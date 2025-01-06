import { HTMLRewriter, Element, TextChunk } from '@worker-tools/html-rewriter';
import { Article } from './Article.ts';
import { NzbFile } from './NzbFile.ts';
import { yEncParse } from '../utils/yenc.ts';

export class NZB implements Iterable<NzbFile> {
  #readable?: ReadableStream;
  readonly processingInstructions: Record<string, Record<string, string>> = {};
  readonly head: Record<string, string> = {};
  readonly files: NzbFile[] = [];
  #segments = 0;
  name?: string;
  size = 0;

  static async from(readable: ReadableStream, name?: string): Promise<NZB> {
    const nzb = new NZB(readable, name);
    await nzb.parse();
    return nzb;
  }

  constructor(readable?: ReadableStream, name?: string) {
    this.#readable = readable;
    this.name = name;
  }

  get segments(): number {
    return this.#segments;
  }

  pi(name: string, data: Record<string, string>) {
    this.processingInstructions[name] = data;
  }

  parse(readable = this.#readable) {
    if (!readable) {
      return;
    }

    let meta = { name: "", value: "" }, group = "";

    return new HTMLRewriter()
      .on("head", {
        text: ({ text, lastInTextNode }: TextChunk) => {
          meta.value += text;
          if (lastInTextNode) {
            meta.value = meta.value.trim();
            if (meta.name) {
              this.head[meta.name] = meta.value;
            }
          }
        },
      })
      .on("head > meta", {
        element: (element: Element) => {
          const name = element.getAttribute("type");
          meta = { name, value: "" };
        },
      })
      .on("file > groups > group", {
        element: (element: Element) => {
          const file: NzbFile = this.files.at(-1)!;
          group = "";

          element.onEndTag(() => {
            file.groups.push(group);
          });
        },
        text: ({ text, lastInTextNode }: TextChunk) => {
          group += text;
          if (lastInTextNode) {
            group = group.trim();
          }
        },
      })
      .on("file", {
        element: (element: Element) => {
          const subject = element.getAttribute("subject");
          const file: NzbFile = new NzbFile({
            poster: element.getAttribute("poster"),
            subject,
            name: "",
            // Stores the seconds specified in 'date' attribute as milliseconds.
            lastModified: Number(element.getAttribute("date")) * 1000,
            size: 0,
            groups: [],
            segments: [],
          });

          if (!subject.indexOf("yEnc")) return;
          const { name, size } = yEncParse(subject);
          file.name = name || "";
          file.size = Number(size);

          this.files.push(file);

          element.onEndTag(() => {
            if (!file.size) {
              file.size = file.segments.reduce(
                (sum, { size }) => sum + size,
                0,
              );
            }

            this.size += file.size;
          });
        },
      })
      .on("file > segments > segment", {
        element: (element: Element) => {
          const file = this.files.at(-1)!;
          file.segments.push({
            id: "",
            size: Number(element.getAttribute("bytes")),
            number: Number(element.getAttribute("number")),
          });

          this.#segments++;
        },
        text: ({ text, lastInTextNode }: TextChunk) => {
          const file = this.files.at(-1)!;
          const segment = file.segments.at(-1)!;
          segment.id += text;
          if (lastInTextNode) {
            segment.id = segment.id.trim();
          }
        },
      })
      .transform(new Response(readable))
      .arrayBuffer(); // Kickstarts the stream.
  }

  file(name: string) {
    return this.files.find((file) => file.name === name);
  }

  [Symbol.iterator](): Iterator<NzbFile> {
    return this.files.values();
  }

  articles() {
    return {
      [Symbol.iterator]: () => {
        const files = this.files, lastFile = files.length - 1;
        let currentFile = 0, currentSegment = 0;

        return {
          next(): IteratorResult<Article> {
            if (currentFile <= lastFile) {
              const { poster, lastModified, subject, groups, segments } =
                files[currentFile];
              const total = segments.length;
              if (currentSegment <= (total - 1)) {
                const { id, number, size } = segments[currentSegment++];
                const article = new Article({
                  headers: {
                    "from": poster,
                    "date": new Date(lastModified).toUTCString(),
                    // The file's subject is the subject of the first segment, so we
                    // replace it with the current number.
                    "subject": subject.replace(
                      `(1/${total})`,
                      `(${number}/${total})`,
                    ),
                    "newsgroups": groups.join(","),
                    "message-id": `<${id}>`,
                    "bytes": `${size}`,
                  },
                });
                article.number = number;
                return { done: false, value: article };
              } else {
                currentSegment = 0;
                currentFile++;
                return this.next();
              }
            } else {
              return { done: true, value: null };
            }
          },
        };
      },
    };
  }

  toString() {
    return [
      `<?xml version="1.0" encoding="utf-8"?>`,
      Object.entries(this.processingInstructions).map(([name, data]) =>
        `<?${name} ${
          Object.entries(data).map(([key, value]) => `${key}="${value}"`).join(
            " ",
          )
        }?>`
      ).join("\n"),
      `<!DOCTYPE nzb PUBLIC "-//newzBin//DTD NZB 1.1//EN" "http://www.newzbin.com/DTD/nzb/nzb-1.1.dtd">`,
      `<nzb xmlns="http://www.newzbin.com/DTD/2003/nzb">`,

      `  <head>`,
      `${
        Object.entries(this.head).map(([type, value]) =>
          [
            `    <meta type="${type}">${value}</meta>`,
          ].join("\n")
        ).join("\n")
      }`,
      `  </head>`,

      `${this.files.map((file) => `${file}`).join("\n")}`,

      `</nzb>`,
    ].join("\n");
  }
}

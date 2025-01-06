import { Segment } from '../types/index.ts';
import { escapeXml } from '../utils/xml.ts';

export class File {
  poster!: string;
  /**
   * The last modified date of the file as the number of milliseconds
   * since the Unix epoch (January 1, 1970 at midnight). Files without
   * a known last modified date return the current date.
   */
  lastModified!: number;
  name!: string;
  size!: number;
  subject!: string;
  groups!: string[];
  segments!: Segment[];

  constructor(file: File) {
    Object.assign(this, file);
  }

  toString() {
    const { poster, lastModified, subject, groups, segments } = this;
    return [
      `  <file poster="${escapeXml(poster)}" date="${
        lastModified / 1000
      }" subject="${escapeXml(subject)}">`,

      `    <groups>`,
      `${
        groups.map((group) =>
          [
            `      <group>${group}</group>`,
          ].join("\n")
        ).join("\n")
      }`,
      `    </groups>`,

      `    <segments>`,
      `${
        segments.map(({ id, size, number }) =>
          [
            `      <segment bytes="${size}" number="${number}">${id}</segment>`,
          ].join("\n")
        ).join("\n")
      }`,
      `    </segments>`,

      `  </file>`,
    ].join("\n");
  }
}

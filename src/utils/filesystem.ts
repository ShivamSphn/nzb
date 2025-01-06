/// <reference types="bun-types" />

declare const Bun: any;

interface FileSystemWriter {
  write(data: string | Uint8Array): Promise<number>;
  end(): Promise<void>;
}

export class FileSystem {
  static async readText(path: string): Promise<string> {
    const file = Bun.file(path);
    return file.text();
  }

  static async writeText(path: string, content: string): Promise<void> {
    await Bun.write(path, content);
  }

  static async createWriteStream(path: string): Promise<FileSystemWriter> {
    return Bun.file(path).writer();
  }

  static async readStream(path: string): Promise<ReadableStream> {
    const file = Bun.file(path);
    return file.stream();
  }

  static async exists(path: string): Promise<boolean> {
    try {
      const file = Bun.file(path);
      await file.exists();
      return true;
    } catch {
      return false;
    }
  }

  static async createDirectory(path: string): Promise<void> {
    // In a real implementation, this would use mkdir -p equivalent
    // For now, we'll assume directories exist
  }
}

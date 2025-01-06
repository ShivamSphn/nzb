import { BaseService, ServiceOptions } from './BaseService.ts';
import { NZB } from '../models/NZB.ts';
import { FileSystem } from '../utils/filesystem.ts';

export interface GetOptions extends ServiceOptions {
  caseSensitive?: boolean;
}

export class GetService extends BaseService {
  private caseSensitive: boolean;

  constructor(options: GetOptions = {}) {
    super(options);
    this.caseSensitive = options.caseSensitive ?? false;
  }

  async execute(input: string, filename: string, output?: string): Promise<NZB | null> {
    const nzb = await this.readNzbFile(input);
    
    // Find the requested file
    const file = this.findFile(nzb, filename);
    if (!file) {
      return null;
    }
    
    // Create a new NZB for the single file
    const extracted = new NZB();
    
    // Copy processing instructions and head metadata
    Object.entries(nzb.processingInstructions).forEach(([name, data]) => {
      extracted.pi(name, data);
    });
    Object.assign(extracted.head, nzb.head);

    // Add the found file
    extracted.files.push(file);

    // Write to output file if specified
    if (output) {
      await FileSystem.writeText(output, extracted.toString());
    }

    return extracted;
  }

  private findFile(nzb: NZB, filename: string) {
    if (this.caseSensitive) {
      return nzb.files.find(file => file.name === filename);
    } else {
      const lowerFilename = filename.toLowerCase();
      return nzb.files.find(file => file.name.toLowerCase() === lowerFilename);
    }
  }
}

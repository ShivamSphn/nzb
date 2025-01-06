import { BaseService, ServiceOptions } from './BaseService.ts';
import { NZB } from '../models/NZB.ts';
import { NzbFile } from '../models/NzbFile.ts';
import { FileSystem } from '../utils/filesystem.ts';

export interface ExtractOptions extends ServiceOptions {
  patternType?: 'glob' | 'regex';
}

export class ExtractService extends BaseService {
  private patternType: 'glob' | 'regex';

  constructor(options: ExtractOptions = {}) {
    super(options);
    this.patternType = options.patternType || 'glob';
  }

  async execute(input: string, pattern: string, output?: string): Promise<NZB> {
    const nzb = await this.readNzbFile(input);
    const matcher = this.createMatcher(pattern);
    
    // Create a new NZB for the extracted files
    const extracted = new NZB();
    
    // Copy processing instructions and head metadata
    Object.entries(nzb.processingInstructions).forEach(([name, data]) => {
      extracted.pi(name, data);
    });
    Object.assign(extracted.head, nzb.head);

    // Extract matching files
    for (const file of nzb.files) {
      if (matcher(file.name)) {
        extracted.files.push(file);
      }
    }

    // Write to output file if specified
    if (output) {
      await FileSystem.writeText(output, extracted.toString());
    }

    return extracted;
  }

  private createMatcher(pattern: string): (filename: string) => boolean {
    if (this.patternType === 'glob') {
      // Convert glob to regex
      const regexPattern = pattern
        .replace(/\./g, '\\.')
        .replace(/\*/g, '.*')
        .replace(/\?/g, '.');
      return (filename: string) => new RegExp(`^${regexPattern}$`).test(filename);
    } else {
      // Use pattern as regex directly
      const regex = new RegExp(pattern);
      return (filename: string) => regex.test(filename);
    }
  }
}

import { BaseService, ServiceOptions } from './BaseService.ts';
import { NZB } from '../models/NZB.ts';
import { NzbFile } from '../models/NzbFile.ts';

export interface CombineOptions extends ServiceOptions {
  removeDuplicates?: boolean;
}

export class CombineService extends BaseService {
  private removeDuplicates: boolean;

  constructor(options: CombineOptions = {}) {
    super(options);
    this.removeDuplicates = options.removeDuplicates ?? true;
  }

  async execute(target: string, sources: string[]): Promise<void> {
    // Read all source NZB files
    const nzbs = await Promise.all(sources.map(source => this.readNzbFile(source)));
    
    // Create a new NZB for the combined result
    const combined = new NZB();
    
    // Merge processing instructions and head metadata
    for (const nzb of nzbs) {
      Object.entries(nzb.processingInstructions).forEach(([name, data]) => {
        combined.pi(name, data);
      });
      Object.assign(combined.head, nzb.head);
    }

    // Merge files
    const fileMap = new Map<string, NzbFile>();
    
    for (const nzb of nzbs) {
      for (const file of nzb.files) {
        const key = this.getFileKey(file);
        
        if (this.removeDuplicates && fileMap.has(key)) {
          // If removing duplicates, only keep the first occurrence
          continue;
        }
        
        fileMap.set(key, file);
      }
    }

    // Add merged files to combined NZB
    fileMap.forEach(file => {
      combined.files.push(file);
    });

    // Write the combined NZB to the target file
    const writer = Bun.file(target).writer();
    await writer.write(combined.toString());
    await writer.end();
  }

  private getFileKey(file: NzbFile): string {
    // Create a unique key for each file based on its properties
    return `${file.name}:${file.size}:${file.segments.length}`;
  }
}

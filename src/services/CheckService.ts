import { BaseService, ServiceOptions } from './BaseService.ts';
import { NZB } from '../models/NZB.ts';

export interface CheckOptions extends ServiceOptions {
  method?: 'quick' | 'full';
}

export class CheckService extends BaseService {
  private method: 'quick' | 'full';

  constructor(options: CheckOptions = {}) {
    super(options);
    this.method = options.method || 'quick';
  }

  async execute(input: string): Promise<{ valid: boolean; issues?: string[] }> {
    const nzb = await this.readNzbFile(input);
    
    if (this.method === 'quick') {
      return this.quickCheck(nzb);
    }
    
    return this.fullCheck(nzb);
  }

  private async quickCheck(nzb: NZB): Promise<{ valid: boolean; issues?: string[] }> {
    const issues: string[] = [];

    // Basic structure checks
    if (!nzb.files.length) {
      issues.push('No files found in NZB');
    }

    // Check each file has required fields
    for (const file of nzb.files) {
      if (!file.name) {
        issues.push(`File missing name: ${file.subject}`);
      }
      if (!file.segments.length) {
        issues.push(`File has no segments: ${file.name || file.subject}`);
      }
      if (!file.groups.length) {
        issues.push(`File has no groups: ${file.name || file.subject}`);
      }
    }

    return {
      valid: issues.length === 0,
      issues: issues.length ? issues : undefined
    };
  }

  private async fullCheck(nzb: NZB): Promise<{ valid: boolean; issues?: string[] }> {
    const quickResult = await this.quickCheck(nzb);
    if (!quickResult.valid) {
      return quickResult;
    }

    const issues: string[] = [];

    // Additional thorough checks
    for (const file of nzb.files) {
      // Check segment numbering
      const segmentNumbers = new Set(file.segments.map(s => s.number));
      if (segmentNumbers.size !== file.segments.length) {
        issues.push(`Duplicate segment numbers in file: ${file.name}`);
      }

      // Check segment sizes
      const totalSize = file.segments.reduce((sum, seg) => sum + seg.size, 0);
      if (file.size && totalSize !== file.size) {
        issues.push(`Size mismatch in file ${file.name}: expected ${file.size}, got ${totalSize}`);
      }

      // Check message IDs
      for (const segment of file.segments) {
        if (!segment.id.match(/^[^<>]+$/)) {
          issues.push(`Invalid message ID in file ${file.name}: ${segment.id}`);
        }
      }
    }

    return {
      valid: issues.length === 0,
      issues: issues.length ? issues : undefined
    };
  }
}

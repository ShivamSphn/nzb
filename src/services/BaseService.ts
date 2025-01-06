import { config } from '../config/config.ts';
import { NZB } from '../models/NZB.ts';
import { FileSystem } from '../utils/filesystem.ts';

export interface ServiceOptions {
  hostname?: string;
  port?: number;
  ssl?: boolean;
  username?: string;
  password?: string;
  connections?: number;
  connectRetries?: number;
  reconnectDelay?: number;
  requestRetries?: number;
  postRetryDelay?: number;
}

export abstract class BaseService {
  protected options: ServiceOptions;

  constructor(options: ServiceOptions = {}) {
    this.options = {
      hostname: options.hostname || config.nntp.hostname,
      port: options.port || config.nntp.port,
      ssl: options.ssl ?? config.nntp.ssl,
      username: options.username || config.nntp.username,
      password: options.password || config.nntp.password,
      connections: options.connections || config.nntp.connections,
      connectRetries: options.connectRetries || config.nntp.connectRetries,
      reconnectDelay: options.reconnectDelay || config.nntp.reconnectDelay,
      requestRetries: options.requestRetries || config.nntp.requestRetries,
      postRetryDelay: options.postRetryDelay || config.nntp.postRetryDelay,
    };
  }

  protected async readNzbFile(input: string): Promise<NZB> {
    const stream = await FileSystem.readStream(input);
    const filename = input.split('/').pop() || '';
    return NZB.from(stream, filename);
  }

  protected validateOptions() {
    if (!this.options.hostname) {
      throw new Error('NNTP hostname is required');
    }
    if (!this.options.port) {
      throw new Error('NNTP port is required');
    }
  }

  abstract execute(...args: any[]): Promise<any>;
}

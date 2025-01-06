#!/usr/bin/env bun
/// <reference types="bun-types" />

declare const Bun: any;

import { CheckService } from './services/CheckService.ts';
import { CombineService } from './services/CombineService.ts';
import { ExtractService } from './services/ExtractService.ts';
import { GetService } from './services/GetService.ts';
import { MirrorService } from './services/MirrorService.ts';

const HELP_TEXT = `NZB Toolkit
Various tools for handling NZB files

USAGE:
  nzb <command> <input> [...options]

COMMANDS:
  check [--method] [...options] <input>
  combine [...options] <target> ...sources
  extract [...options] <input> <glob|regex>
  get [...options] <input> <filename>
  mirror [...options] <input>

OPTIONS:
  --address, -addr <address>  IPaddress:Port or :Port to bind server to (default "127.0.0.1:8000")
  --hostname, -h <hostname>   The hostname of the NNTP server
  --port, -P <port>          The port of the NNTP server
  --ssl, -S                  Whether to use SSL
  --username, -u <username>  The username to authenticate with
  --password, -p <password>  The password to authenticate with
  --connections, -n <num>    The number of connections to use
  --method, -m <method>      Check method (quick|full)
  --pattern-type, -t <type>  Pattern type for extract (glob|regex)
  --case-sensitive, -c       Use case-sensitive matching
  --verify, -v              Verify files when mirroring
  --output, -o <file>       Output file path`;

async function main() {
  const args = Bun.argv.slice(2);
  if (args.length === 0 || args[0] === 'help' || args[0] === '--help') {
    console.log(HELP_TEXT);
    return;
  }

  const command = args[0];
  const options = parseOptions(args.slice(1));

  try {
    switch (command) {
      case 'check':
        await new CheckService({ method: options.method }).execute(options.input);
        break;

      case 'combine':
        if (!options.target || !options.sources || options.sources.length === 0) {
          throw new Error('combine requires target and source files');
        }
        await new CombineService().execute(options.target, options.sources);
        break;

      case 'extract':
        if (!options.input || !options.pattern) {
          throw new Error('extract requires input file and pattern');
        }
        await new ExtractService({ patternType: options.patternType }).execute(
          options.input,
          options.pattern,
          options.output
        );
        break;

      case 'get':
        if (!options.input || !options.filename) {
          throw new Error('get requires input file and filename');
        }
        await new GetService({ caseSensitive: options.caseSensitive }).execute(
          options.input,
          options.filename,
          options.output
        );
        break;

      case 'mirror':
        if (!options.input) {
          throw new Error('mirror requires input file');
        }
        await new MirrorService({
          hostname: options.hostname,
          port: options.port ? Number(options.port) : undefined,
          ssl: options.ssl,
          username: options.username,
          password: options.password,
          connections: options.connections ? Number(options.connections) : undefined,
          verify: options.verify,
        }).execute(options.input, options.output);
        break;

      default:
        console.error(`Unknown command: ${command}`);
        console.log(HELP_TEXT);
        Bun.exit(1);
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error('An unknown error occurred');
    }
    Bun.exit(1);
  }
}

function parseOptions(args: string[]) {
  const options: Record<string, any> = {};
  let i = 0;

  while (i < args.length) {
    const arg = args[i];

    if (arg.startsWith('--') || arg.startsWith('-')) {
      const key = arg.replace(/^-+/, '');
      
      switch (key) {
        case 'S':
        case 'ssl':
        case 'v':
        case 'verify':
        case 'c':
        case 'case-sensitive':
          options[key.replace(/-/g, '')] = true;
          i++;
          break;

        default:
          if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
            options[key.replace(/-/g, '')] = args[i + 1];
            i += 2;
          } else {
            throw new Error(`Missing value for option: ${arg}`);
          }
      }
    } else if (!options.input) {
      options.input = arg;
      i++;
    } else if (arg.includes('*') || arg.includes('?') || arg.includes('/')) {
      options.pattern = arg;
      i++;
    } else if (!options.filename) {
      options.filename = arg;
      i++;
    } else {
      if (!options.sources) options.sources = [];
      options.sources.push(arg);
      i++;
    }
  }

  return options;
}

main().catch((error: unknown) => {
  if (error instanceof Error) {
    console.error(`Unhandled error: ${error.message}`);
  } else {
    console.error('An unknown error occurred');
  }
  Bun.exit(1);
});

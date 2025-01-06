# NZB Toolkit

A modern toolkit for handling NZB files, built with Bun.

## Features

- **Check**: Validate NZB files for correctness and completeness
- **Combine**: Merge multiple NZB files into a single file
- **Extract**: Extract specific files from an NZB based on patterns
- **Get**: Extract a specific file from an NZB by name
- **Mirror**: Create a mirror of an NZB file for a different server

## Installation

```bash
# Install dependencies
bun install

# Build the project
bun run build

# Make the CLI executable
chmod +x dist/index.js

# Optional: Install globally
ln -s "$(pwd)/dist/index.js" /usr/local/bin/nzb
```

## Usage

```bash
nzb <command> <input> [...options]

Commands:
  check [--method] [...options] <input>
  combine [...options] <target> ...sources
  extract [...options] <input> <glob|regex>
  get [...options] <input> <filename>
  mirror [...options] <input>

Options:
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
  --output, -o <file>       Output file path
```

## Examples

### Check an NZB file

```bash
# Quick check
nzb check file.nzb

# Full check with verification
nzb check --method full file.nzb
```

### Combine multiple NZB files

```bash
nzb combine combined.nzb file1.nzb file2.nzb file3.nzb
```

### Extract files matching a pattern

```bash
# Using glob pattern
nzb extract input.nzb "*.mkv" -o extracted.nzb

# Using regex pattern
nzb extract --pattern-type regex input.nzb "\.mp4$" -o extracted.nzb
```

### Get a specific file

```bash
nzb get input.nzb "movie.mkv" -o movie.nzb
```

### Mirror to another server

```bash
nzb mirror --hostname news.example.com --port 563 --ssl \
  --username user --password pass \
  --connections 4 --verify \
  input.nzb -o mirrored.nzb
```

## Configuration

The toolkit can be configured using environment variables:

```env
# Server Configuration
SERVER_ADDRESS=127.0.0.1
SERVER_PORT=8000

# NNTP Configuration
NNTP_HOSTNAME=
NNTP_PORT=119
NNTP_SSL=false
NNTP_USERNAME=
NNTP_PASSWORD=
NNTP_CONNECTIONS=1
NNTP_CONNECT_RETRIES=3
NNTP_RECONNECT_DELAY=1000
NNTP_REQUEST_RETRIES=3
NNTP_POST_RETRY_DELAY=1000
```

## Development

```bash
# Run in development mode with auto-reload
bun run dev

# Build for production
bun run build

# Run tests
bun test
```

## License

MIT License

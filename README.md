# monoread

[日本語](README_ja.md)

Gives your LLM the context of web pages in the smartest way.

## Features

- **Smart Content Extraction**: `@mizchi/readability` (Mozilla Readability) base with specialized optimizations for major services such as GitHub blobs
- **AI-Optimized Output**: Clean, structured content perfect for AI processing
- **MCP Server**: Can run as a Model Context Protocol server for AI assistants

## Installation

### Quick Try

```bash
npx monoread read https://example.com
# or
bunx monoread read https://example.com
```

### Local Install

```bash
npm install -g monoread
monoread read https://example.com
```

## Usage

### CLI Mode

#### Read a URL

```bash
monoread read https://example.com/article
```

#### Read a GitHub file

```bash
monoread read https://github.com/owner/repo/blob/main/README.md
```

### MCP Server Mode

Add to Claude Code:

```bash
claude mcp add monoread -s user -- npx -y monoread@latest mcp
```

## License

MIT © [Yuku Kotani](mailto:yukukotani@gmail.com)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## Support

For issues and feature requests, please visit the [GitHub Issues](https://github.com/yukukotani/monoread/issues) page.

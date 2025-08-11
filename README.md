# monoread

[日本語](README_ja.md)

Gives your LLM the context of web pages in the smartest way.

## Features

- **High-Quality Content Extraction**: Powered by [@mizchi/readability](https://github.com/mizchi/readability) (Mozilla Readability) and llms.txt standards for reliable extraction from any web content
- **Provider-Specific Optimization**: Specialized content extraction tailored for some providers such as GitHub
- **MCP Server Integration**: Seamlessly integrates as a Model Context Protocol server, enabling AI assistants to fetch and process web content intelligently

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

Apache-2.0 © [Yuku Kotani](mailto:yukukotani@gmail.com)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## Support

For issues and feature requests, please visit the [GitHub Issues](https://github.com/yukukotani/monoread/issues) page.

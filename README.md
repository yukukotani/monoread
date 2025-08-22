# monoread

![NPM Version](https://img.shields.io/npm/v/monoread?link=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fmonoread)

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
# Add to user scope (available across all projects)
claude mcp add monoread -s user -- npx -y monoread@latest mcp

# Or add to project scope to share with your team
claude mcp add monoread -s project -- npx -y monoread@latest mcp

# Also you can configure environment variables described below.
claude mcp add monoread -s user -e NOTION_API_KEY=your-integration-token -- npx -y monoread@latest mcp
```

Then add something like this to your CLAUDE.md:

```
Use `mcp__monoread__read_url_content` tool instead of builtin Fetch tool to read web pages.
```

## Providers

monoread uses a multi-provider system to extract content from various sources:

### GitHub

No requirements.

```bash
monoread read https://github.com/owner/repo/blob/main/README.md
```

### Notion

Requires setting up the `NOTION_API_KEY` environment variable:

1. Create a Notion integration at [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Copy the Internal Integration Token
3. Share your Notion pages with the integration:
   - Open the page in Notion
   - Click "Share" → "Add people, emails, or integrations"
   - Select your integration
4. Set the environment variable:
   ```bash
   export NOTION_API_KEY="your-integration-token"
   monoread read https://notion.so/your-page-id
   ```

### Other Providers

monoread attempts to extract content using [@mizchi/readability](https://github.com/mizchi/readability) or [llms.txt](https://llmstxt.org/).

Feel free to open pull requests or issues to add more specific provider supports.

## License

Apache-2.0 © [Yuku Kotani](mailto:yukukotani@gmail.com)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## Support

For issues and feature requests, please visit the [GitHub Issues](https://github.com/yukukotani/monoread/issues) page.

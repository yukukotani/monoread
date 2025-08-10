# Contributing to Monoread

Thank you for considering contributing to Monoread! This document provides guidelines for contributing to the project.

## Development Setup

### Prerequisites

- Node.js 22.0.0 or higher
- pnpm package manager

### Setup

```bash
git clone https://github.com/yukukotani/monoread.git
cd monoread
pnpm install
```

## Available Scripts

- `pnpm dev`: Run in development mode
- `pnpm build`: Build for production
- `pnpm test`: Run tests
- `pnpm test:watch`: Run tests in watch mode
- `pnpm test:coverage`: Run tests with coverage
- `pnpm lint`: Run linting (Biome + TypeScript)
- `pnpm fix`: Fix linting issues

## Project Structure

```
src/
├── presentation/     # Presentation layer (CLI, MCP server)
│   ├── cli/         # CLI commands and handlers
│   └── mcp/         # MCP server implementation
├── usecase/         # Use case layer (business logic)
│   └── providers/   # Content extraction providers
└── libs/            # Utilities and shared libraries
```

## Testing

This project follows Test-Driven Development (TDD) principles. Tests are located alongside source files.

```bash
pnpm test
```

## Contributing Guidelines

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for your changes
4. Ensure all tests pass (`pnpm test`)
5. Run linting (`pnpm lint`)
6. Commit your changes (`git commit -m 'Add some amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## Adding New Providers

To add support for a new website:

1. Create a new provider in `src/usecase/providers/`
2. Implement the `ContentProvider` interface
3. Add tests for the provider
4. Register the provider in `src/usecase/content-extractor.ts`

## Code Style

- Use TypeScript with strict type checking
- Follow functional programming principles
- Use tagged unions for error handling instead of throwing exceptions
- Keep functions pure when possible
- Write descriptive commit messages

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
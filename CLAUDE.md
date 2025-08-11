# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

monoread is a CLI tool and MCP server for reading web page content in AI-optimized format. It provides high-quality content extraction using Mozilla Readability and llms.txt standards.

## Development Commands

- `pnpm dev`: Run in development mode
- `pnpm build`: Build for production
- `pnpm test` / `pnpm test:watch` / `pnpm test:coverage`: Run tests
- `pnpm lint`: Run all linting (Biome + TypeScript)
- `pnpm fix`: Fix linting issues automatically
- `pnpm mcp` / `pnpm mcp:debug`: Run as MCP server

## Architecture

### Layered Architecture
- **Presentation Layer** (`src/presentation/`): CLI (gunshi) and MCP server
- **Use Case Layer** (`src/usecase/`): Business logic and content providers
- **Libs** (`src/libs/`): Domain-independent utilities

### Content Provider System
Multi-provider fallback system: `GithubProvider` → `ReadabilityProvider` → `LlmsTxtProvider` → `HttpProvider`. Each implements `ContentProvider` interface with `canHandle()` and `extractContent()` methods.

## Development Rules

### Core Principles
- **Language**: TypeScript with strict type checking
- **Paradigm**: Functional programming (functions over classes)
- **Error Handling**: Tagged unions instead of throwing errors
- **Conversation**: You MUST respond in Japanese
- **Comments**: You MUST NOT keep descriptions of changes in code

### Testing (TDD)
- Follow t-wada's Test-Driven Development
- Create failing tests first, then make them pass
- Test files in same directory as source files (`.test.ts` extension)
- Tech: vitest, power-assert-monorepo

### Commit Workflow
- Small, frequent commits per task
- Run `pnpm lint` before each commit
- Write commit messages in Japanese
- Mark todos completed immediately after committing

### Directory Structure
You MUST follow this structure and ask user before adding new directories under `src/`:

- `src/presentation/`: CLI and MCP server implementations
- `src/usecase/`: Business logic and providers
- `src/libs/`: Domain-independent utilities

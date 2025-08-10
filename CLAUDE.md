# TypeScript Template

This is a TypeScript template for a project for Coding AI Agent.

## Conversation Rules

- You MUST respond in Japanese.

## Coding Rules

### Small, frequent commits

- You MUST commit your changes in small, frequent increments after completing each task.
- You MUST commit each individual task separately. For example, if there are 3 tasks (A, B, C), create 3 separate commits instead of 1 combined commit.
- You MUST mark each todo as completed immediately after committing the changes for that specific task.
- You MUST run `pnpm lint` and ensure it passes before committing any changes.
- You MUST write commit messages and comments in Japanese.

### Test-Driven Development

- You MUST follow t-wada's Test-Driven Development. Create failing tests first, then make them pass.
- You MUST put test files in the same directory as the source files.

### Functional Programming

- You MUST use function instead of class.
- You MUST use tagged union to represent errors instead of throwing errors.

### Comment

- You MUST NOT keep descriptions of changes in the code.

## Tech Stack

- Language: TypeScript
- Package Manager: pnpm
- Test: vitest, power-assert-monorepo
- Linter, Formatter: Biome

## Directory Structure

You MUST follow the following directory structure. You MUST ask user to add new directory under `src/` directory.

- `src/`
  - `presentation/`: Presentation layer, such as CLI handler.
  - `usecase/`: Usecase layer.
  - `libs/`: Logics that is not depends on domain.

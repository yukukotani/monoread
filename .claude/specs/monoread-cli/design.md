# Design Document

## Overview

monoreadは、拡張可能なプロバイダベースのアーキテクチャを採用したCLIツールです。各プロバイダは特定のURLパターンを処理し、共通のインターフェースを通じてコンテンツを提供します。現在はGitHubプロバイダと汎用Webページプロバイダを実装し、将来的にはGitLab、Bitbucket等の追加プロバイダをサポートします。

## Architecture

```mermaid
graph TD
    A[CLI Handler] --> B[Content Extraction Logic]
    B --> C[GitHub Provider]
    B --> D[Readability Provider]
    B --> E[Future Provider]
    
    C --> F[GitHub API Client]
    D --> G[@mizchi/readability]
    
    F --> H[Raw File Content]
    G --> I[Extracted Article Content]
    
    H --> J[Standard Output]
    I --> J
```

### Core Components

1. **CLI Handler**: gunshiを使用したユーザー入力の処理とヘルプメッセージの表示
2. **Content Extraction Logic**: プロバイダの実行とフォールバック処理

## Components and Interfaces

### Provider Interface

全てのプロバイダが実装する共通インターフェース：

```typescript
interface ContentProvider {
  name: string;
  canHandle(url: string): boolean;
  extractContent(url: string): Promise<ContentResult>;
}

type ContentResult = 
  | { success: true; content: string; metadata: ContentMetadata }
  | { success: false; error: string; errorType: ErrorType };

interface ContentMetadata {
  title?: string;
  fileName?: string;
  fileType?: string;
  source: string;
}

type ErrorType = 'network' | 'not_found' | 'auth' | 'rate_limit' | 'invalid_url' | 'unknown';
```

### GitHub Provider

GitHubファイルURLを処理するプロバイダ：

```typescript
const githubProvider: ContentProvider = {
  name: 'github',
  
  canHandle(url: string): boolean {
    return /^https:\/\/github\.com\/[^\/]+\/[^\/]+\/blob\//.test(url);
  },
  
  async extractContent(url: string): Promise<ContentResult> {
    // GitHub API を使用してraw contentを取得
    // Accept: application/vnd.github.raw+json
  }
};
```

### Content Extraction Logic

プロバイダの実行ロジック：

```typescript
async function extractContent(url: string, providers: ContentProvider[]): Promise<ContentResult> {
  // 特定プロバイダを順番に試行
  const matchingProviders = providers.filter(p => p.canHandle(url));
  
  for (const provider of matchingProviders) {
    const result = await provider.extractContent(url);
    if (result.success) {
      return result;
    }
  }
  
  // フォールバックとして@mizchi/readabilityを直接使用
  try {
    const response = await fetch(url);
    const html = await response.text();
    const { extract } = await import('@mizchi/readability');
    const extracted = extract(html);
    
    return {
      success: true,
      content: extracted.textContent || '',
      metadata: {
        title: extracted.title,
        source: url
      }
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to extract content: ${error.message}`,
      errorType: 'unknown'
    };
  }
}
```

## Data Models

### Configuration Model

将来の機能拡張のための設定モデル：

```typescript
interface Config {
  github?: {
    token?: string;
  };
  output?: {
    maxLength?: number;
  };
  providers?: {
    disabled?: string[];
  };
  logging?: {
    level?: 'silent' | 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
    pretty?: boolean;
  };
}
```

### Logger Setup

pinoを使用したログ設定：

```typescript
import pino from 'pino';

function createLogger(config?: Config) {
  const logLevel = config?.logging?.level || 'silent';
  const prettyPrint = config?.logging?.pretty || false;
  
  return pino({
    level: logLevel,
    transport: prettyPrint ? {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    } : undefined
  });
}
```

## Error Handling

### Tagged Union でのエラー表現

```typescript
type Result<T, E> = 
  | { success: true; data: T }
  | { success: false; error: E };

type AppError = {
  type: ErrorType;
  message: string;
  cause?: Error;
}

type ErrorType = 
  | 'network'
  | 'not_found' 
  | 'auth'
  | 'rate_limit'
  | 'invalid_url'
  | 'unknown';
```

### エラーハンドリング戦略

1. **Network Errors**: 接続問題の明確な表示
2. **Authentication Errors**: GitHub token設定のガイダンス
3. **Rate Limit**: 制限詳細と回復時間の表示
4. **Not Found**: 適切な404メッセージ
5. **Invalid URL**: URL形式の問題を指摘

## Testing Strategy

### Unit Testing

- 各プロバイダの個別テスト
- URL解析ロジックのテスト
- エラーハンドリングのテスト

### Integration Testing

- GitHub API連携のテスト（モック使用）
- @mizchi/readability連携のテスト
- プロバイダルーティングのテスト

### End-to-End Testing

- 実際のURLでの動作確認
- CLI引数解析とヘルプ表示
- エラーケースでの適切なメッセージ表示

### Test Structure

```
src/
  presentation/
    cli.ts
    cli.test.ts
  usecase/
    content-extractor.ts
    content-extractor.test.ts
  libs/
    providers/
      github-provider.ts
      github-provider.test.ts
      readability-provider.ts
      readability-provider.test.ts
    registry/
      provider-registry.ts
      provider-registry.test.ts
```

## Implementation Priorities

1. **Phase 1**: 基本的なCLI構造とGitHubプロバイダ
2. **Phase 2**: Readabilityプロバイダとプロバイダレジストリ
3. **Phase 3**: エラーハンドリングとテスト
4. **Phase 4**: 設定システムと追加プロバイダサポート

## Dependencies

- **@mizchi/readability**: Webページコンテンツ抽出
- **gunshi**: TypeScript対応の現代的なCLIフレームワーク
- **pino**: 高性能JSON構造化ログ
- **pino-pretty**: 開発時の人間に読みやすいログフォーマット
- **vitest**: テストフレームワーク
- **power-assert**: アサーションライブラリ
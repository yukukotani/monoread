# 設計ドキュメント

## 概要

Monoreadのコンテンツ抽出処理において、llms.txtファイルをフォールバック処理に組み込みます。llms.txtは、LLMが効率的にコンテンツを理解できるように最適化されたマークダウン形式のファイルで、ウェブサイトのルートパス（例：`https://example.com/llms.txt`）に配置されます。

現在のフォールバック順序：
`特定プロバイダ → @mizchi/readability`

新しいフォールバック順序：
`特定プロバイダ → @mizchi/readability → llms.txt`

## アーキテクチャ

### 全体フロー

```mermaid
flowchart TD
    A[URL受信] --> B[特定プロバイダ試行]
    B --> C{プロバイダ成功？}
    C -->|Yes| D[コンテンツ返却]
    C -->|No| E[@mizchi/readability実行]
    E --> F{readability成功？}
    F -->|Yes| G[readabilityコンテンツ返却]
    F -->|No| H[llms.txt URL生成]
    H --> I[llms.txt存在チェック]
    I --> J{llms.txt存在？}
    J -->|Yes| K[llms.txtコンテンツ取得]
    K --> L{取得成功？}
    L -->|Yes| M[llms.txtコンテンツ返却]
    L -->|No| N[エラー返却]
    J -->|No| N
```

### llms.txt URL生成ロジック

1. 入力URLをパースしてホスト名とパス（サブパス）を抽出
2. search parameters（?以降）とhash（#以降）を除去
3. パスがファイル名で終わっている場合はディレクトリパスに変換
4. `https://{host}{path}/llms.txt`の形式でllms.txt URLを生成

**URL正規化の例：**
- `https://example.com/page?param=value#section` → `https://example.com/llms.txt`
- `https://docs.example.com/guide/intro` → `https://docs.example.com/guide/llms.txt`
- `https://example.com/docs/api/v1/` → `https://example.com/docs/api/v1/llms.txt`
- `https://example.com/project/readme.md?v=1#top` → `https://example.com/project/llms.txt`

## コンポーネントと インターフェース

### 新規コンポーネント

#### 1. llms.txt抽出ユーティリティ

```typescript
function extractContentFromLlmsTxt(url: string): Promise<ContentResult>;
```

機能：
- llms.txt URLの生成
- llms.txtファイルの存在確認と取得
- コンテンツの検証と返却

#### 2. llms.txt URL生成ユーティリティ

```typescript
function generateLlmsTxtUrl(originalUrl: string): string | null;
```

機能：
- URLをパースしてホスト名とパス（サブパス）を抽出
- search parameters（?以降）とhash（#以降）を除去
- パスがファイル名で終わっている場合はディレクトリパスに変換
- パスの末尾に`/llms.txt`を追加してllms.txt URLを生成
- 無効なURLの場合はnullを返す

#### 3. readability失敗判定ユーティリティ

```typescript
function isReadabilityResultEmpty(content: string): boolean;
```

機能：
- 空文字列やホワイトスペースのみのコンテンツを検出
- readabilityの結果が有効かを判定

#### 4. llms.txtコンテンツ検証ユーティリティ

```typescript
function isValidLlmsTxtContent(content: string): boolean;
```

機能：
- 空文字列やホワイトスペースのみでないことを確認
- 最低限のコンテンツ長を確認
- HTMLタグが含まれていないことを確認（Markdown前提）

### 既存コンポーネントの変更

#### content-extractor.ts

- 現在のフォールバック処理を修正
- readabilityの結果を検証し、失敗時にllms.txtフォールバックを実行

```typescript
// 変更前の処理フロー
for (const provider of matchingProviders) {
  // 特定プロバイダ試行
}
// 直接readabilityにフォールバック

// 変更後の処理フロー  
for (const provider of matchingProviders) {
  // 特定プロバイダ試行
}
// readabilityフォールバック
const readabilityResult = await extractContentByReadability(url);
if (readabilityResult.success && !isReadabilityResultEmpty(readabilityResult.content)) {
  return readabilityResult;
}
// llms.txtフォールバック
const llmsTxtResult = await extractContentFromLlmsTxt(url);
return llmsTxtResult;
```

## データモデル

### LLMSTxtResult

llms.txtから取得したコンテンツは既存の`ContentResult`型を使用：

```typescript
type ContentResult = 
  | { 
      success: true; 
      content: string; // llms.txtの生コンテンツ（Markdown形式）
      metadata: {
        source: string; // 元のURL（llms.txt URLではない）
        title?: string; // llms.txtのH1ヘッダーから抽出（可能であれば）
        fileType?: 'llms-txt'; // プロバイダ識別用
      }
    }
  | { 
      success: false; 
      error: string; 
      errorType: ErrorType; 
    }
```

### llms.txt URLマッピング例

| 元URL | llms.txt URL |
|-------|-------------|
| `https://example.com/` | `https://example.com/llms.txt` |
| `https://docs.example.com/guide/` | `https://docs.example.com/guide/llms.txt` |
| `https://example.com/docs/api/v1` | `https://example.com/docs/api/llms.txt` |
| `https://example.com/project/readme.md` | `https://example.com/project/llms.txt` |
| `https://example.com/page?param=value&foo=bar` | `https://example.com/llms.txt` |
| `https://docs.example.com/guide/intro#section1` | `https://docs.example.com/guide/llms.txt` |
| `https://api.example.com/v1/docs?format=json#auth` | `https://api.example.com/v1/llms.txt` |

## エラーハンドリング

### エラータイプのマッピング

| HTTPステータス | ErrorType | 処理 |
|---------------|-----------|-----|
| 404 | `not_found` | エラーを返す |
| 403, 401 | `auth` | エラーを返す |
| 5xx | `network` | エラーを返す |
| タイムアウト | `network` | エラーを返す |
| URL解析失敗 | `invalid_url` | エラーを返す |

### エラーログ

```typescript
// デバッグレベル：readability失敗時
logger.debug({ url }, "readability failed, trying llms.txt fallback");

// デバッグレベル：llms.txt試行時
logger.debug({ llmsTxtUrl, originalUrl }, "Trying llms.txt fallback");

// 警告レベル：llms.txt取得失敗時
logger.warn({ llmsTxtUrl, error, statusCode }, "llms.txt fallback failed");

// 情報レベル：llms.txt取得成功時
logger.info({ llmsTxtUrl, originalUrl, contentLength }, "llms.txt extraction successful");
```

## テスト戦略

### 1. ユニットテスト

#### URL生成テスト

```typescript
describe('generateLlmsTxtUrl', () => {
  it('should generate correct llms.txt URL for root path', () => {
    expect(generateLlmsTxtUrl('https://example.com/'))
      .toBe('https://example.com/llms.txt');
  });
  
  it('should preserve subpath for directories', () => {
    expect(generateLlmsTxtUrl('https://docs.example.com/guide/'))
      .toBe('https://docs.example.com/guide/llms.txt');
  });
  
  it('should handle file paths by converting to directory', () => {
    expect(generateLlmsTxtUrl('https://example.com/project/readme.md'))
      .toBe('https://example.com/project/llms.txt');
  });
  
  it('should preserve multi-level subpaths', () => {
    expect(generateLlmsTxtUrl('https://api.example.com/v1/docs'))
      .toBe('https://api.example.com/v1/llms.txt');
  });
  
  it('should remove search parameters while preserving path', () => {
    expect(generateLlmsTxtUrl('https://example.com/page?param=value&foo=bar'))
      .toBe('https://example.com/llms.txt');
  });
  
  it('should remove hash fragments while preserving path', () => {
    expect(generateLlmsTxtUrl('https://docs.example.com/guide/intro#section1'))
      .toBe('https://docs.example.com/guide/llms.txt');
  });
  
  it('should remove both search params and hash while preserving path', () => {
    expect(generateLlmsTxtUrl('https://api.example.com/v1/docs?v=1.2#auth'))
      .toBe('https://api.example.com/v1/llms.txt');
  });
  
  it('should return null for invalid URL', () => {
    expect(generateLlmsTxtUrl('invalid-url')).toBeNull();
  });
});
```

#### readability失敗判定テスト

```typescript
describe('isReadabilityResultEmpty', () => {
  it('should return true for empty string', () => {
    expect(isReadabilityResultEmpty('')).toBe(true);
  });
  
  it('should return true for whitespace only', () => {
    expect(isReadabilityResultEmpty('   \n\t   ')).toBe(true);
  });
  
  it('should return false for valid content', () => {
    expect(isReadabilityResultEmpty('# Valid Content')).toBe(false);
  });
});
```

#### llms.txt抽出テスト

```typescript
describe('extractContentFromLlmsTxt', () => {
  it('should successfully extract llms.txt content', async () => {
    // モックサーバーでllms.txtを提供
    const result = await extractContentFromLlmsTxt('https://example.com/page');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.content).toContain('# Example Project');
      expect(result.metadata.source).toBe('https://example.com/page');
    }
  });
  
  it('should fail gracefully when llms.txt not found', async () => {
    // 404を返すモックサーバー
    const result = await extractContentFromLlmsTxt('https://example.com/page');
    expect(result.success).toBe(false);
    expect(result.errorType).toBe('not_found');
  });
});
```

### 2. 統合テスト

#### フォールバック順序テスト

```typescript
describe('Content extraction fallback', () => {
  it('should return readability result when successful', async () => {
    // 特定プロバイダが対応しないURL
    // readabilityが成功する場合
    const result = await extractContent('https://example.com/page');
    expect(result.success).toBe(true);
    // readabilityで抽出されたコンテンツかチェック
  });
  
  it('should fallback to llms.txt when readability fails', async () => {
    // readabilityが失敗またはコンテンツが空の場合
    // llms.txtが存在する場合
    const result = await extractContent('https://example.com/page');
    expect(result.success).toBe(true);
    expect(result.metadata?.fileType).toBe('llms-txt');
  });
  
  it('should fail when both readability and llms.txt fail', async () => {
    // readabilityが失敗し、llms.txtも存在しない場合
    const result = await extractContent('https://example.com/page');
    expect(result.success).toBe(false);
  });
});
```

### 3. エッジケーステスト

- 空のllms.txtファイル
- HTMLが含まれたllms.txtファイル
- 異常に大きなllms.txtファイル
- ネットワークタイムアウト
- リダイレクトを含むURL

## パフォーマンス考慮事項

### レスポンス時間

- llms.txtのHTTP GETリクエストは通常のウェブページより軽量（テキストファイル）
- タイムアウトは既存のreadability処理と同じ設定を使用
- 並列処理は行わず、順次フォールバック処理を実行

### メモリ使用量

- llms.txtファイルは通常数KB～数十KB程度
- 一度に1つのllms.txtファイルのみをメモリに保持
- 大きなファイルに対する制限は実装しない（HTTP経由での自然な制限に依存）

## セキュリティ考慮事項

### SSRF対策

- llms.txt URLの生成時にホスト名検証を実施
- 内部ネットワークアドレス（localhost、プライベートIP）へのアクセスを防ぐ
- 既存のfetch処理と同じセキュリティ設定を適用

### コンテンツ検証

- llms.txtコンテンツにスクリプトタグが含まれていないか確認
- 異常に大きなファイルの処理を避ける
- Markdown以外の形式（HTMLなど）の警告
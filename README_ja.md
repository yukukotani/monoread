# monoread

最も賢い方法でWebページのコンテキストをLLMに提供します。

## 機能

- **スマートなコンテンツ抽出**: `@mizchi/readability` (Mozilla Readability) ベースで、GitHub blobなどの主要サービスに特化した最適化を実装
- **AI最適化された出力**: AI処理に最適なクリーンで構造化されたコンテンツ
- **MCPサーバー**: AIアシスタント向けのModel Context Protocolサーバーとして動作可能

## インストール

### クイック試用

```bash
npx monoread read https://example.com
# または
bunx monoread read https://example.com
```

### ローカルインストール

```bash
npm install -g monoread
monoread read https://example.com
```

## 使用方法

### CLIモード

#### URLを読む

```bash
monoread read https://example.com/article
```

#### GitHubファイルを読む

```bash
monoread read https://github.com/owner/repo/blob/main/README.md
```

### MCPサーバーモード

Claude Codeに追加:

```bash
claude mcp add monoread -s user -- npx -y monoread@latest mcp
```

## ライセンス

MIT © [Yuku Kotani](mailto:yukukotani@gmail.com)

## 貢献

開発のセットアップとガイドラインについては [CONTRIBUTING.md](CONTRIBUTING.md) をご覧ください。

## サポート

問題や機能要求については、[GitHub Issues](https://github.com/yukukotani/monoread/issues) ページをご利用ください。
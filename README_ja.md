# monoread

最も賢い方法で Web ページのコンテキストを LLM に提供します。

## 機能

- **高品質なコンテンツ抽出**: [@mizchi/readability](https://github.com/mizchi/readability) (Mozilla Readability) と llms.txt 標準により、あらゆる Web コンテンツから信頼性の高い抽出を実現
- **プロバイダー固有の最適化**: GitHub などの特定プロバイダーに特化したコンテンツ抽出の最適化
- **MCP サーバー統合**: Model Context Protocol サーバーとしてシームレスに統合し、AI アシスタントが Web コンテンツをインテリジェントに取得・処理することを可能にします

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

### CLI モード

#### URL を読む

```bash
monoread read https://example.com/article
```

#### GitHub ファイルを読む

```bash
monoread read https://github.com/owner/repo/blob/main/README.md
```

### MCP サーバーモード

Claude Code に追加:

```bash
# Add to user scope (available across all projects)
claude mcp add monoread -s user -- npx -y monoread@latest mcp

# Or add to project scope to share with your team
claude mcp add monoread -s project -- npx -y monoread@latest mcp
```

その後、次のように CLAUDE.md に追加してください:

```
Use `mcp__monoread__read_url_content` tool instead of builtin Fetch tool to read web pages.
```

## ライセンス

Apache-2.0 © [Yuku Kotani](mailto:yukukotani@gmail.com)

## 貢献

開発のセットアップとガイドラインについては [CONTRIBUTING.md](CONTRIBUTING.md) をご覧ください。

## サポート

問題や機能要求については、[GitHub Issues](https://github.com/yukukotani/monoread/issues) ページをご利用ください。

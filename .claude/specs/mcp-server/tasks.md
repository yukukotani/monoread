# Implementation Plan

- [ ] 1. MCP SDK依存関係の追加
  - package.jsonに@modelcontextprotocol/sdkとzodを追加
  - pnpm installを実行して依存関係をインストール
  - _Requirements: 3.1_

- [ ] 2. MCPサーバ実装の作成
  - [ ] 2.1 MCPサーバモジュールの作成
    - src/presentation/mcp/server.tsファイルを作成
    - McpServerインスタンスの初期化コードを実装
    - StdioServerTransportの設定を実装
    - _Requirements: 1.1, 1.2, 3.1_
  
  - [ ] 2.2 read_url_contentツールの実装
    - ツールの登録コードを実装
    - 入力スキーマをzodで定義
    - extractContent関数を呼び出すハンドラを実装
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [ ] 2.3 エラーハンドリングの実装
    - URL検証エラーの処理を実装
    - コンテンツ抽出エラーの処理を実装
    - MCPエラーレスポンスの返却を実装
    - _Requirements: 2.4, 2.5, 5.2_

- [ ] 3. CLIコマンドの追加
  - [ ] 3.1 MCPコマンドハンドラの作成
    - src/presentation/cli/mcp-command.tsファイルを作成
    - gunshiのdefine関数でコマンドを定義
    - startMcpServer関数を呼び出す実装
    - _Requirements: 1.1_
  
  - [ ] 3.2 CLIメインファイルへの統合
    - src/presentation/cli/cli.tsにmcpコマンドをインポート
    - コマンドリストにmcpコマンドを追加
    - _Requirements: 1.1_

- [ ] 4. プロセス管理の実装
  - [ ] 4.1 グレースフルシャットダウンの実装
    - SIGINTシグナルハンドラを追加
    - 処理中のリクエスト完了を待つロジックを実装
    - リソースクリーンアップ処理を実装
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [ ] 4.2 エラー時のクリーンアップ処理
    - 予期しないエラーのキャッチを実装
    - 適切なリソース解放を実装
    - _Requirements: 4.3_

- [ ] 5. ログ出力の調整
  - [ ] 5.1 stderr専用ログ出力の実装
    - MCPサーバ内でのconsole.log使用を避ける実装
    - stdoutへの出力を防ぐ設定を実装
    - エラー時のみstderrに出力する実装
    - _Requirements: 1.3, 5.1, 5.4_

- [ ] 6. MCP Inspector対応の確認
  - [ ] 6.1 サーバメタデータの設定
    - サーバ名とバージョンの適切な設定を確認
    - ツールのtitleとdescriptionを設定
    - _Requirements: 6.2, 6.3_
  
  - [ ] 6.2 ツール定義の詳細化
    - パラメータの説明を追加
    - 適切なエラーレスポンスフォーマットを実装
    - _Requirements: 6.3, 6.4_

- [ ] 7. テストの作成
  - [ ] 7.1 MCPサーバ単体テストの作成
    - src/presentation/mcp/server.test.tsファイルを作成
    - サーバ初期化のテストを実装
    - ツール登録のテストを実装
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [ ] 7.2 read_url_contentツールテストの作成
    - 正常系のテストケースを実装
    - エラー系のテストケースを実装
    - extractContentのモックを使用したテストを実装
    - _Requirements: 2.2, 2.3, 2.4, 2.5_
  
  - [ ] 7.3 統合テストの作成
    - MCPコマンドの起動テストを実装
    - stdin/stdout通信のテストを実装
    - _Requirements: 1.1, 1.2_

- [ ] 8. ビルドとlintの確認
  - pnpm buildを実行してTypeScriptのコンパイルを確認
  - pnpm lintを実行してコード品質を確認
  - エラーがあれば修正
  - _Requirements: 1.1, 3.1_
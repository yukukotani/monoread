# Implementation Plan

- [ ] 1. 基本的なプロジェクト構造とCLIハンドラを作成する
  - package.json の設定と依存関係の追加 (gunshi, pino, pino-pretty, @mizchi/readability)
  - src/presentation/cli.ts でgunshiを使用したCLI引数解析を実装
  - 基本的なヘルプメッセージとURL引数の受け取り機能
  - _Requirements: 3.1, 3.2, 3.4_

- [ ] 2. ログ設定とエラーハンドリングの基盤を実装する
  - src/libs/logger.ts でpinoを使用したログ設定を実装
  - src/libs/types.ts でResult型、ContentResult型、ErrorType型を定義
  - エラーハンドリング用のヘルパー関数を作成
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 3. ContentProviderインターフェースと基本的な型定義を作成する
  - src/libs/types.ts でContentProvider, ContentMetadata, Config型を定義
  - プロバイダインターフェースの基本構造を実装
  - _Requirements: 4.1, 4.2_

- [ ] 4. GitHubプロバイダを実装する
  - [ ] 4.1 GitHub URL判定機能を実装する
    - canHandle関数でGitHubファイルURLのパターンマッチングを実装
    - 単体テストでURL判定ロジックを検証
    - _Requirements: 1.1_

  - [ ] 4.2 GitHub API連携を実装する
    - GitHub APIを使用したファイル内容取得機能を実装
    - Accept: application/vnd.github.raw+json ヘッダーの設定
    - 単体テストでAPI呼び出しをモック化してテスト
    - _Requirements: 1.1, 1.2, 1.3_

- [ ] 5. コンテンツ抽出ロジックのコア機能を実装する
  - [ ] 5.1 extractContent関数の基本構造を実装する
    - プロバイダのループ処理とフォールバック機能
    - 成功時の結果返却ロジック
    - _Requirements: 2.1, 4.4_

  - [ ] 5.2 readabilityフォールバック機能を実装する
    - @mizchi/readabilityを使用したWebページ解析
    - fetch APIによるHTML取得
    - エラー処理とContentResult形式での結果返却
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 6. CLI統合とメイン実行ロジックを実装する
  - CLI引数からextractContent関数の呼び出し
  - 結果の標準出力への表示
  - エラーメッセージの適切な表示
  - _Requirements: 3.1, 3.3, 5.1, 5.2, 5.3_

- [ ] 7. テストスイートを充実させる
  - [ ] 7.1 GitHubプロバイダのエンドツーエンドテストを作成する
    - 実際のGitHubファイルURLでの動作確認テスト
    - プライベートリポジトリアクセス時のエラーハンドリングテスト
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ] 7.2 readabilityフォールバックのテストを作成する
    - 一般的なWebページでのコンテンツ抽出テスト
    - 存在しないURLでのエラーハンドリングテスト
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ] 7.3 CLI統合テストを作成する
    - コマンドライン引数解析のテスト
    - ヘルプメッセージ表示のテスト
    - 無効URL処理のテスト
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 8. package.jsonのbinエントリとビルド設定を完成させる
  - CLIコマンドとしての実行可能設定
  - TypeScriptビルド設定の最適化
  - pnpm lintの実行とエラー修正
  - _Requirements: 3.1_

- [ ] 9. 基本的な設定システムを実装する（オプショナル）
  - Config型に基づく設定ファイル読み込み
  - GitHub tokenやログレベル設定のサポート
  - _Requirements: 1.3, 6.2_
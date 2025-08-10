# Requirements Document

## Introduction

monoreadは、あらゆるURLをAI向けに最適化されたフォーマットで読み込むことができるCLIツールです。GitHubファイルには専用のAPI連携を提供し、その他のWebページには汎用的なreadabilityパッケージを使用します。プロバイダ固有の処理を後から追加できる拡張性の高い設計を採用します。

## Requirements

### Requirement 1

**User Story:** 開発者として、GitHub上のファイルのURLを指定してファイル内容を読み込めるようにしたい。コード解析やレビューを効率化するため。

#### Acceptance Criteria

1. WHEN ユーザーがGitHubファイルのURLを指定 THEN システムはGitHub APIを使用してファイル内容を取得する
2. WHEN GitHubファイルが存在しない THEN システムは適切なエラーメッセージを表示する
3. WHEN GitHubファイルがprivateリポジトリの場合 THEN システムは認証エラーメッセージを表示する

### Requirement 2

**User Story:** 開発者として、GitHub以外のWebページのURLを指定してAI向けに最適化された内容を読み込めるようにしたい。記事やドキュメントの内容をAIに効率的に読み込ませるため。

#### Acceptance Criteria

1. WHEN ユーザーがGitHub以外のURLを指定 THEN システムは@mizchi/readabilityパッケージを使用してコンテンツを抽出する
2. WHEN Webページが存在しない THEN システムは404エラーメッセージを表示する
3. WHEN Webページの読み込みに失敗した THEN システムは適切なエラーメッセージを表示する
4. WHEN 抽出されたコンテンツが空の場合 THEN システムは警告メッセージを表示する

### Requirement 3

**User Story:** 開発者として、`omniread <URL>`の形式でCLIツールを実行できるようにしたい。シンプルで覚えやすいインターフェースを使用するため。

#### Acceptance Criteria

1. WHEN ユーザーが`omniread <URL>`を実行 THEN システムは指定されたURLの内容を標準出力に表示する
2. WHEN ユーザーがURLを指定しない THEN システムはヘルプメッセージを表示する
3. WHEN ユーザーが無効なURLを指定 THEN システムは適切なエラーメッセージを表示する
4. WHEN ユーザーが`--help`オプションを指定 THEN システムは使用方法を表示する

### Requirement 4

**User Story:** 将来の開発者として、新しいプロバイダ（例：GitLab、Bitbucket等）を簡単に追加できるようにしたい。システムの拡張性を確保するため。

#### Acceptance Criteria

1. WHEN 新しいプロバイダクラスを作成 THEN システムは統一されたインターフェースを通じてプロバイダを呼び出す
2. WHEN プロバイダが特定のURLパターンをサポート THEN システムは自動的にそのプロバイダを選択する
3. WHEN 複数のプロバイダが同じURLをサポート THEN システムは優先度に基づいてプロバイダを選択する
4. WHEN プロバイダが利用できない場合 THEN システムはフォールバックプロバイダを使用する

### Requirement 5

**User Story:** 開発者として、読み込んだ内容をAI向けに最適化されたフォーマットで出力してもらいたい。AIツールとの連携を効率化するため。

#### Acceptance Criteria

1. WHEN コードファイルが取得される THEN システムはファイル名とファイルタイプを含めて出力する
2. WHEN 画像やバイナリファイルが指定される THEN システムは適切な警告メッセージを表示する
3. WHEN 出力内容が設定可能な上限を超える THEN システムは警告とともに内容を切り詰める

### Requirement 6

**User Story:** 開発者として、エラーが発生した場合に適切な診断情報を得られるようにしたい。問題解決を迅速に行うため。

#### Acceptance Criteria

1. WHEN ネットワークエラーが発生 THEN システムは接続の問題であることを明確に示すメッセージを表示する
2. WHEN APIレート制限に達した THEN システムは制限の詳細と回復時間を表示する
3. WHEN 認証エラーが発生 THEN システムは認証設定に関するヘルプ情報を表示する
4. WHEN 予期しないエラーが発生 THEN システムはデバッグに役立つ詳細情報を表示する
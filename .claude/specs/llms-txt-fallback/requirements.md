# 要件ドキュメント

## 概要

Monoreadのコンテンツ抽出処理において、URLに対応するプロバイダがない場合のフォールバック処理を改善します。現在は直接@mizchi/readabilityにフォールバックしていますが、readabilityが失敗したり結果が空の場合は、llms.txtファイルをセカンダリフォールバックとして利用します。llms.txtは、LLMがコンテンツを理解しやすいように最適化された形式でコンテンツを提供する仕組みです。

## 要件

### 要件 1: llms.txtの検出と取得

**ユーザーストーリー:** 開発者として、URLのルートパスにllms.txtが存在する場合、それを検出して取得したい。これにより、LLMに最適化されたコンテンツを優先的に提供できる。

#### 受け入れ基準

1. WHEN URLが与えられた THEN システムは そのURLのルートパスに/llms.txtが存在するかチェックする SHALL
2. IF llms.txtが存在する THEN システムは そのファイルをHTTP GETリクエストで取得する SHALL
3. WHEN llms.txtへのリクエストが404を返す THEN システムは llms.txtが存在しないと判定する SHALL
4. WHEN llms.txtへのリクエストがネットワークエラーを返す THEN システムは エラーをログに記録してllms.txtが存在しないと判定する SHALL

### 要件 2: フォールバック処理の優先順位

**ユーザーストーリー:** 開発者として、プロバイダがURLを処理できない場合、@mizchi/readability → llms.txt の順番でフォールバック処理を行いたい。これにより、標準的なコンテンツ抽出を試してから、LLM最適化コンテンツにフォールバックできる。

#### 受け入れ基準

1. WHEN 特定のプロバイダがURLを処理できない THEN システムは まず@mizchi/readabilityでコンテンツ抽出を試みる SHALL
2. IF readabilityが成功してコンテンツが取得できた THEN システムは そのコンテンツを返す SHALL
3. IF readabilityが失敗またはコンテンツが空だった THEN システムは llms.txtの存在をチェックする SHALL
4. IF llms.txtが存在して取得に成功した THEN システムは そのコンテンツを返す SHALL
5. WHEN すべてのフォールバック処理が失敗した THEN システムは 適切なエラーメッセージを返す SHALL

### 要件 3: readability処理の改善

**ユーザーストーリー:** 開発者として、readabilityが失敗またはコンテンツが空の場合を適切に判定したい。これにより、llms.txtフォールバックが必要な場合を正確に識別できる。

#### 受け入れ基準

1. WHEN readabilityが例外をスローした THEN システムは readabilityが失敗したと判定する SHALL
2. WHEN readabilityが空文字列を返した THEN システムは readabilityが失敗したと判定する SHALL
3. WHEN readabilityが空白文字のみを返した THEN システムは readabilityが失敗したと判定する SHALL
4. IF readabilityが失敗した THEN システムは ログに「readability failed, trying llms.txt fallback」と記録する SHALL

### 要件 4: llms.txtコンテンツの処理

**ユーザーストーリー:** 開発者として、llms.txtから取得したコンテンツを適切な形式で返したい。これにより、他のプロバイダと同じインターフェースでコンテンツを提供できる。

#### 受け入れ基準

1. WHEN llms.txtが正常に取得された THEN システムは ContentResult形式で成功レスポンスを返す SHALL
2. IF llms.txtの内容が空である THEN システムは 適切なエラーメッセージを返す SHALL
3. WHEN llms.txtからコンテンツを返す THEN システムは metadataのsourceフィールドに元のURLを設定する SHALL
4. WHEN llms.txtからコンテンツを返す THEN システムは ログに「llms.txt extraction successful」と記録する SHALL

### 要件 5: エラーハンドリング

**ユーザーストーリー:** 開発者として、llms.txt取得時のエラーを適切に処理したい。これにより、エラーが発生してもシステムが適切なエラーメッセージを返すことができる。

#### 受け入れ基準

1. WHEN llms.txtへのリクエストがタイムアウトした THEN システムは エラーをログに記録して適切なエラーメッセージを返す SHALL
2. WHEN llms.txtへのリクエストが5xx系エラーを返した THEN システムは エラーをログに記録して適切なエラーメッセージを返す SHALL
3. WHEN llms.txtのURLパース処理でエラーが発生した THEN システムは エラーをログに記録して適切なエラーメッセージを返す SHALL
4. IF llms.txt取得時にエラーが発生した THEN システムは エラー詳細をデバッグログに記録する SHALL
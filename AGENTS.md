# リポジトリ運用ガイドライン（AI）

このファイルを、この repo における AI 向け指示の正本として扱う。
`CLAUDE.md` と `.github/copilot-instructions.md` は、この内容を前提にしたツール別の薄い補足とする。

## 返答ルール

- 返答・説明・コメント・提案は日本語で統一する。
- 不明点は断定せず、前提不足として明示する。
- 結論 -> 理由 -> 実施内容の順で簡潔に説明する。

## Skills / Rules の編集提案

- 修正や新規実装により `.skills` や `.claude/rules` と実装内容が食い違う場合、または新しい実装ルールが必要になった場合は、それらの編集を提案する。

## プロジェクトの前提

- Project Hub は、Linear 風の課題管理 / プロジェクト管理ツールを動くプロダクト試作として育てる repo。
- 主役は `web` と `api`。
- `ext-api` は将来の外部 API 面を探る Go 実装で、完成済みの正式境界ではない。
- 正式なローカル開発導線は `.devcontainer/docker-compose.yml`。
- ルートの `docker-compose.yml` は手元実行用の補助であり、全体の正ではない。

## 基本方針

- 変更は影響範囲を最小化し、無関係な修正を混ぜない。
- 既存の命名規則、責務分割、依存関係の向きを尊重する。
- 既存実装と矛盾する新規パターンを安易に導入しない。
- public API、DB スキーマ、設定ファイル、外部連携仕様を変更する場合は、影響範囲と互換性への影響を明示する。
- null 安全性、入力バリデーション、認可、例外処理、ログ出力を省略しない。
- 秘密情報、接続文字列、API キーをコードに直接書かない。
- 修正にテストが必要な場合は、既存のテスト方針に従って追加・更新する。

## 参照優先順位

- `@AGENTS.local.md` が存在する場合は先に読む。存在しなければ無視してよい。
- ユーザーが `@path/to/file` 形式でファイルを指定した場合は、まずそのファイルを読む。
- 定義ジャンプ、参照解決、影響範囲確認が必要な場合は Serena MCP を優先して使用する。
- 実装前に既存コードの命名、責務分割、例外処理パターンを確認してから変更する。

## 質問フォーマット

スキルやルール内でユーザーへの質問を定義する場合は、以下の形式で統一する。

```markdown
**質問 A: ~~**

1. 選択肢 1or 質問 1
2. 選択肢 2or 質問 2

**質問 B: ~~**

1. 選択肢 1or 質問 1
2. 選択肢 2or 質問 2
3. 選択肢 3or 質問 3
```

回答とみなす例

- `a1b3c2`
- `A1B3C2`
- `A1 B2 C1`
- 改行区切り:

```text
A1
B2
C1
```

## 厳守: ツール利用

- JavaScript / TypeScript 側の package management は `pnpm` を使う。

## プロジェクト構成

- `web/`: Next.js App Router の UI。TypeScript、React 19、Tailwind CSS v4、TanStack Query、SignalR を使う。
- `api/`: ASP.NET Core 10 の本体バックエンド。Cookie 認証、EF Core + PostgreSQL、HotChocolate GraphQL、SignalR を担当する。
- `ext-api/`: Go 1.24 の探索領域。`api` の内部 API と PAT introspection に依存する外部 read 面を試す。
- `docs/`: アーキテクチャや外部 API の意図を説明する。
- `deploy/`: 将来の配備構成のスケッチであり、現時点の正ではない。

## 実装上の解釈

- `web` は `web/app/` を起点に、UI は `web/components/`、状態取得と mutation は `web/hooks/`、HTTP は `web/lib/` に寄せる。
- `api` は Controller を薄く保ち、read は QueryService、write は CommandService に寄せる。
- `api` の認証は Cookie ベースで、`InternalApiController` は `ext-api` 用の内部専用 API として扱う。
- `api` の GraphQL は read 面として扱う。
- `api` の DB は現時点で migration ベースではなく `EnsureCreated` + seed を前提にする。
- `ext-api` は探索中の read surface として扱い、固定された完成形だと思い込まない。

## 変更時の確認

- `web` の確認は `pnpm --dir web lint` が基本。
- `api` の確認は `dotnet build api/LinearStyle.Api.csproj`。
- `ext-api` の確認は `cd ext-api && go test ./...`。
- 全体確認は `pnpm run lint`、`pnpm run check`、`pnpm run test` を優先する。
- Dev Container の起動や DB リセット方法を変えるなら `README.md` と `CONTRIBUTING.md` も更新する。

## 禁止・非推奨

- 推測でライブラリやフレームワークのバージョンを決めつけない。
- 実在しないクラス、メソッド、設定値を断定的に提案しない。
- `ext-api` を完成済みの正式境界として断定しない。
- 既存コードに存在しないアーキテクチャへ大規模に寄せる提案を、根拠なく行わない。

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
- Dev Container は git 管理外の `.devcontainer/docker-compose.local.yml` も読み込む。これは SSH agent、GitHub CLI、AI CLI などの個人ローカルな認証資産共有に使い、標準挙動は `.devcontainer/docker-compose.local.example.yml` の no-op を前提にする。
- Dev Container のホスト向けポート公開は `devcontainer.json` の `forwardPorts` に寄せ、`.devcontainer/docker-compose.yml` では固定 host port publish を避ける。
- ルートには `docker-compose.yml` を置かず、手元実行用の DB 起動も `.devcontainer/docker-compose.yml` に寄せる。
- Dev Container 接続先で使う Node.js / pnpm / Go などの開発ツールは `devcontainer.json` の features で導入し、`.devcontainer/Dockerfile` で他イメージからランタイムを部分コピーしない。
- `mise` は host / CI 側の task runner として扱い、Dev Container image には導入しない。
- Dev Container の `api` 接続セッションは .NET SDK image 既存の `ubuntu` user を使う。Dockerfile では `ubuntu` など base image 固有 user の rename をしない。ホスト UID/GID への同期は Dev Container の `updateRemoteUserUID` に任せる。
- UID 1000 に既存 user がいない base image へ切り替える必要が出た場合は、`common-utils` feature で作る user と `remoteUser` / cache volume の home path を合わせて見直す。
- Dev Container の開発ツール version は互換性上の必要がある場合だけ固定し、通常は feature の既定値や `latest` / `lts` / major tag に追従する。feature lock file は tracked baseline に含めない。
- `web` service の Next.js dev server 起動コマンドは `.devcontainer/Dockerfile` の `web` stage の `CMD` を正とし、Compose 側へ重複して書かない。
- ローカル検証で Next.js dev server を別途ホスト起動しない。画面確認は Dev Container の `web` service を正とし、ホストからは `http://localhost:3000`、Compose network 内からは `http://web:3000` を見る。
- `api` service は Dev Container の workspace container として待機させ、Compose 起動時に `dotnet watch` を自動起動しない。API を動かすときは Dev Container 内で `pnpm run dev:api` を明示的に実行する。
- 標準 Compose では `node_modules` や pnpm store を分離するための named volume を `web` service に足さない。ホスト実行とコンテナ実行を頻繁に切り替える利用者は、必要に応じて自身で `node_modules` を作り直す。
- `ext-api` の Compose service は残すが、通常の Dev Container 起動対象やポート公開対象には含めない。本実装として扱う段階で必要な設定を追加する。
- `ext-api` は opt-in の開発用 service として、専用 image は build せず、Compose から Go 公式 image の既定ユーザーと既定 cache path を使う。通常接続する `api` service の non-root 方針とは分けて扱う。

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

## CI / CD

- GitHub Actions では `mise` を使わず、`pnpm` / `dotnet` / `go` を直接実行する。
- Pull Request では check のみを実行し、GitHub Pages への deploy は行わない。
- `main` へ push された内容を GitHub Pages に常時公開する。
- GitHub Pages 公開は発表会向けの一時的な mock 公開であり、最終的な SSR 配備方針ではない。
- Pages 用 build では `NEXT_OUTPUT=export` を指定し、`web/next.config.ts` で一時的に static export と `/project-hub` base path を有効にする。

## 実装上の解釈

- `web` は `web/app/` を起点に、UI は `web/components/`、状態取得と mutation は `web/hooks/`、HTTP は `web/lib/` に寄せる。
- `api` は Controller を薄く保ち、read は QueryService、write は CommandService に寄せる。
- `api` の認証は Cookie ベースで、`InternalApiController` は `ext-api` 用の内部専用 API として扱う。
- `api` の GraphQL は read 面として扱う。
- `api` の DB は現時点で migration ベースではなく `EnsureCreated` + seed を前提にする。
- `ext-api` は探索中の read surface として扱い、固定された完成形だと思い込まない。

## 変更時の確認

- `web` の確認は `pnpm --dir web lint` が基本。
- `web` のブラウザ確認は起動済みの Dev Container `web` service を対象にする。Playwright CLI は原則 `api` コンテナ内で実行し、対象 URL は `http://web:3000` を使う。
- `api` の確認は `dotnet build api/LinearStyle.Api.csproj`。
- `ext-api` の確認は `cd ext-api && go test ./...`。
- 全体確認は `pnpm run lint`、`pnpm run check`、`pnpm run test` を優先する。
- Dev Container の起動や DB リセット方法を変えるなら `README.md` と `CONTRIBUTING.md` も更新する。

## 禁止・非推奨

- 推測でライブラリやフレームワークのバージョンを決めつけない。
- 実在しないクラス、メソッド、設定値を断定的に提案しない。
- `ext-api` を完成済みの正式境界として断定しない。
- 既存コードに存在しないアーキテクチャへ大規模に寄せる提案を、根拠なく行わない。

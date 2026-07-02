# Project Hub

このリポジトリは、Linear 風の課題管理 / プロジェクト管理ツールを**動くプロダクト試作として育てるための repo**です。汎用テンプレートや monorepo の見本として整理することは、このフェーズの目的にしていません。

## いま主に扱う実行面

- `web`: ブラウザから使う UI。Next.js App Router を使ったフロントエンドです。
- `api`: アプリ本体のバックエンド。Cookie 認証、DB、GraphQL read model、SignalR を担当します。
- `ext-api`: GitLab の REST API のような外部公開面を将来的に提供するための探索領域です。現時点では独立実装を約束する境界ではなく、Go 実装も参考材料として扱います。
- `postgres`: 開発用データベースです。

主役は `web` と `api` です。`ext-api` は将来広げる可能性がある外部 API 面として位置づけています。

## ローカル開発の正

この repo で正式なローカル開発導線は **[`.devcontainer/docker-compose.yml`](./.devcontainer/docker-compose.yml)** です。

個人の SSH agent、GitHub CLI、AI CLI などのホストローカルな認証資産を Dev Container に共有したい場合は、git 管理外の `.devcontainer/docker-compose.local.yml` を使います。初回起動時に [`.devcontainer/docker-compose.local.example.yml`](./.devcontainer/docker-compose.local.example.yml) から no-op の local override が作られるため、必要なユーザーだけ中身を編集してください。

`ext-api` の Compose service は残していますが、通常の Dev Container 起動対象には含めません。本実装として扱う段階で、起動方法やポート公開などの必要な設定を追加します。

### 前提ツール

- Git
- Docker Desktop または Docker Engine
- VS Code + Dev Containers 拡張、または互換エディタ

### 起動方法

1. Dev Container 対応エディタで repo を開き、コンテナを起動します。
2. `.devcontainer/docker-compose.yml` と、git 管理外の `.devcontainer/docker-compose.local.yml` が `postgres` / `api` / `web` を起動します。
3. ホストへのポート公開は `devcontainer.json` の `forwardPorts` で行います。
4. `web` は `http://localhost:3000` で確認できます。`api` は自動起動しないため、必要なときに Dev Container 内で `pnpm run dev:api` を実行してから `http://localhost:5050` を確認します。

### 初回起動で行われること

- `web` image の既定コマンドが `pnpm install --frozen-lockfile` と Next.js dev server を実行します
- `api` service は workspace container として待機します。`dotnet watch` は自動起動しません

`api` を動かす場合は、Dev Container 内で `pnpm run dev:api` を実行してください。このとき `dotnet restore` と PostgreSQL に対する `EnsureCreated` / demo seed が走ります。

### 開発コンテナの実行ユーザー

通常起動する Dev Container の接続セッションは非 root ユーザーで動かします。

- `api`: .NET SDK image 既存の `ubuntu`
- `web`: Node 公式イメージ既存の `node`

Docker image の build 中に OS パッケージを導入する処理は root で実行しますが、Dev Container 起動後の VS Code 接続セッションは `ubuntu` で動かし、ホスト UID/GID への同期は Dev Container に任せます。Dev Container 接続先で使う Node.js / pnpm / Go は `devcontainer.json` の features で導入します。`ext-api` は opt-in の開発用 service なので、専用 image は build せず、Compose から Go 公式 image の既定ユーザーと既定 cache path を使います。

### 変更を壊していないか確認する

Dev Container に接続したターミナルで以下を実行します。

```bash
pnpm run check
```

`web` の ESLint、docs の textlint、`api` の build、`ext-api` の `go test` をまとめて確認します。

### Playwright CLI での画面確認

`api` コンテナでは、root の `package.json` に定義した `@playwright/cli` を使ってローカルアプリを確認します。Dev Container 作成後に `.devcontainer/scripts/install-playwright-tools.sh` が `pnpm install --frozen-lockfile` を実行し、Chromium の OS 依存と headless shell を導入します。日本語 UI のスクリーンショットが豆腐化しないよう、`api` image には `fonts-noto-cjk` も入れています。

Playwright CLI は Compose ネットワーク内から実行するため、Web UI は `http://web:3000` で開きます。Remote-SSH 経由で手元のブラウザから確認するときは、従来どおり `http://localhost:3000` を使います。

```bash
pnpm exec playwright-cli --version
pnpm exec playwright-cli open http://web:3000
pnpm exec playwright-cli snapshot
pnpm exec playwright-cli screenshot --filename=output/playwright/home.png
pnpm exec playwright-cli close
```

日常の smoke 確認は次の script でも実行できます。Playwright の成果物は `output/playwright/` に出力され、git 管理には含めません。

```bash
pnpm run check:playwright
```

### デモ用の認証情報

- Email: `demo@example.com`
- Password: `demo123!`
- PAT: `pat_demo_readonly_local`

## GitHub Pages への一時公開

発表会向けに、`main` の `web` を GitHub Pages へ常時公開します。これは API なしの mock UI を見せるための一時的な導線であり、最終的な SSR 配備方針ではありません。

Pull Request では check のみを実行し、Pages への deploy は `main` push のみで行います。GitHub Actions では `mise` を使わず、`pnpm` / `dotnet` / `go` を直接実行します。

Pages 用 build では `NEXT_OUTPUT=export` を指定し、Next.js の static export と repository Pages 用の `/project-hub` base path を一時的に有効にします。通常のローカル開発や将来の SSR build では、現行どおり `output: "standalone"` を使います。

## いま試していること

- Cookie ベース認証のあるアプリ体験
- ボード / リスト / タイムラインを前提にした課題管理 UI
- GraphQL を read 面として使う API 設計
- SignalR による軽量なリアルタイム無効化
- PAT ベースの外部 API 面をどこまで分けるかの見極め

## 現在の実装配置について

コードは `web` / `api` / `ext-api` を repo ルートに置いています。`web` と `api` を第一級の実行面として扱い、`ext-api` は探索的な外部 API 面として同じ階層に置いています。`packages/` や共有ライブラリ前提の構成は、このフェーズでは採用していません。

## このフェーズで正ではないもの

- `deploy/`: 将来の配備構成を考えるためのスケッチ置き場
- 既存の `ext-api` 実装: 外部 API 面の参考実装であり、完成済みの正式境界ではない
- 配備用のサービス別 Dockerfile / イメージ設計: まだ固定しない

## 参考ドキュメント

- [docs/architecture.md](./docs/architecture.md): 現在の意図した構成と、将来の拡張方針
- [docs/external-api.md](./docs/external-api.md): 外部 API 面の現状の位置づけと想定仕様
- [CONTRIBUTING.md](./CONTRIBUTING.md): チーム向けの開発導線、確認コマンド、DB リセット手順

## DB を壊したときの復旧

この段階では migration ではなく `EnsureCreated` を使っています。schema 変更後にローカル DB が壊れた場合は、**ホスト側のターミナルで**次を実行してください。

```bash
pnpm run dev:db:reset
```

その後に Dev Container 内で `pnpm run dev:api` を起動すると、DB は再作成されて demo seed が入ります。

## 当面は後回しにすること

- 配備構成の正式化
- 配備用のサービス別 Dockerfile / イメージ設計
- `ext-api` を本当に別サービスへ切り出すかの最終決定
- 共有 package / 共有型ディレクトリの導入

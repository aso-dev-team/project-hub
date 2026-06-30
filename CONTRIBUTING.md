# Contributing

このリポジトリは、`web` と `api` を中心に育てている Project Hub の試作です。共有前提の最低限の運用だけをここにまとめます。

## 前提

- Git
- Docker Desktop または Docker Engine
- VS Code + Dev Containers 拡張、または互換エディタ

ローカル直実行もできますが、**正式な開発導線は `.devcontainer/docker-compose.yml`** です。

SSH agent、GitHub CLI、AI CLI などのホストローカルな認証資産を Dev Container に共有したい場合は、git 管理外の `.devcontainer/docker-compose.local.yml` を使ってください。初回起動時に `.devcontainer/docker-compose.local.example.yml` から no-op の local override が作られるため、必要なユーザーだけ中身を編集します。

## 最初の入り方

1. repo を clone する
2. Dev Container で開く
3. 初回起動時に `.devcontainer/docker-compose.local.yml` が無ければ、example から no-op の local override が作られる
4. 起動直後は `web` image の既定コマンドで `pnpm install --frozen-lockfile` と Next.js dev server が走るので、数分待つ
5. `devcontainer.json` の `forwardPorts` で転送された `http://localhost:3000` をブラウザで確認する
6. `api` を動かす場合は、Dev Container 内で `pnpm run dev:api` を実行してから `http://localhost:5050/healthz` を確認する

通常起動する Dev Container の接続セッションは root ではなく、`api` は .NET SDK image 既存の `ubuntu`、`web` は Node 公式イメージ既存の `node` を使います。Docker image の build 中に OS パッケージを入れる処理だけ root を使います。Dev Container 接続先で使う Node.js / pnpm / Go は `devcontainer.json` の features で導入し、ホスト UID/GID への同期は Dev Container に任せます。`ext-api` は opt-in の開発用 service なので、専用 image は build せず、Compose から Go 公式 image の既定ユーザーと既定 cache path を使います。

## デモ用アカウント

- Email: `demo@example.com`
- Password: `demo123!`
- PAT: `pat_demo_readonly_local`

## 日常の確認コマンド

Dev Container に接続したターミナルで実行します。

```bash
pnpm run lint
pnpm run check
pnpm run test
pnpm run check:playwright
```

内容は次の通りです。

- `pnpm run lint`: `web` の ESLint と docs の textlint
- `pnpm run check`: `lint` + `api` の build + `ext-api` の `go test`
- `pnpm run test`: 現状は `ext-api` の `go test`
- `pnpm run check:playwright`: `api` コンテナ内の Playwright CLI で `web` の smoke screenshot を取得

## CI / CD

GitHub Actions では `mise` を使わず、`pnpm` / `dotnet` / `go` を直接実行します。

Pull Request では check のみを実行します。GitHub Pages への deploy は `main` push のみで行い、`web` を static export した成果物を公開します。この Pages 公開は発表会向けの一時的な mock UI 公開であり、最終的な SSR 配備方針ではありません。

Pages 用 build では `NEXT_OUTPUT=export` を指定します。これにより `web/next.config.ts` が一時的に `output: "export"` と repository Pages 用の `/project-hub` base path を有効にします。通常の開発や SSR build では `NEXT_OUTPUT=export` を指定しません。

## Playwright CLI

`api` コンテナでは、root の `package.json` に定義した `@playwright/cli` を使ってローカルアプリを確認します。Dev Container 作成後に `.devcontainer/scripts/install-playwright-tools.sh` が `pnpm install --frozen-lockfile` を実行し、Chromium の OS 依存と headless shell を導入します。日本語 UI のスクリーンショット品質を安定させるため、`api` image には `fonts-noto-cjk` も入れています。

Compose ネットワーク内から使うため、Playwright CLI では Web UI を `http://web:3000` で開きます。Remote-SSH 経由で手元のブラウザから確認するときは、`http://localhost:3000` を使ってください。

```bash
pnpm exec playwright-cli --version
pnpm exec playwright-cli open http://web:3000
pnpm exec playwright-cli snapshot
pnpm exec playwright-cli screenshot --filename=output/playwright/home.png
pnpm exec playwright-cli close
```

生成した screenshot などの成果物は `output/playwright/` に置き、git 管理には含めません。

## DB 運用の当面ルール

`api` は現時点で EF Core migration ではなく `EnsureCreated` + seed data を使っています。複数人開発で schema が変わったときは、**ローカル DB を捨てて作り直す**前提で運用してください。

### DB リセット

ホスト側のターミナルで実行します。

```bash
pnpm run dev:db:reset
```

その後、Dev Container 内で `pnpm run dev:api` を起動してください。API 起動時に DB は再作成されて demo seed が入ります。

## 変更時の期待値

- 開発導線を変えたら `README.md` とこのファイルを更新する
- `ext-api` は探索的な外部 API 面として扱い、完成済みの固定境界だと思わない
- schema 変更を入れるときは、migration 未導入であることを前提に他メンバーへ影響を共有する

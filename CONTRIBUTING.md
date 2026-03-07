# Contributing

このリポジトリは、`web` と `api` を中心に育てている Project Hub の試作です。共有前提の最低限の運用だけをここにまとめます。

## 前提

- Git
- Docker Desktop または Docker Engine
- VS Code + Dev Containers 拡張、または互換エディタ

ローカル直実行もできますが、**正式な開発導線は `.devcontainer/docker-compose.yml`** です。

## 最初の入り方

1. repo を clone する
2. Dev Container で開く
3. 起動直後は以下が走るので、数分待つ
   - `web`: `pnpm install --frozen-lockfile`
   - `api`: `dotnet restore`
   - `ext-api`: `go mod download`
   - `api`: PostgreSQL へ接続し、必要なら seed data を投入
4. ブラウザで以下を確認する
   - `http://localhost:3000`
   - `http://localhost:5050/healthz`

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
```

内容は次の通りです。

- `pnpm run lint`: `web` の ESLint と docs の textlint
- `pnpm run check`: `lint` + `api` の build + `ext-api` の `go test`
- `pnpm run test`: 現状は `ext-api` の `go test`

## DB 運用の当面ルール

`api` は現時点で EF Core migration ではなく `EnsureCreated` + seed data を使っています。複数人開発で schema が変わったときは、**ローカル DB を捨てて作り直す**前提で運用してください。

### DB リセット

ホスト側のターミナルで実行します。

```bash
pnpm run dev:db:reset
```

その後、Dev Container を再起動するか、`.devcontainer/docker-compose.yml` を立ち上げ直してください。起動時に DB は再作成されて demo seed が入ります。

## 変更時の期待値

- 開発導線を変えたら `README.md` とこのファイルを更新する
- `ext-api` は探索的な外部 API 面として扱い、完成済みの固定境界だと思わない
- schema 変更を入れるときは、migration 未導入であることを前提に他メンバーへ影響を共有する

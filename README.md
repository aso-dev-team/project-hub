# Project Hub

このリポジトリは、Linear 風の課題管理 / プロジェクト管理ツールを**動くプロダクト試作として育てるための repo**です。汎用テンプレートや monorepo の見本として整理することは、このフェーズの目的にしていません。

## いま主に扱う実行面

- `web`: ブラウザから使う UI。Next.js App Router を使ったフロントエンドです。
- `api`: アプリ本体のバックエンド。Cookie 認証、DB、GraphQL read model、SignalR を担当します。
- `ext-api`: GitLab の REST API のような外部公開面を将来的に提供するための探索領域です。現時点では独立実装を約束する境界ではなく、Go 実装も参考材料として扱います。
- `postgres`: 開発用データベースです。

主役は `web` と `api` です。`ext-api` は将来広げる可能性がある外部 API 面として位置づけています。

## ローカル開発の正

この repo で正式なローカル開発導線は **[`.devcontainer/docker-compose.yml`](./.devcontainer/docker-compose.yml)** です。ルートの `docker-compose.yml` は手元実行用の雛形が残っている状態で、現時点の正ではありません。

### 前提ツール

- Git
- Docker Desktop または Docker Engine
- VS Code + Dev Containers 拡張、または互換エディタ

### 起動方法

1. Dev Container 対応エディタで repo を開き、コンテナを起動します。
2. `.devcontainer/docker-compose.yml` が `postgres` / `api` / `web` / `ext-api` を起動します。
3. 主要な確認先は以下です。
   - `web`: `http://localhost:3000`
   - `api`: `http://localhost:5050`
   - `ext-api`: `http://localhost:8081`

### 初回起動で行われること

- `web` が `pnpm install --frozen-lockfile` を実行します
- `api` が `dotnet restore` を実行します
- `ext-api` が `go mod download` を実行します
- `api` が PostgreSQL に対して `EnsureCreated` と demo seed を実行します

初回は依存解決に数分かかることがあります。ブラウザ確認は各サービスの起動が落ち着いてから行ってください。

### 変更を壊していないか確認する

Dev Container に接続したターミナルで以下を実行します。

```bash
pnpm run check
```

`web` の ESLint、docs の textlint、`api` の build、`ext-api` の `go test` をまとめて確認します。

### デモ用の認証情報

- Email: `demo@example.com`
- Password: `demo123!`
- PAT: `pat_demo_readonly_local`

## いま試していること

- Cookie ベース認証のあるアプリ体験
- ボード / リスト / タイムラインを前提にした課題管理 UI
- GraphQL を read 面として使う API 設計
- SignalR による軽量なリアルタイム無効化
- PAT ベースの外部 API 面をどこまで分けるかの見極め

## 現在の実装配置について

コードは `web` / `api` / `ext-api` を repo ルートに置いています。`web` と `api` を第一級の実行面として扱い、`ext-api` は探索的な外部 API 面として同じ階層に置いています。`packages/` や共有ライブラリ前提の構成は、このフェーズでは採用していません。

## このフェーズで正ではないもの

- ルートの `docker-compose.yml`: 手動実行や雛形確認のために残っている補助ファイル
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

その後に Dev Container を再起動すると、DB は再作成されて demo seed が入ります。

## 当面は後回しにすること

- 配備構成の正式化
- 配備用のサービス別 Dockerfile / イメージ設計
- `ext-api` を本当に別サービスへ切り出すかの最終決定
- 共有 package / 共有型ディレクトリの導入

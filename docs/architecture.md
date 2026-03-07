# Architecture

## この文書の目的

この repo は、汎用テンプレートや monorepo の見本ではなく、Project Hub を**動くプロダクト試作として育てる**ための土台です。この文書では、いま意図している構成と、まだ固定していない将来要素を分けて扱います。

## 現在の意図した構成

### web

- Next.js App Router によるユーザー向け UI
- ボード / リスト / タイムライン体験を組み立てる主画面
- TanStack Query を中心に read / mutation / invalidate を扱う
- SignalR は `BoardChanged` を受けて最低限の再取得だけを行う

### api

- アプリ本体のバックエンド
- Cookie 認証、DB の正、SignalR、GraphQL read model を担当
- EF Core + PostgreSQL を現在の基準実装にする
- write は REST、read は QueryService / GraphQL へ寄せる
- `web` が必要とするデータと認証フローを最優先で支える

### ext-api

- 将来的に公開したい外部 API 面の名前
- GitLab の REST API のような読み味を持つ面を想定している
- 現時点では `web` / `api` と同格の完成済み境界ではない
- 既存の Go 実装は参考材料であり、責務・技術・分離方法は再検討可能

### postgres

- 開発時の永続化層
- 現在は `api` の実装都合を支えるための内部依存として扱う

## 現在の実装メモ

- ソースは `web` / `api` / `ext-api` を repo ルートに置いている
- 配置は `web` / `api` / `ext-api` を第一級要素として見せるためのもの
- 正式なローカル開発導線は `.devcontainer/docker-compose.yml`
- ルートの `docker-compose.yml` と `deploy/` は現時点の正しいアーキテクチャ表現ではない

## 近い将来に広げる候補

- `ext-api` をアプリ本体からどう切るかの再設計
- PAT 発行 / 失効 / scope 管理 / 監査ログ
- GraphQL / REST の read/write 境界の見直し
- board / list / timeline 以外の操作面
- read 最適化のための QueryService 実装差し替え

## いま固定しないこと

- `ext-api` を独立サービスとして維持するかどうか
- `ext-api` の技術選定を Go に固定すること
- `packages/` や共有ライブラリ前提の構成
- EF Core migration ベースの正式運用
- 配備用のサービス別 Dockerfile / イメージ設計
- 配備構成や前段プロキシの正式設計

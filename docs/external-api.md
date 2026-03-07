# External API

この文書は、Project Hub の**将来の外部 API 面**についての意図をまとめたものです。現時点で `web` と `api` が主役であり、ここに書く内容はまだ安定した契約ではありません。

## 現在の位置づけ

- `ext-api` は、GitLab 風の外部公開 API 面を検討するための探索領域です
- 既存の Go 実装は参考実装であり、独立サービスであることをまだ約束しません
- 認証の正は `api` 側に置き、PAT の introspection を通して外部 API 面へ権限情報を渡す想定です

## 想定しているベース URL

- REST: `/api/ext/v4`
- GraphQL: `/api/ext/v4/graphql`

## 想定している認証

- `Authorization: Bearer <PAT>`
- PAT の発行 / 失効 / scope 管理は `api` 側が担当する
- 外部 API 面は PAT を自前管理せず、必要な権限情報を内側から受け取る

## まず提供したい read 面

### REST

- `GET /api/ext/v4/version`
- `GET /api/ext/v4/teams`
- `GET /api/ext/v4/projects?team_id=...`
- `GET /api/ext/v4/issues?team_id=...&project_id=...&search=...`

### GraphQL

- `version`
- `teams`
- `projects(teamId)`
- `issues(teamId, projectId, search)`

## まだ固定しないこと

- write 系をどこまで外へ出すか
- jobs / webhook / import / export をどう公開するか
- `ext-api` を `api` と別プロセスで持ち続けるか
- Go 実装を正式採用するか

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
  - `web/app/`: ルーティングとページ (`layout.tsx` / `page.tsx` / `providers.tsx`)。
  - `web/components/`: UI。`board/`（ボード画面）、`auth/`、`rich-text/`、`ui/`（shadcn 系プリミティブ）に分かれる。
  - `web/hooks/`: データ取得・mutation・realtime。TanStack Query のクエリキーと optimistic update をここに置く（`use-board.ts`、`use-auth.ts`、`use-board-realtime.ts` など）。
  - `web/lib/`: HTTP クライアント (`api-client.ts` / `graphql-client.ts`)、TanStack Query の設定 (`query-client.ts`)、汎用 util。
  - `web/types/api.ts`: `api` の Contracts に対応する型定義。
- `api/`: ASP.NET Core 10 の本体バックエンド。Cookie 認証、EF Core + PostgreSQL、HotChocolate GraphQL、SignalR を担当する。
  - `api/Controllers/`: `AuthController`（Cookie 認証）、`BoardController`（`/api/app/*`、`web` 向け read/write）、`InternalApiController`（`/internal/*`、`ext-api` 専用・`ApiExplorerSettings(IgnoreApi = true)`）。
  - `api/Services/`: read は `IBoardQueryService`/`BoardQueryService`、write は `IIssueCommandService`/`IssueCommandService` に分離。ほかに `IUserSessionService`、`IPatService`/`PatService`（PAT introspection）、`IRealtimeNotifier`/`SignalRRealtimeNotifier`、`IPasswordHasher`/`Pbkdf2PasswordHasher`。
  - `api/Data/`: `AppDbContext`、`AppDbContextFactory`（design-time 用）、`AppDbSeeder`（起動時に `EnsureCreated` + demo seed を実行）。
  - `api/Domain/Entities.cs`: EF Core エンティティの正。`Workspace > Team > Project > Issue` の階層と `TeamMembership`、`PersonalAccessToken`、`PatPrincipal` を持つ。
  - `api/GraphQL/AppQuery.cs`: read 専用の GraphQL query root（`Viewer`/`Teams`/`Projects`/`Board`/`Issues`/`Timeline`）。write は GraphQL に生やさない。
  - `api/Hubs/BoardHub.cs`: `JoinProject`/`LeaveProject` グループ管理のみを持つ SignalR Hub。
  - `api/Contracts/`: Controller/GraphQL/Service 間で共有する DTO (`ApiContracts.cs`) と Entity→DTO 変換 (`ApiMappings.cs`)。
- `ext-api/`: Go 1.24 の探索領域。`api` の内部 API と PAT introspection に依存する外部 read 面を試す。
  - `ext-api/cmd/server/main.go`: エントリポイント。
  - `ext-api/internal/httpapi/`: `router.go`（`/api/ext/v4/*` のルーティング）、`middleware.go`（`withPAT`: Bearer PAT を internal API に introspect させ scope を検証）、`rest.go`/`graphql.go`（ハンドラ実装）。
  - `ext-api/internal/internalapi/client.go`: `api` の `/internal/*` を呼ぶ HTTP クライアント。`ext-api` 自身は認証・認可・ドメイン整合性を持たない。
  - `ext-api/internal/model/`: `ext-api` 側のレスポンスモデル。
- `docs/`: アーキテクチャや外部 API の意図を説明する（`architecture.md`、`external-api.md`、`figma-guide.md`）。
- `deploy/`: 将来の配備構成のスケッチであり、現時点の正ではない。

## アーキテクチャ概要

サービス間の依存方向は `web → api ← ext-api` で、ドメインと認可の正は常に `api` にある。

- **認証**: `web` は `api` に対し Cookie ベースで認証する（`AuthController` が発行する `linear_like.session` Cookie、`SameSite=Lax`）。ブラウザからの `fetch` は `credentials: "include"` を必須とする（`web/lib/api-client.ts`）。
- **`web` ⇄ `api` の read/write 分離**: 書き込みは REST (`POST /api/app/issues`、`POST /api/app/issues/{id}/move` など、`[Authorize]` 必須) を経由し、読み取りは REST (`GET /api/app/board`) または GraphQL (`/graphql`、`RequireAuthorization()`) のどちらからでも取得できる。GraphQL に write operation は存在しない。
- **`ext-api` ⇄ `api` の関係**: `ext-api` は独自の DB アクセスや認可判定を持たず、すべて `api` の `InternalApiController`（`/internal/*`）を薄く叩くだけの中継。呼び出しには固定の共有シークレット (`X-Internal-Service-Key` ヘッダ、設定キーは `Demo:InternalServiceApiKey` / 環境変数 `Demo__InternalServiceApiKey`) が必須。
- **PAT 認証の流れ**: 外部クライアント → `ext-api`（`Authorization: Bearer <PAT>`）→ `withPAT` ミドルウェアが `api` の `POST /internal/auth/pat/introspect` を呼んで `PatPrincipal`（userId・scopes・所属 team）を取得 → 必要 scope（例: `read_api`）を満たさない場合は 403。PAT の発行・失効・DB 上の hash 検証は `api` の `PatService` が担う。
- **リアルタイム更新**: `api` の `SignalRRealtimeNotifier` が issue の作成・移動時に `BoardHub` を通じて `BoardChanged` イベントを対象 project グループへ送る。`web` の `useBoardRealtime` はイベント受信時に該当 board クエリを invalidate するだけで、差分適用はしていない（`web/hooks/use-board-realtime.ts`）。
- **Issue の並び順**: `Issue.Order` は文字列化した密な整数（`(index+1) * 1000` を `D6` 0 埋め）で管理し、`IssueCommandService.MoveIssueAsync` が move のたびに対象カラムを `ReassignDenseOrder` で振り直す。`web` 側も `useMoveIssueMutation` の optimistic update で同じ採番ロジックを再現している。
- **DB とスキーマ変更**: EF Core migration は未導入で、起動時に `AppDbSeeder` が `EnsureCreated` + demo seed を行う。スキーマ変更時はローカル DB を作り直す前提（後述の DB リセット参照）。

## 実装上の解釈

- `web` は `web/app/` を起点に、UI は `web/components/`、状態取得と mutation は `web/hooks/`、HTTP は `web/lib/` に寄せる。
- `api` は Controller を薄く保ち、read は QueryService、write は CommandService に寄せる。
- `api` の認証は Cookie ベースで、`InternalApiController` は `ext-api` 用の内部専用 API として扱う。
- `api` の GraphQL は read 面として扱う。
- `api` の DB は現時点で migration ベースではなく `EnsureCreated` + seed を前提にする。
- `ext-api` は探索中の read surface として扱い、固定された完成形だと思い込まない。

## よく使うコマンド

すべてリポジトリルートから `pnpm run <script>` で実行する（定義は `package.json`）。単体の `web`/`api`/`ext-api` に対しては直接コマンドを叩いてもよい。

| 目的 | コマンド |
| --- | --- |
| `web` を起動 | `pnpm run dev:web`（`http://localhost:3000`） |
| `api` を起動（hot reload） | `pnpm run dev:api`（`http://localhost:5050`） |
| `ext-api` を起動 | `pnpm run dev:ext`（`http://localhost:8081`） |
| Postgres だけ起動 | `pnpm run dev:db` |
| DB をリセット（ホスト側ターミナルで実行） | `pnpm run dev:db:reset` |
| `web` の ESLint | `pnpm run lint:web`（= `pnpm --dir web lint`） |
| docs の textlint | `pnpm run lint:docs` |
| `web` + docs の lint 一式 | `pnpm run lint` |
| `api` のビルド確認 | `pnpm run check:api`（= `dotnet build api/LinearStyle.Api.csproj --nologo`） |
| `ext-api` のテスト | `pnpm run test:ext` / `pnpm run check:ext`（= `cd ext-api && go test ./...`） |
| Go のフォーマット | `pnpm run format:go`（= `gofmt -w ./ext-api`） |
| 全体確認（CI と同等） | `pnpm run check`（`lint` + `check:api` + `check:ext`） |
| 全体テスト | `pnpm run test`（現状は `check:ext` と同じ） |

補足:

- 単体テストは現時点で `ext-api` の Go テストのみ存在する。特定パッケージ・テスト名だけ実行する場合は `cd ext-api && go test ./internal/httpapi/... -run TestName` のように絞り込む。`web`/`api` には自動テストがまだ無いため、変更確認は lint / build と Dev Container 上での動作確認に頼る。
- CI（`.github/workflows/check.yml`）は `docs-and-web`（`pnpm install --frozen-lockfile` + `pnpm run lint`）、`api`（`dotnet build`）、`ext-api`（`go test ./...`）の 3 job 構成。ローカルの `pnpm run check` と対応させる。
- デモ用ログイン情報: Email `demo@example.com` / Password `demo123!` / PAT `pat_demo_readonly_local`（`README.md`・`CONTRIBUTING.md` 参照）。
- Dev Container の起動や DB リセット方法を変えるなら `README.md` と `CONTRIBUTING.md` も更新する。

## 禁止・非推奨

- 推測でライブラリやフレームワークのバージョンを決めつけない。
- 実在しないクラス、メソッド、設定値を断定的に提案しない。
- `ext-api` を完成済みの正式境界として断定しない。
- 既存コードに存在しないアーキテクチャへ大規模に寄せる提案を、根拠なく行わない。

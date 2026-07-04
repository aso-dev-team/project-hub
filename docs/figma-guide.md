# Figma ガイドライン

## Figma で並べるべき状態

| 状態         | 例                                 |
| ------------ | ---------------------------------- |
| 通常状態     | データが正常に表示されている       |
| 初期状態     | 未入力、未選択                     |
| ローディング | Skeleton、Spinner                  |
| 空状態       | 検索結果なし、登録データなし       |
| エラー状態   | 通信エラー、権限エラー、入力エラー |
| 確認状態     | モーダル、確認ダイアログ           |
| 完了状態     | Toast、完了画面                    |
| 権限差分     | 管理者、一般ユーザー、閲覧のみ     |

---

## コンポーネントを Variants で整理する基準

| Property | 値                                   |
| -------- | ------------------------------------ |
| type     | primary / secondary / danger         |
| size     | small / medium / large               |
| state    | default / hover / disabled / loading |
| icon     | none / left / right                  |

---

## Auto Layout で見るべきポイント

| 観点           | 良い状態                            |
| -------------- | ----------------------------------- |
| 余白           | Auto Layoutのpadding / gapで表現    |
| レスポンシブ   | 幅を変えても破綻しにくい            |
| レイヤー名     | `Frame 1234` ではなく意味のある名前 |
| コンポーネント | 画面内で再利用されている            |
| テキスト       | スタイル化されている                |
| 色             | Styles / Variables化されている      |

---

## Dev Mode の注釈として入れた方がいいもの

- 例：検索ボタン押下時
  - 入力値が空の場合は検索条件なしで全件検索
  - API 実行中は Button を loading 状態にする
  - 失敗時は画面上部に Error Toast を表示
- 例：権限
  - 管理者のみ「削除」ボタンを表示
  - 一般ユーザーは詳細閲覧のみ
- 例：バリデーション
  - メールアドレス形式でない場合、blur 時にエラー表示
  - submit 時にも再検証する

---

## こういうのを作っていきたい

### Figma で作るようなものツリー

```txt
Figma file
├─ 00_README
│   ├─ このファイルの読み方
│   ├─ 対象機能
│   ├─ 関連ドキュメントリンク
│   └─ 更新ルール
│
├─ 01_Flow
│   ├─ 画面遷移図
│   ├─ 正常系フロー
│   └─ 例外系フロー
│
├─ 02_Screens
│   ├─ 一覧画面
│   ├─ 詳細画面
│   ├─ 編集画面
│   └─ 確認・完了画面
│
├─ 03_States
│   ├─ Loading
│   ├─ Empty
│   ├─ Error
│   ├─ Disabled
│   └─ Permission variations
│
├─ 04_Components
│   ├─ Button
│   ├─ TextField
│   ├─ Select
│   ├─ Modal
│   ├─ Table
│   └─ Toast
│
├─ 05_Design Tokens
│   ├─ Color
│   ├─ Typography
│   ├─ Spacing
│   └─ Radius / Shadow
│
└─ 99_Archive
    └─ 古い案
```

### Figma で書くと過剰設計になるアンチパターン表

| 項目               | 理由                                            |
| ------------------ | ----------------------------------------------- |
| API仕様            | OpenAPI / Swagger / Markdownの方が管理しやすい  |
| DB項目             | ERDやテーブル定義と接続した方がよい             |
| バリデーション一覧 | 表形式の方がレビューしやすい                    |
| 権限マトリクス     | Figmaより表の方が明らかに向いている             |
| 画面項目定義       | 大量項目ならExcel/スプレッドシート/Notionが強い |
| 複雑な業務ルール   | 文章・表・状態遷移図の方が向いている            |
| 変更履歴           | Jira / GitHub / Notionの方が追跡しやすい        |

## プロジェクト本体の Figma ファイル

- [01_プロジェクト管理サービス](https://www.figma.com/design/jrVzwLthapUfLWtzJThZUY/01_%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E7%AE%A1%E7%90%86%E3%82%B5%E3%83%BC%E3%83%93%E3%82%B9)

## リンク集

- [Figma 勉強用](https://help.figma.com/hc/ja/sections/30880632542743-%E5%88%9D%E5%BF%83%E8%80%85%E5%90%91%E3%81%91Figma%E3%83%87%E3%82%B6%E3%82%A4%E3%83%B3)
- [オートレイアウト特化](https://help.figma.com/hc/ja/articles/360040451373-%E3%82%AA%E3%83%BC%E3%83%88%E3%83%AC%E3%82%A4%E3%82%A2%E3%82%A6%E3%83%88%E3%81%AE%E3%82%AC%E3%82%A4%E3%83%89)
- [Figma の操作について操作単位で見れる記事](https://note.com/fjkn/m/m9829c621e025)

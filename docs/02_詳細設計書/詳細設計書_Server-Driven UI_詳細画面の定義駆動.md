# 詳細設計書_Server-Driven UI_詳細画面の定義駆動（REDISH_SFA）

## 共通ガイド（正本）

このドキュメントはREDISH_SFAでの「適用設計（実装例）」であり、考え方の正本は共通ガイドに置く。  
共通ガイド：`vaults sync/00_KM/05.Knowledge base/学習ガイド/技術ガイド/03_Server-Driven UI（詳細画面の定義駆動）.md`

## 目的

REDISH_SFAでは、今後「詳細画面（詳細パネル）」が増え続けることが想定される。  
詳細画面の増殖に伴う以下の問題を、**Server-Driven UI（＝定義駆動の詳細画面）**で構造的に解消する。

- 詳細画面が増えるたびに、同じUI構造を毎回手作業で実装して工数が増える
- 実装者ごとに構造・用語・入力部品・権限制御の実装が揺れる
- フィールド追加/変更の影響範囲が広く、修正コストが高い

このドキュメントは、**詳細画面の共通骨格**を固定し、増殖しても開発コストが線形に増えない状態を作るための「詳細設計（層3：構造への介入）」の正本である。

---

## 適用範囲（最初の適用）

最初の適用対象は **REDISH_SFA**。対象画面は未確定（TBD）だが、候補は以下。

- 商談管理: `frontend/src/components/deals/DealDetailPanel.tsx`
- 架電管理: `frontend/src/components/calls/CallDetailPanel.tsx`
- 契約管理: `frontend/src/components/contracts/ContractDetailPanel.tsx`

---

## 基本方針（設計判断）

- **詳細画面の構造を統一**する（セクション → フィールドの並び）
- **表示/編集/必須/readonly/順序**は、可能な限り「定義（Definition）」側で管理する
- **ラベル（表示名）と順序は定義で固定**し、実装者の裁量を減らす
- **権限制御はフィールド単位で一元化**できる構造を前提にする

---

## 用語

- **詳細画面**: 一つのエンティティ（例：商談、架電、契約）の詳細情報を表示・編集するUI（ページ/パネル/モーダルを含む）
- **セクション**: 詳細画面内のまとまり（カード/折りたたみ単位）
- **フィールド**: セクション内に並ぶ「ラベル＋値」の最小単位

---

## データ構造（概念モデル）

詳細画面は、最低限以下の2要素から構成される。

- **DetailDefinition（定義）**: 画面構造（セクション/フィールド/順序/表示名/型/権限など）
- **DetailData（データ）**: 実データ（値）

### 1) DetailDefinition（定義）

| 要素 | 役割 | 例 |
|---|---|---|
| entityKey | 対象エンティティの識別子 | deals / calls / contracts |
| title | 画面タイトル | 商談詳細 |
| sections | セクション配列 | セクションA, セクションB |

### 2) SectionDefinition（セクション定義）

| 要素 | 役割 | 例 |
|---|---|---|
| sectionKey | セクション識別子（固定キー） | basicInfo / status / finance |
| title | 表示名 | 基本情報 |
| displayOrder | 並び順 | 1 |
| collapsible | 折りたたみ可否 | true |
| fields | フィールド配列 | フィールドA, フィールドB |

### 3) FieldDefinition（フィールド定義）

| 要素 | 役割 | 例 |
|---|---|---|
| fieldKey | フィールド識別子（固定キー） | dealDate / staff / rank |
| label | 表示名 | 商談日 |
| valueType | 表示/入力タイプ | DATE / TEXT / SELECT |
| required | 必須 | true |
| readonly | 編集可否 | false |
| displayOrder | 並び順 | 1 |
| dataPath | 値の取得元（データ参照） | deal.dealDate |
| optionsRef | 選択肢参照 | rankOptions |
| visibilityRule | 表示条件（任意） | result が失注なら表示 など |
| permission | 権限制御（任意） | role: manager のみ閲覧可 など |

---

## valueType（表示/入力タイプ）の方針

valueTypeは「詳細画面でよく出る型」に絞り、増殖させない（増やす場合は必ず設計レビュー）。

| valueType | 用途 | 備考 |
|---|---|---|
| TEXT | 文字列 |  |
| MULTILINE_TEXT | 長文 | メモ等 |
| NUMBER | 数値 | 表示フォーマットは別途ルール化 |
| DATE | 日付 |  |
| DATETIME | 日時 |  |
| SELECT | 単一選択 | optionsRefで参照 |
| BADGE | ステータス表示 | 既存のバッジ設計に寄せる |
| LINK | 外部/内部リンク |  |

---

## 権限制御（フィールド単位の一元化）

詳細画面が増えるほど「フィールドごとの閲覧/編集可否」が散らばりやすい。  
そのため、FieldDefinitionに以下の情報を持てる設計を前提とする。

- 閲覧可否（見せない/マスクする/見せる）
- 編集可否（readonly）
- 条件（ユーザーのロール、所属、担当、ステータス等）

---

## 導入手順（段階的）

1. **対象画面を1つだけ決める**（まずはSFAで最も増えそうな詳細画面）
2. その画面の「セクション」と「フィールド」を棚卸しし、sectionKey / fieldKeyを固定する
3. 定義（DetailDefinition）を作り、画面側は「定義を描画する」責務に寄せる
4. フィールド追加/変更のフローを「定義変更→動く」に揃える

---

## 記録と運用（必須）

- Server-Driven UI導入は「層3（構造）への介入」に該当するため、実施したら必ず `PROJECT_CONTROL.md` に記録する
- 詳細画面を新規追加する場合は、本ドキュメントを必ず参照し、独自実装を増やさない

---

## 参照（背景）

- 外部参考: `vaults sync/Clippings/★★★非常に重要　今後システム開発が増えるにつれて詳細画面を多く作る必要がある。　画面が増え続けるプロダクトの Server-Driven UI という選択.md`



# Claude Code Agent Teams 使い方ガイド

Agent Teams は、複数の Claude Code インスタンスが協力して並行作業するための実験的機能です。1つのセッションがチームリーダーとして機能し、複数のティームメイトが独立して作業します。

## 有効化方法

Agent Teams はデフォルトで無効です。以下のいずれかの方法で有効にしてください。

### settings.json で設定

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

### 環境変数で設定

```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
claude
```

## 基本的な使い方

有効化後、Claude に自然言語でチーム作成を指示します。

```
Create an agent team to review PR #142. Spawn three reviewers:
- One focused on security implications
- One checking performance impact
- One validating test coverage
```

Claude が自動的にチームを作成し、ティームメイトを生成・割り当てます。

## 表示モード

### In-process モード（デフォルト）

- すべてのティームメイトがメインターミナルで実行される
- `Shift+Up/Down` でティームメイトを選択してメッセージを送信
- セットアップ不要

### Split Panes モード

- 各ティームメイトが独自の pane で実行される
- すべての出力を同時に表示できる
- tmux または iTerm2 が必要

設定方法:

```json
{
  "teammateMode": "in-process"
}
```

または CLI フラグで:

```bash
claude --teammate-mode tmux
```

## 主な操作

| 操作 | 方法 |
|------|------|
| ティームメイト切替 | `Shift+Up/Down` |
| Delegate モード有効化 | `Shift+Tab`（リーダーを調整役に限定） |
| ティームメイト終了 | `Ask the researcher teammate to shut down` |
| チームクリーンアップ | `Clean up the team` |
| 完了待ち | `Wait for your teammates to complete their tasks` |

## 使用例

### 研究とレビュー

```
Create an agent team to review PR #142. Spawn three reviewers:
- One focused on security implications
- One checking performance impact
- One validating test coverage
```

### 新機能の並行開発

```
Create a team with 4 teammates to refactor these modules in parallel.
Use Sonnet for each teammate.
```

### デバッグ（競合仮説の検証）

```
Users report the app exits after one message instead of staying connected.
Spawn 5 teammates to investigate different hypotheses and challenge
each other's theories.
```

### 計画承認を要求する

```
Spawn an architect teammate to refactor the authentication module.
Require plan approval before they make any changes.
```

## Subagents との比較

| 特性 | Subagents | Agent Teams |
|------|-----------|------------|
| コンテキスト | 独自ウィンドウ; 結果をリーダーに返却 | 独自ウィンドウ; 完全独立 |
| 通信 | リーダーのみとやり取り | ティームメイト同士が直接メッセージ交換 |
| 調整 | メインエージェントがすべて管理 | 共有タスクリストで自己調整 |
| 最適な使用 | 結果のみが重要な集中タスク | 議論・協力が必要な複雑作業 |
| トークンコスト | 低い（結果が要約される） | 高い（各ティームメイトが独立インスタンス） |

**選択基準:**

- **Subagents**: 迅速で集中したワーカーが結果を返却するタスク向き
- **Agent Teams**: ティームメイトが発見を共有・相互に検証し協調する作業向き

## ベストプラクティス

### 十分なコンテキストを提供する

```
Spawn a security reviewer teammate with the prompt: "Review the authentication
module at src/auth/ for security vulnerabilities. Focus on token handling,
session management, and input validation."
```

### 適切なタスクサイズを設定する

- **小さすぎる**: 調整のオーバーヘッドが利益を上回る
- **大きすぎる**: ティームメイトが長く独立作業し、無駄な努力のリスクが増す
- **適切**: 関数、テストファイル、レビューなど明確な成果物があるタスク

### ファイル競合を避ける

複数のティームメイトが同じファイルを編集すると上書きされる可能性があります。各ティームメイトが異なるファイルセットを担当するように設計してください。

### ティームメイトの完了を待つ

```
Wait for your teammates to complete their tasks before proceeding
```

## 注意事項と制限

- 各ティームメイトが独立した Claude インスタンスのため、**トークン消費が大きい**
- 1セッションで管理できるチームは **1つのみ**
- ティームメイトは他のティームメイトを **生成できない**（ネスト不可）
- リーダーはチームを作成したセッションに **固定**
- In-process ティームメイトは `/resume` / `/rewind` で **復元されない**
- Split panes モードは **tmux または iTerm2 が必須**

## トラブルシューティング

### ティームメイトが表示されない

```bash
# In-process モードで Shift+Down を試す
# tmux モードの場合、tmux がインストールされているか確認
which tmux
```

### パーミッションプロンプトが多すぎる

事前に一般的な操作を permissions 設定で承認しておくと改善されます。

### ティームメイトがエラーで停止した

- 直接メッセージで追加指示を送る
- 代替ティームメイトを生成する

### リーダーが早く終了してしまう

```
Keep going and wait for your teammates to complete their tasks
```

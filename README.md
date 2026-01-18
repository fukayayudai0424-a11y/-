# 動画広告分析Pro スクレイピングツール

動画広告分析Pro (https://dpro.kashika-20mile.com) から広告データを自動収集し、Excelファイルに出力するPlaywrightスクリプトです。

## 収集するデータ

- 動画広告のURL
- 画像広告のURL
- 再生数
- 直近の増加数
- いいね数
- 広告テキスト
- LP URL
- LPの文

## 必要条件

- Node.js 18以上
- npm または yarn

## セットアップ

```bash
# 1. 依存関係をインストール
npm install

# 2. Chromiumブラウザをインストール
npm run setup
# または
npx playwright install chromium
```

## 設定

`ad-scraper.js` の `CONFIG` オブジェクトで以下を設定できます：

```javascript
const CONFIG = {
  loginUrl: 'https://dpro.kashika-20mile.com/login',
  email: 'your-email@example.com',      // メールアドレス
  password: 'your-password',             // パスワード
  searchKeyword: '類似キーワード',        // 検索キーワード
  outputFile: 'ad_data.xlsx',            // 出力ファイル名
  screenshotsDir: './screenshots',       // スクリーンショット保存先
  timeout: 30000,                        // タイムアウト(ms)
  maxAdsToCollect: 100                   // 最大収集件数
};
```

## 実行

```bash
npm start
# または
node ad-scraper.js
```

## 出力

- `ad_data.xlsx` - 収集した広告データ
- `screenshots/` - デバッグ用スクリーンショット

## トラブルシューティング

### ログインに失敗する場合
- 認証情報が正しいか確認してください
- `screenshots/` フォルダ内のスクリーンショットを確認してください

### データが収集されない場合
- サイトの構造が変更された可能性があります
- スクリーンショットを確認し、必要に応じてセレクターを調整してください

### ヘッドレスモードを無効にしてデバッグ
`ad-scraper.js` の `chromium.launch` を以下のように変更：

```javascript
const browser = await chromium.launch({
  headless: false,  // false に変更
  // ...
});
```

## ライセンス

ISC

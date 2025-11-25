<p align="center">
  <img src="public/logo.png" alt="SlideRenewal ロゴ" width="200">
</p>

# SlideRenewal

[English version here](README.md)

Google Gemini を活用した AI スライドリデザインツール。

## はじめに

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Google AI Studio API キーの取得

1. [Google AI Studio](https://aistudio.google.com/) にアクセス
2. Google アカウントでログイン
3. 「Get API key」をクリックして新しい API キーを作成
4. API キーをコピー

### 3. 環境変数の設定

ルートディレクトリに `.env.local` ファイルを作成：

```bash
GEMINI_API_KEY=your_api_key_here
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて確認できます。

## ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルを参照してください。

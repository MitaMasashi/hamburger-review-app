# ハンバーガーレビューアプリ 開発・実行ガイド

このアプリは、React (Vite) + FastAPI (Python) で構築されたPWA対応Webアプリケーションです。

## 1. 環境構築 (初回のみ)

新しいPCで開発を始める場合の手順です。

### 前提条件
- Git
- Python 3.9以上
- Node.js (npm)

### 手順

1. **ソースコードの取得**
   ```bash
   git clone https://github.com/MitaMasashi/hamburger-review-app.git
   cd hamburger-review-app
   ```

2. **バックエンドのセットアップ**
   ```bash
   cd backend
   pip install pipenv
   pipenv install
   ```

3. **フロントエンドのセットアップ**
   ```bash
   cd ../frontend
   npm install
   ```

---

## 2. アプリの起動方法

用途に合わせて2つの起動方法があります。

### A. 開発モード (推奨)
コードを編集しながら確認する場合に使います。
*   **Windows**: `start_app.bat` をダブルクリック
*   **Mac/Linux**: `./start_app.sh` を実行

または手動で:
```bash
# ターミナル1 (バックエンド)
cd backend
pipenv run uvicorn main:app --reload

# ターミナル2 (フロントエンド)
cd frontend
npm run dev
```
アクセス: http://localhost:5173

### B. PWA動作確認モード (スマホ実機確認用)
スマホでインストール可能なアプリ(PWA)として動作確認する場合に使います。

1. **バックエンド起動**
   ```bash
   cd backend
   pipenv run uvicorn main:app --host 0.0.0.0 --port 8000
   ```

2. **フロントエンド ビルド & プレビュー**
   ```bash
   cd frontend
   npm run build
   npm run preview -- --host
   ```

---

## 3. スマホ実機での確認方法 (ngrok使用)

PWAとしてスマホにインストールするには、**HTTPS接続**が必須です。
ローカル環境を一時的に外部公開できるツール「ngrok」を使用します。

### 手順

1. **ngrokのインストール**
   [公式サイト](https://ngrok.com)からダウンロードし、認証トークンを設定します。

2. **ngrokの起動**
   上記の「B. PWA動作確認モード」でアプリを起動した状態で、新しいターミナルで以下を実行します。
   ```bash
   ngrok http 4173
   ```

3. **スマホでアクセス**
   ターミナルに表示される `Forwarding` のURL (例: `https://xxxx.ngrok-free.app`) をスマホのブラウザで開きます。

4. **ホーム画面に追加**
   ブラウザのメニューから「ホーム画面に追加」を選択すると、アプリとしてインストールできます。

### トラブルシューティング
*   **「Visit Site」画面が出る**: ngrokの仕様です。「Visit Site」ボタンを押してください。
*   **真っ白な画面になる**: `npm run preview` が動いているか確認してください。
*   **アイコンがおかしい**: ブラウザのキャッシュを削除するか、URLを変えて試してください。

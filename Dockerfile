FROM node:22-alpine

WORKDIR /app

# 依存パッケージをコピーしてインストール
COPY package*.json ./
RUN npm install

# TypeScript開発用の依存関係をインストール
RUN npm install --save-dev @types/node

# ソースコードをコピー
COPY . .

# TypeScriptをコンパイル
RUN npm run build

# デフォルトポート（環境変数として設定）
ENV PORT=3000

# コンテナが公開するポートを明示的に宣言
# docker run -P を使用すると自動的にホストの任意のポートにマッピングされる
# docker run -p 8080:3000 のように明示的にマッピングすることも可能
EXPOSE ${PORT}

# コマンド引数としてポート番号を渡せるようにする (Optional)
# docker run -p 3001:3001 -e PORT=3001 your-image
# または: docker run -p 3001:3001 your-image 3001
ENTRYPOINT ["node", "./dist/server.js"]

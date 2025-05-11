# ポート設定ガイド

このMCPサーバーは複数の方法でポート設定ができます。

## 1. 直接Dockerコマンドを使用する場合

### 基本的な使い方（デフォルトポート3000）

```bash
# ビルド
docker build -t mcp-server .

# 実行（ホストの3000ポートをコンテナの3000ポートにマッピング）
docker run -p 3000:3000 mcp-server
```

### 異なるポートを使用する場合

```bash
# 環境変数でポートを指定
docker run -p 3001:3001 -e PORT=3001 mcp-server

# または引数でポートを指定
docker run -p 3001:3001 mcp-server 3001

# 別のホストポートにマッピングする場合
# （この例ではホストの8080ポートからコンテナの3000ポートにアクセス）
docker run -p 8080:3000 mcp-server
```

## 2. Docker Composeを使用する場合

```bash
# デフォルト設定（3000と3001ポートの両方でサーバーを起動）
docker-compose up

# 特定のサービスだけ起動
docker-compose up mcp-server

# バックグラウンドで実行
docker-compose up -d
```

## 3. クライアント側の設定

クライアントは、サーバーが実際に公開されているポートに接続する必要があります：

```typescript
// 例: src/testClient.tsでの接続設定
const transport = new StreamableHTTPClientTransport(
  new URL("http://localhost:3000/"), // ポート番号はサーバーの公開ポートに合わせる
  {
    sessionId: undefined,
  },
);
```

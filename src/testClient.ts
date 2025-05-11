import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { CallToolRequest, CallToolResultSchema } from "@modelcontextprotocol/sdk/types.js";
import { createInterface } from "readline/promises";

const args = process.argv.slice(2);
const port = args[0] ? parseInt(args[0], 10) : 3000;

// Streamable HTTP トランスポートを使用して MCP サーバーに接続
const transport = new StreamableHTTPClientTransport(
  new URL(`http://localhost:${port}/`), // サーバーのエンドポイントに合わせて調整
  {
    sessionId: undefined,
  },
);

// クライアントの初期化
const client = new Client({
  name: "example-client",
  version: "0.0.1",
});

// エラーハンドラの設定
client.onerror = (error) => {
  console.error("Client error:", error);
};

// 標準入力を受け取るインターフェイス
const readline = createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function disconnect() {
  try {
    await transport.close();
    await client.close();
    readline.close();
    console.log("Disconnected from server.");
  } catch (error) {
    console.error("Error disconnecting:", error);
  } finally {
    process.exit(0);
  }
}

async function main() {
  try {
    // サーバーに接続
    await client.connect(transport);
    console.log("Connected to server");

    // current-time ツールを呼び出す
    const req: CallToolRequest = {
      method: "tools/call",
      params: {
        arguments: { timezone: "Asia/Tokyo" },
        name: "current-time",
      },
    };

    try {
      // MCP SDK requires the request object as first parameter and a schema for validation
      const res = await client.request(req, CallToolResultSchema);
      console.log("Current time:");

      // Print results based on content type
      res.content.forEach((item) => {
        if (item.type === "text") {
          console.log(item.text);
        } else {
          console.log(item.type + " content:", item);
        }
      });
    } catch (error) {
      console.error("Error calling tool:", error);
    }

    // 切断
    await disconnect();
  } catch (error) {
    console.error("Connection error:", error);
    await disconnect();
  }
}

// 実行
main().catch((error) => {
  console.error("Fatal error:", error);
  disconnect();
});

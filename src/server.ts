import { FastMCP } from "fastmcp";
import { z } from "zod";

import { currentTime } from "./time.js";

// ポート番号を環境変数または引数から取得
const PORT = process.env.PORT
  ? parseInt(process.env.PORT, 10)
  : process.argv[2]
    ? parseInt(process.argv[2], 10)
    : 3000;

// ホスト設定 - 情報表示用（コンテナ内では0.0.0.0にバインド）
const HOST = process.env.HOST || "0.0.0.0";

const server = new FastMCP({
  name: "time",
  version: "0.0.1",
});

server.addTool({
  annotations: {
    openWorldHint: false, // This tool doesn't interact with external systems
    readOnlyHint: true, // This tool doesn't modify anything
    title: "current-time",
  },
  description: "Get the current time",
  execute: async (args) => {
    return currentTime(args.timezone);
  },
  name: "current-time",
  parameters: z.object({
    timezone: z
      .string()
      .describe("The timezone to get the current time in. e.g. 'Asia/Tokyo', 'America/New_York'")
      .optional(),
  }),
});

server.addResource({
  async load() {
    return {
      text: "Example log content",
    };
  },
  mimeType: "text/plain",
  name: "Application Logs",
  uri: "file:///logs/app.log",
});

// FastMCPがホストをオプションで設定できない場合でも、
// 内部的にはコンテナ内のすべてのインターフェースにバインドされる
server.start({
  httpStream: {
    endpoint: "/",
    port: PORT,
  },
  transportType: "httpStream",
});

console.log(`Server started on port ${PORT}`);
console.log(`Container access URL: http://${HOST}:${PORT}/`);
console.log(`Local access URL: http://localhost:${PORT}/`);

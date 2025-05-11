import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import {
  CallToolRequest,
  CallToolResultSchema,
  ListToolsRequest,
  ListToolsResultSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Configuration
const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000/";
const TIMEOUT_MS = 15000;

// Set timeout for the entire test
const timeoutPromise = new Promise((_, reject) => {
  setTimeout(() => reject(new Error(`Test timeout after ${TIMEOUT_MS / 1000}s`)), TIMEOUT_MS);
});

async function disconnect(client: Client<any, any, any>, transport: StreamableHTTPClientTransport) {
  try {
    await transport.close();
    await client.close();
    console.log("Disconnected from server");
  } catch (error) {
    console.error("Error during disconnect:", error);
  }
}

async function runTests() {
  console.log("Starting integration tests...");
  console.log(`Connecting to server at ${SERVER_URL}`);

  const transport = new StreamableHTTPClientTransport(new URL(SERVER_URL), {
    sessionId: undefined,
  });

  const client = new Client({
    name: "integration-test-client",
    version: "0.0.1",
  });

  client.onerror = (error) => {
    console.error("Client error:", error);
  };

  try {
    // Test 1: Connect to server
    console.log("\n🔍 Test 1: Connecting to server...");
    await Promise.race([client.connect(transport), timeoutPromise]);
    console.log("✅ Server connection successful!");

    // Test 2: List available tools
    console.log("\n🔍 Test 2: Listing available tools...");
    const listToolsRequest: ListToolsRequest = {
      method: "tools/list",
      params: {},
    };

    const toolsResponse = await client.request(listToolsRequest, ListToolsResultSchema);
    console.log(`✅ Successfully retrieved ${toolsResponse.tools.length} tools`);
    toolsResponse.tools.forEach((tool, index) => {
      console.log(`   ${index + 1}. ${tool.name}: ${tool.description}`);
    });

    // Test 3: Call current-time tool
    console.log("\n🔍 Test 3: Calling current-time tool...");
    const timeRequest: CallToolRequest = {
      method: "tools/call",
      params: {
        arguments: { timezone: "UTC" },
        name: "current-time",
      },
    };

    const timeResponse = await client.request(timeRequest, CallToolResultSchema);
    console.log("✅ Successfully called current-time tool!");
    timeResponse.content.forEach((item) => {
      if (item.type === "text") {
        console.log(`   Response: ${item.text}`);
      }
    });

    // All tests passed
    console.log("\n🎉 All tests passed successfully!");
    await disconnect(client, transport);
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Test failed:", error);
    await disconnect(client, transport);
    process.exit(1);
  }
}

runTests().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});

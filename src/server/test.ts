// // index.ts — run with: npx tsx index.ts
// // Requires OPENAI_API_KEY in .env

// import "dotenv/config";
// import { createOpenAiMcpServer } from "@corsair-dev/app";
// import { Agent, run } from "@openai/agents";

// const CORSAIR_MCP_URL = "https://api.corsair.dev/mcp/f2d6eecb6d6b412a9b258e711c9befd7?tenantId=prashant-chandel";
// const CORSAIR_API_KEY = "ch_Sc-9wKNptyjRwIM8kSJ2J4YPdA5tSmI34YRzssqqmBM"; // move this to your .env file

// const corsairMcp = {
//   url: CORSAIR_MCP_URL,
//   apiKey: CORSAIR_API_KEY,
// };

// // const corsairServer = (await createOpenAiMcpServer(corsairMcp)) as any;
// await corsairServer.connect();

// try {
//   const agent = new Agent({
//     name: "Corsair",
//     instructions:
//       "You are a helpful assistant with access to Corsair integration tools.",
//     model: "gpt-4o-nano",
//     mcpServers: [corsairServer],
//   });

//   const result = await run(agent, "Use Corsair to list my mails");
//   console.log(result.finalOutput);
// } finally {
//   await corsairServer.close();
// }
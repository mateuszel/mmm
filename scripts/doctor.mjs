import { existsSync } from "node:fs";
const configured = (name) => Boolean(process.env[name]?.trim());
const rows = [
  ["Node 22+", Number(process.versions.node.split(".")[0]) >= 22],
  ["Demo mode", process.env.DEMO_MODE !== "false"],
  ["OpenAI live mode", configured("OPENAI_API_KEY") && configured("OPENAI_MODEL")],
  ["Local env convention", existsSync(".env.local")],
];
for (const [label, ok] of rows) console.log(`${ok ? "✓" : "○"} ${label}`);
console.log("No secret values were read or printed. Live credentials are optional.");

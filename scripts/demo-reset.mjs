import { rm, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
const state = resolve(".demo-state");
await rm(state, { recursive: true, force: true });
await mkdir(state, { recursive: true });
console.log("Demo fixture state reset. The UI starts in generic mode.");

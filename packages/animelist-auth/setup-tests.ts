import crypto from "node:crypto";
import dotenv from "dotenv";
dotenv.config();

Object.defineProperty(globalThis, "crypto", {
  value: { randomUUID: crypto.randomUUID },
});

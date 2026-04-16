import { defineConfig } from "vitest/config";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  test: {
    setupFiles: ["./src/data/__tests__/setup.ts"],
  },
  resolve: {
    alias: {
      "@/*": resolve(__dirname, "src/*"),
    },
  },
});
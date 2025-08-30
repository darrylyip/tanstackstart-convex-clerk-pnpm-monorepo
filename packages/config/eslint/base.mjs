import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs}"],
    rules: {
      "prefer-const": "error"
    }
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module"
      },
      globals: {
        // Node globals
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        // Browser globals for React components
        HTMLElement: "readonly",
        HTMLDivElement: "readonly", 
        HTMLButtonElement: "readonly",
        HTMLParagraphElement: "readonly",
        HTMLHeadingElement: "readonly",
        document: "readonly",
        window: "readonly"
      }
    },
    rules: {
      "prefer-const": "error",
      "no-unused-vars": "off" // Let TypeScript compiler handle this
    }
  },
  {
    ignores: ["dist/", "node_modules/", "_generated/", "**/_generated/**", "*.config.*"]
  }
];
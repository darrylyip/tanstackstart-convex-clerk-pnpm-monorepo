import baseConfig from "../../packages/config/eslint/base.mjs";

export default [
  ...baseConfig,
  {
    files: ["**/*.{jsx,tsx}"],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      // Enforce using alias imports for deep relative paths (web app specific)
      "no-restricted-imports": ["error", {
        patterns: [
          {
            group: ["../../*", "../../../*", "../../../../*"],
            message: "Use alias imports (@/) instead of relative paths that go up 2+ levels. Use @/components, @/lib, etc."
          }
        ]
      }]
    }
  }
];
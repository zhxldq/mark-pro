import vuePlugin from "eslint-plugin-vue";
import typescriptEslintPlugin from "@typescript-eslint/eslint-plugin";
import parserPackage from "@typescript-eslint/parser";
import globals from "globals";

// 从 CommonJS 模块的默认导出中获取需要的内容
const typescriptParser = parserPackage;

export default [
  {
    files: ["**/*.{vue,js,ts,tsx}"],
    ignores: ["node_modules/", "dist/", "*.config.js"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      vue: vuePlugin,
      "@typescript-eslint": typescriptEslintPlugin,
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
    },
  },
];

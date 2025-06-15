import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import unocss from "@unocss/eslint-config/flat";
import pluginPrettierRecomended from "eslint-plugin-prettier/recommended";
import eslintPluginSimpleImportSort from "eslint-plugin-simple-import-sort";
import autoImportJson from "./.eslintrc-auto-import.json" with { type: "json" };
import defineImportJson from "./.eslintrc-define-import.json" with { type: "json" };

export default defineConfig([
  globalIgnores(["dist/**", "dist-electron/**", "node_modules/**"]),
  {
    files: ["src/**/*.{vue,ts}", "electron/**/*.ts"],
    plugins: {
      js,
      "simple-import-sort": eslintPluginSimpleImportSort,
    },
    extends: ["js/recommended"],
    languageOptions: {
      parser: tseslint.parser,
    },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
  },
  {
    files: ["src/**/*.{vue,ts}"],
    languageOptions: {
      globals: Object.assign(
        {},
        globals.browser,
        autoImportJson.globals,
        defineImportJson.globals,
      ),
    },
  },
  {
    files: ["electron/**/*.ts"],
    languageOptions: {
      globals: Object.assign({}, globals.node),
    },
  },
  {
    extends: [tseslint.configs.recommended],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    files: ["src/**/*.{ts,vue}"],
    extends: [unocss],
  },
  {
    files: ["src/**/*.vue"],
    extends: [pluginVue.configs["flat/essential"]],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
    rules: {
      "vue/multi-word-component-names": "off",
    },
  },
  pluginPrettierRecomended,
]);

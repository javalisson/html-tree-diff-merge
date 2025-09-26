/**
 * ESLint v9+ flat config for a NodeNext + TypeScript project
 * - No type-checking required (no project field)
 * - Keeps src/ clean and ignores dist/, node_modules/, coverage/
 */
import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettier from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  // Global ignores (replaces .eslintignore)
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**"],
  },

  // Base JS rules (ES2022)
  js.configs.recommended,

  // TypeScript files
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        // No "project" => faster, lint without TS type-checking
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      /* Turn off the base rule */
      "no-unused-vars": "off",

      // Reasonable defaults; relax rules since you don't want to force types
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/ban-ts-comment": "off",

      // General JS quality
      eqeqeq: ["warn", "smart"],
      "no-const-assign": "error",
      "prefer-const": "warn",
    },
  },

  {
    languageOptions: {
      globals: {
        console: "readonly",
      },
    },
  },

  {
    files: ["**/*.ts", "**/*.js"],
    plugins: { prettier },
    rules: {
      "prettier/prettier": "warn",
    },
    settings: {},
  },
  eslintConfigPrettier, // disables conflicting ESLint formatting rules
];

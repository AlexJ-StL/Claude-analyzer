import globals from "globals";
import js from "@eslint/js";
// For TypeScript-ESLint v8, you import from 'typescript-eslint'
// and it includes both the plugin and parser as part of its default export.
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import jsonPlugin from "@eslint/json"; // Alias to avoid conflict with 'json' file extension rule
import markdownPlugin from "@eslint/markdown"; // Alias

// With ESLint v9, defineConfig is a direct named export from 'eslint'
import { defineConfig } from 'eslint';

export default defineConfig([
  // Basic JavaScript rules and browser globals
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: { js },
    extends: [js.configs.recommended],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      ecmaVersion: "latest", // Ensure latest JS features are supported
      sourceType: "module",  // For ES Modules
    },
  },

  // TypeScript specific configuration
  {
    files: ["**/*.{ts,mts,cts,tsx}"],
    // tseslint.configs.recommended is an array in v8, so use spread
    extends: [...tseslint.configs.recommended],
    languageOptions: {
      parser: tseslint.parser, // Use the parser from the tseslint default import
      parserOptions: {
        project: true, // If you're using a tsconfig.json
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser, // Apply browser globals to TS as well if needed
      },
    },
  },

  // React specific configuration, applied ONLY to relevant files
  {
    files: ["**/*.{jsx,tsx}"],
    plugins: {
      react: pluginReact
    },
    settings: {
      react: {
        version: 'detect', // Add this to resolve the warning "React version not specified"
      },
    },
    rules: {
      ...pluginReact.configs.recommended.rules,
      // Add any other React-specific rules here
    }
  },

  // JSON specific configurations
  {
    files: ["**/*.json", "**/*.jsonc", "**/*.json5"],
    plugins: { json: jsonPlugin },
    languageOptions: { parser: jsonPlugin.parser },
    extends: [jsonPlugin.configs.recommended],
  },

  // Markdown specific configuration
  {
    files: ["**/*.md"],
    plugins: { markdown: markdownPlugin },
    languageOptions: { parser: markdownPlugin.parser },
    extends: [markdownPlugin.configs.recommended],
  },

  // Add a .gitignore equivalent for ESLint to ignore certain files/directories
  {
    ignores: ["node_modules/", "dist/", "build/", ".vscode/", "**/*.d.ts", "package-lock.json"],
  }
]);

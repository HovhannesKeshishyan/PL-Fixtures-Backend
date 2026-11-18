import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";

export default [
    {
        ignores: ["node_modules/", "dist/"],
    },
    js.configs.recommended,
    // turns off ESLint rules that conflict with Prettier (formatting is done by Prettier)
    prettierConfig,
    {
        files: ["**/*.js"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: globals.node,
        },
        plugins: {
            "@stylistic": stylistic,
        },
        rules: {
            // double quotes; single quotes allowed only to avoid escaping, e.g. 'He said "hi"'
            "@stylistic/quotes": ["error", "double", {avoidEscape: true}],
            // allow intentionally unused args/vars prefixed with "_" (e.g. Express error handler's _next)
            "no-unused-vars": ["error", {argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrors: "none"}],
            eqeqeq: ["error", "always"],
            "no-var": "error",
            "prefer-const": "error",
        },
    },
];

module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  env: {
    browser: true,
    es2021: true
  },
  plugins: ["@typescript-eslint", "react-refresh"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  rules: {
    "react-refresh/only-export-components": ["warn", { allowConstantExport: true }]
  }
};

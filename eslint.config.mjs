export default [
  {
    files: ["chrome/*.js", "firefox/*.js", "common/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        browser: "readonly",
        chrome: "readonly",
        console: "readonly",
        document: "readonly",
        window: "readonly"
      }
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error"
    }
  }
];
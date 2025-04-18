/** @type {import("prettier").Config} */
const prettierConfig = {
  tailwindFunctions: ["cn", "cva"],
  plugins: ["prettier-plugin-tailwindcss"],
  trailingComma: "es5",
  tabWidth: 2,
  semi: true,
  singleQuote: false,
  useTabs: true,
  bracketSpacing: true,
  printWidth: 80,
};

export default prettierConfig;

/** @typedef {import("prettier").Config} PrettierConfig */
/** @typedef {import("prettier-plugin-tailwindcss").PluginOptions} TailwindConfig */
/** @typedef {import("@ianvs/prettier-plugin-sort-imports").PluginConfig} SortImportsConfig */

/** @type { PrettierConfig | SortImportsConfig | TailwindConfig } */
const config = {
  tabWidth: 2,
  semi: false,
  singleQuote: false,
  printWidth: 130,
  trailingComma: "es5",
  plugins: ["@ianvs/prettier-plugin-sort-imports", "prettier-plugin-tailwindcss"],
  tailwindFunctions: ["cn", "cva"],
  importOrder: [
    "<TYPES>",
    "",
    "^(react/(.*)$)|^(react$)",
    "^(@?remix-run/(.*)$)|^(@?remix-run$)",
    "<THIRD_PARTY_MODULES>",
    "",
    "^~/",
    "^[./]",
  ],
  importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
  importOrderTypeScriptVersion: "5.0.0",
  importOrderCaseSensitive: false,
}

export default config

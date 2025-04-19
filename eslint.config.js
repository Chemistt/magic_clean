/* @ts-check */

import { FlatCompat } from "@eslint/eslintrc";
import eslint from "@eslint/js";
import eslintReact from "@eslint-react/eslint-plugin";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import globals from "globals";
import tseslint from "typescript-eslint";

/* utility to translate legacy eslintrc-style configs into flat configs */
const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const eslintConfig = tseslint.config(
	...compat.extends("next/core-web-vitals"),
	eslintReact.configs["recommended-type-checked"],
	eslint.configs.recommended,
	tseslint.configs.strictTypeChecked,
	tseslint.configs.stylisticTypeChecked,
	eslintPluginUnicorn.configs.recommended,
	eslintConfigPrettier,
	{
		ignores: ["coverage", "node_modules", ".next", "src/app/_components/ui/**"],
	},
	{
		plugins: { "simple-import-sort": simpleImportSort },
		rules: {
			"simple-import-sort/imports": "error",
			"simple-import-sort/exports": "error",
			"@typescript-eslint/consistent-type-imports": "error",
			"@typescript-eslint/consistent-type-exports": "error",
			"@typescript-eslint/consistent-type-definitions": ["error", "type"],
			"unicorn/better-regex": "warn",
			"unicorn/prevent-abbreviations": [
				"error",
				{
					allowList: {
						env: true,
						props: true,
						Props: true,
						ref: true,
						Ref: true,
						utils: true,
					},
				},
			],
		},
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
			globals: {
				...globals.browser,
				...globals.node,
				...globals.vitest,
			},
		},
	}
);

export default eslintConfig;

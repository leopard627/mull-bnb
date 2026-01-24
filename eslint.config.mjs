import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Additional ignores
    "node_modules/**",
    "coverage/**",
    "scripts/**",
  ]),
  // Custom rules
  {
    rules: {
      // TypeScript
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],

      // React - relax some strict rules
      "react/self-closing-comp": "error",
      "react/jsx-curly-brace-presence": ["error", { props: "never", children: "never" }],
      // Allow setState in useEffect for initialization patterns
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/exhaustive-deps": "warn",

      // General
      "no-console": ["warn", { allow: ["warn", "error"] }],
      eqeqeq: ["error", "always"],
      "prefer-const": "error",

      // Next.js - allow img element in custom components
      "@next/next/no-img-element": "warn",
    },
  },
]);

export default eslintConfig;

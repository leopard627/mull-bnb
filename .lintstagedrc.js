module.exports = {
  // Type check TypeScript files
  "**/*.{ts,tsx}": () => "tsc --noEmit",

  // Lint & Prettify TS and JS files
  "**/*.{ts,tsx,js,jsx,mjs}": (filenames) => [
    `eslint --fix --max-warnings 5 ${filenames.join(" ")}`,
    `prettier --write ${filenames.join(" ")}`,
  ],

  // Prettify only CSS and JSON files
  "**/*.{css,json}": (filenames) => `prettier --write ${filenames.join(" ")}`,
};

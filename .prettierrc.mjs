// .prettierrc.mjs
/** @type {import("prettier").Config} */
export default {
  tabWidth: 2,
  trailingComma: 'all',
  singleQuote: true,
  semi: false,
  plugins: ['prettier-plugin-astro'],
  overrides: [
    {
      files: '*.astro',
      options: {
        parser: 'astro',
      },
    },
  ],
}

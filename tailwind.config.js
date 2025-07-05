/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx,md,mdx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      height: {
        'screen-minus-header': 'calc(100vh - 4rem)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

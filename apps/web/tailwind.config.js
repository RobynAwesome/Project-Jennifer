/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "jennifer-primary": "#6366f1",
        "jennifer-accent": "#a855f7",
        "jennifer-dark": "#0f0f1a",
        "jennifer-surface": "#1a1a2e",
        "jennifer-border": "#2d2d4a",
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};

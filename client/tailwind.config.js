/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B0D11",
        surface: "#14171D",
        raised: "#1B1F26",
        line: "rgba(244,243,239,0.09)",
        accent: "#4FD1C5",
        accentDeep: "#1FA89C",
        accentInk: "#04201C",
        sand: "#E3B873",
        text: "#F4F3EF",
        dim: "#98A0AC",
        faint: "#666E7A",
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      letterSpacing: {
        label: '0.22em',
      },
      maxWidth: {
        page: '1180px',
      },
    },
  },
  plugins: [],
}

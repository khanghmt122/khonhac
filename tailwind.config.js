/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        spotify: {
          green: "#1db954",
          greenHover: "#1ed760",
          black: "#121212",
          dark: "#181818",
          card: "#242424",
          cardHover: "#2a2a2a",
          elevated: "#282828",
          text: "#ffffff",
          muted: "#b3b3b3",
          subtle: "#727272",
        }
      },
      fontFamily: {
        sans: ['CircularSp', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

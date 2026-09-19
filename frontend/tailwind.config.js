/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        manganese: {
          50: '#f4f6fb',
          100: '#e5eaf5',
          500: '#6366f1',
          800: '#1e1b4b',
          900: '#0f172a'
        }
      }
    },
  },
  plugins: [],
}

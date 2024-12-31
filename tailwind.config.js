/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        'timeline': 'auto 1fr',
        'timeline-months': 'repeat(auto-fill, minmax(50px, 1fr))'
      }
    }
  },
  plugins: [],
}
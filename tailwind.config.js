/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Palette sombre personnalisée
        canvas: '#0f1117',
        surface: '#1a1d27',
        surfaceHover: '#22263a',
        border: '#2e3347',
        accent: '#6366f1',   // indigo-500
        accentHover: '#4f46e5',
      },
    },
  },
  plugins: [],
}

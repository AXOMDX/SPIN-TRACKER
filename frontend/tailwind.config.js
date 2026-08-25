/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        dark: '#0a0a1a',
        card: '#16213e',
        accent: '#e94560',
        gold: '#f5c518',
        green: '#00d4aa',
        secondary: '#8892b0'
      }
    }
  },
  plugins: []
};

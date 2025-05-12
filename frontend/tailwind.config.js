/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Scans these files for Tailwind classes
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      colors: {
        background: '#000000',
        spotify: {
          green: '#1DB954', // Updated from #1ED760
          black: '#191414',
        },
      },
      backgroundColor: {
        primary: '#000000',
        secondary: '#121212',
        'button-hover': 'rgba(255, 255, 255, 0.1)',
        'white-alpha-05': 'rgba(255, 255, 255, 0.05)', // Added for subtle container backgrounds
      },
      textColor: {
        primary: 'rgba(255, 255, 255, 0.9)',
        secondary: 'rgba(255, 255, 255, 0.7)',
        tertiary: 'rgba(255, 255, 255, 0.5)',
      },
      borderColor: {
        default: 'rgba(255, 255, 255, 0.1)',
      },
    },
  },
  plugins: [],
}

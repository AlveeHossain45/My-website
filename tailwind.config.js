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
        brand: {
          50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
          400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8',
          800: '#1e40af', 900: '#1e3a8a',
        },
        dark: { // ডার্ক মোডের জন্য নতুন কালার
          primary: '#1a202c', // Main background
          secondary: '#2d3748', // Card background
          text: '#e2e8f0',
          "text-secondary": '#a0aec0',
        }
      },
      fontFamily: { // একটি সুন্দর ফন্ট যোগ করা হয়েছে
        sans: ['Inter', 'sans-serif'],
      },
      keyframes: { // অ্যানিমেশনের জন্য
        "fade-in": {
          "0%": { opacity: 0, transform: 'translateY(10px)' },
          "100%": { opacity: 1, transform: 'translateY(0)' },
        }
      },
      animation: {
        "fade-in": 'fade-in 0.5s ease-out forwards',
      }
    },
  },
  plugins: [],
}
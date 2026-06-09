/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        clock: ['Orbitron', 'monospace'],
      },
      colors: {
        navy:  { 950: '#0b0f1a', 900: '#111827', 800: '#1a2235', 700: '#1f2a42' },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.7s cubic-bezier(0.4,0,0.2,1) both',
        'fade-in':    'fadeIn 0.5s cubic-bezier(0.4,0,0.2,1) both',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'shimmer':    'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
}

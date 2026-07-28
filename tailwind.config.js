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
        cream: '#FAFAF7',
        graphite: {
          50: '#F4F4F5',
          800: '#262626',
          900: '#171717',
          950: '#0A0A0A',
        },
        neuron: {
          text: '#1A1A1A',
          accent: '#4F46E5',
          success: '#22C55E',
          warning: '#F59E0B',
        }
      },
      borderRadius: {
        'neuron': '14px',
        '2xl': '14px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 2px 10px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'subtle-dark': '0 2px 10px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.2)',
      }
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'in': 'in 150ms ease-out',
        'fade-in-0': 'fade-in-0 150ms ease-out',
        'zoom-in-95': 'zoom-in-95 150ms ease-out',
      },
      keyframes: {
        'in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-0': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'zoom-in-95': {
          '0%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      screens: {
        'print': {'raw': 'print'},
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}


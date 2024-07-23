/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms';
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Mona Sans", "mona-sans"],
      },
    },
  },
  plugins: [
    (process.env.NODE_ENV === 'production' ? { cssnano: {} } : {}),
    forms,
  ]
};
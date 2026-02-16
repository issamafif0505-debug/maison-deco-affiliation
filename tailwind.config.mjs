/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf8f0',
          100: '#f9eddb',
          200: '#f2d7b6',
          300: '#e9bb87',
          400: '#df9956',
          500: '#d77f35',
          600: '#c8672b',
          700: '#a65026',
          800: '#854125',
          900: '#6c3721',
          950: '#3a1a0f',
        },
        accent: {
          50: '#f0f7f4',
          100: '#dbeee3',
          200: '#b9dcc9',
          300: '#8ac3a8',
          400: '#59a683',
          500: '#398a68',
          600: '#296e53',
          700: '#225944',
          800: '#1e4737',
          900: '#1a3b2e',
          950: '#0d211a',
        },
        warm: {
          50: '#faf6f3',
          100: '#f3ebe3',
          200: '#e7d5c5',
          300: '#d7b89f',
          400: '#c49577',
          500: '#b77c5a',
          600: '#aa6a4e',
          700: '#8d5542',
          800: '#73463a',
          900: '#5e3b32',
          950: '#321d19',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

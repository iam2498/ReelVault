/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    "from-indigo-900/90",
    "to-slate-900",
    "from-emerald-950",
    "to-teal-900",
    "from-amber-950",
    "to-orange-900",
    "from-zinc-900",
    "to-stone-900",
    "from-violet-950",
    "to-blue-900",
    "from-neutral-900",
    "from-red-950",
    "from-cyan-950",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        canvas: '#FAFAFA',
        card: '#FFFFFF',
        borderLight: '#EAEAEA',
        subtle: '#71717A',
        heading: '#18181B',
      },
    },
  },
  plugins: [],
};

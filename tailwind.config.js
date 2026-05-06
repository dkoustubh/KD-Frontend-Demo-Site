/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#0F172A',
        secondary: '#3B82F6',
        accent: '#10B981',
        background: '#F8FAFC',
        surface: '#FFFFFF',
        textMain: '#1E293B',
        textSecondary: '#64748B',
      }
    },
  },
  plugins: [],
}

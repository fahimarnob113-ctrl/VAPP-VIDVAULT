/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'yt-black': '#0f0f0f',
        'yt-dark': '#212121',
        'yt-red': '#FF0000',
        'yt-blue': '#3EA6FF',
        'yt-hover': '#383838',
        'yt-lightText': '#f1f1f1'
      }
    },
  },
  plugins: [],
}

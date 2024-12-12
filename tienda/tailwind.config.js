/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        textoBlanco: "#fff",
        textoNegro: "#000000",
        textoGrisClaro: "#f7f7f7",
        textoVerde: "#1d8221",
        textoRojo: "#E02B2B",
        textoAzulCielo: "#32BDE8",
        textoAmarillo: "#FFD700"
      },
      flex: {
        full: "0 0 100%",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
  ],
};


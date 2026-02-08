import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Azul Horizon/Hormiga
        bankGradient: "#0179FE", 
        primary: {
          500: "#0179FE", // El azul principal de los botones
          600: "#0162CA",
          700: "#014E9F",
        },
        // Colores de estado (Éxito, Error)
        success: "#039855", // Verde para ingresos
        error: "#D92D20",   // Rojo para gastos hormiga
        warning: "#F79009",
        
        // Grises para textos y fondos
        black: {
          1: "#15171C",
          2: "#191D23",
        },
        gray: {
          25: "#FCFCFD", // Fondo muy claro
          200: "#EAECF0", // Bordes
          300: "#D0D5DD",
          500: "#667085", // Texto secundario
          600: "#475467",
          700: "#344054", // Texto principal
          900: "#101828", // Títulos
        },
        blue: {
          25: "#F5FAFF",
          100: "#D1E9FF",
          500: "#2E90FA",
          600: "#1570EF",
          700: "#175CD3",
          900: "#194185",
        },
      },
      fontFamily: {
        inter: ["var(--font-inter)"],
        "ibm-plex-serif": ["var(--font-ibm-plex-serif)"],
      },
      backgroundImage: {
        "bank-gradient": "linear-gradient(90deg, #0179FE 0%, #4893FF 100%)",
        "gradient-mesh": "url('/icons/gradient-mesh.svg')", // Opcional si tienes el fondo
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
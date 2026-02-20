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
    screens: {
      'xs': '360px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    container: {
      center: true,
      padding: {
        'DEFAULT': '1rem',
        'xs': '1rem',
        'sm': '1rem',
        'md': '2rem',
        'lg': '2rem',
        'xl': '2rem',
        '2xl': '2rem',
      },
      screens: {
        'xs': '360px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1400px',
      },
    },
    extend: {
      spacing: {
        '4.5': '1.125rem',
        '5.5': '1.375rem',
        '13': '3.25rem',
        '15': '3.75rem',
      },
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
      fontSize: {
        '10': '0.625rem',
        '11': '0.6875rem',
        '12': '0.75rem',
        '13': '0.8125rem',
        '14': '0.875rem',
        '15': '0.9375rem',
        '16': '1rem',
        '18': '1.125rem',
        '20': '1.25rem',
        '22': '1.375rem',
        '24': '1.5rem',
        '26': '1.625rem',
        '28': '1.75rem',
        '30': '1.875rem',
        '32': '2rem',
      },
      fontFamily: {
        inter: ["var(--font-inter)"],
        "ibm-plex-serif": ["var(--font-ibm-plex-serif)"],
      },
      backgroundImage: {
        "bank-gradient": "linear-gradient(90deg, #0179FE 0%, #4893FF 100%)",
        "gradient-mesh": "url('/icons/gradient-mesh.svg')",
      },
      boxShadow: {
        'chart': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'profile': '0 8px 16px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
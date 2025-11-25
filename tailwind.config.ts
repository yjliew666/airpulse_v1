import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "#F5F5F5",
        foreground: "#424242",
        primary: {
          DEFAULT: "#4FC3F7",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#26A69A",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#AED581",
          foreground: "#424242",
        },
        warning: {
          DEFAULT: "#FFB300",
          foreground: "#424242",
        },
        danger: {
          DEFAULT: "#E57373",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F5F5F5",
          foreground: "#757575",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#424242",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#424242",
        },
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "6px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config

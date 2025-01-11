import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
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
        background: "#F5F7FA",
        foreground: "#111827",
        primary: {
          DEFAULT: "#2563EB",
          hover: "#1D4ED8",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#10B981",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#7C3AED",
          foreground: "#ffffff",
        },
        highlight: {
          DEFAULT: "#F97316",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        heebo: ["Heebo", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "card-hover": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-5px)" }
        }
      },
      animation: {
        "card-hover": "card-hover 0.2s ease-out forwards"
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
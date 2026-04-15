import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      sans: ["Inter", "Poppins", "Manrope", "Segoe UI", "sans-serif"],
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563EB",
          light: "#3b82f6",
          dark: "#1e40af"
        },
        background: {
          light: "#F8FAFC",
          dark: "#0F172A"
        },
        card: {
          light: "#FFFFFF",
          dark: "#1E293B"
        },
        text: {
          light: "#0F172A",
          dark: "#F1F5F9"
        },
        accent: {
          DEFAULT: "#10B981"
        },
        border: {
          DEFAULT: "#E2E8F0"
        }
      },
      borderRadius: {
        xl: "12px"
      },
      boxShadow: {
        card: "0 4px 24px 0 rgba(16, 24, 40, 0.08)",
        soft: "0 2px 8px 0 rgba(16, 24, 40, 0.04)"
      }
    }
  },
  plugins: []
};

export default config;

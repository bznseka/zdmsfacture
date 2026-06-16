import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-plus-jakarta-sans)", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#7C3AED", // purple-600
          hover: "#6D28D9",
          light: "#EDE9FE",
        },
        sidebar: {
          bg: "#FFFFFF",
          text: "#4B5563",
          activeBg: "#F3F4F6",
          activeText: "#7C3AED",
        },
        status: {
          paid: {
            bg: "#DCFCE7",
            text: "#15803D",
          },
          pending: {
            bg: "#FEF3C7",
            text: "#D97706",
          },
          overdue: {
            bg: "#FEE2E2",
            text: "#B91C1C",
          },
          draft: {
            bg: "#F3F4F6",
            text: "#4B5563",
          },
        },
        chart: {
          violet: "#7C3AED",
          teal: "#14B8A6",
          rose: "#EC4899",
          amber: "#F59E0B",
          gray: "#9CA3AF",
        },
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(0.96)' },
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-slow': 'pulse-slow 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
export default config;

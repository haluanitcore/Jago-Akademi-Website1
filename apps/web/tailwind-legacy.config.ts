import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ─── Jago Akademi Brand Colors ───────────────────────────────
      colors: {
        // Primary: Cyan (dari logo)
        cyan: {
          50: "#e0fbff",
          100: "#b3f5ff",
          200: "#80eeff",
          300: "#4de7ff",
          400: "#1ae0ff",
          500: "#00d4ff", // Brand primary
          600: "#00aad4",
          700: "#0080a8",
          800: "#005c7a",
          900: "#00374d",
          950: "#001f2e",
        },
        // Accent: Hot Pink / Magenta (dari logo)
        pink: {
          50: "#ffe0ef",
          100: "#ffb3d2",
          200: "#ff80b3",
          300: "#ff4d94",
          400: "#ff1a75",
          500: "#ff0066", // Brand accent
          600: "#d40054",
          700: "#a80042",
          800: "#7a0031",
          900: "#4d001f",
          950: "#2e0013",
        },
        // Neutral (dark-first, habiskerja style)
        dark: {
          50: "#f2f2f2",
          100: "#e0e0e0",
          200: "#c2c2c2",
          300: "#a3a3a3",
          400: "#737373",
          500: "#525252",
          600: "#363636",
          700: "#262626",
          800: "#171717",
          900: "#0d0d0d",
          950: "#080808",
        },
        // Semantic aliases (used in CSS vars)
        brand: {
          primary: "#00d4ff",
          accent: "#ff0066",
          dark: "#0d0d0d",
          darker: "#080808",
        },
      },

      // ─── Typography ──────────────────────────────────────────────
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
        display: ["Syne", "Plus Jakarta Sans", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.625rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.875rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.375rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.75rem" }],
        "5xl": ["3rem", { lineHeight: "1.1" }],
        "6xl": ["3.75rem", { lineHeight: "1.05" }],
        "7xl": ["4.5rem", { lineHeight: "1" }],
        "8xl": ["6rem", { lineHeight: "0.95" }],
      },

      // ─── Spacing ─────────────────────────────────────────────────
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "30": "7.5rem",
        "section": "6rem",
      },

      // ─── Border Radius ───────────────────────────────────────────
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },

      // ─── Box Shadow (neon glow effect) ───────────────────────────
      boxShadow: {
        "glow-cyan": "0 0 20px rgba(0, 212, 255, 0.4), 0 0 60px rgba(0, 212, 255, 0.15)",
        "glow-pink": "0 0 20px rgba(255, 0, 102, 0.4), 0 0 60px rgba(255, 0, 102, 0.15)",
        "glow-sm-cyan": "0 0 10px rgba(0, 212, 255, 0.3)",
        "glow-sm-pink": "0 0 10px rgba(255, 0, 102, 0.3)",
        "card-dark": "0 4px 24px rgba(0, 0, 0, 0.4)",
        "card-hover": "0 8px 40px rgba(0, 0, 0, 0.6)",
      },

      // ─── Background Image (gradients) ────────────────────────────
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #00d4ff 0%, #ff0066 100%)",
        "gradient-brand-soft": "linear-gradient(135deg, rgba(0,212,255,0.15) 0%, rgba(255,0,102,0.15) 100%)",
        "gradient-dark": "linear-gradient(180deg, #0d0d0d 0%, #080808 100%)",
        "gradient-dark-card": "linear-gradient(145deg, #171717 0%, #0d0d0d 100%)",
        "gradient-hero": "radial-gradient(ellipse at top, rgba(0,212,255,0.12) 0%, transparent 60%), radial-gradient(ellipse at bottom right, rgba(255,0,102,0.1) 0%, transparent 60%)",
        "noise": "url('/textures/noise.png')",
      },

      // ─── Animation ───────────────────────────────────────────────
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "marquee": {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "border-spin": {
          "0%": { "--border-angle": "0deg" },
          "100%": { "--border-angle": "360deg" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out",
        "fade-in-up": "fade-in-up 0.6s ease-out",
        "slide-in-left": "slide-in-left 0.5s ease-out",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "float": "float 3s ease-in-out infinite",
        "marquee": "marquee 30s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;

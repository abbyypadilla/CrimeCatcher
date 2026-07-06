/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Core surfaces
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        "surface-raised": "var(--color-surface-raised)",
        border: "var(--color-border)",

        // Brand / navy spine
        navy: {
          950: "#070D1F",
          900: "#0B1530",
          800: "#101D40",
          700: "#16294F",
          600: "#1E3866",
        },
        // AI / accent blue
        accent: {
          DEFAULT: "#2F6FED",
          soft: "#EAF1FF",
          dark: "#1D4ED8",
        },
        // Risk semantics
        risk: {
          high: "#D6304B",
          "high-soft": "#FDE8EC",
          medium: "#DB8A1F",
          "medium-soft": "#FCF1DE",
          low: "#1F9D6B",
          "low-soft": "#E4F7EE",
        },
        ink: {
          DEFAULT: "var(--color-ink)",
          muted: "var(--color-ink-muted)",
          faint: "var(--color-ink-faint)",
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        terminal: "0 1px 2px 0 rgba(11, 21, 48, 0.06), 0 1px 1px 0 rgba(11, 21, 48, 0.04)",
        panel: "0 4px 24px -8px rgba(11, 21, 48, 0.18)",
      },
      keyframes: {
        ticker: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        pulseDot: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.35 },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(8px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        ticker: "ticker 28s linear infinite",
        pulseDot: "pulseDot 1.6s ease-in-out infinite",
        scan: "scan 2.4s ease-in-out infinite",
        fadeUp: "fadeUp 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};

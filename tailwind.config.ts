import type { Config } from "tailwindcss"

import { fontFamily } from "tailwindcss/defaultTheme"

export default {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    container: {
      screens: { md: "40rem" },
      padding: "1rem",
      center: true,
    },
    extend: {
      fontFamily: {
        sans: ["InterVariable", ...fontFamily.sans],
      },
      colors: ({ colors }) => ({
        border: {
          DEFAULT: "rgba(0,0,0,0.1)",
          50: "rgba(0,0,0,0.05)",
          150: "rgba(0,0,0,0.15)",
          200: "rgba(0,0,0,0.2)",
        },
        ring: {
          DEFAULT: colors.blue[500],
        },
      }),
      borderColor: ({ theme }) => ({ DEFAULT: theme("colors.border.DEFAULT") }),
      ringColor: ({ theme }) => ({ DEFAULT: theme("colors.ring.DEFAULT") }),
      ringOpacity: { DEFAULT: "1" },
    },
  },
  plugins: [],
} satisfies Config

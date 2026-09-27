/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f5ff",
          100: "#dbe6fe",
          500: "#4f6df5",
          600: "#3c53e0",
          700: "#2f41b8",
        },
      },
    },
  },
  plugins: [],
};

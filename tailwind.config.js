/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}"
    ],
    safelist: [
        {
            pattern: /translate-x-(0|full)/,
        },
        {
            pattern: /-translate-x-full/,
        },
        {
            pattern: /overflow-x-(auto|hidden|scroll)/,
        }
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}


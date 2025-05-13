/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}"
    ],
    safelist: [
        'translate-x-0',
        'translate-x-full',
        '-translate-x-full',
        'overflow-x-hidden'
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}


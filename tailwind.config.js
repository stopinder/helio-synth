/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}"
    ],
    safelist: [
        // Handle left and right sidebar transforms
        {
            pattern: /^-?translate-x-(0|full)$/,
        },
        // Just in case it's applied as raw string in HTML
        'translate-x-0',
        'translate-x-full',
        '-translate-x-full',
        'transform',
        'overflow-x-hidden'
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}

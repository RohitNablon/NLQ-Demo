/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Jost', 'sans-serif'],
                inter: ['Inter', 'sans-serif'],
            },
            animation: {
                'spin-slow': 'spin 3s linear infinite',
                'shimmer': 'shimmer 2s linear infinite',
            },
            keyframes: {
                shimmer: {
                    '0%': { backgroundPosition: '200% 0' },
                    '100%': { backgroundPosition: '-200% 0' },
                }
            }
        },
    },
    plugins: [],
}

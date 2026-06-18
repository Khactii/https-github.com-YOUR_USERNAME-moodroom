/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: 'var(--ink)',
        surf: 'var(--surf)',
        surf2: 'var(--surf2)',
        cream: 'var(--cream)',
        mut: 'var(--mut)',
        faint: 'var(--faint)',
        acc: 'var(--acc)',
        'acc-soft': 'var(--acc-soft)',
        line: 'var(--line)',
      },
      fontFamily: {
        grotesk: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"Space Mono"', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        'flame-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.12)', opacity: '0.92' },
        },
        'rise': {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'pop': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '60%': { transform: 'scale(1.06)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'flame-pulse': 'flame-pulse 2.2s ease-in-out infinite',
        'rise': 'rise 0.5s ease-out both',
        'pop': 'pop 0.5s cubic-bezier(0.18, 0.89, 0.32, 1.28) both',
      },
    },
  },
  plugins: [],
};

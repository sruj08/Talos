import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/context/**/*.{js,ts,jsx,tsx,mdx}',
    './src/hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--background)',
        surface: {
          DEFAULT: 'var(--surface)',
          elevated: 'var(--surface-elevated)',
          secondary: 'var(--surface-secondary)',
        },
        ink: {
          DEFAULT: 'var(--foreground)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          paypal: 'var(--tone-paypal-fg)',
          emerald: 'var(--tone-emerald-fg)',
          amber: 'var(--tone-amber-fg)',
          crimson: 'var(--tone-crimson-fg)',
        },
        obsidian: {
          950: 'oklch(12% 0.005 285.823)',
          900: 'oklch(21.03% 0.0059 285.89)',
        },
        paypal: {
          navy: '#003087',
          cerulean: '#0070BA',
        },
      },
      borderRadius: {
        xs: '2px',
        control: 'var(--radius-control)',
        inner: 'var(--radius-inner)',
        outer: 'var(--radius-outer)',
      },
      fontFamily: {
        display: ['Fraunces Variable', 'Fraunces', 'Georgia', 'serif'],
        sans: ['Figtree Variable', 'Figtree', 'Mukta', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;

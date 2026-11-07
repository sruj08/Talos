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
        deep: 'var(--bg-deep)',
        surface: {
          DEFAULT: 'var(--surface)',
          elevated: 'var(--surface-elevated)',
          secondary: 'var(--surface-secondary)',
        },
        hairline: {
          DEFAULT: 'var(--border-hairline)',
          hover: 'var(--border-hover)',
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
          950: '#0f0f10',
          900: '#19191b',
        },
        paypal: {
          navy: '#003087',
          cerulean: '#0070ba',
        },
      },
      borderRadius: {
        xs: '4px',
        control: 'var(--radius-control)',
        inner: 'var(--radius-inner)',
        outer: 'var(--radius-outer)',
      },
      transitionTimingFunction: {
        unslop: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      fontFamily: {
        display: ['Fraunces Variable', 'Fraunces', 'Georgia', 'serif'],
        sans: ['Figtree Variable', 'Figtree', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;

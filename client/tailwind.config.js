/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
      },
      boxShadow: {
        neon: '0 0 18px hsl(var(--primary) / 0.55), 0 0 32px hsl(var(--primary) / 0.35)',
        'neon-accent': '0 0 18px hsl(var(--accent) / 0.55), 0 0 32px hsl(var(--accent) / 0.35)',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 10px hsl(var(--primary) / 0.35), 0 0 18px hsl(var(--primary) / 0.2)', transform: 'translateY(0)' },
          '50%': { boxShadow: '0 0 22px hsl(var(--primary) / 0.6), 0 0 36px hsl(var(--primary) / 0.35)', transform: 'translateY(-1px)' },
        },
        'text-glow-pulse': {
          '0%, 100%': { textShadow: '0 0 8px hsl(var(--primary) / 0.45), 0 0 14px hsl(var(--primary) / 0.25)' },
          '50%': { textShadow: '0 0 14px hsl(var(--accent) / 0.55), 0 0 24px hsl(var(--accent) / 0.35)' },
        },
      },
      animation: {
        'glow-pulse': 'glow-pulse 2.6s ease-in-out infinite',
        'text-glow-pulse': 'text-glow-pulse 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}


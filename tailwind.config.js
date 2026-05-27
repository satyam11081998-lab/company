/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: { '2xl': '1400px' }
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'monospace'],
      },
      fontSize: {
        'label': ['13px', { lineHeight: '1.2', fontWeight: '600', letterSpacing: '0.1em' }],
        'kpi':   ['clamp(36px, 5vw, 52px)', { lineHeight: '1', fontWeight: '700', letterSpacing: '-0.04em' }],
      },
      letterSpacing: {
        tightest: '-0.03em',
        tight:    '-0.02em',
        wide:     '0.06em',
        widest:   '0.12em',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        sm:  'var(--radius-sm)',
        md:  'calc(var(--radius) + 2px)',
        lg:  'calc(var(--radius) + 4px)',
        xl:  'calc(var(--radius) + 8px)',
        '2xl': 'calc(var(--radius) + 12px)',
        full: '9999px',
        none: '0px',
      },
      colors: {
        border:      'hsl(var(--border))',
        'border-strong': 'hsl(var(--border-strong))',
        input:       'hsl(var(--input))',
        ring:        'hsl(var(--ring))',
        background:  'hsl(var(--background))',
        foreground:  'hsl(var(--foreground))',
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          hover:      'hsl(var(--primary-hover))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        navy: {
          DEFAULT:    'hsl(var(--navy))',
          foreground: 'hsl(var(--navy-foreground))',
          mid:        'hsl(var(--navy-mid))',
          soft:       'hsl(var(--navy-soft))',
        },
        success: {
          DEFAULT:    'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
          soft:       'hsl(var(--success-soft))',
        },
        warning: {
          DEFAULT:    'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
          soft:       'hsl(var(--warning-soft))',
        },
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up':   { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        'fade-in':        { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-up':       { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        'fade-in':        'fade-in 0.45s ease-out both',
        'slide-up':       'slide-up 0.4s ease-out both',
      },
    }
  },
  plugins: [require("tailwindcss-animate")],
}

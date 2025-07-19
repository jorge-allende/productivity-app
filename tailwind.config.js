/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design System Colors following 60/30/10 rule
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: 'hsl(var(--card))',
        'card-foreground': 'hsl(var(--card-foreground))',
        popover: 'hsl(var(--popover))',
        'popover-foreground': 'hsl(var(--popover-foreground))',
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
        // Priority colors for tasks
        priority: {
          low: 'hsl(var(--priority-low))',
          medium: 'hsl(var(--priority-medium))',
          high: 'hsl(var(--priority-high))',
          urgent: 'hsl(var(--priority-urgent))',
        },
      },
      fontSize: {
        // 4 Font Sizes Only
        'size-1': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }], // Large headings
        'size-2': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '600' }], // Subheadings
        'size-3': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }], // Body text
        'size-4': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }], // Small text
      },
      fontWeight: {
        // 2 Font Weights Only
        normal: '400',
        semibold: '600',
      },
      spacing: {
        // Ensure 8pt grid compliance
        '18': '4.5rem', // 72px
        '22': '5.5rem', // 88px
        '26': '6.5rem', // 104px
        '30': '7.5rem', // 120px
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.line-clamp-2': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '2',
        },
      });
    },
  ],
}
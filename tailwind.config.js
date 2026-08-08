export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#0f172a',
        surfaceAlt: '#0f172a',
        panel: '#111827',
        accent: '#22d3ee',
        accentSoft: '#38bdf8',
      },
      boxShadow: {
        panel: '0 24px 80px rgba(15, 23, 42, 0.35)',
      },
    },
  },
  plugins: [],
}

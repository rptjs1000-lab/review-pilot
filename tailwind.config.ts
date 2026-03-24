import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard', 'sans-serif'],
        grotesk: ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        primary: { DEFAULT: '#2563EB', light: '#DBEAFE', dark: '#1D4ED8' },
        sidebar: { DEFAULT: '#0F172A', hover: '#1E293B' },
        surface: '#FFFFFF',
        bg: '#F8FAFC',
        txt: { DEFAULT: '#1E293B', sub: '#64748B' },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        bdr: '#E2E8F0',
      },
    },
  },
  plugins: [],
};

export default config;

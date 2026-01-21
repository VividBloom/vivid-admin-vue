import { defineConfig, presetUno, presetAttributify, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    // presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
      collections: {
        ep: () => import('@iconify-json/ep/icons.json').then(i => i.default),
      },
    }),
  ],
  theme: {
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    colors: {
      primary: {
        50: '#faf5ff',
        100: '#f3e8ff',
        200: '#e9d5ff',
        300: '#d8b4fe',
        400: '#c084fc',
        500: '#a855f7',
        600: '#9333ea',
        700: '#7e22ce',
        800: '#6b21a8',
        900: '#581c87',
      },
      neutral: {
        50: '#fafafa',
        100: '#f5f5f5',
        200: '#e5e5e5',
        300: '#d4d4d4',
        400: '#a3a3a3',
        500: '#737373',
        600: '#525252',
        700: '#404040',
        800: '#262626',
        900: '#171717',
        950: '#0a0a0a',
      },
    },
    fontFamily: {
      sans: 'Inter, system-ui, -apple-system, sans-serif',
    },
    animation: {
      keyframes: {
        fadeIn: '{0%{opacity:0}100%{opacity:1}}',
        slideIn:
          '{0%{transform:translateX(20px);opacity:0}100%{transform:translateX(0);opacity:1}}',
        float: '{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}',
      },
      durations: {
        fadeIn: '0.5s',
        slideIn: '0.3s',
        float: '3s',
      },
      timingFns: {
        fadeIn: 'ease-out',
        slideIn: 'ease-out',
        float: 'ease-in-out',
      },
      counts: {
        float: 'infinite',
      },
    },
  },
})

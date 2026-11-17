import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

// Genera los iconos PNG de la app a partir de public/favicon.svg (npm run icons).
export default defineConfig({
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, resizeOptions: { background: '#DCEBF8' } },
    apple: { ...minimal2023Preset.apple, resizeOptions: { background: '#DCEBF8' } },
  },
  images: ['public/favicon.svg'],
});

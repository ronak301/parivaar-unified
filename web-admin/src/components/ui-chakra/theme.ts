import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const config = defineConfig({
  preflight: { scope: '.chakra-scope', level: 'parent' },
  globalCss: {},
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: '#e5eeff' },
          100: { value: '#dce9ff' },
          200: { value: '#c2d3ff' },
          300: { value: '#9fb4fb' },
          400: { value: '#6f6ee0' },
          500: { value: '#3230c4' },
          600: { value: '#2a28a3' },
          700: { value: '#232184' },
          800: { value: '#1b1a66' },
          900: { value: '#141349' },
          950: { value: '#0b1c30' },
        },
      },
      fonts: {
        heading: { value: 'var(--font-manrope)' },
        body: { value: 'var(--font-manrope)' },
        label: { value: 'var(--font-hanken)' },
        mono: { value: 'var(--font-geist-mono)' },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: '{colors.brand.500}' },
          contrast: { value: 'white' },
          fg: { value: '{colors.brand.700}' },
          muted: { value: '{colors.brand.100}' },
          subtle: { value: '{colors.brand.50}' },
          emphasized: { value: '{colors.brand.200}' },
          focusRing: { value: '{colors.brand.500}' },
        },
        border: {
          DEFAULT: { value: '#c7c4d7' },
        },
        fg: {
          DEFAULT: { value: '#0b1c30' },
          muted: { value: '#464555' },
        },
      },
      radii: {
        l1: { value: '{radii.sm}' },
        l2: { value: '{radii.lg}' },
        l3: { value: '{radii.xl}' },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);

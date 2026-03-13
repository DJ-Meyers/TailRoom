import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [tailwindcss(), tanstackStart({ srcDirectory: 'app' })],
  resolve: {
    alias: {
      '~': path.resolve(import.meta.dirname, 'app'),
    },
  },
})

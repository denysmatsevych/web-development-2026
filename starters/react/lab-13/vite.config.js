import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
    // Два набори тестів: основна частина (npm test) і додаткові
    // завдання §4.9 (npm run test:extra).
    projects: [
      {
        extends: true,
        test: { name: 'lab', include: ['tests/*.test.jsx'] },
      },
      {
        extends: true,
        test: { name: 'extra', include: ['tests/extra/*.test.jsx'] },
      },
    ],
  },
})

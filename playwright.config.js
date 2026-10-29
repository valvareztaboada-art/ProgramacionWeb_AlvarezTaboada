// Configuración de Playwright: pruebas de extremo a extremo (E2E) en un navegador real.
// Las pruebas están en e2e/ y se corren con:  npm run test:e2e
//
// · webServer: Playwright levanta el sitio solo antes de probar (en CI, la versión de producción)
// · projects: cada prueba corre en una compu de escritorio y en un celular
// · trace: si una prueba falla, guarda una "grabación" paso a paso para el Trace Viewer
//          (npx playwright show-trace <archivo>), útil cuando falla en el servidor de CI

import { defineConfig, devices } from '@playwright/test'

const enCI = Boolean(process.env.CI)
const PUERTO = 3000

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: enCI, // en CI no se permite dejar un test.only olvidado
  retries: enCI ? 1 : 0,
  reporter: enCI ? [['github'], ['html', { open: 'never' }]] : 'list',

  use: {
    baseURL: `http://localhost:${PUERTO}`,
    locale: 'es-AR',
    timezoneId: 'America/Argentina/Buenos_Aires',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'escritorio', use: { ...devices['Desktop Chrome'] } },
    { name: 'celular', use: { ...devices['Pixel 7'] } },
  ],

  webServer: {
    // En CI se prueba lo mismo que se publica (next start después del build); en local, el modo dev
    command: enCI ? `npm run start -- --port ${PUERTO}` : `npm run dev -- --port ${PUERTO}`,
    url: `http://localhost:${PUERTO}`,
    reuseExistingServer: !enCI,
    timeout: 120_000,
  },
})

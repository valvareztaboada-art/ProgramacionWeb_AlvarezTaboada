// Auditoría automática de accesibilidad con axe (WCAG 2.1 A y AA) en las páginas públicas,
// en compu y en celular. Revisa contraste, etiquetas, textos alternativos, jerarquía de títulos,
// roles ARIA, nombres de botones y enlaces, etc. Si aparece un problema, la prueba falla y lo lista.

import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const PAGINAS = [
  ['portada', '/'],
  ['catálogo de servicios', '/servicios'],
  ['detalle de un servicio', '/servicios/vacunacion'],
  ['ingresar', '/login'],
  ['crear cuenta', '/registro'],
  ['recuperar la contraseña', '/recuperar'],
  ['página no encontrada', '/esta-pagina-no-existe'],
]

for (const [nombre, url] of PAGINAS) {
  test(`${nombre} (${url}) no tiene problemas de accesibilidad`, async ({ page }) => {
    // Con "reducir movimiento" no hay animaciones: axe mide los colores reales (sin elementos
    // a medio aparecer por la animación de scroll, que darían contrastes falsos)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(url)
    await page.waitForLoadState('networkidle')

    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      // El mapa es un iframe de Google: su contenido no es nuestro
      .exclude('iframe')
      .analyze()

    // Si falla, el mensaje dice qué regla y en qué elementos
    const resumen = violations.map((v) => `${v.id} (${v.impact}): ${v.help} → ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
    expect(resumen, resumen.join('\n')).toEqual([])
  })
}

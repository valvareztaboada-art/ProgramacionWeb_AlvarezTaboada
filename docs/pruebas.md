# Calidad: pruebas, reportes de bug y depuración

Cómo se asegura la calidad de MICAN (clase 12: testing, depuración y calidad de software).

## QA y QC en el proyecto

- **QA (aseguramiento, preventivo):** el *proceso* evita que los errores lleguen a producción.
  Cada cambio va en una rama → pull request → **CI** (`npm audit`, lint, pruebas unitarias y de base de datos, build y
  pruebas E2E) → revisión de la *preview* → merge. La rama `main` está protegida: no se puede mergear si el CI falla.
- **QC (control, reactivo):** se *revisa el producto* para encontrar fallas: pruebas automáticas, casos de prueba
  manuales, testing exploratorio y monitoreo en producción (logs, Speed Insights, `/api/v1/salud`).

## Tipos de prueba

| Nivel | Herramienta | Qué cubre | Comando |
|---|---|---|---|
| Unitarias | `node:test` | Funciones puras: validaciones, fechas, edades, vacunas, cobros, Mercado Pago, esquemas Zod, errores de la API | `npm test` |
| Base de datos | `node:test` + PGlite | RLS (quién puede leer o escribir qué), funciones y triggers de Postgres, en una base real en memoria | `npm test` |
| Extremo a extremo (E2E) | **Playwright** | El sitio en un navegador real (Chromium), en compu y celular: portada, catálogo, formularios, redirecciones, API | `npm run test:e2e` |
| Accesibilidad | **axe** (dentro de Playwright) | WCAG 2.1 A/AA en las páginas públicas: contraste, etiquetas, textos alternativos, títulos, ARIA | `npm run test:e2e` |
| Manuales | Casos de prueba (abajo) | Flujos con sesión iniciada y pagos reales de prueba | — |
| Exploratorias | Sesiones con objetivo (abajo) | Lo que los guiones no anticipan | — |

### Playwright (E2E)

Las pruebas están en [`e2e/`](../e2e) y la configuración en [`playwright.config.js`](../playwright.config.js).

- **Locators semánticos:** se busca lo que ve la persona (`getByRole('button', { name: 'Entrar' })`, `getByLabel`,
  `getByText`), no clases de CSS. Así las pruebas no se rompen con un rediseño, y de paso verifican la accesibilidad
  (si un botón no tiene nombre accesible, la prueba no lo encuentra).
- **Auto-waiting:** Playwright espera solo a que cada elemento esté visible y habilitado. No hay esperas fijas.
- **Dos proyectos:** `escritorio` (Desktop Chrome) y `celular` (Pixel 7). El menú hamburguesa se prueba solo en
  el celular y "Saltar al contenido" (teclado) solo en la compu.
- **Trace Viewer:** si una prueba falla en el CI, se guarda la traza (capturas, DOM y red de cada paso) en el
  artefacto `reporte-playwright` de GitHub Actions. Se abre con `npx playwright show-trace <archivo.zip>`.
- **Codegen:** para escribir una prueba nueva, `npx playwright codegen http://localhost:3000` graba los clics y
  genera el código (después se le agregan los `expect`).

Correrlas en local (la primera vez hay que instalar el navegador):

```bash
npx playwright install chromium
npm run test:e2e
```

Las pruebas E2E no inician sesión: los flujos con usuario se prueban a mano (casos de abajo) y su seguridad está
cubierta por las pruebas de base de datos (RLS).

### Auditoría de accesibilidad (axe)

[`e2e/accesibilidad.spec.js`](../e2e/accesibilidad.spec.js) corre axe sobre la portada, el catálogo, un servicio, ingresar,
crear cuenta, recuperar la contraseña y el 404, en compu y celular. La primera corrida encontró **dos problemas reales de
contraste** (texto celeste sobre azul en las opiniones: 4,1:1; texto sobre Toffee en el llamado final: 3,9:1; el mínimo
es 4,5:1) y se corrigieron. Ahora pasa sin observaciones.

## Casos de prueba manuales

Formato: **precondiciones · pasos · datos de entrada · resultado esperado**.

### CP-01 · Pedir un turno como cliente
- **Precondiciones:** cliente con cuenta y al menos una mascota cargada por la veterinaria. Sesión cerrada.
- **Pasos:** 1) En la portada tocar "Sacá un turno". 2) Ingresar. 3) Elegir mascota, "Consulta", un día hábil y un horario libre. 4) "Pedir turno".
- **Datos:** email y contraseña del cliente de prueba; día: el próximo martes; horario: 10:00.
- **Resultado esperado:** después del login vuelve al formulario de turnos (no al inicio). Aparece "¡Turno solicitado!" con estado *pendiente*. En la agenda de la veterinaria aparece el turno.

### CP-02 · No se puede cancelar con menos de 24 h
- **Precondiciones:** cliente con un turno pendiente para dentro de menos de 24 horas.
- **Pasos:** Mis turnos → "Cancelar turno" → confirmar.
- **Datos:** el turno de mañana a primera hora.
- **Resultado esperado:** mensaje de error explicando la regla de las 24 h; el turno sigue *pendiente*.

### CP-03 · Atender y cobrar en el momento (veterinaria)
- **Precondiciones:** veterinaria con sesión iniciada; turno confirmado de hoy.
- **Pasos:** Agenda → "Atendido" → en la ventana revisar concepto y monto → tildar "Ya lo pagó en efectivo" → "Registrar pago en efectivo" → "Listo".
- **Datos:** concepto propuesto "Consulta · Luna"; monto 18000.
- **Resultado esperado:** "¡Cobrado en efectivo!"; en Cobros aparece *Pagado · Efectivo*; el turno no figura en "Atendidos sin cobrar".

### CP-04 · "Ahora no" deja el cobro pendiente
- **Precondiciones:** igual que CP-03.
- **Pasos:** "Atendido" → "Ahora no".
- **Resultado esperado:** el turno aparece en "Atendidos sin cobrar" (Panel y Cobros) con el botón "Cobrar", que abre la misma ventana.

### CP-05 · Pagar con Mercado Pago (cliente)
- **Precondiciones:** cliente con un cobro pendiente; credenciales de prueba de Mercado Pago; usuario comprador de prueba.
- **Pasos:** Pagos → "Pagar con Mercado Pago" → pagar con la tarjeta de prueba aprobada.
- **Datos:** tarjeta de prueba de Mercado Pago (ver [pruebas-mercado-pago.md](pruebas-mercado-pago.md)).
- **Resultado esperado:** vuelve a MICAN con "¡Pago aprobado!"; el cobro pasa a *Pagado* sin recargar a mano (webhook); en Vercel → Logs aparece `webhook.procesado`.

### CP-06 · No se puede eliminar un paciente con pagos
- **Precondiciones:** veterinaria con sesión; paciente con un pago registrado.
- **Pasos:** Pacientes → Editar → "Eliminar paciente".
- **Resultado esperado:** el botón está deshabilitado y explica el motivo. Llamando a la API directamente (`DELETE /api/v1/pacientes/:id`) responde `409`.

### CP-07 · Edad automática con la fecha de nacimiento
- **Precondiciones:** veterinaria con sesión; paciente cargado antes del cambio (solo con edad).
- **Pasos:** Editar → cargar fecha de nacimiento → Guardar.
- **Datos:** 14/03/2022 (con la fecha de hoy 29/10/2026).
- **Resultado esperado:** la ficha muestra "4 años" y "Nació el 14/03/2022"; una fecha futura muestra "La fecha de nacimiento no puede ser futura." y no guarda.

### CP-08 · Recuperar la contraseña
- **Precondiciones:** cuenta existente; sesión cerrada.
- **Pasos:** Ingresar → "¿Olvidaste tu contraseña?" → email → abrir el enlace del email en el mismo navegador → elegir una contraseña nueva.
- **Datos:** el email de la cuenta; contraseña nueva `Perro-Feliz-2026`.
- **Resultado esperado:** "Revisá tu email" (el mismo mensaje aunque el email no tenga cuenta); el enlace lleva a "Elegí tu contraseña nueva"; al guardar entra a su panel; la contraseña vieja ya no sirve.

### CP-09 · Anular un cobro cargado por error
- **Precondiciones:** veterinaria con sesión; cobro pendiente.
- **Pasos:** Cobros → "Anular" → "Sí, anular".
- **Resultado esperado:** el cobro queda *Anulado* (tachado) y no suma al total pendiente; el dueño/a ya no lo puede pagar. Si estaba en "Atendidos sin cobrar", el turno vuelve a esa lista.

### CP-10 · Catálogo y "Sacar turno" con el servicio elegido
- **Precondiciones:** cliente con mascota; sesión cerrada.
- **Pasos:** Servicios → filtro "Gatos" → Peluquería → "Sacar turno de peluquería" → ingresar.
- **Resultado esperado:** el filtro deja solo los servicios para gatos; después del login el formulario de turno abre con "Peluquería" ya elegida.

## Reportes de bug (reales, encontrados durante el desarrollo)

### BUG-01 · El aviso de "Supabase va a pausar el proyecto" llegaba aunque el keep-alive corría
- **Severidad:** alta (si se pausa, el sitio deja de funcionar). **Prioridad:** alta.
- **Pasos para reproducir:** 1) Dejar el workflow diario que hacía `GET /rest/v1/especialidades`. 2) Esperar 7 días.
- **Resultado esperado:** el proyecto no recibe el aviso de inactividad. **Resultado real:** llegó el mail de pausa programada.
- **Evidencia:** mail de Supabase del 28/10; logs del workflow en verde con `Supabase respondió: [{"id":"consulta"}]`.
- **Causa:** una lectura chica no cuenta como "suficiente actividad" para Supabase.
- **Solución:** escritura diaria (`registrar_latido()`) dos veces por día, desde GitHub Actions y cron-job.org. Ver [despliegue.md](despliegue.md).

### BUG-02 · El workflow del latido fallaba con HTTP 400 solo en GitHub
- **Severidad:** media. **Prioridad:** alta (sin latido vuelve el riesgo de pausa).
- **Pasos para reproducir:** Actions → "Mantener Supabase activo" → Run workflow.
- **Resultado esperado:** ✅ y "Latido registrado". **Resultado real:** `curl: (22) The requested URL returned error: 400`.
- **Depuración:** el mismo pedido desde la compu (con los valores de `.env.local`) daba `200`; se descartaron función
  inexistente (`404`) y clave inválida (`401`) probando cada caso. Se cambió el workflow para mostrar la respuesta de
  Supabase y el *formato* de los secrets sin revelarlos.
- **Causa:** caracteres invisibles (espacios/saltos de línea) en los secrets pegados en GitHub.
- **Solución:** el workflow limpia los valores antes de usarlos. Con la rama corregida, Run workflow dio ✅.

### BUG-03 · El texto de la portada no aparecía (prototipo)
- **Severidad:** alta (la portada quedaba sin título). **Prioridad:** alta.
- **Pasos para reproducir:** abrir la portada con la pestaña del navegador en segundo plano.
- **Resultado esperado:** se ve el título. **Resultado real:** solo se veía la etiqueta superior.
- **Causa:** la animación de entrada arrancaba en `opacity: 0` con retraso; si el navegador no la ejecutaba, el texto quedaba invisible.
- **Solución:** la animación solo desplaza (el texto siempre es visible) y se apaga con "reducir movimiento".

## Testing exploratorio

Sesiones cortas con un objetivo, sin guion, anotando lo encontrado:

| Objetivo de la sesión | Hallazgos | Resultado |
|---|---|---|
| Cobrar al marcar "Atendido": ¿qué pasa si la página se actualiza con la ventana abierta? | El turno cambiaba de lista y la ventana desaparecía a mitad del cobro | La página se actualiza recién al cerrar la ventana |
| "Atendidos sin cobrar" con datos viejos | Todos los atendidos anteriores aparecían como sin cobrar | La migración los marca como ya resueltos |
| Fechas de nacimiento raras | 30/02 y fechas futuras pasaban según el navegador | Validación estricta en el navegador, en la API (Zod) y en la base |
| Búsqueda de pacientes con caracteres especiales | Comas o paréntesis podían alterar el filtro de la consulta | El esquema solo acepta letras, números y caracteres de email |

## Cómo depurar

- **Pensar en voz alta (rubber duck):** antes de tocar código, explicar qué debería pasar y qué pasa. En BUG-02 alcanzó con
  separar "desde la compu anda / desde GitHub no" para ubicar el problema en los secrets y no en el código.
- **DevTools → Network:** para cualquier problema con datos, mirar primero el pedido a `/api/v1/...`: código de estado,
  respuesta JSON (la API siempre explica el error) y cabeceras. Muchas veces el error no está en la pantalla sino en el pedido.
- **DevTools → Sources:** *breakpoints* (o *breakpoints condicionales*, ej. `turno.id === 12`) en los Client Components
  para ver el *call stack* y el valor real de las variables (scope) en ese momento. Para registrar algo sin tocar el
  código, usar un *logpoint* en lugar de `console.log`.
- **Servidor:** los Route Handlers escriben logs estructurados ([`src/lib/api/log.js`](../src/lib/api/log.js)); en
  producción se ven en Vercel → Logs, filtrando por `evento` (ej. `api.error_inesperado`). En el código no quedan `console.log` sueltos.
- **Pruebas que fallan en el CI:** descargar el artefacto `reporte-playwright` y abrir la traza con el Trace Viewer.

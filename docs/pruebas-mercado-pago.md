# Mercado Pago: integración y pruebas

## Cómo funciona

```
Cliente toca "Pagar"
   │  fetch POST /api/pagos/:id/preferencia        (Route Handler, con la sesión del cliente)
   ▼
Servidor ── busca el cobro con RLS (solo los suyos) y verifica que esté "pendiente"
   │  POST api.mercadopago.com/checkout/preferences  (Access Token, solo en el servidor)
   │      items · external_reference = "mican-pago-<id>" · back_urls
   ▼
Checkout Pro de Mercado Pago  ── el cliente paga fuera de nuestro sitio (PCI-DSS)
   │                                   │
   │ back_urls (navegador)             │ WEBHOOK (servidor a servidor)
   ▼                                   ▼
/cliente/pagos/resultado        POST /api/webhooks/mercadopago
 solo MUESTRA un mensaje          1. valida la firma x-signature (HMAC-SHA256 + Webhook Secret) → 401 si no
 y espera la confirmación         2. GET /v1/payments/:id  (no confía en el cuerpo del webhook)
                                  3. registrar_pago_mp() en Supabase: atómica, idempotente,
                                     controla el monto y no "despaga" un pago acreditado
                                  4. 200 si salió bien · 500 si falló algo → Mercado Pago reintenta
```

### Estados

| Mercado Pago (`status`) | Cobro en MICAN | Qué ve el cliente |
|---|---|---|
| `approved` | `pagado` | ¡Pago acreditado! |
| `pending`, `in_process`, `authorized` | `en_proceso` | Tu pago está en proceso |
| `rejected`, `cancelled` | `pendiente` | Puede volver a intentar |
| `refunded`, `charged_back` | `reembolsado` | — |

### Seguridad

| Riesgo | Cómo se evita |
|---|---|
| Exponer el Access Token | Solo en `MP_ACCESS_TOKEN` (sin `NEXT_PUBLIC_`), en archivos `server-only` |
| Webhooks falsos | Firma `x-signature` validada con HMAC-SHA256 y comparación en tiempo constante |
| Confiar en el cuerpo del webhook | Se consulta `GET /v1/payments/:id` con nuestro token |
| Confiar en las back_urls | La página de resultado no escribe nada en la base |
| Pagar un monto distinto | El monto sale de la base al crear la preferencia y se vuelve a comparar al conciliar |
| Pagar cobros ajenos | La preferencia se crea con la sesión del cliente (RLS) y `guardar_preferencia_mp` vuelve a controlar |
| Marcar "pagado" desde el navegador | `registrar_pago_mp` solo la ejecuta el rol `service_role` (clave secreta del servidor) |
| Notificaciones repetidas o desordenadas | La función es idempotente y un aviso viejo no pisa un `approved` |

## Pruebas automáticas (`npm test`, corren en el CI)

| Archivo | Qué prueba |
|---|---|
| `tests/mercadopago.test.js` | Firma (válida, secreto distinto, id cambiado, request-id/ts cambiados, cabeceras faltantes); preferencia (monto de la base, ARS, back_urls, `auto_return` solo en https); `external_reference`; procesamiento del webhook (consulta la API, reintentos ante fallas, ignora pagos ajenos/otra moneda/inexistentes) |
| `tests/rls.test.js` | En Postgres real (PGlite): el navegador no puede acreditar pagos; rechazado → pendiente; monto distinto → no se acredita; en proceso → aprobado; avisos repetidos/viejos no cambian nada; reembolso; pago inexistente; auditoría solo para la veterinaria; preferencia solo de cobros propios y pendientes |
| `tests/validaciones.test.js` | Formulario de nuevo cobro (monto > 0, hasta 2 decimales, etc.) |

### Pruebas por HTTP del webhook (servidor local)

| Caso | Respuesta esperada |
|---|---|
| Sin firma | `401 Firma inválida` |
| Firma hecha con otro secreto | `401` |
| Firma válida pero con otro `data.id` | `401` |
| Firma válida, `type=merchant_order` | `200` (ignorada) |
| Firma válida, falla la consulta a Mercado Pago | `500` (Mercado Pago reintenta) |
| Firma válida, pago inexistente | `200` (ignorada) |
| Crear preferencia sin sesión | `401` |
| Crear preferencia con id inválido | `400` |
| `GET` al webhook | `405` |

## Pruebas manuales (demo) con credenciales de prueba

Siempre con un **comprador de prueba**, en una ventana de incógnito. Tarjetas de prueba (ver la lista actualizada en el panel de Mercado Pago): el **nombre del titular** define el resultado.

| # | Caso | Titular | Resultado esperado en MICAN |
|---|---|---|---|
| 1 | Pago aprobado | `APRO` | Vuelve a "Resultado" → "Estamos confirmando…" → se actualiza solo a **¡Pago acreditado!**. En la veterinaria: estado `Pagado`, N° de pago y la notificación en la tabla |
| 2 | Pago rechazado | `OTHE` | "El pago no se completó"; el cobro sigue **pendiente** y se puede reintentar |
| 3 | Pago pendiente | `CONT` | "Tu pago está en proceso"; estado `En proceso` y sin botón de pagar |
| 4 | Cerrar la pestaña después de pagar (APRO) | `APRO` | Aunque no vuelva al sitio, el webhook lo marca **Pagado** (el problema de las back_urls) |
| 5 | Notificación de prueba del panel ("Simular") | — | En los logs de Vercel: firma válida → "El pago no existe en Mercado Pago" (200) |
| 6 | Cliente intenta pagar un cobro ya pagado | — | No aparece el botón; si fuerza la API: `409` |
| 7 | La veterinaria crea un cobro nuevo | — | El dueño/a lo ve en "Pagos → Para pagar" |

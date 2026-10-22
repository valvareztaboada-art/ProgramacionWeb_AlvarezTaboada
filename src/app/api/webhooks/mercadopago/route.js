// Dirección VIEJA del webhook (sin versión). Queda como alias de /api/v1/webhooks/mercadopago
// para que Mercado Pago no pierda avisos mientras se actualiza la URL en su panel.
// Es justamente para lo que sirve versionar: cambiar sin romper a quien ya usa la API.
// Cuando la URL nueva esté configurada en Mercado Pago, se puede borrar este archivo.
export { POST } from '../../v1/webhooks/mercadopago/route'

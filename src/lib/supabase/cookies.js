// Opciones de las cookies de sesión de Supabase (las usan los tres clientes:
// navegador, servidor y proxy, así todas las cookies salen iguales).
//
// · secure: true   → la cookie solo viaja por HTTPS (en producción, en Vercel).
//                    En localhost (http) se desactiva para poder desarrollar.
// · sameSite: lax  → el navegador no la manda en pedidos que vienen de otros sitios
//                    (protege contra CSRF), pero sí al volver desde Mercado Pago o el email.
// · httpOnly: false → (valor de Supabase) la sesión tiene que poder leerse desde el
//                    navegador, porque los formularios hablan directo con Supabase.
//                    La protección contra XSS viene de React, que escapa todo el texto
//                    que se muestra, y de no usar nunca dangerouslySetInnerHTML.
//                    (Ver docs/seguridad.md.)

export const OPCIONES_DE_COOKIES = {
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
}

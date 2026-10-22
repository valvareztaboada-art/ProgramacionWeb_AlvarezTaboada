# Seguridad en MICAN: autenticación, autorización y contraseñas

Cómo aplica MICAN cada punto de la clase de Autenticación, Autorización y Seguridad Web.

## 1. AuthN vs AuthO (el orden importa)

| | Pregunta | En MICAN |
|---|---|---|
| **Autenticación** | ¿Quién sos? | Supabase Auth: email + contraseña, con el email confirmado |
| **Autorización** | ¿Qué podés hacer? | Rol en `perfiles` (cliente o veterinaria) + RLS en la base |

La autorización siempre va **después**: el proxy y los layouts primero verifican la sesión (AuthN) y recién después miran el rol (AuthO). El RLS usa `auth.uid()`, que solo existe si hay una sesión válida.

## 2. Registro (sign-up)

| Validación de la clase | Frontend (UX) | Backend (seguridad real) |
|---|---|---|
| Email no duplicado | Mensaje "Ya existe una cuenta…" | Supabase Auth rechaza el duplicado. Con la confirmación de email activada, responde igual exista o no la cuenta, así no se puede averiguar qué emails están registrados |
| Fortaleza de contraseña | Indicador visual (`MedidorContrasena`) y requisitos que se tildan mientras se escribe | `password_requirements` + `minimum_password_length` en Supabase Auth |
| Sanitización | Validaciones con `trim()`, formato de email, largo máximo | SQL siempre parametrizado (PostgREST), `check` constraints en las tablas, y React escapa todo lo que muestra (no se usa `dangerouslySetInnerHTML`) |

**Requisitos de la contraseña** ([`src/lib/contrasena.js`](../src/lib/contrasena.js)): al menos 8 caracteres, minúscula, mayúscula, número y símbolo; no puede contener palabras obvias ("password", "mican"…), y tiene un máximo de 72 caracteres (el límite de bcrypt).

## 3. Contraseñas: hash + salt

**MICAN nunca recibe ni guarda contraseñas.** El formulario se las manda (por HTTPS) directo a **Supabase Auth**, que las guarda en `auth.users.encrypted_password` con **bcrypt**:

```
$2a$10$N9qo8uLOickgx2ZMRZoMye IjZAgcfl7p92ldGxad68LJZdL17lhWy
└┬┘└┬┘└────────┬──────────┘└──────────────┬─────────────────┘
 │  │      salt (22)                hash (31)
 │  └ costo: 2^10 = 1024 vueltas (lento a propósito)
 └ algoritmo: bcrypt
```

- **Hash unidireccional:** no se puede revertir para obtener la contraseña.
- **Salt único por usuario:** bcrypt genera un salt aleatorio en cada registro, así dos personas con la misma contraseña tienen hashes distintos y las *rainbow tables* no sirven.
- **Lento a propósito:** el costo 10 hace que probar millones de contraseñas sea muy caro.

**Cómo comprobarlo** (Supabase → SQL Editor):

```sql
select
  email,
  substr(encrypted_password, 1, 3)  as algoritmo,  -- $2a = bcrypt
  substr(encrypted_password, 5, 2)  as costo,      -- 10
  substr(encrypted_password, 8, 22) as salt,       -- distinto en cada usuario
  substr(encrypted_password, 30)    as hash
from auth.users;
```

Si dos cuentas tienen la **misma contraseña**, se ve que el salt y el hash son **distintos**.

## 4. Login y rate limiting

- La contraseña viaja por **HTTPS** (Vercel fuerza HTTPS).
- El mensaje de error es el mismo si el email no existe o si la contraseña está mal.
- **Rate limiting real (servidor):** Supabase Auth limita los intentos de login y registro **por IP** (Authentication → Rate Limits).
- **Bloqueo progresivo (pantalla):** después de 3 intentos fallidos, el botón se bloquea 15 s, y la espera se duplica en cada fallo nuevo, hasta 5 minutos ([`src/lib/intentos.js`](../src/lib/intentos.js)).

## 5. Sesión: JWT en cookies

Supabase usa **JWT**: después del login, el navegador guarda un *access token* (dura 1 hora) y un *refresh token*, en **cookies**.

| Atributo | En MICAN | Por qué |
|---|---|---|
| `Secure` | ✅ en producción | La cookie solo viaja por HTTPS ([`src/lib/supabase/cookies.js`](../src/lib/supabase/cookies.js)) |
| `SameSite=Lax` | ✅ | No se manda en pedidos que vienen de otros sitios (protección contra CSRF) |
| `HttpOnly` | ❌ (decisión consciente) | Los formularios hablan con Supabase **desde el navegador** y necesitan leer la sesión. Se compensa evitando XSS: React escapa todo el texto y no se inserta HTML crudo |
| Payload del JWT | Solo id, email y rol de Supabase | Nunca se agregan datos sensibles: el payload solo está codificado, no cifrado |

El `proxy.js` renueva el token antes de cada página, y el servidor lo verifica con `getClaims()` / `getUser()`.

## 6. RBAC y middleware (proxy)

Dos roles, guardados en `perfiles.rol`. **Nadie elige su rol**: todos se registran como `cliente`, y la veterinaria se asigna a mano. El rol no se puede cambiar desde la app, porque está bloqueado por permisos de columna.

### Mini actividad: rutas, permisos y respuestas

| Ruta | Quién puede | Sin sesión (401) | Con sesión, otro rol (403) |
|---|---|---|---|
| `/`, `/login`, `/registro` | Todos | — | — |
| `/cliente/**` | `cliente` | El proxy redirige a `/login` | Página **403** (`forbidden()`) |
| `/veterinaria/**` | `veterinaria` | El proxy redirige a `/login` | Página **403** (`forbidden()`) |
| `POST /api/v1/pagos/:id/preferencia` | `cliente` (sus cobros) | `401` JSON | `403` JSON |
| `POST /api/v1/webhooks/mercadopago` | Mercado Pago (firma HMAC) | `401` si la firma no es válida | — |
| `/auth/confirmar` | Quien tiene el enlace del email | Lo valida Supabase | — |

En las páginas, el "401" se muestra como una **redirección al login**, porque es lo útil para quien navega. En la API se responde el código tal cual.

**Tercera capa (RLS):** aunque alguien saltee el proxy y los layouts, la base de datos solo devuelve o modifica lo que su rol permite. Está probado en `tests/rls.test.js`.

## 7. Errores frecuentes de la clase, revisados

| Error | En MICAN |
|---|---|
| Contraseñas en texto plano | ❌ No: bcrypt en Supabase Auth |
| Hash sin salt | ❌ No: salt aleatorio por usuario (incluido en el hash bcrypt) |
| Login por HTTP | ❌ No: HTTPS en Vercel y en Supabase |
| Cookies sin `Secure` | ❌ No: `Secure` en producción |
| Cookies sin `HttpOnly` | ⚠️ Decisión consciente, ver punto 5 |
| Datos sensibles en el JWT | ❌ No |
| Login sin rate limiting | ❌ No: límites por IP en Supabase + bloqueo progresivo en pantalla |
| Confundir 401 con 403 | ❌ No: ver la tabla de la mini actividad |

## Configuración en el panel de Supabase (proyecto en la nube)

Los valores de `supabase/config.toml` solo se aplican al entorno local. En el proyecto real se configuran a mano:

1. **Authentication → Sign In / Providers → Email**
   - *Minimum password length*: `8`
   - *Password requirements*: **Lowercase, uppercase letters, digits and symbols**
   - *Confirm email*: activado
2. **Authentication → Rate Limits**: revisar los límites de *sign-ups and sign-ins* por IP (por defecto, 30 cada 5 minutos).

# API REST de MICAN

Los Route Handlers viven en `src/app/api/v1/`. Siguen los principios REST de la clase 10:

- **Recursos con sustantivos en plural** (`/pacientes`, `/pagos`) y **sin verbos en la URL**: la acción la dice el método HTTP.
- **Versionado en la URL** (`/api/v1/...`): si algún día cambia el contrato, se crea `/v2` sin romper a quien usa `/v1`.
- **Sin estado**: cada pedido lleva todo lo necesario (la sesión viaja en las cookies).
- **Respuestas en JSON** y **códigos de estado correctos**.

## Endpoints

| Método | URL | Quién | Qué hace | Datos que recibe |
|---|---|---|---|---|
| `GET` | `/api/v1/pacientes` | veterinaria | Lista los pacientes | query: `buscar`, `especie` (opcionales) |
| `POST` | `/api/v1/pacientes` | veterinaria | Crea un paciente → `201` + `Location` | body JSON: `nombre`, `especie`, `raza`, `fechaNacimiento` (`AAAA-MM-DD`), `emailDuenio` |
| `GET` | `/api/v1/pacientes/:id` | veterinaria | Trae un paciente | route param: `id` |
| `PATCH` | `/api/v1/pacientes/:id` | veterinaria | Modifica **solo** los campos que vienen | route param + body JSON (al menos un campo) |
| `DELETE` | `/api/v1/pacientes/:id` | veterinaria | Lo elimina con su historial y los archivos de sus estudios | route param |
| `POST` | `/api/v1/pagos/:id/preferencia` | cliente (sus cobros) | Crea la preferencia de Mercado Pago → `201` + `{ url }` | route param |
| `POST` | `/api/v1/webhooks/mercadopago` | Mercado Pago (firma HMAC) | Recibe los avisos de pago | body/query de Mercado Pago |

Ejemplos (con la sesión iniciada como veterinaria):

```http
GET /api/v1/pacientes?buscar=luna&especie=Perro
→ 200 { "pacientes": [ { "id": 1, "nombre": "Luna", "especie": "Perro", ... } ] }

PATCH /api/v1/pacientes/1
Content-Type: application/json
{ "fechaNacimiento": "2022-03-14" }
→ 200 { "paciente": { "id": 1, "fechaNacimiento": "2022-03-14", "edad": "4 años", ... } }

POST /api/v1/pacientes
{ "nombre": "", "especie": "Dragón", "emailDuenio": "no-es-email" }
→ 400 {
    "error": "Hay datos inválidos. Revisá el formulario.",
    "detalles": {
      "nombre": "Ingresá el nombre de la mascota.",
      "especie": "Elegí la especie.",
      "emailDuenio": "Ingresá un email válido (ej: nombre@mail.com)."
    }
  }
```

## Códigos de estado

| Código | Cuándo |
|---|---|
| `200` OK | Se leyó, modificó o eliminó bien |
| `201` Created | Se creó un recurso (paciente, preferencia) |
| `400` Bad Request | Los datos no cumplen el esquema (con el error de cada campo en `detalles`), el JSON está mal formado o el id no es un número |
| `401` Unauthorized | No hay sesión (o venció). En el webhook: la firma no es válida |
| `403` Forbidden | Hay sesión pero el rol no puede (ej: un cliente queriendo crear pacientes) |
| `404` Not Found | El paciente o el cobro no existe (o no es tuyo: el RLS no lo deja ver) |
| `409` Conflict | Choca con el estado actual: eliminar un paciente con pagos registrados, pagar un cobro que ya no está pendiente |
| `500` Internal Server Error | Falla imprevista. El cliente recibe un mensaje genérico; el detalle queda en el log |
| `502` Bad Gateway | Mercado Pago no respondió |
| `503` Service Unavailable | Los pagos online no están configurados |

## Validación en el servidor (Zod)

"Nunca confiar en los datos del cliente": el formulario valida en el navegador para dar una buena experiencia,
pero cualquiera puede mandar un pedido directo a la API. Por eso **la API vuelve a validar todo** con esquemas de
[Zod](https://zod.dev) en [`src/lib/esquemas.js`](../src/lib/esquemas.js):

- **Tipo** y **formato** (fecha de nacimiento `AAAA-MM-DD` que exista, ni futura ni de hace más de 40 años; email válido),
  **largo** (nombre de 1 a 40 caracteres) y **obligatoriedad** de cada campo.
- La **edad no se guarda**: se calcula a partir de la fecha de nacimiento cada vez que se muestra, así se actualiza sola.
- **Campos de más se rechazan** (`z.strictObject`): no se puede colar un `id` o un `rol`.
- **Sanitización**: a los textos se les sacan etiquetas HTML (`<script>…`), caracteres de control y espacios de más.
  El email se pasa a minúsculas.
- El texto de búsqueda solo admite letras, números y caracteres de email, así no puede alterar el filtro de la consulta.

Y debajo de todo, la base de datos vuelve a controlar: **RLS** (quién puede leer/escribir cada fila),
restricciones `check` y el trigger que no deja borrar pacientes con pagos.

## Manejo de errores centralizado

[`src/lib/api/errores.js`](../src/lib/api/errores.js) es el equivalente al *Global Error Middleware* de la clase.
Cada Route Handler se envuelve con `conManejoDeErrores(...)`:

1. Los errores esperables se lanzan como `ErrorDeApi(status, mensaje, detalles)` (ej: `sinSesion()`, `noEncontrado()`).
2. Si algo falla, el error se **propaga** hasta `conManejoDeErrores`, que lo captura.
3. Lo **registra completo** en el log del servidor ([`src/lib/api/log.js`](../src/lib/api/log.js): una línea JSON por evento,
   al estilo de Pino/Winston, que se ve en Vercel → Logs).
4. Le **responde al cliente** un JSON con un mensaje claro, **sin stack trace** ni detalles internos.

Los tests de [`tests/api.test.js`](../tests/api.test.js) comprueban los esquemas, la sanitización y que un error
inesperado nunca filtre detalles internos.

## Cómo se usa desde el sitio

Los Client Components llaman a la API con `fetch` (helper [`src/lib/api/cliente.js`](../src/lib/api/cliente.js)):

- `FormularioPaciente` → `POST /api/v1/pacientes` (nuevo) o `PATCH /api/v1/pacientes/:id` (editar).
  Si la API responde `400`, cada error aparece debajo de su campo.
- `BotonEliminarPaciente` → `DELETE /api/v1/pacientes/:id` (después de confirmar).
- `BotonPagar` → `POST /api/v1/pagos/:id/preferencia`.

> La dirección vieja del webhook (`/api/webhooks/mercadopago`, sin versión) sigue funcionando como alias
> mientras se actualiza la URL en el panel de Mercado Pago.

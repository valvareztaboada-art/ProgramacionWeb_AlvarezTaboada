# Despliegue, entornos y observabilidad

Cómo MICAN llega a producción (clase 13: DevOps y despliegue continuo).

## Serverless con Vercel

El repositorio de GitHub está conectado a Vercel. No hay servidores que mantener:

1. Cada `push` dispara un build en un contenedor aislado (`npm install` + `next build`).
2. Las páginas estáticas y las imágenes optimizadas van a la red global de Vercel (CDN).
3. Las páginas dinámicas, el proxy y los Route Handlers (`/api/v1/...`) corren como **funciones serverless**.

## Entornos

| Entorno | Dónde | Cuándo se actualiza | Variables |
|---|---|---|---|
| **Development** | `http://localhost:3000` | `npm run dev` | `.env.local` (no se sube a GitHub) |
| **Preview** (staging) | URL propia por cada PR | cada push a una rama con PR | Vercel → Settings → Environment Variables → *Preview* |
| **Production** | https://mican-five.vercel.app | cada merge a `main` | Vercel → Settings → Environment Variables → *Production* |

Las URLs de *Preview* están protegidas por Vercel (piden iniciar sesión). Para mostrarle el sitio a otras
personas se comparte la de producción, o el enlace del botón **Share** de una preview.

## Variables de entorno

Nunca se escriben claves en el código. Están en `.env.local` (local) y en Vercel (cifradas).
El modelo, sin datos reales, está en [`.env.example`](../.env.example). El `.gitignore` ignora `.env*`
(salvo el ejemplo), así ningún archivo con claves puede subirse por error.

| Variable | Dónde se usa | ¿Pública? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | navegador y servidor | Sí (por eso el prefijo `NEXT_PUBLIC_`) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | navegador y servidor | Sí: lo que cada uno puede hacer lo limita el RLS |
| `SUPABASE_SECRET_KEY` | solo servidor (webhook) | **No**: saltea el RLS |
| `MP_ACCESS_TOKEN` | solo servidor | **No** |
| `MP_WEBHOOK_SECRET` | solo servidor | **No** |

**Regla de Next.js:** solo las variables con prefijo `NEXT_PUBLIC_` llegan al navegador. Las secretas
nunca llevan ese prefijo.

Lo ideal es que *Preview* use credenciales de **prueba** de Mercado Pago, así ningún deploy de prueba
puede cobrar de verdad.

## Dominio y HTTPS

El sitio usa el subdominio gratuito `mican-five.vercel.app`, que ya tiene **HTTPS automático**
(certificado de Let's Encrypt que Vercel renueva solo).

Para un dominio propio (ej: `mican.com.ar`) habría que comprarlo y, en Vercel → Settings → Domains, agregarlo y
crear en el proveedor DNS:

- un registro **A** para el dominio raíz (`mican.com.ar`) apuntando a la IP que indica Vercel;
- un registro **CNAME** para `www` apuntando a `cname.vercel-dns.com`.

Vercel emite el certificado SSL cuando el DNS se propaga. No es necesario para el proyecto.

## Observabilidad

| Qué | Dónde se ve | Para qué |
|---|---|---|
| **Build logs** | Vercel → Deployments → (un deploy) → Building | Errores de compilación o de dependencias |
| **Runtime logs** | Vercel → Logs | Lo que pasa en producción: cada pedido y nuestros logs |
| **Logs estructurados** | Vercel → Logs (buscar por `evento`) | La API escribe una línea JSON por evento ([`src/lib/api/log.js`](../src/lib/api/log.js)): `pacientes.creado`, `pacientes.eliminado`, `webhook.procesado`, `api.error_inesperado`… |
| **Speed Insights (RUM)** | Vercel → Speed Insights | Core Web Vitals medidas en los dispositivos de las personas reales: **LCP** (carga), **INP** (interactividad; reemplazó a FID) y **CLS** (estabilidad visual) |

Los logs de las funciones serverless duran poco en el plan gratuito. Para guardarlos más tiempo se usaría un
*Log Drain* (Datadog, Logtail, etc.). No hace falta para el proyecto.

## CI/CD

```
rama → push → GitHub Actions (CI) ──✔──→ PR mergeable → merge a main → Vercel (CD) → producción
                                  └──✘──→ no se puede mergear
```

- **CI** ([`.github/workflows/ci.yml`](../.github/workflows/ci.yml)): en cada PR y cada push a `main` corre
  `npm ci` → `npm audit` (dependencias con vulnerabilidades altas) → lint → tests → build.
  Si un paso falla, el pipeline se corta.
- **CD**: Vercel despliega solo. Cada PR tiene su Preview y cada merge a `main` va a producción.
- **Protección de `main`**: GitHub no deja mergear un PR hasta que el CI pase. Así **solo el código que pasa
  los tests llega a producción**.
- **GitHub Secrets**: el workflow que mantiene activa la base ([`mantener-supabase-activo.yml`](../.github/workflows/mantener-supabase-activo.yml))
  usa `${{ secrets.SUPABASE_URL }}` y `${{ secrets.SUPABASE_PUBLISHABLE_KEY }}`. GitHub los cifra y los oculta en los logs.

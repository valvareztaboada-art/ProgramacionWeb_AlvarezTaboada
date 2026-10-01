# MICAN · Veterinaria

Sitio web integral para veterinarias — Proyecto de **Programación Web**.

Tiene **doble interfaz**:

| Interfaz | Ruta | Qué incluye |
|---|---|---|
| Sitio público | `/` | Presentación, servicios, contacto, login |
| Dueños de mascotas | `/cliente` | Mis mascotas, turnos, vacunas, estudios, pagos |
| Veterinaria | `/veterinaria` | Panel, pacientes, agenda, estudios, cobros |

## Identidad visual
- **Paleta:** crema `#fbf3e6`, azul cobalto `#2f45c4`, mostaza `#f2a531`, durazno `#f7d6ab`, celeste `#d6ebf5`, azul marino `#16306e` (panel de la veterinaria).
- **Tipografías:** Fredoka (títulos) y Nunito (textos), de Google Fonts.
- **Ilustraciones:** perros y gatos dibujados en SVG (`src/components/ilustraciones`), en estilo de línea a mano alzada.

## Tecnologías
- **Next.js** (App Router) + React
- **Supabase**: base de datos Postgres, autenticación y RLS
- CSS puro (variables, flexbox, grid, animaciones, responsive)

## Cómo está organizado (App Router)
```
src/
├── app/
│   ├── layout.jsx          # Layout raíz (tipografías, metadata)
│   ├── not-found.jsx       # Página 404
│   ├── (publico)/          # Grupo de rutas: no aparece en la URL
│   │   ├── layout.jsx      # Navbar + footer
│   │   ├── page.jsx        # /
│   │   └── login/          # /login
│   ├── cliente/            # Interfaz del dueño
│   │   ├── layout.jsx      # Menú lateral compartido
│   │   ├── loading.jsx     # Pantalla de carga
│   │   └── mascotas/[id]/  # Ruta dinámica: ficha de cada mascota
│   └── veterinaria/        # Interfaz de la veterinaria
│       └── pacientes/[id]/ # Ruta dinámica: ficha de cada paciente
├── components/             # Componentes reutilizables
├── lib/datos.js            # Funciones async que leen de Supabase (Server Components)
├── lib/supabase/           # Clientes de Supabase (servidor y navegador)
├── proxy.js                # Renueva la sesión y protege /cliente y /veterinaria
```

### Server y Client Components
Todas las páginas y layouts son **Server Components**: buscan los datos con `async/await`.
Solo tres componentes chicos (hojas del árbol) llevan `'use client'`, porque necesitan hooks o eventos:

| Componente | Por qué es Client Component |
|---|---|
| `EnlaceNav` | Usa `usePathname` para marcar el enlace activo del menú |
| `FormularioLogin` | Usa `useState`, `onSubmit` y `useRouter` |
| `TablaPacientes` | Buscador con `useState` y `onChange` |

## Correr en local
```bash
npm install
npm run dev
```

| Comando | Qué hace |
|---|---|
| `npm run dev` | Levanta el sitio en `http://localhost:3000` |
| `npm run lint` | Revisa el código con oxlint (incluye reglas de accesibilidad) |
| `npm test` | Corre los tests (`tests/`) con el test runner de Node |
| `npm run build` | Compila la versión de producción |
| `npx supabase <comando>` | CLI de Supabase (instalado como dependencia del proyecto) |

## CI/CD
- **CI (GitHub Actions):** en cada pull request y en cada push a `main` se ejecutan lint, tests y build ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)).
- **CD (Vercel):** cada pull request genera un **deploy de preview** con su propia URL, y al mergear a `main` se publica en producción.
- **Flujo de trabajo:** cada cambio se hace en una rama → pull request → CI en verde + revisar la preview → merge.

## Accesibilidad y responsive
- HTML semántico: `header`, `nav` (con `aria-label`), `main`, `section`, `article`, `footer`, `ol`, `dl`, `address`, tablas con `thead`/`th`.
- Enlace "Saltar al contenido", foco visible en todos los elementos interactivos y respeto de "reducir movimiento".
- Formularios con `label` asociados, errores vinculados con `aria-describedby` y `aria-invalid`.
- Menú hamburguesa en pantallas chicas (`aria-expanded`), paneles adaptados a celular.
- Auditado con axe (WCAG 2.1 AA): 0 problemas en las 15 vistas; sin desbordes a 375 px y 768 px.

## Supabase: base de datos, autenticación y RLS

### Tablas
| Tabla | Qué guarda | Relación |
|---|---|---|
| `perfiles` | Nombre, email, teléfono y **rol** de cada usuario | 1 a 1 con `auth.users` |
| `mascotas` | Pacientes | Dueño/a por `email_duenio` |
| `especialidades` | Consulta, Vacunación, Estudios, Peluquería | — |
| `turnos` | Día, hora, motivo, estado | `mascota_id`, `especialidad_id` |
| `vacunas`, `estudios`, `pagos` | Historial clínico y cobros | `mascota_id` |

Todo está en [`supabase/migrations`](supabase/migrations) y los datos de ejemplo en [`supabase/seed.sql`](supabase/seed.sql).

### Quién puede hacer qué (RLS)
| | Cliente (dueño/a) | Veterinaria |
|---|---|---|
| Ver mascotas, turnos, vacunas, estudios, pagos | Solo los de **sus** mascotas | Todos |
| Cargar / editar mascotas, vacunas, estudios, pagos | ❌ | ✅ |
| Pedir turno | ✅ Para sus mascotas, a futuro, en horario de atención | ✅ |
| Cancelar turno | ✅ Solo con **más de 24 h** (`cancelar_turno`) | ✅ Siempre |
| Confirmar / marcar atendido o **ausente** | ❌ | ✅ |
| Cambiarse el rol | ❌ (bloqueado por permisos de columna) | — |

- Todos los que se registran son **clientes**; el rol `veterinaria` se asigna a mano.
- El dueño/a ve sus mascotas solo si **confirmó su email** (así nadie puede registrarse con un email ajeno).
- No puede haber dos turnos activos en el mismo horario (índice único).

### Configurar un proyecto nuevo
1. Crear el proyecto en [supabase.com](https://supabase.com) y copiar `.env.example` como `.env.local` con la URL y la clave *publishable*.
2. Subir las tablas y los datos de ejemplo:
   ```bash
   npx supabase login
   npx supabase link --project-ref <id-del-proyecto>
   npx supabase db push --include-seed
   ```
3. En **Authentication → URL Configuration**: *Site URL* = la URL de Vercel; *Redirect URLs* = `http://localhost:3000/**` y `https://*.vercel.app/**`.
4. Registrarse en el sitio y convertir esa cuenta en veterinaria (SQL Editor):
   ```sql
   update public.perfiles set rol = 'veterinaria' where email = 'tu@email.com';
   ```
5. En Vercel → Settings → Environment Variables: cargar las mismas dos variables.

## Próximos pasos (según avance la materia)
- [x] Migrar a Next.js (App Router)
- [x] Base de datos con Supabase
- [x] Login real y roles (dueño / veterinaria)
- [ ] Pagos con Mercado Pago
- [ ] Tests con Playwright
- [x] CI/CD con GitHub Actions

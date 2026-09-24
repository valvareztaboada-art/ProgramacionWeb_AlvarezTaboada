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
├── lib/datos.js            # Funciones async para obtener datos (después: Supabase)
└── data/mockData.js        # Datos de ejemplo
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

## Próximos pasos (según avance la materia)
- [ ] Migrar a Next.js (App Router)
- [ ] Base de datos con Supabase
- [ ] Login real y roles (dueño / veterinaria)
- [ ] Pagos con Mercado Pago
- [ ] Tests con Playwright
- [ ] CI/CD con GitHub Actions

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

## Tecnologías (por ahora)
- React + Vite
- React Router
- CSS puro (variables, flexbox, grid, animaciones, responsive)

## Estructura
```
src/
├── components/       # Piezas reutilizables (Navbar, Sidebar, Logo, Icono, ...)
│   └── ilustraciones/
├── layouts/          # Layout público y layout de panel
├── pages/
│   ├── publico/
│   ├── cliente/
│   └── veterinaria/
└── data/             # Datos de ejemplo (después: Supabase)
```

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

## Qué cambia

<!-- En 1 o 2 oraciones: qué hace este PR y por qué. -->

## Cómo probarlo

<!-- Pasos para verificarlo en la preview de Vercel (con qué usuario: cliente o veterinaria). -->

1.
2.

## Checklist

### Código
- [ ] Corre en local sin errores (`npm run dev`)
- [ ] `npm run lint` sin advertencias
- [ ] `npm test` en verde (y agregué pruebas si cambié lógica)
- [ ] `npm run test:e2e` en verde (y agregué pruebas si cambié una pantalla o un flujo)
- [ ] Sin `console.log` sueltos (los registros van por `src/lib/api/log.js`)

### Seguridad y datos
- [ ] Los datos se validan en el servidor (esquema Zod en la API o reglas en la base), no solo en el formulario
- [ ] Las tablas nuevas tienen RLS y políticas (y pruebas en `tests/rls.test.js`)
- [ ] Ninguna clave secreta en el código ni con prefijo `NEXT_PUBLIC_`
- [ ] Si hay migración nueva: probada con las pruebas y lista para `npx supabase db push`

### Interfaz y accesibilidad
- [ ] Se ve bien en celular (375 px) y en compu
- [ ] Se puede usar con teclado (foco visible, Escape cierra ventanas)
- [ ] Etiquetas en los campos, textos alternativos en las imágenes, errores anunciados (`role="alert"`)

### Entrega
- [ ] La documentación está al día (`README.md` y `docs/`)
- [ ] El CI pasó (lint, pruebas, build y E2E) y revisé la preview de Vercel

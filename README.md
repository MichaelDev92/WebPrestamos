# WebPréstamos · Dashboard

Dashboard administrativo (Next.js 16 + React 19) que consume el backend NestJS de préstamos.

## Stack

- Next.js 16 (App Router, Turbopack) + React 19
- TypeScript estricto
- CSS Modules + variables CSS (paleta híbrida dark, light preparado)
- TanStack Query + Zustand (estado server / cliente)
- Axios sobre proxy interno con rotación de refresh token server-side
- React Hook Form + Zod
- Recharts (overview)
- Lucide para iconos
- i18n preparado (es, listo para multi-idioma)

## Estructura

```
src/
├── app/                       # rutas (App Router)
│   ├── (auth)/login           # pública
│   ├── (dashboard)/           # protegida (middleware proxy.ts)
│   │   ├── overview
│   │   ├── products
│   │   ├── product-types
│   │   └── register           # solo superadmin
│   └── api/proxy/[...path]    # proxy server-only hacia el backend
├── features/                  # feature-based: cada dominio aislado
│   ├── auth
│   ├── products
│   ├── product-types
│   └── overview
├── shared/
│   ├── components/            # UI base + dashboard shell
│   ├── hooks/                 # useSession, useToast, useT, useTheme, useDebounce, usePagination
│   ├── lib/                   # http, i18n, theme, query, format
│   └── styles/                # tokens.css, animations.css, globals.css
├── server/                    # server-only: config, auth (cookies httpOnly, refresh)
├── types/                     # tipos compartidos (auth)
├── locales/                   # diccionarios i18n
└── proxy.ts                   # protección de rutas (Next 16 file convention)
```

## Variables de entorno

Copiar `.env.example` a `.env.local` y completar.

| Variable | Descripción | Default |
| --- | --- | --- |
| `API_URL` | URL base del backend NestJS (server-only, **no se expone al cliente**) | _(requerida)_ |
| `SESSION_COOKIE_ACCESS` | Nombre de la cookie httpOnly del access token | `wp_at` |
| `SESSION_COOKIE_REFRESH` | Nombre de la cookie httpOnly del refresh token | `wp_rt` |
| `COOKIE_SAMESITE` | `lax` en dev, `strict` o `none` en prod según contexto | `lax` |

## Scripts

```bash
pnpm dev        # servidor dev (Turbopack)
pnpm build      # build producción
pnpm start      # servir build producción
pnpm lint       # ESLint
```

## Flujo de autenticación

1. Usuario envía `email + password` a la server action `loginAction`.
2. Backend `POST /auth/login` devuelve `{ accessToken, refreshToken, user }`.
3. Server action setea cookies httpOnly + cookie `wp_user` (info no sensible) y devuelve OK.
4. Toda petición a la API pasa por `/api/proxy/[...path]` (route handler server-only):
   - Lee `accessToken` server-side y lo añade en `Authorization`.
   - Si el backend responde `401`, intenta refresh (rota tokens) y reintenta una vez.
   - Si el refresh falla, limpia cookies y responde `401` (el cliente redirige a `/login`).
5. `proxy.ts` (file convention de Next 16) protege todas las rutas privadas.
6. El layout `/(dashboard)` valida adicionalmente el rol del usuario.

## Decisiones de diseño

- **Toda la lógica de tokens vive server-side.** El cliente nunca ve el JWT.
- **Paleta híbrida** (ver `src/shared/styles/tokens.css`): base sobria estilo "Design 1" + glow bioluminiscente y cyan secundario inspirados en "Design 2".
- **Theme toggle preparado pero bloqueado a `dark`.** Para activar light: eliminar `forceTheme="dark"` en `AppProviders` y agregar el control al `Topbar`.
- **i18n preparado.** Para agregar un idioma: crear `src/locales/<locale>.json`, registrarlo en `i18n.constants.ts` y `getDictionary.ts`.

## Alcance MVP

✅ Auth (login + register + logout + refresh rotation)
✅ Products (CRUD + paginación + filtros)
✅ Product types (CRUD + integridad referencial)
✅ Overview con KPIs (productos activos, stock total, valor inventario) + chart productos por tipo

🚧 Pospuesto: dashboard de clients/users, KPIs de risk category, theme toggle activo, multi-idioma.

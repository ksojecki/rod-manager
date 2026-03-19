# AGENTS Guide

## Repo Snapshot

- This is an Nx 22 workspace (`nx`, `@nx/js` in `package.json`) organized around `apps/` and `libs/`.
- Application projects live in `apps/` (`apps/api`, `apps/web`), and reusable code lives in `libs/` (`libs/shared`).
- Treat root config as source of truth unless a project-level config overrides it intentionally.
- Extended docs for agents and architecture are in `docs/` (`docs/agents/`, `docs/architecture/`, `docs/operations/`).

## Language Policy

- All documentation must be written in English.
- All generated code must use English for identifiers, comments, and user-facing messages.

## Big Picture Architecture

- Monorepo orchestration is defined in `nx.json`; project tasks are expected to be inferred by Nx.
- `@nx/js/typescript` plugin wires common targets: `build` and `typecheck` (see `nx.json` plugin options).
- Shared cache inputs include `.github/workflows/ci.yml` via `namedInputs.sharedGlobals`; CI changes can invalidate task cache.
- TypeScript baseline lives in `tsconfig.base.json` with strict + composite settings and NodeNext module system.

## Critical Workflows

- When running Nx commands as an AI agent, always pass `--no-tui`.
- Install deps: `npm ci` (used in CI).
- Run lint via npm script: `npm run lint` (delegates to Nx `lint` target inference).
- Run formatting checks: `npm run format:check`; auto-fix formatting: `npm run format`.
- Run CI-equivalent checks locally: `npx nx run-many -t lint test build typecheck --no-tui`.
- Apply Nx Cloud CI remediation hints: `npx nx fix-ci --no-tui`.
- Explore project/task graph: `npx nx graph --no-tui`.
- Keep TS project refs consistent after adding projects: `npx nx sync --no-tui` (or `npx nx sync:check --no-tui` in CI).

## Project-Specific Conventions

- Formatting: Prettier with single quotes (`.prettierrc`).
- Formatting indentation is 2 spaces globally (`tabWidth: 2`, `useTabs: false`); JSON/JSONC have explicit Prettier override.
- Ignore generated artifacts in formatting and VCS (`.prettierignore`, `.gitignore` include `dist`, `coverage`, `.nx/*`).
- ESLint uses flat config in `eslint.config.mjs` with Nx lint inference from `@nx/eslint/plugin` in `nx.json`.
- TypeScript lint enforces `@typescript-eslint/no-explicit-any` and `@typescript-eslint/no-floating-promises`.
- Keep top-level declaration order as: exported types, local types, constants, exported functions, local functions.
- Allow exceptions only when this order breaks compilation; in such cases add a local ESLint disable with a short reason.
- Public class methods require JSDoc description (`jsdoc/require-jsdoc` + `jsdoc/require-description`).
- TS output intent is declaration-focused (`emitDeclarationOnly: true` in `tsconfig.base.json`), so library packaging should expect `.d.ts` generation.
- `customConditions` includes `@rod-manager/source`; keep this in mind when introducing conditional exports/resolution.

## Integration Points

- CI runs on GitHub Actions (`.github/workflows/ci.yml`) with Node 20 and npm cache.
- Nx Cloud is configured (`nxCloudId` in `nx.json`); distributed agents are prepared but currently commented in CI.
- Release flow is expected via `npx nx release --no-tui` (documented in `README.md`).

## Authentication & OAuth

### Architecture Overview

- **Backend (Fastify)**: OAuth plugin (`apps/api/src/app/plugins/oauth.ts`) handles provider communication via OAuth 2.0 with PKCE.
- **Database**: SQLite `oauth_providers` table stores provider credentials per user; supports Google, Apple, and Facebook.
- **Frontend (React)**: OAuth flow initiated on login page with state/code verifier stored in session storage; callback handler manages token exchange.
- **Session Management**: After OAuth callback, standard session cookie is created (no OAuth tokens returned to frontend).

### OAuth Environment Variables

Provider credentials must be configured via environment variables:

- `OAUTH_GOOGLE_CLIENT_ID` / `OAUTH_GOOGLE_CLIENT_SECRET` — Google OAuth 2.0 app credentials.
- `OAUTH_APPLE_CLIENT_ID` / `OAUTH_APPLE_CLIENT_SECRET` / `OAUTH_APPLE_TEAM_ID` — Apple Sign In credentials.
- `OAUTH_FACEBOOK_CLIENT_ID` / `OAUTH_FACEBOOK_CLIENT_SECRET` — Facebook app credentials.
- `OAUTH_REDIRECT_BASE_URL` — Base URL for OAuth callbacks (default: `http://localhost:3000`); must match provider redirect URI config.

### Adding a New OAuth Provider

1. **Extend `OAuthProviderType`** in `libs/shared/src/lib/auth.dto.ts` to include new provider string literal.
2. **Update OAuth plugin** (`apps/api/src/app/plugins/oauth.ts`):
   - Add provider config block in `oauthPlugin` function.
   - Implement user info parsing in `getUserInfo()` method (handle provider-specific response format).
   - Implement token refresh in `refreshAccessToken()` if provider supports refresh tokens.
3. **Update OAuth routes** (`apps/api/src/app/routes/oauth.ts`) if new authorization/callback flow differs from standard OAuth 2.0.
4. **Update login page** (`apps/web/src/app/auth/loginPage.tsx`) to add provider button and call `initiateOAuth()`.

### Code Structure

- **Backend Routes**: `POST /api/auth/oauth/authorize/:provider` (initiate), `GET /api/auth/oauth/callback/:provider` (callback), `DELETE /api/auth/oauth/link/:provider` (unlink).
- **Frontend Pages**: `LoginPage` (OAuth button trigger), `OAuthCallbackPage` (callback handler).
- **Shared Types**: `OAuthProviderType`, `OAuthInitiateRequestBody`, `OAuthUserInfo` in `libs/shared/src/lib/auth.dto.ts`.

### Security Considerations

- PKCE (Proof Key for Code Exchange) used for all OAuth flows; code verifier generated per authorization and validated at callback.
- OAuth state stored in browser `sessionStorage` with 10-minute expiration; validated on callback.
- Access tokens NOT returned to frontend; stored server-side in database, refreshed as needed.
- Email auto-verified on OAuth login (implicit account linking if email matches); explicit confirmation recommended for production.

## When Adding a New Project

- Prefer Nx generators (example from `README.md`):
  - `npx nx g @nx/js:lib libs/<name> --publishable --importPath=@my-org/<name> --no-tui`
  - `npx nx g @nx/react:app apps/<name> --bundler=vite --no-tui`
- After generation, validate inferred targets with `npx nx show project <project-name> --no-tui` and run `build` + `typecheck`.
- Keep new package configs aligned with root TS/Nx conventions instead of overriding defaults unless necessary.

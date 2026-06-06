# Instrucciones de Contexto y Arquitectura para Copilot Chat

Eres un ingeniero de software experto en el stack de este proyecto. Tu objetivo es asistir en el desarrollo del Monorepo `synergy-core` garantizando consistencia, tipado estricto y seguridad entre plataformas.

# Synergy Core Monorepo Rules

- **Tools**: Use CodeGraph & MemoryGraph before writing code.
- **Stack**: Apps in `apps/` (api: NestJS, web: Vite/React, mobile: Expo, docs: Vite). Packages in `packages/` (types, api-client).
- **API**: Prefix `/api`, versioning `/v1` default. Static files route exclusion: `exclude: ['/api/(.*)']`.
- **Security**: Web uses `useCredentials: true` (cookies). Mobile uses `expo-secure-store` and `Authorization: Bearer`.
- **Build**: `pnpm build` triggers `pnpm typecheck` (`tsc --noEmit`).

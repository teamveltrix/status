# Agent Instructions for Status Page Codebase

## Build & Development Commands

This project uses Bun as the package manager.

- `bun dev` - Start development server with Turbopack
- `bun build` - Build for production
- `bun lint` - Run Next.js linter
- `bun db:generate` - Generate Drizzle migrations
- `bun db:push` - Push schema changes to database
- `bun db:seed` - Seed database with initial data

## Code Style Guidelines
- **Framework**: Next.js 15 with App Router, React 19, TypeScript (strict mode)
- **Styling**: Tailwind CSS v4, use utility classes directly
- **Database**: Drizzle ORM with PostgreSQL (Neon), schema in `src/db/schema.ts`
- **API**: tRPC for type-safe APIs, routers in `src/lib/trpc/routers/`
- **Components**: Use shadcn/ui components from `@/components/ui/`
- **Imports**: Use `@/` alias for src directory imports
- **State**: React Query via tRPC hooks, avoid unnecessary client state
- **Forms**: react-hook-form with zod validation
- **Icons**: lucide-react for all icons
- **Error Handling**: Return proper tRPC errors, display user-friendly messages
- **File Naming**: kebab-case for files, PascalCase for components
- **Types**: Define in `src/types/`, use strict TypeScript, avoid `any`
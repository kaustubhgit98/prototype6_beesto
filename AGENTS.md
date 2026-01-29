## Project Summary
AI-powered code editor with real-time preview, terminal, and chat interface. Features Monaco Editor, WebContainer API for in-browser code execution, and multiple AI model integrations (SambaNova, Groq).

## Tech Stack
- **Framework**: Next.js 15 (App Router) with TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 + shadcn/ui + Framer Motion
- **State**: Zustand for global state management
- **Editor**: Monaco Editor (@monaco-editor/react)
- **Runtime**: WebContainer API for in-browser Node.js
- **Terminal**: XTerm.js (@xterm/xterm)
- **Data Fetching**: TanStack React Query
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)

## Architecture
```
src/
├── app/           # Next.js App Router (routes + API)
├── components/    # UI components
│   ├── layout/    # Main layout components
│   ├── editor/    # Monaco editor wrapper
│   ├── file-tree/ # File explorer
│   ├── preview/   # Live preview iframe
│   ├── chat/      # AI chat interface
│   ├── terminal/  # XTerm terminal
│   └── ui/        # shadcn/ui primitives
├── lib/
│   ├── stores/    # Zustand stores
│   ├── webcontainer/  # WebContainer logic
│   ├── ai/        # AI provider integrations
│   └── utils/     # Utility functions
├── hooks/         # Custom React hooks
├── types/         # TypeScript definitions
└── config/        # Environment & constants
```

## User Preferences
- BEESTO monochromatic design: pure black backgrounds, white/gray accents only
- NO purple/violet colors - use white, gray, and zinc shades instead
- Premium, minimal aesthetic with subtle white glows
- Geist Sans + Geist Mono fonts
- Dark theme exclusively

## Project Guidelines
- Use path aliases (@/components, @/lib, etc.)
- Strict TypeScript - no `any` types
- Components are client-side by default ("use client")
- Follow existing code patterns in the codebase

## Common Patterns
- Zustand stores in `src/lib/stores/`
- Type definitions in `src/types/index.ts`
- Constants in `src/config/constants.ts`

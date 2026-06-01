# Nexus - Collaborative Workspace

A modern, Notion-like collaborative workspace application built with Next.js 14+, Supabase, and TipTap.

## Tech Stack

- **Framework**: Next.js 14+ (App Router, Server Actions, React Server Components)
- **Styling**: Tailwind CSS, Shadcn UI
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Text Editor**: TipTap with slash commands
- **Real-time Collaboration**: Yjs CRDTs
- **Database & Auth**: Supabase (PostgreSQL, Supabase Auth, RLS)
- **File Storage**: Supabase Storage

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase project created

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.local.example .env.local
```

3. Configure your Supabase credentials in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Run the database migration in your Supabase dashboard:
   - Go to your Supabase project
   - Navigate to SQL Editor
   - Run the SQL from `supabase/migrations/001_initial_schema.sql`

5. Start the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Features

- ✅ Authentication with Supabase Auth (email/password, OAuth)
- ✅ Multi-tenant workspace management
- ✅ Infinite nested document structure
- ✅ Recursive sidebar navigation
- ✅ Rich-text editor with slash commands
- ✅ Real-time collaboration with Yjs CRDTs
- ✅ File storage for images
- ✅ Row Level Security (RLS) for data protection

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # Reusable UI components
├── lib/             # Utility functions and configurations
├── types/           # TypeScript type definitions
└── store/           # Zustand state management
```

## Database Schema

The application uses PostgreSQL with the following main tables:

- **profiles**: User profiles linked to Supabase auth
- **workspaces**: Workspace containers
- **workspace_members**: Workspace membership with roles
- **documents**: Nested documents with infinite hierarchy

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

MIT

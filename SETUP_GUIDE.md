# Setup Guide for Collaborative Workspace Application

## Prerequisites

- Node.js 18+ installed
- A Supabase account and project created

## Installation Steps

### 1. Install Dependencies

Due to Windows bash path issues, run the following command in your terminal (PowerShell or Command Prompt):

```bash
npm install
```

This will install all required dependencies including:
- Next.js 14+
- React 18+
- Supabase client libraries
- TipTap editor
- Yjs for real-time collaboration
- Shadcn UI components
- Tailwind CSS
- Framer Motion

### 2. Configure Environment Variables

1. Copy the example environment file:
```bash
copy .env.local.example .env.local
```

2. Get your Supabase credentials:
   - Go to your Supabase project dashboard
   - Navigate to Settings > API
   - Copy your Project URL and Anon Key

3. Update `.env.local` with your credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Set Up Database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL migration from `supabase/migrations/001_initial_schema.sql`

This will create:
- `profiles` table (linked to auth.users)
- `workspaces` table
- `workspace_members` table
- `documents` table (with infinite nesting support)
- Row Level Security (RLS) policies
- Indexes for performance
- Triggers for automatic profile creation and timestamp updates

### 4. Configure Supabase Auth

1. In your Supabase dashboard, go to Authentication > Settings
2. Enable email/password authentication
3. Optionally enable OAuth providers (GitHub, Google)
4. Configure your site URL for redirects

### 5. Set Up Storage (for images)

1. In your Supabase dashboard, go to Storage
2. Create a new bucket named `documents`
3. Make it public or configure appropriate RLS policies
4. Update the bucket settings to allow image uploads

### 6. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── auth/                    # Authentication pages
│   │   ├── login/               # Login page
│   │   ├── register/            # Registration page
│   │   └── actions/             # Auth server actions
│   ├── dashboard/               # Dashboard and workspace pages
│   │   ├── [workspaceId]/       # Dynamic workspace routes
│   │   │   ├── doc/             # Document editor
│   │   │   └── actions/         # Workspace server actions
│   │   └── page.tsx             # Main dashboard
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Landing page
├── components/                  # React components
│   ├── ui/                      # Shadcn UI components
│   ├── editor/                  # TipTap editor components
│   └── workspace/               # Workspace-specific components
├── lib/                        # Utility functions
│   ├── supabase/               # Supabase client configurations
│   └── utils.ts                # Helper functions
└── types/                      # TypeScript type definitions
    └── supabase.ts             # Supabase database types
```

## Features Implemented

✅ Authentication with Supabase Auth
✅ Multi-tenant workspace management
✅ Infinite nested document structure
✅ Recursive sidebar navigation
✅ Rich-text editor with TipTap
✅ Slash command menu for editor
✅ Document creation and management
✅ Row Level Security (RLS) for data protection

## Features To Be Added

⏳ Real-time collaboration with Yjs CRDTs
⏳ Presence indicators (showing active users)
⏳ File storage for inline images
⏳ Loading states and skeleton loaders
⏳ Error handling and toasts
⏳ Drag-and-drop document reordering
⏳ Document search functionality

## Troubleshooting

### Lint Errors

If you see lint errors about missing modules, run:
```bash
npm install
```

### Database Connection Issues

- Verify your `.env.local` file has correct Supabase credentials
- Check that your Supabase project is active
- Ensure the database migration has been run

### Authentication Issues

- Verify Supabase Auth is enabled in your project
- Check that email/password authentication is configured
- Ensure your site URL is correctly set in Supabase Auth settings

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features

1. Create server actions in appropriate `actions/` directories
2. Create React components in `components/`
3. Add new routes in `app/`
4. Update database schema if needed (create new migration)
5. Update TypeScript types in `types/supabase.ts`

## Security Notes

- All database operations are protected by RLS policies
- User authentication is handled by Supabase Auth
- Sensitive data is never exposed to the client
- API keys are stored in environment variables

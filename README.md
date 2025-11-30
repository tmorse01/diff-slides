# DiffSlides

A SaaS tool that lets developers create slideshow-style tutorials from code changes. The UI shows code with highlighted diffs (added/removed/modified lines) and lets users step through "slides" that represent each change.

## Features

- **Code Diff Visualization**: Automatically highlight code changes between steps
- **Step-by-Step Tutorials**: Create sequential slides showing code evolution
- **Shareable Links**: Share your tutorials with public/unlisted links
- **Code Editor**: Built-in code editor with syntax highlighting
- **Multiple Languages**: Support for TypeScript, JavaScript, Python, HTML, CSS, JSON

## Tech Stack

- **Framework**: Next.js 16.0.5 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Code Editor**: CodeMirror
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd diff-slides
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

4. Set up Supabase:

   - Create a new Supabase project
   - Run the migration file in `supabase/migrations/001_initial_schema.sql` in your Supabase SQL editor
   - This will create the necessary tables and RLS policies

5. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/app
  /(auth)          # Auth layout group
    /login
    /register
  /(dashboard)     # Protected layout group
    /dashboard
    /projects
      /new
      /[projectSlug]
        /edit
  /view/[projectSlug]  # Public viewer
  /api              # API routes
/components
  /editor          # Editor-specific components
  /viewer          # Viewer-specific components
  /landing         # Landing page components
/lib
  /supabase        # Supabase clients
  /validations     # Zod schemas
  /diff.ts         # Diff utilities
  /slug.ts         # Slug utilities
/types
  /database.ts     # Database types
/supabase
  /migrations      # SQL migration files
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

### Vercel Deployment Checklist

- [ ] Supabase project created
- [ ] Database migrations run
- [ ] RLS policies verified
- [ ] Vercel project connected to GitHub
- [ ] Environment variables configured in Vercel:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Build succeeds
- [ ] Auth flow tested
- [ ] Public project sharing tested

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## Database Schema

The application uses three main tables:

- **profiles**: User profile information
- **projects**: User projects with visibility settings
- **steps**: Individual steps/slides within projects

See `supabase/migrations/001_initial_schema.sql` for the complete schema.

## License

ISC

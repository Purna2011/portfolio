# Data Analyst Portfolio CMS

A full-stack portfolio + private admin dashboard built with **TanStack Start**, **React 19**, **Tailwind CSS v4**, and **Supabase** .

## What is included

- `src/` — public site routes, shared components, and the `/admin` CMS.
- `supabase/migrations/` — database schema, RLS policies, and role-based access rules.
- `public/` — static assets.
- `.env.example` — required environment variables.

## Required environment variables

Copy `.env.example` to `.env` and fill in your Supabase project values:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://ydmtlbgahgcfxaomsqaj.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_sx-4xa0u7YS2KhlGonocEg_fW1cq4eK
VITE_SUPABASE_PROJECT_ID=ydmtlbgahgcfxaomsqaj
SUPABASE_URL=https://ydmtlbgahgcfxaomsqaj.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_sx-4xa0u7YS2KhlGonocEg_fW1cq4eK
SUPABASE_PROJECT_ID=ydmtlbgahgcfxaomsqaj
```

Where to get them:

- In the Lovable editor: **Project Settings → Backend** → copy the **Project URL** and **Publishable Key**.
- The **Project ID** is the short ref in the URL (`ydmtlbgahgcfxaomsqaj`).

> **Security note:** do not commit `.env` to GitHub. It is already listed in `.gitignore`.

## Local development

1. Install dependencies:

   ```bash
   bun install
   ```

   If you do not have Bun, `npm install` works too.

2. Copy and fill in the environment variables (see above).
3. Start the dev server:

   ```bash
   bun dev
   ```

4. Open `http://localhost:8080`.
5. Go to `http://localhost:8080/admin` and sign up with the **first account** to claim the owner/admin role.

## Database migrations

The backend is managed by **Lovable Cloud**. The migration files in `supabase/migrations/` are included for backup and portability.

### If you keep using the same Lovable Cloud backend

Migrations are already applied — nothing to do.

### If you move to your own Supabase project

1. Install the Supabase CLI:

   ```bash
   npm install -g supabase
   ```

2. Login and link your project:

   ```bash
   supabase login
   supabase link --project-ref <your-project-ref>
   ```

3. Push the migrations:

   ```bash
   supabase db push
   ```

## Hosting on GitHub

### Option 1: Upload files directly (simplest)

1. Create a new empty repository on GitHub.
2. Click **Upload files**.
3. Drag the entire extracted project folder into the browser.
4. Add a commit message like `Initial commit` and click **Commit changes**.
5. (Optional) If you use GitHub Actions for deployment, go to **Settings → Secrets and variables → Actions** and add the environment variables from `.env.example`.

### Option 2: Push with Git

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## Deploying to production

This is a full-stack TanStack Start app. You can deploy the frontend to any host that supports Vite/Node, while keeping Lovable Cloud as the backend.

### Vercel

1. Import your GitHub repo in Vercel.
2. Framework preset: **Other**.
3. Build command: `bun install && bun run build`
4. Output directory: leave default, or set to `.output` if prompted.
5. Add the environment variables from `.env.example` in **Project Settings → Environment Variables**.

### Netlify

1. Add a new site from GitHub.
2. Build command: `bun install && bun run build`
3. Publish directory: `dist` or `.output/public` (check after the first build).
4. Add the environment variables in **Site settings → Environment variables**.

### Lovable (recommended)

For two-way sync and one-click publishing, connect this repo to Lovable via **+ menu → GitHub → Connect project** inside the Lovable editor instead of manual upload.

## Important notes

- The **first user** who signs up at `/admin` becomes the owner/admin. Subsequent signups are regular users and cannot access the admin dashboard.
- Phone numbers in the profile are hidden from public visitors by Row Level Security (RLS).
- Admin write operations require an authenticated session. Server functions use the authenticated Supabase client, so RLS policies protect your data.

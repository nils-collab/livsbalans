# Livsbalans

En webbapp för att bedöma och förbättra din livsbalans genom att analysera sex viktiga livsdimensioner.

## Om appen

Livsbalans hjälper dig att:
- **Bedöma din livssituation** utifrån sex dimensioner: Fysisk hälsa, Mental hälsa, Familj, Vänner, Boende och Jobb
- **Identifiera orsaker** till varför vissa områden har ett visst värde
- **Skapa målbilder** och handlingsplaner för förbättring
- **Följa upp** din utveckling över tid

## Funktioner

### Nulägesbedömning
- Interaktivt radardiagram (spindeldiagram) för visuell överblick
- Dra i prickarna för att justera poäng direkt i diagrammet
- Färgkodning baserat på poäng (grön = hög, röd = låg)

### Orsaksanalys
- Frågeställningar per dimension för reflektion
- Textruta för att dokumentera bakomliggande orsaker
- Auto-save med visuell statusindikator

### Mål & Plan
- Skriv målbilder för varje dimension
- Skapa handlingsplaner med prioritet (1-3) och datum
- Håll koll på vad som ska göras

### Övriga funktioner
- **PDF-export** - Ladda ner en rapport med alla dina bedömningar
- **Delningslänk** - Dela appen med andra
- **Admin-panel** - Redigera frågeställningar (för administratörer)
- **Konto-radering** - Radera all din data permanent

## Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript
- **Styling:** Tailwind CSS, Radix UI
- **Backend:** Supabase (PostgreSQL, Auth, RLS)
- **Deployment:** Vercel

## Kom igång

### Förutsättningar
- Node.js 18+
- npm eller yarn
- Supabase-projekt

### Installation

1. Klona repot:
```bash
git clone https://github.com/nils-collab/livsbalans.git
cd livsbalans
```

2. Installera dependencies:
```bash
npm install
```

3. Skapa `.env.local` med dina Supabase-credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=din_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=din_supabase_anon_key
```

4. Kör databasen (migrations körs automatiskt via Supabase Dashboard)

5. Starta utvecklingsservern:
```bash
npm run dev
```

6. Öppna [http://localhost:3000](http://localhost:3000)

## Databasschema

Appen använder följande tabeller:
- `user_profiles` - Användarprofiler med admin-roll
- `dimension_scores` - Poäng per dimension (1-10)
- `dimension_causes` - Orsaksanalyser
- `dimension_goals` - Målbilder
- `dimension_tasks` - Handlingsplaner
- `dimension_questions` - Frågeställningar (admin-redigerbara)

Alla tabeller har Row Level Security (RLS) för att säkerställa att användare bara ser sin egen data.

## Autentisering

Stödjer:
- E-post/lösenord
- Google Sign-In
- Microsoft Sign-In

## Deployment

Appen är konfigurerad för deployment på Vercel:

1. Koppla GitHub-repot till Vercel
2. Lägg till environment variables i Vercel Dashboard
3. Deploy sker automatiskt vid push till main

## Licens

MIT

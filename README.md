# Product Margin Tracker

A multi-country product margin tracking system with media spend attribution, sales tracking, and consolidated EUR reporting.

## Features

- **Multi-Country Support**: Track data across multiple countries with local currencies
- **Product Management**: Global products with COGS set centrally in EUR
- **Product Groups**: Organize products into overlapping groups
- **Creatives**: Save presets of products for media spend attribution
- **Media Spend Tracking**: Track by channel, sub-channel, and month
- **Sales Tracking**: Monthly sales by product and sales channel
- **EUR Consolidation**: All metrics converted to EUR using monthly exchange rates
- **Dashboard**: KPI snapshots and time series charts

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **Charts**: Recharts
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Authentication**: Google SSO via Supabase Auth

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

3. Enable Google OAuth in Supabase Dashboard:
   - Go to Authentication > Providers > Google
   - Add your Google OAuth credentials
   - Set the redirect URL to `http://localhost:3000/auth/callback`

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── (authenticated)/     # Protected routes
│   │   ├── dashboard/       # KPIs and trends
│   │   ├── data/            # Data entry pages
│   │   │   ├── products/    # Product management
│   │   │   ├── creatives/   # Creative presets
│   │   │   ├── media-spend/ # Media spend entry
│   │   │   └── sales/       # Sales entry
│   │   └── settings/        # Configuration
│   │       ├── countries/   # Country/currency setup
│   │       ├── rates/       # Exchange rates
│   │       └── channels/    # Media/sales channels
│   └── auth/                # Authentication
├── components/
│   ├── layout/              # Layout components
│   └── ui/                  # shadcn/ui components
├── lib/
│   ├── calculations.ts      # Margin calculations
│   ├── supabase/            # Supabase clients
│   └── utils.ts             # Utility functions
├── hooks/                   # React hooks
└── types/                   # TypeScript types
```

## Data Model

### Core Entities

- **Countries**: Country + currency pairs (SE/SEK, DE/EUR)
- **Exchange Rates**: Monthly EUR conversion rates
- **Products**: Global products with COGS in EUR
- **Product Groups**: Categories (products can belong to multiple)
- **Creatives**: Saved presets of advertised products

### Transactions

- **Media Spend**: Monthly spend by channel with product attribution
- **Sales**: Monthly sales by product and sales channel

### Profit Calculation

```
Revenue (EUR) = Revenue (local) / Exchange Rate
COGS Total = Units × COGS (EUR)
Gross Profit = Revenue (EUR) - COGS Total
Net Profit = Gross Profit - Media Spend (EUR)
Margin % = Net Profit / Revenue (EUR) × 100
```

## Usage

1. **Setup**: Add countries, channels, and exchange rates in Settings
2. **Products**: Create products with COGS, organize into groups
3. **Creatives**: Save presets of products for campaigns
4. **Data Entry**: Enter monthly media spend and sales
5. **Dashboard**: View consolidated metrics and trends

## License

Private





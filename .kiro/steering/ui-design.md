# UI Design Standards — FreshCast

## Core Philosophy
Every screen must look like it was designed by a senior product designer at a funded startup. No AI slop. No default Tailwind blue. No Lorem Ipsum. No placeholder UI that "we'll fix later."

Judges form impressions in 10 seconds. The UI is part of the pitch.

## Color System
- Background: `#0F1117` (near-black, not pure black)
- Card surface: `#1A1D27`
- Border: `#2D3748`
- Text primary: `#E2E8F0`
- Text secondary: `#94A3B8`
- Text muted: `#64748B`
- Accent green (good/savings): `#10B981`
- Accent red (waste/bad): `#EF4444`
- Accent blue (neutral data): `#60A5FA`
- Never use default Tailwind blue (`#3B82F6`) as a primary action color

## Typography
- Font: Inter (import from Google Fonts)
- Hero numbers (waste amounts, savings): `text-5xl font-bold tracking-tighter`
- Card labels: `text-xs uppercase tracking-widest text-muted`
- Body: `text-sm text-secondary`
- No walls of text anywhere in the UI

## Component Rules
- Cards: `rounded-xl border border-[#2D3748] bg-[#1A1D27] p-6`
- Buttons: rectangular, not pill-shaped. Primary = emerald green bg. Secondary = transparent with green border.
- No shadows. Depth comes from border contrast only.
- No gradients on backgrounds. Gradients only acceptable on data visualizations.
- Icons: Lucide React exclusively. Never mix icon libraries.
- Loading states: skeleton loaders, never spinners

## Charts & Data Viz
- Use Recharts for all charts
- Animate on mount: `animationDuration={800}`
- Colors: red for waste, green for savings, blue for neutral metrics
- Always show real numbers, never percentages alone
- Every chart needs a plain-English headline above it

## Animations
- Use Framer Motion for page transitions and significant state changes
- The red→green transition when applying waste recommendations is the signature animation — make it smooth, 800ms ease
- Numbers counting up on load: use a counter animation
- Never animate things that don't need attention drawn to them

## Layout
- Sidebar navigation (desktop): 240px wide, dark surface
- Main content: padded 24px, max-width 1200px centered
- Dashboard grid: 3 columns for stat cards, 2 columns for larger cards
- Mobile: stack everything single column
- Always use `gap-4` or `gap-6` between cards, never tighter

## What "Not AI Slop" Means
- Every data point shown must be a real number from real logic, not placeholder text
- No generic descriptions like "Your sustainability metrics are improving"
- No stock photography or generic icons that could be from any app
- Restaurant name, address, and data must feel specific and real (use Marco's Trattoria as demo data)
- Dark mode only — no light mode toggle needed for the hackathon

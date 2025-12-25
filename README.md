# Imposter Game

Light‑pink, mobile‑friendly imposter game setup + reveal flow for Nepali word lists.

## Pages

- `/` — Landing page with quick start links.
- `/setup` — Player + category + word setup (saved to localStorage).
- `/round` — Pass‑the‑phone reveal flow for roles and the secret word.

## Getting Started

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Notes

- Setup data persists in `localStorage`, so it survives refreshes.
- A round requires at least 3 active players and a selected category with words.

## Scripts

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run start` — run production build
- `npm run lint` — lint

## Deploy

This app is ready for Vercel deployment.

## Tech

- Next.js App Router
- Tailwind CSS
- React Icons

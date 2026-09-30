# SANDHI app

The Android and iOS app for [SANDHI Research Lab](https://sandhiresearch.org).
It is a client of the website, not a second system: the same accounts, the
same data, the same permissions, read through the site's `/api/v1`
([API reference](https://github.com/asifuddin01/Sandhi/blob/main/docs/mobile/API.md),
[app notes](https://github.com/asifuddin01/Sandhi/blob/main/docs/mobile/APP.md)).

Built with Expo (SDK 57) and Expo Router.

## What it does today

The public lab: home, research themes and areas, projects, papers (with
search), people, news, events, research notes, and site-wide search. Joining,
event registration, and anything account-related open the website.

## Run it on your phone

```bash
npm install
npx expo start
```

Install **Expo Go** from the App Store or Play Store and scan the QR code. The
phone and this computer must be on the same Wi-Fi (or run
`npx expo start --tunnel`).

The app reads from the live site. To point it elsewhere:

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.10:3000 npx expo start
```

## Checks

```bash
npx tsc --noEmit
npx expo lint
node --test src/lib/logic.test.ts
```

## Layout

- `src/app/` — screens (Expo Router: every file is a route). `(tabs)/` holds
  the five tabs; the rest push on top of them.
- `src/lib/api.ts` — the one place requests are made: the base URL, the
  `X-Sandhi-Client` header the site uses for update checks, and the envelope.
- `src/components/ui.tsx` — text styles, rows, and the loading and error
  states every screen shares.
- `src/constants/theme.ts` — the website's palettes and fonts.

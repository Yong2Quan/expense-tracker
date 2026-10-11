<p align="center">
  <img src="assets/mascot.svg" alt="Pob, the expense tracker mascot" width="160" height="160">
</p>

<h1 align="center">Expense Tracker</h1>

<p align="center">
  A personal spending tracker: a <b>Flask + SQLAlchemy</b> REST API and an
  <b>Expo / React Native</b> mobile client that talks to it.
</p>

```
mobile/   React Native app (Expo)  ──HTTP──>  backend/  Flask API  ──>  spending.db
```

## Requirements

- Python 3.14 (`py --version`)
- Node.js 20+ and npm (`node --version`)
- The [Expo Go](https://expo.dev/go) app, if testing on a physical phone

## Backend

```powershell
cd backend
py -m venv .venv                      # first time only
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt       # first time only
python main.py                        # serves on port 8000
```

With the server running, seed the six default categories **once**:

```powershell
python seed.py
```

Check it's alive: <http://localhost:8000/health> should return `{"status": "ok"}`.

### API

| Method | Route | Notes |
|---|---|---|
| `GET` | `/health` | Liveness check |
| `GET` | `/categories/` | All categories, sorted by name |
| `POST` | `/categories/` | `{"name": "Food", "colour": "#F59E0B"}` |
| `DELETE` | `/categories/<id>` | **Also deletes that category's expenses** |
| `GET` | `/expenses/` | All expenses, newest first |
| `POST` | `/expenses/` | `{"amount": 12.5, "date": "2026-10-11", "note": "Lunch", "category_id": 1}` |
| `DELETE` | `/expenses/<id>` | |

Dates are `YYYY-MM-DD`. Errors come back as JSON: `{"error": "..."}`.

## Mobile

```powershell
cd mobile
npm install                           # first time only
npm start
```

Scan the QR code with Expo Go, or press `a` / `i` for an emulator.

> `index.js` must stay the `main` entry, and its `react-native-url-polyfill/auto`
> import must stay first. React Native's built-in `URL` exposes `protocol` as a
> getter with no setter, but `expo-asset` assigns to it at module load — without
> the polyfill loading first, the app dies on startup with
> `TypeError: Cannot assign to property 'protocol' which has only a getter`.

The app finds the backend automatically — it reuses the host Expo already
served the app from, so there is **no IP address to edit**. For this to work:

1. Your phone and PC must be on the **same Wi-Fi network**.
2. The backend must be running (`python main.py` binds `0.0.0.0`, not just localhost).
3. Windows Firewall must allow inbound TCP on port 8000. If the app shows
   "Cannot reach the backend", run this once in an **elevated** PowerShell:

   ```powershell
   New-NetFirewallRule -DisplayName "Expense Tracker API" -Direction Inbound `
     -Protocol TCP -LocalPort 8000 -Action Allow -Profile Private
   ```

## Tests

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt   # first time only
python -m pytest tests -v
```

The suite spins up the app against a throwaway database in your temp folder,
so it never touches your real `spending.db`, and it needs no running server.

## Project layout

```
backend/
  main.py              app factory, JSON error handler, /health
  database.py          engine + session (DATABASE_URL overridable for tests)
  models.py            Category, Expense
  routers/             categories.py, expenses.py
  seed.py              inserts the six default categories
  tests/               pytest suite
assets/
  mascot.svg           Penny — source art for the README and the app icons
mobile/
  assets/              icon.png, adaptive-icon.png, favicon.png (generated from mascot.svg)
  index.js             entry point — installs the URL polyfill, then mounts App
  App.tsx              bottom-tab navigation + theme wiring
  src/theme.ts         colours, spacing, radii — the validated category palette
  src/categoryIcons.ts picks an icon from a category name, by keyword
  src/api/             client.ts (host autodetect), categories, expenses, summary
  src/hooks/           useExpenses — fetch + refetch on focus
  src/components/      CategoryAvatar, Loading / ErrorNotice / EmptyState
  src/screens/         Home, Add, History, Summary, Settings
  src/utils/format.ts  money and date formatting
  src/types/           shared TypeScript interfaces
```

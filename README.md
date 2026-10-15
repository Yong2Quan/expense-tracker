<p align="center">
  <img src="assets/mascot.svg" alt="Pob, the expense tracker mascot" width="150" height="150">
</p>

<h1 align="center">Expense Tracker</h1>

<p align="center">
  <b>Know where your money goes.</b><br>
  A personal spending tracker — a Flask REST API with an Expo / React&nbsp;Native app on top.
</p>

<p align="center">
  <a href="https://www.python.org/"><img src="https://img.shields.io/badge/Python-3.14-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python 3.14"></a>
  <a href="https://flask.palletsprojects.com/"><img src="https://img.shields.io/badge/Flask-3.1-000000?style=for-the-badge&logo=flask&logoColor=white" alt="Flask 3.1"></a>
  <a href="https://docs.sqlalchemy.org/"><img src="https://img.shields.io/badge/SQLAlchemy-2.0-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white" alt="SQLAlchemy 2.0"></a>
  <br>
  <a href="https://docs.expo.dev/"><img src="https://img.shields.io/badge/Expo-SDK%2057-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo SDK 57"></a>
  <a href="https://reactnative.dev/"><img src="https://img.shields.io/badge/React%20Native-0.86-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Native 0.86"></a>
  <a href="https://www.typescriptlang.org/docs/"><img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 6.0"></a>
</p>

<p align="center">
  <a href="https://yong2quan.github.io/expense-tracker/"><img src="https://img.shields.io/badge/Live_page-5B4BE1?style=flat-square&logo=githubpages&logoColor=white" alt="Project page"></a>
  <a href="https://github.com/Yong2Quan/expense-tracker"><img src="https://img.shields.io/badge/Source-181717?style=flat-square&logo=github&logoColor=white" alt="Source on GitHub"></a>
  <a href="https://github.com/Yong2Quan/expense-tracker/actions/workflows/tests.yml"><img src="https://img.shields.io/github/actions/workflow/status/Yong2Quan/expense-tracker/tests.yml?branch=main&style=flat-square&logo=pytest&logoColor=white&label=tests" alt="Test suite status"></a>
</p>

<p align="center">
  <img src="assets/preview.png" alt="Three screens of the running app: the dashboard, the monthly breakdown with a donut chart, and the day-grouped history list." width="100%">
</p>

<p align="center">
  <sub><i>Real screenshots of the running app, talking to the Flask API over a seeded sample month.</i></sub>
</p>

## ✨ What it does

| | |
|---|---|
| 📊 **Dashboard** | This month's total as a hero figure, plus average spend per active day and your biggest category |
| 🍩 **Monthly breakdown** | A donut for share-at-a-glance, backed by ranked bars for the precise comparison |
| 🗓 **Day-grouped history** | Expenses bucketed by day with a running total on every day header |
| 🏷 **Custom categories** | Pick a colour, and the icon is chosen automatically from the name |
| 🌈 **A background that reacts** | The dashboard's gradient is derived from your top-spending category, then darkened until white text provably clears WCAG contrast |
| 🎨 **Accessible by design** | The category palette is validated so no two colours are hard to tell apart, including for colourblind users |
| 📱 **Zero config on device** | The app finds your backend by itself — no IP address to type in |

## 🚀 Quick start

You'll need **Python 3.14**, **Node 20+**, and the [Expo Go](https://expo.dev/go) app on your phone.

**1 — Start the API**

```powershell
cd backend
py -m venv .venv                      # first time only
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt       # first time only
python main.py                        # serves on port 8000
```

**2 — Seed the default categories** — once, in a second terminal, while the API runs

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python seed.py
```

**3 — Start the app**

```powershell
cd mobile
npm install                           # first time only
npm start
```

Scan the QR code with Expo Go, or press `a` / `i` for an emulator. That's it — the app
reuses the host Expo served it from, so there's no IP address to edit.

> 💡 If the app says **"Cannot reach the backend"**, it's almost always Windows
> Firewall — the fix is one line, under **Troubleshooting** below.

## 🧪 Tests

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt   # first time only
python -m pytest tests -v
```

21 tests covering every endpoint. They run against a throwaway database in your temp
folder, so they never touch your real `spending.db`, and no server needs to be running.

The same suite runs on GitHub Actions for every push and pull request — see
[`.github/workflows/tests.yml`](.github/workflows/tests.yml) and the
[latest runs](https://github.com/Yong2Quan/expense-tracker/actions/workflows/tests.yml).
The badge at the top reports that workflow's real result.

## 🏗 How it fits together

```
mobile/   React Native app (Expo)  ──HTTP──>  backend/  Flask API  ──>  spending.db
```

The app talks to the API over your local network; the API owns the SQLite database.
Because the data lives on your PC rather than the phone, you can wipe and reinstall
the app without losing anything.

## 🔌 API reference

| Method | Route | Notes |
|---|---|---|
| `GET` | `/health` | Liveness check |
| `GET` | `/categories/` | All categories, sorted by name |
| `POST` | `/categories/` | `{"name": "Food", "colour": "#eb6834"}` |
| `DELETE` | `/categories/<id>` | **Also deletes that category's expenses** |
| `GET` | `/expenses/` | All expenses, newest first |
| `POST` | `/expenses/` | `{"amount": 12.5, "date": "2026-10-11", "category_id": 1}` |
| `DELETE` | `/expenses/<id>` | — |

Dates are `YYYY-MM-DD`. Errors come back as JSON: `{"error": "..."}`.

## 🛠 Troubleshooting

**"Cannot reach the backend"**

For the phone to talk to your PC, all three must be true:

1. Phone and PC on the **same Wi-Fi network**.
2. The backend running — `python main.py` binds `0.0.0.0`, not just localhost.
3. Windows Firewall allowing inbound TCP on port 8000. Run once in an **elevated** PowerShell:

```powershell
New-NetFirewallRule -DisplayName "Expense Tracker API" -Direction Inbound `
  -Protocol TCP -LocalPort 8000 -Action Allow -Profile Private
```

**`ModuleNotFoundError: No module named 'flask'`**

The virtual environment isn't active. Look for `(.venv)` at the start of your prompt.
Either activate it, or call its Python directly: `.\.venv\Scripts\python.exe main.py`.

**The app crashes on startup**

Clear the Metro cache with `npx expo start -c`.

`index.js` must stay the `main` entry, and its `react-native-url-polyfill/auto` import
must stay **first**. React Native's built-in `URL` exposes `protocol` as a getter with
no setter, but `expo-asset` assigns to it at module load — without the polyfill loading
first, the app dies with
`TypeError: Cannot assign to property 'protocol' which has only a getter`.

## 📁 Project layout

```
backend/
  main.py              app factory, JSON error handler, /health
  database.py          engine + session (DATABASE_URL overridable for tests)
  models.py            Category, Expense
  routers/             categories.py, expenses.py
  seed.py              inserts the six default categories
  tests/               pytest suite

assets/
  mascot.svg           Pob — source art for this page and the app icons
  preview.png          the screenshots above

mobile/
  assets/              icon.png, adaptive-icon.png, favicon.png
  index.js             entry point — installs the URL polyfill, then mounts App
  App.tsx              tab + stack navigation, theme wiring
  src/theme.ts         colours, spacing, radii — the validated category palette
  src/categoryIcons.ts picks an icon from a category name, by keyword
  src/api/             client.ts (host autodetect), categories, expenses, summary
  src/hooks/           useExpenses, useBottomSpace
  src/components/      CategoryAvatar, DonutChart, GradientHero, Loading / ErrorNotice
  src/screens/         Home, Add, History, Summary, Settings, MonthDetail
  src/utils/format.ts  money and date formatting
  src/utils/colour.ts  derives the hero gradient, darkened until white text is readable
  src/types/           shared TypeScript interfaces
```

---

<p align="center">
  <sub>Built as a learning project. Pob supervises.</sub>
</p>

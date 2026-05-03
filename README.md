# MASIV Calgary 3D Urban Design Dashboard

A full-stack web application that renders a 3D interactive map of Calgary's downtown buildings, supports natural language querying via an LLM, and includes a fabrication/toolpath animation mode.

---

## Live Demo

> **Frontend:** `https://incandescent-hotteok-c3018d.netlify.app`
> **Backend:**  `https://masiv-dashboard-production.up.railway.app`

---

## Features

| Feature | Description |
|---|---|
| 🏙 3D City View | Extruded building footprints from Calgary/OSM data, rendered with Three.js |
| 🖱 Click to Inspect | Click any building to see address, height, zoning, assessed value, and more |
| 🤖 LLM Querying | Type natural language queries — the AI interprets and highlights matching buildings |
| 💾 Project Persistence | Save and reload named filter analyses per user (SQLite + Flask) |
| ⚙ Fabrication Mode | Animated toolhead traces building footprints with a CatmullRom spline path |
| 🔍 Address Search | Search buildings by address or name with live dropdown results |
| 📊 Stats Panel | Live building type breakdown with animated bars, updates on filter |
| 📐 UML Diagrams | Class + sequence diagrams in `docs/uml_diagram.html` |

---

## Tech Stack

### Backend
- **Python 3.11+** with **Flask 3**
- **Groq API** (llama-3.1-8b-instant) for free LLM query interpretation
- **SQLite** for user/project persistence
- **OpenStreetMap Overpass API** for live building data (fallback: realistic seeded dataset)
- **City of Calgary Open Data** for property assessment enrichment

### Frontend
- **React 18** + **Vite**
- **Three.js** via **@react-three/fiber** and **@react-three/drei**
- **Zustand** for global state management
- **Tailwind CSS** for styling
- **Axios** for API calls

---

## Project Structure

```
masiv-dashboard/
├── backend/
│   ├── app.py                  # Flask app factory
│   ├── database.py             # SQLite helpers (users, projects)
│   ├── services/
│   │   └── buildings.py        # OSM fetch, Calgary API, seed data
│   ├── routes/
│   │   ├── buildings.py        # GET /api/buildings/
│   │   ├── projects.py         # CRUD /api/projects/
│   │   └── llm.py             # POST /api/llm/query
│   ├── requirements.txt
│   ├── Procfile               # Railway deployment
│   ├── railway.toml           # Railway config
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── store/useStore.js          # Zustand global state + applyFilter()
│   │   ├── components/
│   │   │   ├── Scene3D.jsx            # R3F canvas, lights, controls
│   │   │   ├── BuildingMesh.jsx       # Extruded 3D building
│   │   │   ├── FabricationToolpath.jsx # Animated print-head
│   │   │   ├── LLMPanel.jsx           # AI query input
│   │   │   ├── ProjectsPanel.jsx      # Save/load projects
│   │   │   ├── BuildingPopup.jsx      # Building detail panel
│   │   │   ├── AddressSearch.jsx      # Address/name search bar
│   │   │   ├── StatsPanel.jsx         # Live building type stats
│   │   │   ├── Header.jsx
│   │   │   └── Legend.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── netlify.toml               # Netlify deployment config
└── docs/
    └── uml_diagram.html       # Class + sequence UML diagrams
```

---

## Local Development Setup

### 1. Clone and configure

```bash
git clone https://github.com/mishelaalam/masiv-dashboard.git
cd masiv-dashboard
```

### 2. Backend setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env          # Windows
# cp .env.example .env          # Mac/Linux

# Edit .env and set your GROQ_API_KEY (see "Getting an API Key" below)

# Run the Flask server
python app.py
# API available at http://localhost:5000
```

### 3. Frontend setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
# App available at http://localhost:5173
```

The Vite dev server proxies `/api/*` to Flask on port 5000, so no CORS issues locally.

---

## Getting an API Key

### Groq API Key — Required for LLM queries (free, no credit card needed)

1. Visit [console.groq.com](https://console.groq.com)
2. Sign up / log in (completely free)
3. Go to **API Keys** → **Create API Key**
4. Copy the key and set it in `backend/.env`:

```
GROQ_API_KEY=gsk_...
```

Groq's free tier allows 14,400 requests/day

---

## Usage Guide

### 3D Navigation
- **Drag** — orbit the camera around the city
- **Scroll** — zoom in/out
- **Right-drag** — pan
- **Click a building** — opens the detail popup (address, height, zoning, assessed value)

### AI Query Examples
```
"show buildings over 100 metres"
"highlight commercial buildings"
"buildings in RC-G zoning"
"residential built before 1980"
"show buildings worth less than $500,000"
"office towers with more than 20 floors"
"reset"  <- clears all filters
```

### Address Search
- Type any street name or building name in the search bar
- Results appear in a dropdown instantly
- Click a result to select and highlight that building

### Saving Projects
1. Enter a username in the Sign In panel
2. Run an AI query — matched buildings highlight yellow
3. Enter a project name and click Save
4. Click any saved project to re-apply its filter

### Fabrication Mode
1. Optionally run an AI query to filter buildings first
2. Click Fabrication Mode in the header
3. A cyan toolhead animates along the footprints of matched buildings
4. The traced path glows cyan; ghost path shows upcoming trajectory
5. Click again to stop

---

## Data Sources

| Source | Description | API |
|---|---|---|
| OpenStreetMap | Building footprints, heights, addresses | Overpass API (free) |
| City of Calgary | Property assessments, zoning | data.calgary.ca (free) |
| Seed data | ~500 realistic Calgary downtown buildings | Built-in fallback |

The seed dataset covers the Beltline / Downtown Core / East Village area bounded by approximately 6 Ave SW – 12 Ave SW and Centre St – 4 St SW.

---

## Architecture Notes

- **LLM filtering is entirely client-side**: The LLM only receives the user's text query and returns a structured JSON filter schema. Building data is never sent to the LLM — keeping latency low and data private.
- **Building geometry**: Footprints are stored as local-metre XZ coordinates (flat-earth projection from the area centroid). Three.js ExtrudeGeometry extrudes them by height_m.
- **Fabrication toolpath**: A CatmullRomCurve3 is fitted through all footprint vertices of selected buildings. A sphere mesh is animated via useFrame() along curve.getPoint(t).
- **Stats panel**: Counts update reactively via useMemo whenever the active filter changes — no extra API calls needed.
- **Address search**: Pure client-side substring match against the loaded building dataset — instant results with no backend involvement.

---
## Architecture & Design Decisions

### Why client-side filtering?
The LLM never sees the building dataset. It only receives the user's text query and returns a small JSON filter object like `{"height_min": 100}`. The actual filtering runs in the browser via `applyFilter()` in `useStore.js`. This means filter results are instant (no network round trip), the building data stays private, and the LLM API costs stay near zero since we're only sending a short text query each time.

### Why Zustand over Redux?
Zustand is a lightweight state manager that doesn't require boilerplate. All shared state, buildings, active filter, selected building, user, projects, fabrication mode, lives in one `useStore.js` file. Any component can read or update state with one line. For a project this size Redux would be overkill.

### Why seed data instead of live API?
The app tries OpenStreetMap's Overpass API first on startup. If it's unavailable or slow, it falls back to ~500 pre-generated Calgary buildings with realistic coordinates, heights, zoning codes, and assessed values. This means the app always works, even without internet access or if OSM rate-limits the request.

### Why Flask over FastAPI or Django?
Flask is minimal and explicit, you can read the entire backend in under 300 lines. For a small project that needs to be reviewed and understood quickly, that matters more than performance. FastAPI would also work but adds complexity with async and type annotations that aren't needed here.

### Why separate backend and frontend?
Keeping Flask and React separate means they can be deployed independently (Railway for backend, Netlify for frontend) and scaled separately. It also mirrors how real production systems are structured, the frontend is just a client that talks to an API.

### Fabrication toolpath approach
Rather than a physically accurate toolpath, the fabrication mode fits a `CatmullRomCurve3` through all footprint vertices of selected buildings. A sphere mesh moves along `curve.getPoint(t)` inside `useFrame()`, which runs every animation frame. The curve smooths sharp corners between buildings so the animation looks fluid rather than jerky.

# MASIV Calgary 3D Urban Design Dashboard

A full-stack web application that renders a 3D interactive map of Calgary's downtown buildings, supports natural language querying via an LLM, and includes a fabrication/toolpath animation mode.

---

## Live Demo

> **Frontend:** `https://masiv-dashboard.vercel.app`  
> **Backend:**  `https://masiv-dashboard.railway.app`

*(Update these URLs after deployment)*

---

## Features

| Feature | Description |
|---|---|
| 🏙 3D City View | Extruded building footprints from Calgary/OSM data, rendered with Three.js |
| 🖱 Click to Inspect | Click any building to see address, height, zoning, assessed value, and more |
| 🤖 LLM Querying | Type natural language queries — the AI interprets and highlights matching buildings |
| 💾 Project Persistence | Save and reload named filter analyses per user (SQLite + Flask) |
| ⚙ Fabrication Mode | Animated toolhead traces building footprints with a CatmullRom spline path |
| 📊 UML Diagrams | Class + sequence diagrams in `docs/uml_diagram.html` |

---

## Tech Stack

### Backend
- **Python 3.11+** with **Flask 3**
- **Anthropic Claude** (claude-sonnet-4) for LLM query interpretation
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
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── store/useStore.js   # Zustand global state + applyFilter()
│   │   ├── components/
│   │   │   ├── Scene3D.jsx            # R3F canvas, lights, controls
│   │   │   ├── BuildingMesh.jsx       # Extruded 3D building
│   │   │   ├── FabricationToolpath.jsx # Animated print-head
│   │   │   ├── LLMPanel.jsx           # AI query input
│   │   │   ├── ProjectsPanel.jsx      # Save/load projects
│   │   │   ├── BuildingPopup.jsx      # Building detail panel
│   │   │   ├── Header.jsx
│   │   │   └── Legend.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json
└── docs/
    └── uml_diagram.html        # Class + sequence UML diagrams
```

---

## Local Development Setup

### 1. Clone and configure

```bash
git clone https://github.com/yourusername/masiv-dashboard.git
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
cp .env.example .env
# Edit .env and set your ANTHROPIC_API_KEY (see "Getting an API Key" below)

# Run the Flask server
python app.py
# → API available at http://localhost:5000
```

### 3. Frontend setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
# → App available at http://localhost:5173
```

The Vite dev server proxies `/api/*` to Flask on port 5000, so no CORS issues locally.

---

## Getting an API Key

### Anthropic (Claude) API Key — Required for LLM queries

1. Visit [console.anthropic.com](https://console.anthropic.com)
2. Sign up / log in
3. Go to **API Keys** → **Create Key**
4. Copy the key and set it in `backend/.env`:

```
ANTHROPIC_API_KEY=sk-ant-...
```

The free tier includes a small credit on signup. LLM queries in this app use ~100 tokens each (very cheap).

---

## Deployment

### Backend → Railway

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
3. Select the `backend/` directory (or set root directory in Railway settings)
4. Add environment variable: `ANTHROPIC_API_KEY=sk-ant-...`
5. Railway auto-detects the `Procfile` and deploys with gunicorn
6. Copy the generated URL (e.g. `https://masiv-dashboard.railway.app`)

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo
2. Set **Root Directory** to `frontend`
3. Add environment variable: `VITE_API_URL=https://masiv-dashboard.railway.app/api`
4. Edit `frontend/vercel.json` to point rewrites to your Railway URL
5. Deploy — Vercel auto-runs `npm run build`

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
"reset"  ← clears all filters
```

### Saving Projects
1. Enter a username in the **Sign In** panel
2. Run an AI query — matched buildings are highlighted in yellow
3. Enter a project name → click **Save**
4. Click any saved project to re-apply its filter

### Fabrication Mode
1. Optionally run an AI query to filter buildings first
2. Click **⚙ Fabrication Mode** in the header
3. A cyan toolhead animates along the footprints of matched buildings
4. The traced path glows cyan; ghost path shows upcoming trajectory
5. Click again to stop

---

## Data Sources

| Source | Description | API |
|---|---|---|
| OpenStreetMap | Building footprints, heights, addresses | Overpass API (free) |
| City of Calgary | Property assessments, zoning | data.calgary.ca (free) |
| Seed data | ~80 realistic Calgary downtown buildings | Built-in fallback |

The seed dataset covers the Beltline / Downtown Core / East Village area bounded by approximately 6 Ave – 12 Ave SW and Centre St – 4 St SW.

---

## Architecture Notes

- **LLM filtering is entirely client-side**: The LLM only receives the user's text query and returns a structured JSON filter schema. Building data is never sent to the LLM — keeping latency low and data private.
- **Building geometry**: Footprints are stored as local-metre XZ coordinates (flat-earth projection from the area centroid). Three.js `ExtrudeGeometry` extrudes them by `height_m`.
- **Fabrication toolpath**: A `CatmullRomCurve3` is fitted through all footprint vertices of selected buildings. A sphere mesh is animated via `useFrame()` along `curve.getPoint(t)`.

---

## License

MIT

# Annotately

> A modern, precision annotation tool for PDFs and images. Built with React 18, TypeScript, Zustand, and Tailwind CSS.

[![Deploy to GitHub Pages](https://github.com/luke-pekala/Annotately/actions/workflows/deploy.yml/badge.svg)](https://github.com/luke-pekala/Annotately/actions/workflows/deploy.yml)

**Live demo:** https://luke-pekala.github.io/Annotately/

---

## Features

- **PDF annotation** — powered by `react-pdf` / `pdfjs-dist`; multi-page navigation with page selector
- **Image annotation** — PNG, JPG, WebP, GIF, SVG support
- **Annotation tools:**
  - Highlight, Underline, Strikethrough (text markup)
  - Sticky Notes with editable text
  - Rectangle & Ellipse shapes
  - Arrow
  - Freehand drawing
  - Text labels
  - Eraser
- **Selection & editing** — click to select, inline comment editing
- **Sidebar** with tabs: Annotations, Pages, Comments; search & filter
- **Undo / Redo** (up to 20 steps)
- **Zoom** — scroll-to-zoom (Ctrl+Wheel), zoom controls, reset
- **Color picker** — 7 preset colours, per-annotation colour
- **Stroke width** — 3 sizes
- **Export** — JSON export of all annotation data
- **Keyboard shortcuts** (see below)
- **Persistent state** — annotations survive page refresh via `localStorage`
- **Drag & drop** file open
- **Dark theme** — designed dark-first with a refined ink/amber palette

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `V` | Select tool |
| `H` | Pan tool |
| `N` | Note |
| `R` | Rectangle |
| `E` | Ellipse |
| `A` | Arrow |
| `F` | Freehand draw |
| `T` | Text |
| `X` | Eraser |
| `Ctrl/⌘ + Z` | Undo |
| `Ctrl/⌘ + Shift + Z` | Redo |
| `Ctrl/⌘ + +` | Zoom in |
| `Ctrl/⌘ + -` | Zoom out |
| `Ctrl/⌘ + 0` | Reset zoom |

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite 5 |
| State | Zustand (with `persist` middleware) |
| PDF rendering | react-pdf + pdfjs-dist |
| Styling | Tailwind CSS v3 |
| Animation | Framer Motion |
| Icons | lucide-react |
| Fonts | Syne (display) + DM Sans (body) |
| Hotkeys | react-hotkeys-hook |

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Install & run locally

```bash
git clone https://github.com/luke-pekala/Annotately.git
cd Annotately
npm install
npm run dev
```

Open http://localhost:5173/Annotately/

### Build for production

```bash
npm run build
npm run preview   # preview the production build locally
```

---

## Deployment

### Option 1 — GitHub Pages (recommended, automatic)

The repo ships with a GitHub Actions workflow (`.github/workflows/deploy.yml`) that:
1. Runs type-check and build on every push to `main`
2. Deploys the `dist/` folder to GitHub Pages automatically

**One-time setup:**
1. Push the code to GitHub (`git push origin main`)
2. In your repo → **Settings → Pages**
3. Under *Source*, select **GitHub Actions**
4. On the next push to `main` the site deploys automatically to:  
   `https://luke-pekala.github.io/Annotately/`

### Option 2 — Vercel

```bash
npm i -g vercel
vercel
```

Set the *Output Directory* to `dist` and *Build Command* to `npm run build`.  
Change `base` in `vite.config.ts` from `/Annotately/` to `/`.

### Option 3 — Netlify

Drag & drop the `dist/` folder into https://app.netlify.com/drop  
Or connect your GitHub repo and set build command `npm run build`, publish dir `dist`.  
Change `base` in `vite.config.ts` to `/`.

### Option 4 — Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

---

## Project Structure

```
Annotately/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD → GitHub Pages
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Canvas/
│   │   │   ├── AnnotationLayer.tsx  # SVG annotation renderer
│   │   │   ├── CanvasArea.tsx       # Main canvas with PDF/image + event handling
│   │   │   └── PageNav.tsx          # PDF page navigation bar
│   │   ├── Sidebar/
│   │   │   └── index.tsx            # Sidebar: annotations, pages, comments tabs
│   │   ├── Toolbar/
│   │   │   └── index.tsx            # Vertical tool palette
│   │   ├── Canvas.tsx               # Re-export
│   │   ├── DropZone.tsx             # Re-export
│   │   ├── Header.tsx               # Top bar: logo, doc tabs, undo/redo, zoom, export
│   │   ├── WelcomeScreen.tsx        # Empty-state drop zone
│   │   └── index.ts                 # Barrel exports
│   ├── hooks/
│   │   ├── useAnnotationDraw.ts     # Drawing state machine
│   │   └── useFileOpen.ts           # File open helper
│   ├── store/
│   │   └── index.ts                 # Zustand store + selectors
│   ├── styles/
│   │   └── globals.css              # Tailwind + custom CSS vars + utilities
│   ├── types/
│   │   └── index.ts                 # All TypeScript types
│   ├── utils/
│   │   └── index.ts                 # Helpers: export, format, color
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Contributing

PRs welcome! Please open an issue first for major changes.

## License

MIT © Luke Pękała

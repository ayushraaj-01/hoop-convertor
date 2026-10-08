# HoopConvert 🏀

> **Throw & Convert Arena** — An interactive basketball arcade meets pure client-side document conversion. Shoot hoops to convert documents instantly in your browser with zero server uploads.

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![Client Side Only](https://img.shields.io/badge/Privacy-100%25%20Client--Side-00e5ff.svg)
![Zero Server Uploads](https://img.shields.io/badge/Server%20Uploads-Zero-ff5500.svg)
![Vite 8](https://img.shields.io/badge/Built%20With-Vite-8b5cf6.svg)

---

## 🌟 Overview

**HoopConvert** gamifies document processing into a fast-paced basketball shooting arena. Drag and drop any document (PDF, Word, Images, Text, or Markdown), pull back to aim along a glowing parabolic trajectory arc, and release. Sinking a clean swish or throwing down a monster slam dunk triggers a high-speed, 100% client-side conversion engine.

No account needed, no wait times, and **your documents never touch a third-party server**.

---

## ✨ Features

- 🏀 **Interactive Court Physics Engine**
  - Custom HTML5 Canvas physics with gravity, friction, and backboard banking.
  - Parabolic trajectory arc guide that updates dynamically as you aim.
  - Cloth net rope physics that ripples realistically on every basket.
  - **Smart Magnet Assist** toggle for guaranteed clean swishes into the rim.
  - Quick action buttons: **Slam Dunk** (auto swish), **3-Point Arc**, and **Reset Ball**.

- 🔒 **100% Privacy & Pure Client-Side Conversion**
  - Powered by modern in-browser runtimes: `pdfjs-dist`, `docx`, `mammoth`, `jspdf`, and `html2canvas`.
  - Zero cloud APIs, zero analytics, zero data retention — everything converts locally in browser memory.

- 🔄 **Supported Conversion Formats**
  - **PDF (`.pdf`)** ➔ Word (`.docx`), Plain Text (`.txt`), High-Res Images (`.png`), Markdown (`.md`)
  - **Word (`.docx`, `.doc`)** ➔ PDF (`.pdf`), Plain Text (`.txt`), HTML (`.html`), Markdown (`.md`)
  - **Images (`.png`, `.jpg`, `.jpeg`, `.webp`)** ➔ Vector-wrapped PDF (`.pdf`), PNG Image (`.png`)
  - **Plain Text (`.txt`, `.md`)** ➔ Word Document (`.docx`), PDF (`.pdf`)

- 🎨 **Authentic Brand Logos & Modern Aesthetics**
  - Crisp, real vector SVG logos for **Microsoft Word**, **Adobe Acrobat PDF**, **HTML5**, **Markdown**, and **PNG Graphics**.
  - NBA stadium arena styling: floodlight glow beams, dynamic glassmorphism, and Bebas Neue athletic scoreboard typography.

- 🔊 **Web Audio Synthesizer**
  - Procedural Web Audio FX without external audio files: ball dribble thump, rim metal ping, cloth net swish, crowd cheers, and referee whistles.

- 🏆 **Arena HUD, Trophy Celebrations & Locker History**
  - Live scoreboard tracking total **Points**, **Streaks**, and **Converted Docs**.
  - Real-time conversion telemetry bar with progress feedback.
  - Post-conversion **Championship Trophy Modal** with instant file download and content preview.
  - **Locker Room History Drawer** to review and re-download any file converted during your session.

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- `npm` (bundled with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/hoop-convert.git

# Navigate into the project folder
cd hoop-convert

# Install dependencies
npm install
```

### Running Locally

```bash
# Start the local Vite development server
npm run dev
```

Open `http://localhost:5173` in your browser to enter the arena!

### Building for Production

```bash
# Build the production-ready static assets
npm run build

# Preview the production build locally
npm run preview
```

The optimized bundle will be compiled into the `dist/` directory, ready to deploy to GitHub Pages, Vercel, Netlify, or Cloudflare Pages.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Build & Tooling** | [Vite](https://vite.dev/) |
| **Document Processing** | `pdfjs-dist`, `docx`, `mammoth`, `jspdf`, `html2canvas` |
| **Game & Canvas Physics** | Native HTML5 Canvas 2D, Cloth Physics, Verlet Integration |
| **Audio** | Web Audio API (`AudioContext`, procedural oscillators & noise buffers) |
| **Visual Effects** | `canvas-confetti`, custom CSS Glassmorphism & Neon Glow |
| **Icons & Branding** | Custom authentic vector SVGs (Microsoft Word, Adobe PDF, HTML5, Markdown) |

---

## 📁 Project Structure

```text
├── index.html               # Stadium layout, Arena HUD, and action decks
├── package.json             # Scripts and client-side conversion dependencies
├── public/                  # Favicons and static assets
├── src/
│   ├── audio.js             # Web Audio API synthesizer for court sound effects
│   ├── basketballEngine.js  # Canvas physics engine (aim arc, net cloth, collisions)
│   ├── converter.js         # Pure client-side document conversion pipeline
│   ├── icons.js             # Authentic brand logos (Word, PDF, HTML5, MD, PNG)
│   ├── main.js              # Application controller & arena HUD state
│   └── style.css            # Stadium glassmorphism theme and animations
└── README.md
```

---

## 🔐 Privacy Policy & Data Security

HoopConvert takes data privacy seriously:
- **No Uploads**: No files are sent to remote servers or cloud endpoints.
- **Local Memory**: Files exist solely within your browser's execution memory and are cleared when the tab closes.
- **Offline Capable**: Functions entirely offline once loaded.

---

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE).

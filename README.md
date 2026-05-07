# Hermes — Frontend Monorepo

**HERMES** (High-frequency Emergency and Rural Multimedia Exchange System) is a project by [Rhizomatica](https://www.rhizomatica.org/hermes/) that enables communities in remote or disaster-affected areas to exchange messages, files, and GPS coordinates over **HF radio** (3–30 MHz shortwave). HF radio propagates over the horizon via ionospheric reflection, making it one of the few communication methods that works without infrastructure — no internet, no cell towers, no satellites required.

This repository is the frontend monorepo that consumes the [Hermes API](https://github.com/Rhizomatica/hermes-api) and provides two independent web applications:

| App | Port | Purpose |
|---|---|---|
| `hermes-chat` | `:3000` | Messaging client — send/receive messages and files between Hermes stations |
| `hermes-gps` | `:3001` | Geolocation viewer — displays the station's current GPS coordinates in real time |

---

## Tech Stack

| Technology | Version |
|---|---|
| Node.js | 25.6.1 |
| npm | 11.9.0 |
| Turborepo | 2.9.6 |
| Next.js | 16.2.4 |
| React | 19.0.0 |
| TypeScript | 5.7.2 |
| Tailwind CSS | 3.4.17 |
| next-intl | 4.8.3 |
| lucide-react | 1.7.0 |

---

## Project Structure

```
hermes/
├── apps/
│   ├── hermes-chat/        # Messaging app (Next.js, port 3000)
│   └── hermes-gps/         # GPS viewer app (Next.js, port 3001)
├── packages/
│   ├── api/                # @hermes/api — shared Hermes API client
│   ├── ui/                 # @hermes/ui — shared React components
│   └── tailwind-config/    # @hermes/tailwind-config — shared Tailwind base config
├── package.json            # Workspace root
├── turbo.json              # Turborepo pipeline
└── tsconfig.base.json      # Shared TypeScript config
```

---

## Getting Started

### Prerequisites

Copy the environment file and set your Hermes API URL:

```bash
cp .env.example apps/hermes-chat/.env.local
cp .env.example apps/hermes-gps/.env.local
```

Edit each `.env.local`:

```env
HERMES_API_URL=https://<your-station-ip>
```

### Install dependencies

```bash
npm install
```

### Run

```bash
# Run hermes-chat only (port 3000)
npm run dev:chat

# Run hermes-gps only (port 3001)
npm run dev:gps

# Run both apps in parallel via Turborepo
npm run dev
```

### Build

```bash
# Build all apps (shared packages are built first automatically)
npm run build
```

---

## API

Both apps proxy requests to the [Hermes REST API](https://github.com/Rhizomatica/hermes-api).
The shared `@hermes/api` package (`packages/api/`) handles all HTTP communication with the backend over HTTPS (with self-signed certificate support for on-device deployments).

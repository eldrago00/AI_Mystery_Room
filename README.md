# AI Mystery Room

A full stack mystery game built with React, Vite, Express, MongoDB, and Gemini. The API owns case generation, investigation progress, scoring, and the hidden solution.

## Requirements

- Node.js 20 or newer
- MongoDB local instance or MongoDB Atlas database
- Gemini API key

## Run locally

1. Copy `server/.env.example` to `server/.env` and set `MONGODB_URI` and `GEMINI_API_KEY`.
2. In `server`, run `npm install`, then `npm run dev`.
3. Copy `client/.env.example` to `client/.env` if the API is not at `http://localhost:5000/api`.
4. In `client`, run `npm install`, then `npm run dev`.
5. Open the Vite URL shown in the terminal (normally `http://localhost:5173`).

The server exposes `GET /api/health`. The implementation blueprint and API contract are in [docs/SPEC.md](./docs/SPEC.md), alongside the original project brief in [spec.md](./spec.md).

## Deployment

Deploy the server with `server` as its working directory and set `MONGODB_URI`, `GEMINI_API_KEY`, `CLIENT_URL`, and optionally `PORT`. Deploy `client` with `client` as its root directory and set `VITE_API_URL` to the deployed API URL ending in `/api`. The server uses `gemini-3.8-flash`; keep Gemini credentials on the server only.

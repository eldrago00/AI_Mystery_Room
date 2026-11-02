# AI Mystery Room — Project Specification

## Overview
AI Mystery Room is a responsive web game for generating and solving original mysteries with Gemini. Players enter a premise, choose a difficulty, inspect suspects and clues, request optional hints, then accuse a suspect to receive the verdict, explanation, and score.

## Audience and experience
The app is for casual mystery fans and students. The flow should be clear on mobile and desktop, preserve progress for a case, and never expose the culprit or solution before an accusation.

## Stack
- Frontend: React, Vite, React Router, Axios, Tailwind CSS
- Backend: Node.js, Express, Mongoose, Zod, Gemini via `@google/genai`
- Database: MongoDB

## Screens and flow
1. Home: explain the game and start creating a case.
2. Create Mystery: enter a premise and choose Easy, Medium, or Hard.
3. Investigation Room: read the story, inspect suspects, reveal clues and spend hints; show progress and current score.
4. Accusation: choose a suspect and confirm.
5. Results: show whether the accusation was correct, culprit, explanation, and score; offer a new game.
Show loading, empty, validation, and API error states. Navigation should work at small and large viewport sizes.

## Difficulty content
| Level | Suspects | Clues | Hints | Correct accusation |
| --- | ---: | ---: | ---: | ---: |
| Easy | 3 | 5 | 2 | 100 |
| Medium | 4 | 7 | 3 | 150 |
| Hard | 5 | 9 | 3 | 200 |

Each discovered clue adds 5 points; each requested hint subtracts 10 points; minimum score is 0. A wrong accusation earns no correctness points. Backend is authoritative for validation and scoring.

## Data and privacy
Persist case title, premise, story, difficulty, suspects, clues, hints, solution, culprit, player progress, accusation, and score. The API must omit solution and culprit from all active-case responses. Only the result endpoint after an accusation may return them. Gemini output must be structured and validated before saving; solutions must be logically supported by the clues.

## API
- `POST /api/cases` — `{ premise, difficulty }` creates a case; returns safe case view.
- `GET /api/cases/:id` — safe active case and progress.
- `POST /api/cases/:id/clues/:clueId/discover` — reveal one clue and update score.
- `POST /api/cases/:id/hints` — reveal next available hint and update score.
- `POST /api/cases/:id/accuse` — `{ suspectId }`; records accusation and computes result.
- `GET /api/cases/:id/result` — result only after accusation.
Use JSON, validate inputs, return useful 4xx errors and safe 5xx errors. Cases are identified by MongoDB ObjectId.

## Acceptance criteria
- Cases generate at all three difficulties with exact requested counts.
- Players can discover clues, request hints, accuse, and view a result.
- The active-case API never reveals the solution or culprit.
- Backend validates content and calculates score.
- Failures are communicated in the UI; layout works on mobile and desktop.
- The full flow can be deployed with secrets configured server-side.

## Setup and deployment
Configure `server/.env` from `.env.example`; never commit secrets. Deploy the API with MongoDB Atlas and the frontend to Vercel, setting `VITE_API_URL` to the API base URL and configuring CORS `CLIENT_URL`.

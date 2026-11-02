import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

const sizes = { Easy: { suspects: 3, clues: 5, hints: 2 }, Medium: { suspects: 4, clues: 7, hints: 3 }, Hard: { suspects: 5, clues: 9, hints: 3 } };
const mysterySchema = z.object({
  title: z.string().min(3).max(100), story: z.string().min(80).max(2400),
  suspects: z.array(z.object({ name: z.string().min(2).max(60), description: z.string().min(10).max(300), motive: z.string().min(3).max(180) })),
  clues: z.array(z.string().min(12).max(300)), hints: z.array(z.string().min(8).max(250)),
  culpritIndex: z.number().int().nonnegative(), solution: z.string().min(40).max(1200)
});

export async function generateMystery(premise, difficulty) {
  if (!process.env.GEMINI_API_KEY) throw Object.assign(new Error('Mystery generation is not configured. Add GEMINI_API_KEY to the server environment.'), { status: 503 });
  const counts = sizes[difficulty];
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    config: { responseMimeType: 'application/json', temperature: 0.8 },
    contents: `Create a fair, self-contained fictional detective mystery from this premise: ${premise}\nDifficulty: ${difficulty}. Return JSON only with keys title, story, suspects, clues, hints, culpritIndex, solution. Exactly ${counts.suspects} suspects as objects {name,description,motive}; exactly ${counts.clues} clue strings; exactly ${counts.hints} escalating hint strings. culpritIndex is zero-based. The explanation must identify the culprit and show how multiple clues support the answer; clues must be concrete and logically consistent, with no contradictions. Do not state the culprit in title, story, suspect descriptions, clues, or hints. Keep solution separate from all player-facing content.`
  });
  let parsed;
  try { parsed = mysterySchema.parse(JSON.parse(response.text)); }
  catch { throw Object.assign(new Error('The mystery generator returned an invalid case. Please try again.'), { status: 502 }); }
  if (parsed.suspects.length !== counts.suspects || parsed.clues.length !== counts.clues || parsed.hints.length !== counts.hints || parsed.culpritIndex >= counts.suspects) {
    throw Object.assign(new Error('The generated case did not meet the selected difficulty requirements. Please try again.'), { status: 502 });
  }
  return parsed;
}

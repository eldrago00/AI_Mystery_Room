import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import Case from '../models/Case.js';
import { generateMystery } from '../services/generateMystery.js';

const router = Router();
const counts = { Easy: { suspects: 3, clues: 5, hints: 2, points: 100 }, Medium: { suspects: 4, clues: 7, hints: 3, points: 150 }, Hard: { suspects: 5, clues: 9, hints: 3, points: 200 } };
const calculateScore = c => Math.max(0, (c.completedAt && c.accusationId?.equals(c.culpritId) ? counts[c.difficulty].points : 0) + c.discoveredClueIds.length * 5 - c.usedHintIndexes.length * 10);
const createSchema = z.object({ premise: z.string().trim().min(12).max(500), difficulty: z.enum(['Easy', 'Medium', 'Hard']) });
const validId = id => mongoose.isValidObjectId(id);
const safeCase = c => ({ _id: c._id, title: c.title, story: c.story, difficulty: c.difficulty, suspects: c.suspects.map(s => ({ _id: s._id, name: s.name, description: s.description, motive: s.motive })), clues: c.clues.map(cl => ({ _id: cl._id, discovered: c.discoveredClueIds.some(id => id.equals(cl._id)), ...(c.discoveredClueIds.some(id => id.equals(cl._id)) ? { text: cl.text } : {}) })), hintsUsed: c.usedHintIndexes.length, hintCount: c.hints.length, usedHints: c.usedHintIndexes.map(i => c.hints[i]), score: c.score, completed: Boolean(c.completedAt) });
const findCase = async (id, res) => { if (!validId(id)) { res.status(400).json({ error: 'Invalid case ID.' }); return null; } const c = await Case.findById(id); if (!c) res.status(404).json({ error: 'Case not found.' }); return c; };

router.post('/', async (req, res, next) => {
  try {
    const input = createSchema.parse(req.body);
    const generated = await generateMystery(input.premise, input.difficulty);
    const doc = new Case({ ...input, ...generated, suspects: generated.suspects, clues: generated.clues.map(text => ({ text })) });
    doc.culpritId = doc.suspects[generated.culpritIndex]._id;
    await doc.save();
    res.status(201).json(safeCase(doc));
  } catch (err) { next(err); }
});
router.get('/:id', async (req, res, next) => { try { const c = await findCase(req.params.id, res); if (c) res.json(safeCase(c)); } catch (e) { next(e); } });
router.post('/:id/clues/:clueId/discover', async (req, res, next) => { try { const c = await findCase(req.params.id, res); if (!c) return; if (c.completedAt) return res.status(409).json({ error: 'This case is already closed.' }); const clue = c.clues.id(req.params.clueId); if (!clue) return res.status(404).json({ error: 'Clue not found.' }); if (!c.discoveredClueIds.some(id => id.equals(clue._id))) { c.discoveredClueIds.push(clue._id); c.score = calculateScore(c); await c.save(); } res.json(safeCase(c)); } catch (e) { next(e); } });
router.post('/:id/hints', async (req, res, next) => { try { const c = await findCase(req.params.id, res); if (!c) return; if (c.completedAt) return res.status(409).json({ error: 'This case is already closed.' }); const nextIndex = c.usedHintIndexes.length; if (nextIndex >= c.hints.length) return res.status(409).json({ error: 'No hints remain.' }); c.usedHintIndexes.push(nextIndex); c.score = calculateScore(c); await c.save(); res.json(safeCase(c)); } catch (e) { next(e); } });
router.post('/:id/accuse', async (req, res, next) => { try { const input = z.object({ suspectId: z.string().refine(validId) }).safeParse(req.body); if (!input.success) return res.status(400).json({ error: 'Choose a valid suspect.' }); const c = await findCase(req.params.id, res); if (!c) return; if (c.completedAt) return res.status(409).json({ error: 'This case is already closed.' }); if (!c.suspects.id(input.data.suspectId)) return res.status(400).json({ error: 'That person is not a suspect in this case.' }); c.accusationId = input.data.suspectId; c.completedAt = new Date(); c.score = calculateScore(c); await c.save(); res.json({ accepted: true }); } catch (e) { next(e); } });
router.get('/:id/result', async (req, res, next) => { try { const c = await findCase(req.params.id, res); if (!c) return; if (!c.completedAt) return res.status(409).json({ error: 'Submit an accusation before viewing the result.' }); res.json({ correct: c.accusationId.equals(c.culpritId), accused: { _id: c.suspects.id(c.accusationId)?._id, name: c.suspects.id(c.accusationId)?.name }, culprit: { _id: c.suspects.id(c.culpritId)?._id, name: c.suspects.id(c.culpritId)?.name }, explanation: c.solution, score: c.score, difficulty: c.difficulty }); } catch (e) { next(e); } });
export default router;

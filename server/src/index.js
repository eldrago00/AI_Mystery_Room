import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import casesRouter from './routes/cases.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '20kb' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/cases', casesRouter);
app.use((err, _req, res, _next) => {
  if (err?.name === 'ZodError') return res.status(400).json({ error: 'Please check the submitted information.' });
  console.error(err);
  res.status(err.status || 500).json({ error: err.status ? err.message : 'The server could not complete that request.' });
});

const port = Number(process.env.PORT || 5000);
if (!process.env.MONGODB_URI) { console.error('MONGODB_URI is required. Copy server/.env.example to server/.env and configure it.'); process.exit(1); }
mongoose.connect(process.env.MONGODB_URI).then(() => app.listen(port, () => console.log(`Mystery Room API listening on ${port}`))).catch(err => { console.error('MongoDB connection failed:', err.message); process.exit(1); });

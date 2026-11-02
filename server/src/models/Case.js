import mongoose from 'mongoose';

const suspectSchema = new mongoose.Schema({ name: String, description: String, motive: String }, { _id: true });
const clueSchema = new mongoose.Schema({ text: String }, { _id: true });
const caseSchema = new mongoose.Schema({
  title: { type: String, required: true }, premise: { type: String, required: true }, story: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  suspects: { type: [suspectSchema], required: true }, clues: { type: [clueSchema], required: true }, hints: { type: [String], required: true },
  culpritId: { type: mongoose.Schema.Types.ObjectId, required: true }, solution: { type: String, required: true },
  discoveredClueIds: { type: [mongoose.Schema.Types.ObjectId], default: [] }, usedHintIndexes: { type: [Number], default: [] },
  accusationId: { type: mongoose.Schema.Types.ObjectId, default: null }, score: { type: Number, default: 0 }, completedAt: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.model('Case', caseSchema);

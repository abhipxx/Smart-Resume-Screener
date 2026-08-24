import mongoose from 'mongoose';

const CandidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, default: 'N/A' },
  skills: [{ type: String }],
  experienceYears: { type: Number, default: 0 },
  education: [{ type: String }],
  matchScore: { type: Number, required: true },
  verdict: { type: String, enum: ['Strong Match', 'Moderate Match', 'Low Match'], required: true },
  keyStrengths: [{ type: String }],
  missingSkills: [{ type: String }],
  justification: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Candidate = mongoose.model('Candidate', CandidateSchema);
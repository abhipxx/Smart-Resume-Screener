import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import { createRequire } from 'module';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { Candidate } from '../models/Candidate.js';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const evaluationSchema = {
  type: SchemaType.OBJECT,
  properties: {
    name: { type: SchemaType.STRING, description: "Candidate's full name" },
    email: { type: SchemaType.STRING, description: "Candidate's email address" },
    skills: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    experienceYears: { type: SchemaType.NUMBER, description: "Estimated total years of relevant experience" },
    education: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    matchScore: { type: SchemaType.NUMBER, description: "Fit score from 1 to 10 based on JD requirements" },
    verdict: { type: SchemaType.STRING, description: "Must be 'Strong Match', 'Moderate Match', or 'Low Match'" },
    keyStrengths: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    missingSkills: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    justification: { type: SchemaType.STRING, description: "Concise hiring justification" }
  },
  required: ["name", "skills", "matchScore", "verdict", "keyStrengths", "missingSkills", "justification"]
};

router.post('/evaluate', upload.single('resume'), async (req, res) => {
  try {
    const { jobDescription } = req.body;

    if (!req.file || !jobDescription) {
      return res.status(400).json({ error: 'Resume PDF and Job Description are required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('Error: GEMINI_API_KEY is not defined in environment variables.');
      return res.status(500).json({ error: 'Server configuration error: Missing Gemini API key.' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const pdfData = await pdf(req.file.buffer);
    const resumeText = pdfData.text ? pdfData.text.trim() : '';

    if (!resumeText) {
      return res.status(400).json({ 
        error: 'Unable to extract text from PDF. Please ensure the file contains readable text and is not an image scan.' 
      });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: evaluationSchema,
        temperature: 0.2
      }
    });

    const prompt = `
      You are an expert HR Technical Recruiter.
      Parse the candidate resume text and compare it thoroughly against the Job Description.

      JOB DESCRIPTION:
      ${jobDescription}

      RESUME TEXT:
      ${resumeText}
    `;

    const result = await model.generateContent(prompt);
    const evaluation = JSON.parse(result.response.text());

    const newCandidate = new Candidate({
      name: evaluation.name || 'Unknown Candidate',
      email: evaluation.email || 'N/A',
      skills: evaluation.skills || [],
      experienceYears: evaluation.experienceYears || 0,
      education: evaluation.education || [],
      matchScore: evaluation.matchScore,
      verdict: evaluation.verdict,
      keyStrengths: evaluation.keyStrengths || [],
      missingSkills: evaluation.missingSkills || [],
      justification: evaluation.justification
    });

    await newCandidate.save();
    res.status(201).json({ success: true, data: newCandidate });

  } catch (error) {
    console.error('Screening Error Detailed:', error);
    res.status(500).json({ error: 'Failed to process and screen resume.' });
  }
});

router.get('/candidates', async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ matchScore: -1 });
    res.status(200).json({ success: true, data: candidates });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch candidates.' });
  }
});

export default router;
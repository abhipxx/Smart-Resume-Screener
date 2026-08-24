import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import screenerRoutes from './routes/screener.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', screenerRoutes);

// MongoDB Connection
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/resume_screener')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  })
  .catch((err) => console.error('Database connection failed:', err));
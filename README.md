# Smart Resume Screener

Smart Resume Screener is an AI-powered hiring application designed to automate candidate shortlisting. It extracts text from PDF resumes, parses technical skills and candidate experience using Google Gemini API, and evaluates overall fit against target job descriptions. Evaluated candidates are stored in a database and ranked on an interactive dashboard with detailed match justifications.

## Features

* **PDF Resume Parsing:** Directly extracts raw text from candidate PDF files.
* **Semantic Match Scoring:** Evaluates candidate fit on a 1–10 scale based on experience, skill overlap, and job requirements.
* **Strength & Gap Analysis:** Identifies core candidate strengths and missing technical skills.
* **Ranked Dashboard:** Persists evaluation results and presents candidates ordered by match score.

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React (Vite), Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose |
| **LLM Engine** | Google Gemini API (`gemini-1.5-flash`) |
| **File Handling** | `pdf-parse`, `multer` |

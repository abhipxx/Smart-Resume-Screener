import React, { useState, useEffect } from 'react';

export default function App() {
  const [jobDescription, setJobDescription] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState([]);

  const fetchCandidates = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/candidates');
      const data = await res.json();
      if (data.success) setCandidates(data.data);
    } catch (err) {
      console.error('Failed to fetch candidates:', err);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !jobDescription) return alert('Provide both a resume PDF and job description.');

    setLoading(true);
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jobDescription);

    try {
      const res = await fetch('http://localhost:5000/api/evaluate', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setFile(null);
        fetchCandidates();
      } else {
        alert(data.error || 'Evaluation failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to backend.');
    } finally {
      setLoading(false);
    }
  };

  const getBadgeColor = (verdict) => {
    if (verdict === 'Strong Match') return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (verdict === 'Moderate Match') return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-rose-100 text-rose-800 border-rose-300';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Smart Resume Screener</h1>
          <p className="text-slate-500 mt-1">Extract technical profiles and compute semantic match fit with Gemini AI.</p>
        </header>

        {/* Input Form Section */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Target Job Description</label>
                <textarea
                  required
                  rows={6}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste job requirements, required technical skills, and experience criteria here..."
                  className="w-full p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Upload Candidate Resume (PDF)</label>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-6 bg-slate-50 hover:bg-slate-100 transition">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  {file && <p className="mt-3 text-xs text-indigo-600 font-medium">Selected: {file.name}</p>}
                </div>
              </div>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? 'Extracting & Screening Profile...' : 'Screen Candidate'}
            </button>
          </form>
        </section>

        {/* Shortlisted Candidates Dashboard */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800">Evaluated Candidates</h2>

          {candidates.length === 0 ? (
            <p className="text-slate-400 text-sm italic">No candidate profiles screened yet.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {candidates.map((c) => (
                <div key={c._id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{c.name}</h3>
                      <p className="text-xs text-slate-500">{c.email}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-indigo-600">{c.matchScore}/10</span>
                      <div className={`mt-1 text-xs px-2.5 py-0.5 rounded-full border font-semibold ${getBadgeColor(c.verdict)}`}>
                        {c.verdict}
                      </div>
                    </div>
                  </div>

                  {/* Justification */}
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-700">Justification: </span>{c.justification}
                  </p>

                  {/* Strengths & Missing Skills */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="font-semibold text-emerald-700 mb-1">Key Strengths:</p>
                      <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                        {c.keyStrengths?.map((s, idx) => <li key={idx}>{s}</li>)}
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-rose-700 mb-1">Missing Skills:</p>
                      <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                        {c.missingSkills?.map((m, idx) => <li key={idx}>{m}</li>)}
                      </ul>
                    </div>
                  </div>

                  {/* Extracted Skills */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1">
                    {c.skills?.map((skill, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>

                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
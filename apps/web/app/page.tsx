"use client";
import { useState, useRef } from "react";

export default function Home() {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Points to your API Gateway upload handler
      const res = await fetch("http://localhost:4000/upload", {
        method: "POST",
        body: formData,
      });
      
      if (res.ok) {
        const data = await res.json();
        alert(`Engine engaged! Job ID: ${data.jobId}`);
        // Future step: Redirect to /jobs/[jobId]
      } else {
        alert("Upload failed. Check API Gateway connection.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Network error. Is the API Gateway running?");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-sans selection:bg-cyan-900 selection:text-cyan-50">
      
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/20">
              CG
            </div>
            <span className="text-xl font-semibold tracking-tight text-white">CodeGuard</span>
          </div>
          <div className="flex gap-8 text-sm font-medium text-gray-400">
            <a href="#" className="hover:text-cyan-400 transition-colors">Dashboard</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Scans</a>
            <a href="https://github.com/abhicodesnow/codeguard-ai_plagiarism_engine" target="_blank" rel="noreferrer" className="text-white hover:text-cyan-400 transition-colors">GitHub ↗</a>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-16 space-y-16">
        <header className="text-center space-y-6 max-w-3xl mx-auto mt-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/30 border border-cyan-800/50 text-cyan-400 text-xs font-semibold tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
            Engine Online
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 tracking-tight">
            Algorithmic Code Forensics
          </h1>
          <p className="text-lg text-gray-400 leading-relaxed">
            Detect structural plagiarism across C++, Python, and JavaScript using AST winnowing and deep LLM semantic analysis.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          
          <div 
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`group relative rounded-2xl border border-white/10 bg-white/5 p-8 hover:bg-white/[0.07] transition-all border-dashed hover:border-cyan-500/50 flex flex-col items-center justify-center text-center h-80 overflow-hidden ${isUploading ? 'opacity-50 cursor-not-allowed animate-pulse' : 'cursor-pointer'}`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept=".zip" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <svg className="w-16 h-16 text-gray-600 group-hover:text-cyan-400 transition-colors mb-6 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2 relative z-10">
              {isUploading ? "Transmitting..." : "Initialize Scan"}
            </h3>
            <p className="text-sm text-gray-400 max-w-xs relative z-10">
              Drag and drop raw codebase archives here or click to browse standard directories.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 flex items-center justify-between hover:bg-white/[0.07] transition-colors">
              <div>
                <p className="text-sm font-medium text-gray-400">AST Nodes Processed</p>
                <p className="text-3xl font-bold text-white mt-1">142.8k</p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 flex items-center justify-between hover:bg-white/[0.07] transition-colors">
              <div>
                <p className="text-sm font-medium text-gray-400">Active Pipelines</p>
                <p className="text-3xl font-bold text-white mt-1">Llama / Groq</p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
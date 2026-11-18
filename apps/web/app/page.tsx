"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();

    // 1. Attach the GraphQL mutation expected by Busboy ('operations' field)
    formData.append(
      "operations",
      JSON.stringify({
        query: `
          mutation UploadSubmissions($input: UploadSubmissionsInput) {
            uploadSubmissions(input: $input) {
              jobId
              status
              progress
              message
            }
          }
        `,
        variables: {
          input: {
            similarityThreshold: 0.7,
            label: file.name,
          },
        },
      })
    );

    // 2. Attach the ZIP archive ('file' field)
    formData.append("file", file);

    const uploadUrl =
      process.env.NEXT_PUBLIC_UPLOAD_URL || "http://localhost:4000/graphql";

    try {
      const res = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      // GraphQL returns HTTP 200 even on errors, so check result.errors first
      if (result.errors && result.errors.length > 0) {
        console.error("GraphQL upload error:", result.errors);
        alert(`Upload error: ${result.errors[0].message}`);
        return;
      }

      const jobId = result?.data?.uploadSubmissions?.jobId;

      if (res.ok && jobId) {
        router.push(`/jobs/${jobId}`);
      } else {
        console.error("Unexpected upload response:", result);
        alert("Upload succeeded, but no Job ID was returned. Check console.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Network error. Is the API Gateway running?");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (isUploading) return;
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <main className="min-h-screen bg-black text-zinc-100 flex flex-col justify-center items-center px-6 py-12">
      <div className="max-w-4xl w-full space-y-10">
        {/* Header Section */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono uppercase tracking-wider">
            CodeGuard-AI Forensics
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            Structural Plagiarism Engine
          </h1>
          <p className="text-zinc-400 text-base md:text-lg max-w-2xl">
            Multi-stage AST winnowing, Locality-Sensitive Hashing, and Llama / Groq
            LLM semantic analysis.
          </p>
        </div>

        {/* Main Grid: Upload Zone + Telemetry Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Upload Dropzone */}
          <div
            onClick={() => !isUploading && fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={`md:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer hover:border-emerald-500/50 hover:bg-zinc-900/40 ${
              isUploading ? "opacity-60 pointer-events-none" : ""
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4 text-emerald-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>

            <h2 className="text-lg font-semibold text-white mb-1">
              {isUploading ? "Transmitting..." : "Initialize Scan"}
            </h2>
            <p className="text-xs text-zinc-500 max-w-xs">
              Drag and drop raw codebase archives here or click to browse standard
              directories.
            </p>
          </div>

          {/* Right Column Stats */}
          <div className="flex flex-col gap-6 justify-between">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 flex flex-col justify-center">
              <span className="text-xs text-zinc-500 font-medium mb-2">
                AST Nodes Processed
              </span>
              <span className="text-3xl font-bold text-white tracking-tight">
                142.8k
              </span>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 flex flex-col justify-center">
              <span className="text-xs text-zinc-500 font-medium mb-2">
                Active Pipelines
              </span>
              <span className="text-2xl font-bold text-white tracking-tight">
                Llama / Groq
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
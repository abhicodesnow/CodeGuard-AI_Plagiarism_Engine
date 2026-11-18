"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import ForensicGraph from "../../../components/ForensicGraph";
import ReportModal from "../../../components/ReportModal";
import { SuspiciousPair } from "@codeguard/types";

const GET_JOB_DASHBOARD = gql`
  query GetJobDashboard($jobId: ID!) {
    jobStatus(jobId: $jobId) {
      jobId
      status
      progress
      message
      suspiciousPairCount
    }
    suspiciousPairs(jobId: $jobId) {
      pairId
      fileA: fileAName
      fileB: fileBName
      similarity: similarityScore
    }
  }
`;

interface JobStatusData {
  jobId: string;
  status: string;
  progress: number;
  message: string;
  suspiciousPairCount?: number;
}

export default function JobPage({ params }: { params: { jobId: string } }) {
  const { jobId } = params;
  const [selectedPair, setSelectedPair] = useState<SuspiciousPair | null>(null);

  const { data, loading, error, stopPolling } = useQuery<{
    jobStatus: JobStatusData | null;
    suspiciousPairs: SuspiciousPair[];
  }>(GET_JOB_DASHBOARD, {
    variables: { jobId },
    skip: !jobId,
    pollInterval: 2000,
    fetchPolicy: "network-only",
  });

  const job = data?.jobStatus;
  const pairs = (data?.suspiciousPairs ?? []).map((p) => ({
    ...p,
    fileA: p.fileA ?? "Unknown_A",
    fileB: p.fileB ?? "Unknown_B",
    similarity: typeof p.similarity === "number" ? p.similarity : 0,
  }));

  const isTerminal = job?.status === "COMPLETE" || job?.status === "FAILED";

  useEffect(() => {
    if (isTerminal) {
      stopPolling();
    }
  }, [isTerminal, stopPolling]);

  return (
    <div className="flex flex-col h-screen bg-black text-zinc-100">
      {/* Top Telemetry & Progress Header */}
      <header className="border-b border-zinc-800 bg-zinc-950 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-mono text-zinc-400 hover:text-emerald-400 transition-colors"
            >
              ← New Scan
            </Link>
            <span className="text-zinc-700">/</span>
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
              Job {jobId.slice(0, 8)}...
            </span>
            {job?.status && (
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold ${
                  job.status === "COMPLETE"
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : job.status === "FAILED"
                    ? "bg-red-500/15 text-red-400 border border-red-500/30"
                    : "bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse"
                }`}
              >
                {job.status}
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-400">
            {error
              ? `GraphQL Error: ${error.message}`
              : job?.message || (loading ? "Connecting to telemetry stream..." : "Waiting for worker status...")}
          </p>
        </div>

        {/* Progress Bar & Pair Count */}
        <div className="flex items-center gap-6">
          <div className="w-48">
            <div className="flex justify-between text-xs font-mono text-zinc-400 mb-1">
              <span>Progress</span>
              <span>{job?.progress ?? 0}%</span>
            </div>
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, job?.progress ?? 0))}%` }}
              />
            </div>
          </div>

          <div className="text-right">
            <span className="block text-xs text-zinc-500">Flagged Pairs</span>
            <span className="text-lg font-bold font-mono text-white">
              {pairs.length}
            </span>
          </div>
        </div>
      </header>

      {/* Main Forensic Graph Canvas */}
      <div className="flex-1 min-h-[600px] relative">
        <ForensicGraph
          jobId={jobId}
          pairs={pairs}
          onEdgeClick={setSelectedPair}
        />
        <ReportModal
          pair={selectedPair}
          jobId={jobId}
          onClose={() => setSelectedPair(null)}
        />
      </div>
    </div>
  );
}
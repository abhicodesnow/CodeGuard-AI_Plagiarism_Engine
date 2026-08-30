// @ts-ignore
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CodeGuard | Code Forensics",
  description: "AI-Powered Plagiarism & Code Forensics Engine",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
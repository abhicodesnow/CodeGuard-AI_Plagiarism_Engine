import type { Metadata } from "next";
// @ts-expect-error CSS is handled by Next.js at build time.
import "./globals.css";
import ApolloWrapper from "../components/ApolloWrapper";

export const metadata: Metadata = {
  title: "CodeGuard | Code Forensics",
  description: "Structural Plagiarism Engine",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-zinc-100 antialiased">
        <ApolloWrapper>{children}</ApolloWrapper>
      </body>
    </html>
  );
}
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("nexusflow_token");
    if (token) {
      router.push("/dashboard");
    }
  }, [router]);

  return (
    <div className="flex flex-col flex-1 items-center justify-center">
      <main className="flex flex-1 w-full max-w-4xl flex-col items-center justify-center px-8 text-center">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
            <svg
              className="h-7 w-7 text-primary-foreground"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold">NexusFlow AI</h1>
        </div>

        <h2 className="text-2xl font-semibold text-foreground mb-4">
          The Autonomous Supply Chain Brain
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mb-8">
          AI-powered supply chain management for SMB e-commerce.
          Predict demand, negotiate with suppliers, automate logistics,
          and optimize your cash flow.
        </p>

        <div className="flex gap-4">
          <Link href="/auth/register" className={buttonVariants({ size: "lg" })}>
            Get Started
          </Link>
          <Link href="/auth/login" className={buttonVariants({ variant: "outline", size: "lg" })}>
            Sign In
          </Link>
        </div>
      </main>
    </div>
  );
}

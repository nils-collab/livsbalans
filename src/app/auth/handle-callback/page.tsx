"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Suspense } from "react";

function HandleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const next = searchParams.get("next") || "/";

      if (!code) {
        setError("Ingen autentiseringskod hittades");
        setProcessing(false);
        return;
      }

      try {
        const supabase = createClient();
        
        // Exchange the code for a session - this will use the PKCE verifier from browser storage
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          console.error("Code exchange error:", exchangeError);
          setError(exchangeError.message);
          setProcessing(false);
          return;
        }

        // Success - redirect to the next page
        console.log("Code exchange successful, redirecting to:", next);
        router.push(next);
      } catch (err: any) {
        console.error("Unexpected error:", err);
        setError(err.message || "Ett oväntat fel uppstod");
        setProcessing(false);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  if (processing && !error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Verifierar...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="max-w-md w-full bg-card rounded-2xl shadow-soft p-8 text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="text-xl font-semibold mb-2">Något gick fel</h1>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => router.push("/auth/login")}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-xl font-medium"
          >
            Försök igen
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default function HandleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Laddar...</p>
      </div>
    }>
      <HandleCallbackContent />
    </Suspense>
  );
}


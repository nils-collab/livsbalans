"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Suspense } from "react";

function HandleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(true);
  const hasRun = useRef(false);

  useEffect(() => {
    // Prevent double execution in React StrictMode
    if (hasRun.current) return;
    hasRun.current = true;

    const handleCallback = async () => {
      const code = searchParams.get("code");
      const next = searchParams.get("next") || "/";

      const supabase = createClient();

      // Set a timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        if (processing) {
          setError("Verifieringen tog för lång tid. Detta kan bero på att länken öppnades i en annan webbläsare än den du registrerade dig i.");
          setProcessing(false);
        }
      }, 15000); // 15 second timeout

      try {
        // First check if we have a session from implicit flow (tokens in URL hash)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (session) {
          clearTimeout(timeout);
          router.push(next);
          return;
        }

        // If no session and we have a code, try PKCE exchange
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            clearTimeout(timeout);
            // Check if it's a PKCE verifier error
            if (exchangeError.message.includes("code verifier") || 
                exchangeError.message.includes("PKCE") ||
                exchangeError.message.includes("invalid")) {
              setError("Länken kunde inte verifieras. Detta händer ofta om du öppnar bekräftelselänken i en annan webbläsare eller app än där du skapade kontot. Gå till inloggningen och logga in med dina uppgifter.");
            } else {
              setError(exchangeError.message);
            }
            setProcessing(false);
            return;
          }

          clearTimeout(timeout);
          router.push(next);
          return;
        }

        // No code and no session
        clearTimeout(timeout);
        if (sessionError) {
          setError(sessionError.message);
        } else {
          setError("Ingen autentiseringsinformation hittades. Försök logga in direkt med dina uppgifter.");
        }
        setProcessing(false);
      } catch (err: any) {
        clearTimeout(timeout);
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


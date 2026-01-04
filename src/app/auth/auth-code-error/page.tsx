"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const message = searchParams.get("message");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <span className="text-3xl">⚠️</span>
          </div>
          <div>
            <CardTitle className="text-2xl">Något gick fel</CardTitle>
            <CardDescription className="mt-2">
              Det uppstod ett problem med autentiseringen. Detta kan bero på att:
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
            <li>Bekräftelselänken har gått ut (giltig i 24 timmar)</li>
            <li>Länken har redan använts</li>
            <li>Det finns ett tekniskt problem</li>
          </ul>
          
          {(error || message) && (
            <div className="p-3 bg-muted rounded-lg text-xs">
              <p className="font-medium text-muted-foreground mb-1">Teknisk information:</p>
              {error && <p className="font-mono text-destructive">Fel: {error}</p>}
              {message && <p className="font-mono text-muted-foreground break-words">Meddelande: {message}</p>}
            </div>
          )}
          
          <div className="pt-4 space-y-3">
            <Button asChild className="w-full">
              <Link href="/auth/login">
                Försök logga in igen
              </Link>
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Om problemet kvarstår, försök skapa ett nytt konto eller kontakta support.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthCodeErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}



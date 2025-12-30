"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthCodeErrorPage() {
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


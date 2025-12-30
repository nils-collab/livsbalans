"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-muted-foreground mb-4 max-w-md text-center">
        {error.message || "An unexpected error occurred"}
      </p>
      <pre className="bg-muted p-4 rounded mb-4 text-xs max-w-lg overflow-auto">
        {error.stack || error.toString()}
      </pre>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}




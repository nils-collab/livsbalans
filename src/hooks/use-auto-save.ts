import { useCallback, useEffect, useRef, useState } from "react";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<boolean>;
  debounceMs?: number;
  enabled?: boolean;
}

export function useAutoSave<T>({
  data,
  onSave,
  debounceMs = 1000,
  enabled = true,
}: UseAutoSaveOptions<T>) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>("");
  const isFirstRender = useRef(true);

  const save = useCallback(async (dataToSave: T) => {
    const serialized = JSON.stringify(dataToSave);
    
    // Don't save if data hasn't changed
    if (serialized === lastSavedRef.current) {
      return;
    }

    setStatus("saving");
    try {
      const success = await onSave(dataToSave);
      if (success) {
        lastSavedRef.current = serialized;
        setStatus("saved");
        // Reset to idle after 2 seconds
        setTimeout(() => setStatus("idle"), 2000);
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Auto-save error:", error);
      setStatus("error");
    }
  }, [onSave]);

  useEffect(() => {
    // Skip first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      lastSavedRef.current = JSON.stringify(data);
      return;
    }

    if (!enabled) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced save
    timeoutRef.current = setTimeout(() => {
      save(data);
    }, debounceMs);

    // Cleanup on unmount or data change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, save, debounceMs, enabled]);

  // Manual save function
  const saveNow = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    save(data);
  }, [data, save]);

  return { status, saveNow };
}

// Status indicator component helper
export function getSaveStatusText(status: SaveStatus): string {
  switch (status) {
    case "saving":
      return "Sparar...";
    case "saved":
      return "Sparat ✓";
    case "error":
      return "Fel vid sparning";
    default:
      return "";
  }
}

export function getSaveStatusColor(status: SaveStatus): string {
  switch (status) {
    case "saving":
      return "text-muted-foreground";
    case "saved":
      return "text-green-500";
    case "error":
      return "text-destructive";
    default:
      return "text-transparent";
  }
}


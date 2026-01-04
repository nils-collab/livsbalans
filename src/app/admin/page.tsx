"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DimensionKey, DIMENSIONS } from "@/types/dimensions";
import { Button } from "@/components/ui/button";
import { getQuestions, saveQuestion, getUserProfile } from "@/lib/api";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [questions, setQuestions] = useState<Record<DimensionKey, string>>({
    fysisk_halsa: "",
    mental_halsa: "",
    familj: "",
    vanner: "",
    boende: "",
    jobb: "",
  });
  const [selectedDimension, setSelectedDimension] = useState<DimensionKey>("fysisk_halsa");
  const { toast } = useToast();

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push("/auth/login");
        return;
      }

      const profile = await getUserProfile();
      if (!profile?.is_admin) {
        router.push("/");
        return;
      }

      setIsAdmin(true);
      const questionsData = await getQuestions();
      setQuestions(questionsData);
      setLoading(false);
    });
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    const success = await saveQuestion(selectedDimension, questions[selectedDimension]);
    setSaving(false);
    if (success) {
      toast({
        title: "Sparat",
        description: "Frågeställningar sparade!",
      });
    } else {
      toast({
        title: "Fel",
        description: "Fel vid sparning. Försök igen.",
        variant: "destructive",
      });
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    let allSuccess = true;
    for (const dim of DIMENSIONS) {
      const success = await saveQuestion(dim.key, questions[dim.key]);
      if (!success) allSuccess = false;
    }
    setSaving(false);
    if (allSuccess) {
      toast({
        title: "Sparat",
        description: "Alla frågeställningar sparade!",
      });
    } else {
      toast({
        title: "Delvis misslyckad",
        description: "Vissa frågeställningar kunde inte sparas. Försök igen.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-heading font-bold text-primary">Admin - Frågeställningar</h1>
        </div>

        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {DIMENSIONS.map((dim) => (
              <Button
                key={dim.key}
                variant={selectedDimension === dim.key ? "default" : "outline"}
                onClick={() => setSelectedDimension(dim.key)}
              >
                {dim.icon} {dim.label}
              </Button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Frågeställningar för{" "}
                {DIMENSIONS.find((d) => d.key === selectedDimension)?.label}
              </label>
              <textarea
                value={questions[selectedDimension]}
                onChange={(e) =>
                  setQuestions((prev) => ({
                    ...prev,
                    [selectedDimension]: e.target.value,
                  }))
                }
                placeholder="Skriv frågeställningar här. Varje rad blir en ny punkt..."
                className="w-full min-h-[300px] p-4 border border-border rounded-xl bg-card resize-none font-mono text-sm shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex gap-4">
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Sparar..." : "Spara denna dimension"}
              </Button>
              <Button variant="outline" onClick={handleSaveAll} disabled={saving}>
                {saving ? "Sparar..." : "Spara alla dimensioner"}
              </Button>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <h2 className="text-xl font-heading font-semibold mb-4">Förhandsgranska</h2>
            <div className="bg-card p-4 rounded-2xl whitespace-pre-line border border-border shadow-soft">
              {questions[selectedDimension] || "Inga frågeställningar ännu."}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}


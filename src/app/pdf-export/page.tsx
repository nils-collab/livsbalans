"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { DimensionKey, DIMENSIONS } from "@/types/dimensions";
import { Button } from "@/components/ui/button";
import { getScores, getCauses, getGoals, getTasks, DimensionTask, User } from "@/lib/api";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function PDFExportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [scores, setScores] = useState<Record<DimensionKey, number>>({
    fysisk_halsa: 5,
    mental_halsa: 5,
    familj: 5,
    vanner: 5,
    boende: 5,
    jobb: 5,
  });
  const [causes, setCauses] = useState<Record<DimensionKey, string>>({
    fysisk_halsa: "",
    mental_halsa: "",
    familj: "",
    vanner: "",
    boende: "",
    jobb: "",
  });
  const [goals, setGoals] = useState<Record<DimensionKey, string>>({
    fysisk_halsa: "",
    mental_halsa: "",
    familj: "",
    vanner: "",
    boende: "",
    jobb: "",
  });
  const [tasks, setTasks] = useState<Record<DimensionKey, DimensionTask[]>>({
    fysisk_halsa: [],
    mental_halsa: [],
    familj: [],
    vanner: [],
    boende: [],
    jobb: [],
  });
  const contentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push("/auth/login");
      } else {
        setUser(user);
        const [scoresData, causesData, goalsData, tasksData] = await Promise.all([
          getScores(),
          getCauses(),
          getGoals(),
          getTasks(),
        ]);
        setScores(scoresData);
        setCauses(causesData);
        setGoals(goalsData);
        setTasks(tasksData);
        setLoading(false);
      }
    });
  }, [router]);

  const generatePDF = async () => {
    if (!contentRef.current) return;

    setGenerating(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`livsbalans-${new Date().toISOString().split("T")[0]}.pdf`);
      toast({
        title: "PDF genererad",
        description: "Din PDF har laddats ner!",
      });
    } catch (error) {
      toast({
        title: "Fel",
        description: "Kunde inte generera PDF. Försök igen.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getColorForScore = (score: number) => {
    if (score >= 8) return "#22c55e";
    if (score >= 6) return "#84cc16";
    if (score >= 4) return "#eab308";
    if (score >= 2) return "#f59e0b";
    return "#ef4444";
  };

  const avgScore =
    Object.values(scores).reduce((a, b) => a + b, 0) / DIMENSIONS.length;

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-heading font-bold text-primary">Exportera till PDF</h1>
        </div>

        <div className="mb-6 bg-card p-6 rounded-2xl border border-border shadow-soft">
          <h2 className="text-xl font-heading font-semibold mb-4">Din Livsbalans-rapport</h2>
          <p className="text-muted-foreground mb-4">
            Ladda ner en PDF-rapport med din nuvarande livsbalansbedömning,
            orsaksanalyser, målbilder och handlingsplaner.
          </p>
          <Button onClick={generatePDF} disabled={generating} size="lg">
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Genererar PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Ladda ner PDF
              </>
            )}
          </Button>
        </div>

        {/* PDF Content - This will be converted to PDF */}
        <div
          ref={contentRef}
          className="bg-white text-black p-8 rounded-lg shadow-lg"
          style={{ minHeight: "auto" }}
        >
          {/* Header */}
          <div className="border-b-4 pb-4 mb-6" style={{ borderColor: "#125E6A" }}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#125E6A" }}>
                <span className="text-xl text-white font-bold">和</span>
              </div>
              <span className="text-2xl font-light" style={{ color: "#125E6A" }}>livsbalans.co</span>
            </div>
            <p className="text-gray-500 text-sm mt-2">
              Rapport genererad {new Date().toLocaleDateString("sv-SE")} •{" "}
              {user?.email}
            </p>
          </div>

          {/* Scores Overview */}
          <div className="mb-8">
            <h2 className="text-xl font-bold bg-gray-100 p-3 rounded mb-4">
              Nulägesbedömning (Snitt: {avgScore.toFixed(1)}/10)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {DIMENSIONS.map((dim) => (
                <div
                  key={dim.key}
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg"
                  style={{
                    borderLeft: `4px solid ${getColorForScore(scores[dim.key])}`,
                  }}
                >
                  <span className="text-2xl">{dim.icon}</span>
                  <div>
                    <p className="font-medium text-sm text-gray-600">
                      {dim.label}
                    </p>
                    <p
                      className="text-xl font-bold"
                      style={{ color: getColorForScore(scores[dim.key]) }}
                    >
                      {scores[dim.key]}/10
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dimension Details */}
          <div className="space-y-6">
            {DIMENSIONS.map((dim) => {
              const dimTasks = tasks[dim.key] || [];
              const hasCause = causes[dim.key]?.trim();
              const hasGoal = goals[dim.key]?.trim();
              const hasTasks = dimTasks.filter((t) => t.text?.trim()).length > 0;

              if (!hasCause && !hasGoal && !hasTasks) return null;

              return (
                <div
                  key={dim.key}
                  className="bg-gray-50 p-4 rounded-lg"
                  style={{ pageBreakInside: "avoid" }}
                >
                  <h3 className="font-bold text-lg flex items-center gap-2 mb-3 text-gray-800">
                    <span>{dim.icon}</span>
                    {dim.label} ({scores[dim.key]}/10)
                  </h3>

                  {hasCause && (
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-gray-500 mb-1">
                        Orsaker:
                      </p>
                      <p className="text-sm text-gray-700 whitespace-pre-line">
                        {causes[dim.key]}
                      </p>
                    </div>
                  )}

                  {hasGoal && (
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-gray-500 mb-1">
                        Målbild:
                      </p>
                      <p className="text-sm text-gray-700 whitespace-pre-line">
                        {goals[dim.key]}
                      </p>
                    </div>
                  )}

                  {hasTasks && (
                    <div>
                      <p className="text-sm font-semibold text-gray-500 mb-2">
                        Handlingsplan:
                      </p>
                      <ul className="space-y-2">
                        {dimTasks
                          .filter((t) => t.text?.trim())
                          .map((task) => (
                            <li
                              key={task.id}
                              className="flex items-center gap-2 text-sm"
                            >
                              <span
                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                style={{
                                  backgroundColor:
                                    task.priority === 1
                                      ? "#ef4444"
                                      : task.priority === 2
                                      ? "#eab308"
                                      : "#22c55e",
                                }}
                              >
                                {task.priority}
                              </span>
                              <span
                                className={`text-gray-700 ${
                                  task.completed ? "line-through" : ""
                                }`}
                              >
                                {task.text}
                              </span>
                              {task.due_date && (
                                <span className="text-gray-400 text-xs">
                                  ({task.due_date})
                                </span>
                              )}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t text-center text-gray-400 text-xs">
            Livsbalans - Verktyg för personlig utveckling och livsbalans
          </div>
        </div>
      </div>
    </main>
  );
}

"use client";

import React from "react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadarChart, TaskCard, AddTaskModal } from "@/components/life-balance";
import type { TaskType as CardTaskType } from "@/components/life-balance/TaskCard";
import { DimensionKey, DIMENSIONS } from "@/types/dimensions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  getScores,
  saveScore,
  getCauses,
  saveCause,
  getGoals,
  saveGoal,
  getTasks,
  saveTask,
  deleteTask,
  getQuestions,
  getUserProfile,
  getFocusDimensions,
  setFocusDimension,
  DimensionTask,
  TaskType,
} from "@/lib/api";
import {
  useAutoSave,
  SaveStatus,
} from "@/hooks/use-auto-save";
import { Header } from "@/components/layout";
import { Plus, Download, Loader2, Play, Square, RefreshCw, Star, Lightbulb, ChevronRight, ChevronLeft, Info, Sparkles, CalendarPlus } from "lucide-react";
import { CAUSE_QUESTIONS } from "@/lib/cause-questions";
import { OnboardingGuide } from "@/components/OnboardingGuide";

// Task type icons for overview
const TASK_TYPE_ICONS: Record<string, { icon: typeof Play; color: string }> = {
  borja: { icon: Play, color: "#22c55e" },
  sluta: { icon: Square, color: "#ef4444" },
  fortsatta: { icon: RefreshCw, color: "#3b82f6" },
};

function DimensionSliders({
  scores,
  focusDimensions,
  onScoreChange,
  onToggleFocus,
}: {
  scores: Record<DimensionKey, number>;
  focusDimensions: DimensionKey[];
  onScoreChange: (dim: DimensionKey, score: number) => void;
  onToggleFocus: (dim: DimensionKey, e: React.MouseEvent) => void;
}) {
  const [expandedInfo, setExpandedInfo] = useState<DimensionKey | null>(null);

  return (
    <div className="space-y-4">
      {DIMENSIONS.map((dim) => {
        const isFocus = focusDimensions.includes(dim.key);
        const canAddFocus = focusDimensions.length < 2;
        const showInfo = expandedInfo === dim.key;
        return (
          <div key={dim.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <span>{dim.icon}</span>
                {dim.label}
                <button
                  onClick={() => setExpandedInfo(showInfo ? null : dim.key)}
                  className="p-0.5 rounded-full transition-colors hover:bg-muted"
                  aria-label={`Info om ${dim.label}`}
                >
                  <Info className={`h-3.5 w-3.5 transition-colors ${showInfo ? "text-primary" : "text-muted-foreground/40"}`} />
                </button>
                {isFocus && (
                  <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                    Fokus
                  </span>
                )}
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => onToggleFocus(dim.key, e)}
                  className="p-1 rounded-full transition-colors"
                  title={isFocus ? "Ta bort fokus" : canAddFocus ? "Markera som fokus" : "Max 2 fokusområden"}
                  disabled={!isFocus && !canAddFocus}
                >
                  <Star
                    className={`h-4 w-4 transition-colors ${
                      isFocus
                        ? "text-yellow-500 fill-yellow-500"
                        : canAddFocus
                          ? "text-muted-foreground/40 hover:text-yellow-500"
                          : "text-muted-foreground/20"
                    }`}
                  />
                </button>
                <span className="text-sm font-bold">{scores[dim.key]}/10</span>
              </div>
            </div>
            {showInfo && (
              <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                {dim.description}
              </p>
            )}
            <input
              type="range"
              min="1"
              max="10"
              value={scores[dim.key]}
              onChange={(e) => onScoreChange(dim.key, parseInt(e.target.value))}
              className="w-full h-2 bg-primary/20 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        );
      })}
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
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
  const [questions, setQuestions] = useState<Record<DimensionKey, string>>({
    fysisk_halsa: "",
    mental_halsa: "",
    familj: "",
    vanner: "",
    boende: "",
    jobb: "",
  });
  const [selectedDimension, setSelectedDimension] = useState<DimensionKey>("fysisk_halsa");
  const [activeTab, setActiveTab] = useState<"nulage" | "orsaker" | "mal" | "oversikt">("nulage");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [focusDimensions, setFocusDimensions] = useState<DimensionKey[]>([]);
  const [scoreChangeCount, setScoreChangeCount] = useState(0);
  const pdfContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push("/auth/login");
      } else {
        setUser(user);
        // Load all user data
        const [scoresData, causesData, goalsData, tasksData, questionsData, profile, focusData] =
          await Promise.all([
            getScores(),
            getCauses(),
            getGoals(),
            getTasks(),
            getQuestions(),
            getUserProfile(),
            getFocusDimensions(),
          ]);
        setScores(scoresData);
        setCauses(causesData);
        setGoals(goalsData);
        setFocusDimensions(focusData);
        setTasks(tasksData);
        setQuestions(questionsData);
        setIsAdmin(profile?.is_admin || false);
        setLoading(false);
      }
    });
  }, [router]);

  // Scroll to top when changing tabs
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [activeTab]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const handleScoreChange = async (dimension: DimensionKey, score: number) => {
    setScores((prev) => ({ ...prev, [dimension]: score }));
    setScoreChangeCount((prev) => prev + 1);
    setSaveStatus("saving");
    const success = await saveScore(dimension, score);
    setSaveStatus(success ? "saved" : "error");
    if (success) {
      setTimeout(() => setSaveStatus("idle"), 2000);
    }
  };

  const handleCauseChange = async (dimension: DimensionKey, value: string) => {
    setCauses((prev) => ({ ...prev, [dimension]: value }));
  };

  const handleCauseSave = async (dimension: DimensionKey) => {
    setSaveStatus("saving");
    const success = await saveCause(dimension, causes[dimension]);
    setSaveStatus(success ? "saved" : "error");
    if (success) {
      setTimeout(() => setSaveStatus("idle"), 2000);
    }
  };

  const handleGoalChange = async (dimension: DimensionKey, value: string) => {
    setGoals((prev) => ({ ...prev, [dimension]: value }));
  };

  const handleGoalSave = async (dimension: DimensionKey) => {
    setSaveStatus("saving");
    const success = await saveGoal(dimension, goals[dimension]);
    setSaveStatus(success ? "saved" : "error");
    if (success) {
      setTimeout(() => setSaveStatus("idle"), 2000);
    }
  };

  const handleShare = async () => {
    const url = window.location.origin;
    try {
      await navigator.clipboard.writeText(url);
      alert("Länk kopierad till urklipp!");
    } catch {
      prompt("Kopiera länken:", url);
    }
  };

  const generatePDF = async () => {
    if (!pdfContentRef.current) return;

    setGeneratingPDF(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const canvas = await html2canvas(pdfContentRef.current, {
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

      const imgWidth = 210;
      const pageHeight = 297;
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
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Kunde inte generera PDF. Försök igen.");
    } finally {
      setGeneratingPDF(false);
    }
  };

  const getColorForScore = (score: number) => {
    if (score >= 8) return "#22c55e";
    if (score >= 6) return "#84cc16";
    if (score >= 4) return "#eab308";
    if (score >= 2) return "#f59e0b";
    return "#ef4444";
  };

  const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) / DIMENSIONS.length;

  const handleDimensionClick = (dimension: DimensionKey) => {
    setSelectedDimension(dimension);
    setActiveTab("orsaker");
  };

  const handleToggleFocus = async (dimension: DimensionKey, e: React.MouseEvent) => {
    e.stopPropagation(); // Don't trigger dimension click
    const isFocus = focusDimensions.includes(dimension);
    
    if (!isFocus && focusDimensions.length >= 2) {
      // Already have 2 focus dimensions, need to remove one first
      return;
    }
    
    const success = await setFocusDimension(dimension, !isFocus);
    if (success) {
      if (isFocus) {
        setFocusDimensions(focusDimensions.filter(d => d !== dimension));
      } else {
        setFocusDimensions([...focusDimensions, dimension]);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header skeleton */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
          <div className="container mx-auto px-4 h-14 flex items-center justify-between max-w-4xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-muted animate-pulse" />
              <div className="h-5 w-28 bg-muted rounded animate-pulse" />
            </div>
            <div className="w-10 h-10 bg-muted rounded animate-pulse" />
          </div>
        </div>

        {/* Tab bar skeleton */}
        <div className="sticky top-14 z-40 bg-background/95 backdrop-blur border-b border-border">
          <div className="container mx-auto px-4 py-2 max-w-4xl">
            <div className="grid grid-cols-4 gap-2 h-10 p-1 bg-muted rounded-xl">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`rounded-lg ${i === 1 ? 'bg-white' : 'bg-transparent'}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Content skeleton */}
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          {/* Radar chart placeholder */}
          <div className="flex justify-center mb-6">
            <div className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] rounded-full bg-muted/50 animate-pulse flex items-center justify-center">
              <div className="w-3/4 h-3/4 rounded-full bg-muted/30" />
            </div>
          </div>

          {/* Dimension sliders skeleton */}
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-12 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-2 w-full bg-muted rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Onboarding Guide - shows on first login */}
      <OnboardingGuide />

      {/* Sticky Header */}
      <Header
        isAdmin={isAdmin}
        onShare={handleShare}
        onLogout={handleLogout}
        onLogoClick={() => setActiveTab("nulage")}
      />

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as any)}
        className="flex flex-col"
      >
        {/* Sticky Tabs */}
        <div className="sticky top-14 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
          <div className="container mx-auto px-4 py-2 max-w-4xl">
            <TabsList className="grid w-full grid-cols-4 h-10 p-1 bg-muted rounded-xl">
              <TabsTrigger 
                value="nulage"
                className="h-full text-xs sm:text-sm font-medium text-muted-foreground data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg transition-all"
              >
                Nuläge
              </TabsTrigger>
              <TabsTrigger 
                value="orsaker"
                className="h-full text-xs sm:text-sm font-medium text-muted-foreground data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg transition-all"
              >
                Orsaker
              </TabsTrigger>
              <TabsTrigger 
                value="mal"
                className="h-full text-xs sm:text-sm font-medium text-muted-foreground data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg transition-all"
              >
                Plan
              </TabsTrigger>
              <TabsTrigger 
                value="oversikt"
                className="h-full text-xs sm:text-sm font-medium text-muted-foreground data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg transition-all"
              >
                Översikt
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-4 pb-8 max-w-4xl flex-1">
          <TabsContent value="nulage" className="space-y-6 mt-0">
            <div className="flex flex-col items-center">
              <RadarChart
                scores={scores}
                onDimensionClick={handleDimensionClick}
                onScoreChange={handleScoreChange}
                size={400}
              />
            </div>

            <DimensionSliders
              scores={scores}
              focusDimensions={focusDimensions}
              onScoreChange={handleScoreChange}
              onToggleFocus={handleToggleFocus}
            />

            {/* Bottom nudge for Nuläge */}
            <div className="mt-6">
              {focusDimensions.length === 0 ? (
                <ClickableNudge showArrow={false}>
                  Välj 1-2 fokusområden genom att klicka på ⭐ ovan
                </ClickableNudge>
              ) : (
                <ClickableNudge onClick={() => setActiveTab("orsaker")}>
                  Bra fokus! Reflektera nu över orsakerna
                </ClickableNudge>
              )}
            </div>
          </TabsContent>

          <TabsContent value="orsaker">
            <OrsakerView
              selectedDimension={selectedDimension}
              scores={scores}
              causes={causes}
              questions={questions}
              focusDimensions={focusDimensions}
              onDimensionChange={setSelectedDimension}
              onCauseChange={handleCauseChange}
              onCauseSave={handleCauseSave}
              onNavigateToPlan={() => setActiveTab("mal")}
            />
          </TabsContent>

          <TabsContent value="mal">
            <MalPlanView
              selectedDimension={selectedDimension}
              scores={scores}
              goals={goals}
              tasks={tasks}
              focusDimensions={focusDimensions}
              onDimensionChange={setSelectedDimension}
              onGoalChange={handleGoalChange}
              onGoalSave={handleGoalSave}
              setTasks={setTasks}
              saveStatus={saveStatus}
              setSaveStatus={setSaveStatus}
              onNavigateToOversikt={() => setActiveTab("oversikt")}
            />
          </TabsContent>

          <TabsContent value="oversikt" className="space-y-4 mt-0">
            <OversiktView
              scores={scores}
              causes={causes}
              goals={goals}
              tasks={tasks}
              focusDimensions={focusDimensions}
              avgScore={avgScore}
              onNavigateToPlan={(dimKey) => {
                setSelectedDimension(dimKey);
                setActiveTab("mal");
              }}
              onNavigateToNulage={() => setActiveTab("nulage")}
              pdfContentRef={pdfContentRef}
              onGeneratePDF={generatePDF}
              generatingPDF={generatingPDF}
            />
          </TabsContent>
        </div>
      </Tabs>
    </main>
  );
}

function OrsakerView({
  selectedDimension,
  scores,
  causes,
  questions,
  focusDimensions,
  onDimensionChange,
  onCauseChange,
  onCauseSave,
  onNavigateToPlan,
}: {
  selectedDimension: DimensionKey;
  scores: Record<DimensionKey, number>;
  causes: Record<DimensionKey, string>;
  questions: Record<DimensionKey, string>;
  focusDimensions: DimensionKey[];
  onDimensionChange: (dim: DimensionKey) => void;
  onCauseChange: (dim: DimensionKey, value: string) => void;
  onCauseSave: (dim: DimensionKey) => void;
  onNavigateToPlan: () => void;
}) {
  const dimension = DIMENSIONS.find((d) => d.key === selectedDimension)!;
  const [isExpanded, setIsExpanded] = useState(true);
  const [aiMode, setAiMode] = useState(false);
  const [aiStep, setAiStep] = useState(0);
  const [aiAnswers, setAiAnswers] = useState<Record<number, string>>({});
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  const causeQuestions = CAUSE_QUESTIONS[selectedDimension] || [];

  // Sort dimensions with focus first
  const sortedDimensions = [...DIMENSIONS].sort((a, b) => {
    const aIsFocus = focusDimensions.includes(a.key);
    const bIsFocus = focusDimensions.includes(b.key);
    if (aIsFocus && !bIsFocus) return -1;
    if (!aIsFocus && bIsFocus) return 1;
    return 0;
  });

  // Reset AI state when dimension changes
  useEffect(() => {
    setAiMode(false);
    setAiStep(0);
    setAiAnswers({});
    setAiSuggestion(null);
  }, [selectedDimension]);

  const { status } = useAutoSave({
    data: causes[selectedDimension],
    onSave: async () => {
      await onCauseSave(selectedDimension);
      return true;
    },
    debounceMs: 1500,
  });

  const handleAiGenerate = async (finalAnswers?: Record<number, string>) => {
    setAiLoading(true);
    try {
      const answersToUse = finalAnswers || aiAnswers;
      const answers = causeQuestions.map((q, i) => ({
        question: q.question,
        answer: answersToUse[i] || "Ej besvarat",
      }));

      const res = await fetch("/api/analyze-causes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dimension: selectedDimension,
          dimensionLabel: dimension.label,
          score: scores[selectedDimension],
          answers,
        }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setAiSuggestion(data.analysis);
    } catch {
      setAiSuggestion("Kunde inte generera analys. Försök igen eller skriv själv.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAcceptSuggestion = () => {
    if (aiSuggestion) {
      const existing = causes[selectedDimension]?.trim();
      const newText = existing ? `${existing}\n\n${aiSuggestion}` : aiSuggestion;
      onCauseChange(selectedDimension, newText);
    }
    setAiMode(false);
    setAiStep(0);
    setAiAnswers({});
    setAiSuggestion(null);
  };

  // Check if the selected dimension has causes
  const hasCauses = causes[selectedDimension]?.trim();

  // Check if ALL focus dimensions have causes (for nudge logic)
  const focusDimensionsWithCauses = focusDimensions.filter(dim => causes[dim]?.trim());
  const allFocusHaveCauses = focusDimensions.length > 0 && focusDimensionsWithCauses.length === focusDimensions.length;
  const missingCausesCount = focusDimensions.length - focusDimensionsWithCauses.length;

  return (
    <div className="space-y-6">
      {/* Dimension selector */}
      <div>
        <label className="text-sm font-medium mb-2 block">Välj dimension:</label>
        <Select
          value={selectedDimension}
          onValueChange={(value) => onDimensionChange(value as DimensionKey)}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {focusDimensions.includes(selectedDimension) && "⭐ "}
              {dimension.icon} {dimension.label} ({scores[selectedDimension]}/10)
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {sortedDimensions.map((dim) => (
              <SelectItem key={dim.key} value={dim.key}>
                {focusDimensions.includes(dim.key) && "⭐ "}
                {dim.icon} {dim.label} ({scores[dim.key]}/10)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* AI-assisted flow */}
      {aiMode ? (
        <div className="space-y-4">
          {aiSuggestion ? (
            /* AI suggestion result */
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="h-4 w-4 text-primary" />
                AI-förslag på orsaksanalys
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm whitespace-pre-line">
                {aiSuggestion}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleAcceptSuggestion}
                  className="flex-1"
                  size="sm"
                >
                  Använd förslaget
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setAiMode(false);
                    setAiSuggestion(null);
                    setAiStep(0);
                    setAiAnswers({});
                  }}
                  size="sm"
                >
                  Avbryt
                </Button>
              </div>
            </div>
          ) : aiLoading ? (
            /* Loading state */
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Analyserar dina svar...</p>
            </div>
          ) : (
            /* Question steps */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Fråga {aiStep + 1} av {causeQuestions.length}
                </span>
                <button
                  onClick={() => {
                    setAiMode(false);
                    setAiStep(0);
                    setAiAnswers({});
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Avbryt
                </button>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${((aiStep + 1) / causeQuestions.length) * 100}%` }}
                />
              </div>

              <p className="font-medium text-base">
                {causeQuestions[aiStep]?.question}
              </p>

              <div className="space-y-2">
                {causeQuestions[aiStep]?.options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const newAnswers = { ...aiAnswers, [aiStep]: option };
                      setAiAnswers(newAnswers);

                      if (aiStep < causeQuestions.length - 1) {
                        setAiStep(aiStep + 1);
                      } else {
                        // Last question answered - generate with final answers
                        handleAiGenerate(newAnswers);
                      }
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-colors text-sm ${
                      aiAnswers[aiStep] === option
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {aiStep > 0 && (
                <button
                  onClick={() => setAiStep(aiStep - 1)}
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <ChevronLeft className="h-3 w-3" /> Föregående fråga
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Normal cause editing view */
        <div className="space-y-4">
          {/* Existing questions section */}
          <div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="font-semibold mb-2 flex items-center gap-2 w-full text-left"
            >
              <span
                className={`transition-transform ${isExpanded ? "rotate-90" : ""}`}
              >
                ▶
              </span>
              Frågeställningar om {dimension.label.toLowerCase()}
            </button>
            {isExpanded && (
              <div className="bg-card p-4 rounded-2xl text-sm whitespace-pre-line shadow-soft border border-border">
                {questions[selectedDimension] || "Inga frågeställningar ännu."}
              </div>
            )}
          </div>

          {/* AI help button */}
          {!hasCauses && (
            <button
              onClick={() => setAiMode(true)}
              className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Behöver du hjälp att komma igång?</p>
                <p className="text-xs text-muted-foreground">Svara på några frågor så hjälper AI dig formulera orsakerna</p>
              </div>
            </button>
          )}

          {/* Causes textarea */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="causes" className="text-sm font-medium">
                Orsaker
              </label>
              {hasCauses && (
                <button
                  onClick={() => setAiMode(true)}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3" /> AI-hjälp
                </button>
              )}
            </div>
            <textarea
              id="causes"
              value={causes[selectedDimension]}
              onChange={(e) => onCauseChange(selectedDimension, e.target.value)}
              placeholder="Skriv ditt svar här..."
              className="w-full min-h-[200px] p-4 border border-border rounded-xl bg-card resize-none shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      )}

      {/* Bottom nudge */}
      {!aiMode && (
        <div className="mt-6">
          {allFocusHaveCauses ? (
            <ClickableNudge onClick={onNavigateToPlan}>
              Dags att sätta mål och plan
            </ClickableNudge>
          ) : hasCauses && missingCausesCount > 0 ? (
            <ClickableNudge showArrow={false}>
              Bra! Reflektera nu över orsaker för {missingCausesCount === 1 ? "ditt andra fokusområde" : "dina andra fokusområden"}
            </ClickableNudge>
          ) : (
            <ClickableNudge showArrow={false}>
              Vad ligger bakom din bedömning? Reflektera ovan
            </ClickableNudge>
          )}
        </div>
      )}
    </div>
  );
}

function MalPlanView({
  selectedDimension,
  scores,
  goals,
  tasks,
  focusDimensions,
  onDimensionChange,
  onGoalChange,
  onGoalSave,
  setTasks,
  saveStatus,
  setSaveStatus,
  onNavigateToOversikt,
}: {
  selectedDimension: DimensionKey;
  scores: Record<DimensionKey, number>;
  goals: Record<DimensionKey, string>;
  tasks: Record<DimensionKey, DimensionTask[]>;
  focusDimensions: DimensionKey[];
  onDimensionChange: (dim: DimensionKey) => void;
  onGoalChange: (dim: DimensionKey, value: string) => void;
  onGoalSave: (dim: DimensionKey) => void;
  setTasks: React.Dispatch<React.SetStateAction<Record<DimensionKey, DimensionTask[]>>>;
  saveStatus: SaveStatus;
  setSaveStatus: (status: SaveStatus) => void;
  onNavigateToOversikt: () => void;
}) {
  const dimension = DIMENSIONS.find((d) => d.key === selectedDimension)!;
  const dimensionTasks = tasks[selectedDimension] || [];
  
  // Sort dimensions with focus first
  const sortedDimensions = [...DIMENSIONS].sort((a, b) => {
    const aIsFocus = focusDimensions.includes(a.key);
    const bIsFocus = focusDimensions.includes(b.key);
    if (aIsFocus && !bIsFocus) return -1;
    if (!aIsFocus && bIsFocus) return 1;
    return 0;
  });

  // Auto-save for goals
  useAutoSave({
    data: goals[selectedDimension],
    onSave: async () => {
      await onGoalSave(selectedDimension);
      return true;
    },
    debounceMs: 1500,
  });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<{
    id: string;
    taskType: CardTaskType;
    text: string;
    priority: 1 | 2 | 3;
  } | null>(null);

  // Reset modal when dimension changes
  useEffect(() => {
    setIsModalOpen(false);
    setEditingTask(null);
  }, [selectedDimension]);

  const handleOpenAddModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: DimensionTask) => {
    setEditingTask({
      id: task.id,
      taskType: task.task_type as CardTaskType,
      text: task.text,
      priority: task.priority,
    });
    setIsModalOpen(true);
  };

  const handleSaveTask = async (taskData: { taskType: CardTaskType; text: string; priority: 1 | 2 | 3 }) => {
    setSaveStatus("saving");
    
    if (editingTask) {
      // Update existing task
      const updatedTask = await saveTask({
        id: editingTask.id,
        dimension: selectedDimension,
        task_type: taskData.taskType as TaskType,
        text: taskData.text,
        priority: taskData.priority,
      });
      
      if (updatedTask) {
        setTasks((prev) => ({
          ...prev,
          [selectedDimension]: prev[selectedDimension].map((t) =>
            t.id === editingTask.id ? updatedTask : t
          ),
        }));
        setSaveStatus("saved");
        setIsModalOpen(false);
        setEditingTask(null);
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        setSaveStatus("error");
      }
    } else {
      // Create new task
      const newTask = await saveTask({
        dimension: selectedDimension,
        task_type: taskData.taskType as TaskType,
        text: taskData.text,
        priority: taskData.priority,
      });
      
      if (newTask) {
        setTasks((prev) => ({
          ...prev,
          [selectedDimension]: [...prev[selectedDimension], newTask],
        }));
        setSaveStatus("saved");
        setIsModalOpen(false);
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        setSaveStatus("error");
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Är du säker på att du vill ta bort denna uppgift?")) {
      return;
    }
    
    const success = await deleteTask(taskId);
    if (success) {
      setTasks((prev) => ({
        ...prev,
        [selectedDimension]: prev[selectedDimension].filter((t) => t.id !== taskId),
      }));
    }
  };

  // Check nudge conditions for selected dimension
  const hasGoal = goals[selectedDimension]?.trim();
  const hasTasks = dimensionTasks.length > 0;
  
  // Check if ALL focus dimensions have goals and tasks (for nudge logic)
  const focusDimensionsComplete = focusDimensions.filter(dim => {
    const dimGoal = goals[dim]?.trim();
    const dimTasks = (tasks[dim] || []).filter(t => t.text?.trim());
    return dimGoal && dimTasks.length > 0;
  });
  const allFocusComplete = focusDimensions.length > 0 && focusDimensionsComplete.length === focusDimensions.length;
  const missingPlanCount = focusDimensions.length - focusDimensionsComplete.length;

  return (
    <div className="space-y-6">
      {/* Dimension selector */}
      <div>
        <label className="text-sm font-medium mb-2 block">Välj dimension:</label>
        <Select
          value={selectedDimension}
          onValueChange={(value) => onDimensionChange(value as DimensionKey)}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {focusDimensions.includes(selectedDimension) && "⭐ "}
              {dimension.icon} {dimension.label} ({scores[selectedDimension]}/10)
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {sortedDimensions.map((dim) => (
              <SelectItem key={dim.key} value={dim.key}>
                {focusDimensions.includes(dim.key) && "⭐ "}
                {dim.icon} {dim.label} ({scores[dim.key]}/10)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Goal section */}
      <div>
        <label htmlFor="goal" className="text-sm font-medium mb-2 block">
          Målbild för {dimension.label.toLowerCase()}
        </label>
        <textarea
          id="goal"
          value={goals[selectedDimension]}
          onChange={(e) => onGoalChange(selectedDimension, e.target.value)}
          placeholder="Beskriv din målbild..."
          className="w-full h-[4.5rem] p-3 border border-border rounded-xl bg-card resize-none shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm overflow-y-auto"
        />
      </div>

      {/* Tasks section */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Handlingsplan</h3>
        
        {/* Task list */}
        {dimensionTasks.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground border border-dashed border-border rounded-xl bg-card/30">
            <p className="text-sm">Inga aktiviteter ännu.</p>
            <p className="text-xs mt-1">Lägg till din första aktivitet nedan.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {[...dimensionTasks]
              .sort((a, b) => a.priority - b.priority)
              .map((task) => (
                <TaskCard
                  key={task.id}
                  id={task.id}
                  taskType={task.task_type as CardTaskType}
                  text={task.text}
                  priority={task.priority}
                  onEdit={() => handleEditTask(task)}
                  onDelete={() => handleDeleteTask(task.id)}
                />
              ))}
          </div>
        )}

        {/* Add activity button */}
        <Button
          onClick={handleOpenAddModal}
          className="w-full h-12 text-base font-medium"
          size="lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Lägg till aktivitet
        </Button>
      </div>

      {/* Add/Edit Task Modal */}
      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        editTask={editingTask}
        isSaving={saveStatus === "saving"}
      />

      {/* Bottom nudge */}
      <div className="mt-6">
        {allFocusComplete ? (
          <ClickableNudge onClick={onNavigateToOversikt}>
            Snyggt! Se hela bilden i Översikten
          </ClickableNudge>
        ) : hasGoal && hasTasks && missingPlanCount > 0 ? (
          <ClickableNudge showArrow={false}>
            Bra! Skapa nu plan för {missingPlanCount === 1 ? "ditt andra fokusområde" : "dina andra fokusområden"}
          </ClickableNudge>
        ) : !hasGoal ? (
          <ClickableNudge showArrow={false}>
            Skapa en målbild för ditt fokusområde ovan
          </ClickableNudge>
        ) : (
          <ClickableNudge showArrow={false}>
            Lägg till aktiviteter för att nå din målbild
          </ClickableNudge>
        )}
      </div>
    </div>
  );
}

// Clickable nudge component for guiding users forward
function ClickableNudge({ 
  children, 
  onClick,
  showArrow = true,
}: { 
  children: React.ReactNode;
  onClick?: () => void;
  showArrow?: boolean;
}) {
  const isClickable = !!onClick;
  
  return (
    <button
      onClick={onClick}
      disabled={!isClickable}
      className={`w-full bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center gap-3 text-left transition-all ${
        isClickable 
          ? "cursor-pointer hover:from-amber-100 hover:to-yellow-100 dark:hover:from-amber-900/40 dark:hover:to-yellow-900/40 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-md active:scale-[0.99]" 
          : "cursor-default"
      }`}
    >
      <Lightbulb className="h-5 w-5 text-amber-500 flex-shrink-0" />
      <div className="flex-1 text-sm text-amber-900 dark:text-amber-100 font-medium">
        {children}
      </div>
      {isClickable && showArrow && (
        <ChevronRight className="h-5 w-5 text-amber-500 flex-shrink-0" />
      )}
    </button>
  );
}

// Collapsible section component
function CollapsibleSection({ 
  title, 
  icon, 
  defaultOpen = false,
  children 
}: { 
  title: string; 
  icon: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
      >
        <span className="font-semibold flex items-center gap-2">
          {icon} {title}
        </span>
        <span className={`transition-transform ${isOpen ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );
}

function CalendarReminderButton() {
  const [showOptions, setShowOptions] = useState(false);

  const createGoogleCalendarUrl = (frequency: "weekly" | "biweekly" | "monthly") => {
    const title = encodeURIComponent("Livsbalans - Reflektion");
    const details = encodeURIComponent(
      "Dags att reflektera över din livsbalans! Gå in på livsbalans.co och uppdatera din bedömning.\n\nTips: Ta 10 minuter och gå igenom dina fokusområden."
    );
    const location = encodeURIComponent("https://livsbalans.co");

    // Start next Monday at 09:00
    const now = new Date();
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7 || 7));
    nextMonday.setHours(9, 0, 0, 0);
    const endTime = new Date(nextMonday);
    endTime.setMinutes(endTime.getMinutes() + 30);

    const formatDate = (d: Date) =>
      d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

    const dates = `${formatDate(nextMonday)}/${formatDate(endTime)}`;

    let recur = "";
    if (frequency === "weekly") recur = "&recur=RRULE:FREQ=WEEKLY;BYDAY=MO";
    else if (frequency === "biweekly") recur = "&recur=RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=MO";
    else if (frequency === "monthly") recur = "&recur=RRULE:FREQ=MONTHLY;BYDAY=1MO";

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}${recur}`;
  };

  if (showOptions) {
    return (
      <div className="w-full max-w-xs space-y-2">
        <p className="text-xs text-muted-foreground text-center mb-2">Hur ofta vill du bli påmind?</p>
        {[
          { label: "Varje vecka", value: "weekly" as const },
          { label: "Varannan vecka", value: "biweekly" as const },
          { label: "En gång i månaden", value: "monthly" as const },
        ].map((opt) => (
          <a
            key={opt.value}
            href={createGoogleCalendarUrl(opt.value)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full p-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
          >
            <CalendarPlus className="h-4 w-4 text-primary" />
            {opt.label}
          </a>
        ))}
        <button
          onClick={() => setShowOptions(false)}
          className="text-xs text-muted-foreground hover:text-foreground w-full text-center mt-1"
        >
          Avbryt
        </button>
      </div>
    );
  }

  return (
    <Button variant="outline" onClick={() => setShowOptions(true)}>
      <CalendarPlus className="h-4 w-4 mr-2" />
      Lägg till påminnelse i kalendern
    </Button>
  );
}

function OversiktView({
  scores,
  causes,
  goals,
  tasks,
  focusDimensions,
  avgScore,
  onNavigateToPlan,
  onNavigateToNulage,
  pdfContentRef,
  onGeneratePDF,
  generatingPDF,
}: {
  scores: Record<DimensionKey, number>;
  causes: Record<DimensionKey, string>;
  goals: Record<DimensionKey, string>;
  tasks: Record<DimensionKey, DimensionTask[]>;
  focusDimensions: DimensionKey[];
  avgScore: number;
  onNavigateToPlan: (dim: DimensionKey) => void;
  onNavigateToNulage: () => void;
  pdfContentRef: React.RefObject<HTMLDivElement | null>;
  onGeneratePDF: () => void;
  generatingPDF: boolean;
}) {
  // Get non-focus dimensions that have content
  const otherDimensionsWithContent = DIMENSIONS.filter(dim => {
    if (focusDimensions.includes(dim.key)) return false;
    const dimTasks = tasks[dim.key] || [];
    return causes[dim.key]?.trim() || goals[dim.key]?.trim() || dimTasks.filter(t => t.text?.trim()).length > 0;
  });

  const getColorForScore = (score: number) => {
    if (score >= 8) return "#22c55e";
    if (score >= 6) return "#84cc16";
    if (score >= 4) return "#eab308";
    if (score >= 2) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="space-y-4">
      {/* Focus Areas - Full Detail */}
      {focusDimensions.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-heading font-semibold flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            Dina fokusområden
          </h2>
          
          {focusDimensions.map((dimKey) => {
            const dim = DIMENSIONS.find(d => d.key === dimKey);
            if (!dim) return null;
            const dimTasks = (tasks[dimKey] || []).filter(t => t.text?.trim()).sort((a, b) => a.priority - b.priority);
            const hasGoal = goals[dimKey]?.trim();
            
            return (
              <div 
                key={dimKey} 
                className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-2xl border border-primary/20 space-y-3"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{dim.icon}</span>
                    <div>
                      <p className="font-semibold">{dim.label}</p>
                      <p className="text-sm" style={{ color: getColorForScore(scores[dimKey]) }}>
                        {scores[dimKey]}/10
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onNavigateToPlan(dimKey)}
                    className="text-primary"
                  >
                    Redigera →
                  </Button>
                </div>
                
                {/* Goal */}
                {hasGoal && (
                  <div className="bg-background/60 p-3 rounded-xl">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Målbild</p>
                    <p className="text-sm">{goals[dimKey]}</p>
                  </div>
                )}
                
                {/* Tasks */}
                {dimTasks.length > 0 ? (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Handlingsplan</p>
                    <ul className="space-y-2">
                      {dimTasks.map((task) => {
                        const typeConfig = TASK_TYPE_ICONS[task.task_type] || TASK_TYPE_ICONS.borja;
                        const TypeIcon = typeConfig.icon;
                        return (
                          <li key={task.id} className="flex items-center gap-2 text-sm bg-background/60 p-2 rounded-lg">
                            <span
                              className="w-5 h-5 rounded-full flex-shrink-0"
                              style={{
                                backgroundColor: task.priority === 1 ? "#125E6A" : task.priority === 2 ? "#4A8A8F" : "#A5C5C8",
                                color: task.priority === 3 ? "#1a1a1a" : "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "11px",
                                fontWeight: "bold",
                                lineHeight: 1,
                              }}
                            >
                              {task.priority}
                            </span>
                            <span className="flex-1">{task.text}</span>
                            <TypeIcon className="h-4 w-4 flex-shrink-0" style={{ color: typeConfig.color }} />
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Inga aktiviteter ännu. <button onClick={() => onNavigateToPlan(dimKey)} className="text-primary underline">Lägg till →</button>
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-muted/50 p-6 rounded-2xl border border-dashed border-border text-center">
          <Star className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="font-medium mb-1">Inga fokusområden valda</p>
          <p className="text-muted-foreground text-sm mb-3">
            Välj 1-2 dimensioner att fokusera på för att komma igång.
          </p>
          <Button variant="outline" size="sm" onClick={onNavigateToNulage}>
            Gå till Nuläge →
          </Button>
        </div>
      )}

      {/* Collapsible: Other Dimensions - Full Detail like Focus Areas */}
      {otherDimensionsWithContent.length > 0 && (
        <CollapsibleSection title={`Övriga områden (${otherDimensionsWithContent.length})`} icon="📋" defaultOpen={false}>
          <div className="space-y-4">
            {otherDimensionsWithContent.map((dim) => {
              const dimTasks = (tasks[dim.key] || []).filter(t => t.text?.trim()).sort((a, b) => a.priority - b.priority);
              const hasGoal = goals[dim.key]?.trim();
              const hasCause = causes[dim.key]?.trim();
              
              return (
                <div 
                  key={dim.key} 
                  className="bg-muted/30 p-4 rounded-xl space-y-3"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{dim.icon}</span>
                      <div>
                        <p className="font-semibold">{dim.label}</p>
                        <p className="text-sm" style={{ color: getColorForScore(scores[dim.key]) }}>
                          {scores[dim.key]}/10
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onNavigateToPlan(dim.key)}
                      className="text-muted-foreground"
                    >
                      Redigera →
                    </Button>
                  </div>
                  
                  {/* Cause */}
                  {hasCause && (
                    <div className="bg-background/60 p-3 rounded-xl">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Orsaker</p>
                      <p className="text-sm">{causes[dim.key]}</p>
                    </div>
                  )}
                  
                  {/* Goal */}
                  {hasGoal && (
                    <div className="bg-background/60 p-3 rounded-xl">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Målbild</p>
                      <p className="text-sm">{goals[dim.key]}</p>
                    </div>
                  )}
                  
                  {/* Tasks */}
                  {dimTasks.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Handlingsplan</p>
                      <ul className="space-y-2">
                        {dimTasks.map((task) => {
                          const typeConfig = TASK_TYPE_ICONS[task.task_type] || TASK_TYPE_ICONS.borja;
                          const TypeIcon = typeConfig.icon;
                          return (
                            <li key={task.id} className="flex items-center gap-2 text-sm bg-background/60 p-2 rounded-lg">
                              <span
                                className="w-5 h-5 rounded-full flex-shrink-0"
                                style={{
                                  backgroundColor: task.priority === 1 ? "#125E6A" : task.priority === 2 ? "#4A8A8F" : "#A5C5C8",
                                  color: task.priority === 3 ? "#1a1a1a" : "white",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "11px",
                                  fontWeight: "bold",
                                  lineHeight: 1,
                                }}
                              >
                                {task.priority}
                              </span>
                              <span className="flex-1">{task.text}</span>
                              <TypeIcon className="h-4 w-4 flex-shrink-0" style={{ color: typeConfig.color }} />
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CollapsibleSection>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col items-center gap-3 pt-2">
        <Button onClick={onGeneratePDF} disabled={generatingPDF} variant="outline">
          {generatingPDF ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Genererar...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Ladda ner PDF-sammanställning
            </>
          )}
        </Button>
        <CalendarReminderButton />
      </div>

      {/* Hidden PDF Content - used for PDF generation */}
      {/* Using absolute positioning instead of hidden to ensure html2canvas can render it */}
      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
        <div ref={pdfContentRef} className="bg-white text-black p-8" style={{ width: "794px" }}>
          {/* PDF Header */}
          <div className="border-b-4 pb-4 mb-6" style={{ borderColor: "#125E6A" }}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#125E6A" }}>
                <span className="text-xl text-white font-bold">和</span>
              </div>
              <span className="text-2xl font-light" style={{ color: "#125E6A" }}>livsbalans.co</span>
            </div>
            <p className="text-gray-500 text-sm mt-2">
              Rapport genererad {new Date().toLocaleDateString("sv-SE")}
            </p>
          </div>

          {/* PDF Scores */}
          <div className="mb-6">
            <h2 className="text-xl font-bold bg-gray-100 p-3 rounded mb-4">
              Nulägesbedömning (Snitt: {avgScore.toFixed(1)}/10)
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {DIMENSIONS.map((dim) => (
                <div
                  key={dim.key}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded"
                  style={{ borderLeft: `4px solid ${getColorForScore(scores[dim.key])}` }}
                >
                  <span className="text-xl">{dim.icon}</span>
                  <div>
                    <p className="text-sm text-gray-600">{dim.label}</p>
                    <p className="text-lg font-bold" style={{ color: getColorForScore(scores[dim.key]) }}>
                      {scores[dim.key]}/10
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PDF Dimension Details */}
          <div className="space-y-4">
            {DIMENSIONS.map((dim) => {
              const dimTasks = (tasks[dim.key] || []).filter(t => t.text?.trim()).sort((a, b) => a.priority - b.priority);
              const hasCause = causes[dim.key]?.trim();
              const hasGoal = goals[dim.key]?.trim();
              if (!hasCause && !hasGoal && dimTasks.length === 0) return null;

              return (
                <div key={dim.key} className="bg-gray-50 p-4 rounded" style={{ pageBreakInside: "avoid" }}>
                  <h3 className="font-bold text-lg flex items-center gap-2 mb-3 text-gray-800">
                    {dim.icon} {dim.label} ({scores[dim.key]}/10)
                    {focusDimensions.includes(dim.key) && <span className="text-yellow-500">⭐</span>}
                  </h3>
                  {hasCause && (
                    <div className="mb-2">
                      <p className="text-sm font-semibold text-gray-500">Orsaker:</p>
                      <p className="text-sm text-gray-700">{causes[dim.key]}</p>
                    </div>
                  )}
                  {hasGoal && (
                    <div className="mb-2">
                      <p className="text-sm font-semibold text-gray-500">Målbild:</p>
                      <p className="text-sm text-gray-700">{goals[dim.key]}</p>
                    </div>
                  )}
                  {dimTasks.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-500 mb-1">Handlingsplan:</p>
                      <ul className="space-y-1">
                        {dimTasks.map((task) => {
                          const typeConfig = TASK_TYPE_ICONS[task.task_type] || TASK_TYPE_ICONS.borja;
                          const TypeIcon = typeConfig.icon;
                          return (
                            <li key={task.id} className="flex items-center gap-2 text-sm">
                              <span
                                className="w-5 h-5 rounded-full flex-shrink-0"
                                style={{
                                  backgroundColor: task.priority === 1 ? "#125E6A" : task.priority === 2 ? "#4A8A8F" : "#A5C5C8",
                                  color: task.priority === 3 ? "#1a1a1a" : "white",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "11px",
                                  fontWeight: "bold",
                                }}
                              >
                                {task.priority}
                              </span>
                              <span className="flex-1 text-gray-700">{task.text}</span>
                              <TypeIcon className="h-4 w-4" style={{ color: typeConfig.color }} />
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* PDF Footer */}
          <div className="mt-8 pt-4 border-t text-center text-gray-400 text-xs">
            Livsbalans - Verktyg för personlig utveckling och livsbalans
          </div>
        </div>
      </div>
    </div>
  );
}

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
  DimensionTask,
  TaskType,
} from "@/lib/api";
import {
  useAutoSave,
  SaveStatus,
} from "@/hooks/use-auto-save";
import { Header } from "@/components/layout";
import { Plus, Download, Loader2, Play, Square, RefreshCw } from "lucide-react";
import { OnboardingGuide } from "@/components/OnboardingGuide";

// Task type icons for overview
const TASK_TYPE_ICONS: Record<string, { icon: typeof Play; color: string }> = {
  borja: { icon: Play, color: "#22c55e" },
  sluta: { icon: Square, color: "#ef4444" },
  fortsatta: { icon: RefreshCw, color: "#3b82f6" },
};

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
  const pdfContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push("/auth/login");
      } else {
        setUser(user);
        // Load all user data
        const [scoresData, causesData, goalsData, tasksData, questionsData, profile] =
          await Promise.all([
            getScores(),
            getCauses(),
            getGoals(),
            getTasks(),
            getQuestions(),
            getUserProfile(),
          ]);
        setScores(scoresData);
        setCauses(causesData);
        setGoals(goalsData);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
      />

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as any)}
        className="flex flex-col min-h-[calc(100vh-56px)]"
      >
        {/* Sticky Tabs */}
        <div className="sticky top-14 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
          <div className="container mx-auto px-4 py-2 max-w-4xl">
            <TabsList className="grid w-full grid-cols-4 h-10 p-1 bg-muted rounded-xl">
              <TabsTrigger 
                value="nulage"
                className="h-full text-sm font-medium text-muted-foreground data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg transition-all"
              >
                Nuläge
              </TabsTrigger>
              <TabsTrigger 
                value="orsaker"
                className="h-full text-sm font-medium text-muted-foreground data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg transition-all"
              >
                Orsaker
              </TabsTrigger>
              <TabsTrigger 
                value="mal"
                className="h-full text-sm font-medium text-muted-foreground data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg transition-all"
              >
                Plan
              </TabsTrigger>
              <TabsTrigger 
                value="oversikt"
                className="h-full text-sm font-medium text-muted-foreground data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg transition-all"
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

            <div className="space-y-4">
              {DIMENSIONS.map((dim) => (
                <div key={dim.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <span>{dim.icon}</span>
                      {dim.label}
                    </label>
                    <span className="text-sm font-bold">{scores[dim.key]}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={scores[dim.key]}
                    onChange={(e) =>
                      handleScoreChange(dim.key, parseInt(e.target.value))
                    }
                    className="w-full h-2 bg-primary/20 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="orsaker">
            <OrsakerView
              selectedDimension={selectedDimension}
              scores={scores}
              causes={causes}
              questions={questions}
              onDimensionChange={setSelectedDimension}
              onCauseChange={handleCauseChange}
              onCauseSave={handleCauseSave}
            />
          </TabsContent>

          <TabsContent value="mal">
            <MalPlanView
              selectedDimension={selectedDimension}
              scores={scores}
              goals={goals}
              tasks={tasks}
              onDimensionChange={setSelectedDimension}
              onGoalChange={handleGoalChange}
              onGoalSave={handleGoalSave}
              setTasks={setTasks}
              saveStatus={saveStatus}
              setSaveStatus={setSaveStatus}
            />
          </TabsContent>

          <TabsContent value="oversikt" className="space-y-6 mt-0">
            {/* PDF Export Button */}
            <div className="flex justify-end">
              <Button onClick={generatePDF} disabled={generatingPDF}>
                {generatingPDF ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Genererar...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Ladda ner PDF
                  </>
                )}
              </Button>
            </div>

            {/* Overview Content - This is also used for PDF */}
            <div
              ref={pdfContentRef}
              className="bg-card rounded-2xl border border-border shadow-soft p-6 space-y-6"
            >
              {/* Header */}
              <div className="border-b-2 pb-4 mb-4" style={{ borderColor: "#125E6A" }}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#125E6A" }}>
                    <span className="text-xl text-white font-bold">和</span>
                  </div>
                  <span className="text-xl font-light" style={{ color: "#125E6A" }}>livsbalans.co</span>
                </div>
                <p className="text-muted-foreground text-sm mt-2">
                  Senast uppdaterad {new Date().toLocaleDateString("sv-SE")}
                </p>
              </div>

              {/* Scores Overview */}
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  📊 Nulägesbedömning
                  <span className="text-sm font-normal text-muted-foreground">
                    (Snitt: {avgScore.toFixed(1)}/10)
                  </span>
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {DIMENSIONS.map((dim) => (
                    <div
                      key={dim.key}
                      className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl"
                      style={{
                        borderLeft: `4px solid ${getColorForScore(scores[dim.key])}`,
                      }}
                    >
                      <span className="text-xl">{dim.icon}</span>
                      <div>
                        <p className="font-medium text-sm">{dim.label}</p>
                        <p
                          className="text-lg font-bold"
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
              <div className="space-y-4">
                {DIMENSIONS.map((dim) => {
                  const dimTasks = tasks[dim.key] || [];
                  const hasCause = causes[dim.key]?.trim();
                  const hasGoal = goals[dim.key]?.trim();
                  const hasTasks = dimTasks.filter((t) => t.text?.trim()).length > 0;

                  if (!hasCause && !hasGoal && !hasTasks) return null;

                  return (
                    <div
                      key={dim.key}
                      className="bg-muted/30 p-4 rounded-xl space-y-3"
                    >
                      <h3 className="font-semibold flex items-center gap-2">
                        <span>{dim.icon}</span>
                        {dim.label}
                        <span className="text-sm font-normal text-muted-foreground">
                          ({scores[dim.key]}/10)
                        </span>
                      </h3>

                      {hasCause && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Orsaker
                          </p>
                          <p className="text-sm whitespace-pre-line">
                            {causes[dim.key]}
                          </p>
                        </div>
                      )}

                      {hasGoal && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Målbild
                          </p>
                          <p className="text-sm whitespace-pre-line">
                            {goals[dim.key]}
                          </p>
                        </div>
                      )}

                      {hasTasks && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2">
                            Handlingsplan
                          </p>
                          <ul className="space-y-2">
                            {dimTasks
                              .filter((t) => t.text?.trim())
                              .sort((a, b) => a.priority - b.priority)
                              .map((task) => {
                                const typeConfig = TASK_TYPE_ICONS[task.task_type] || TASK_TYPE_ICONS.borja;
                                const TypeIcon = typeConfig.icon;
                                return (
                                  <li
                                    key={task.id}
                                    className="flex items-center gap-2 text-sm"
                                  >
                                    <span
                                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                      style={{
                                        backgroundColor:
                                          task.priority === 1
                                            ? "#125E6A"
                                            : task.priority === 2
                                            ? "#4A8A8F"
                                            : "#A5C5C8",
                                        color: task.priority === 3 ? "#1a1a1a" : "white",
                                      }}
                                    >
                                      {task.priority}
                                    </span>
                                    <span className="flex-1">{task.text}</span>
                                    <TypeIcon 
                                      className="h-4 w-4 flex-shrink-0" 
                                      style={{ color: typeConfig.color }}
                                    />
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

              {/* Empty State */}
              {DIMENSIONS.every((dim) => {
                const dimTasks = tasks[dim.key] || [];
                return !causes[dim.key]?.trim() && !goals[dim.key]?.trim() && !dimTasks.filter((t) => t.text?.trim()).length;
              }) && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-lg mb-2">Din sammanställning är tom</p>
                  <p className="text-sm">
                    Börja med att bedöma ditt nuläge, identifiera orsaker och skapa en plan.
                  </p>
                </div>
              )}
            </div>
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
  onDimensionChange,
  onCauseChange,
  onCauseSave,
}: {
  selectedDimension: DimensionKey;
  scores: Record<DimensionKey, number>;
  causes: Record<DimensionKey, string>;
  questions: Record<DimensionKey, string>;
  onDimensionChange: (dim: DimensionKey) => void;
  onCauseChange: (dim: DimensionKey, value: string) => void;
  onCauseSave: (dim: DimensionKey) => void;
}) {
  const dimension = DIMENSIONS.find((d) => d.key === selectedDimension)!;
  const [isExpanded, setIsExpanded] = useState(true);

  const { status } = useAutoSave({
    data: causes[selectedDimension],
    onSave: async () => {
      await onCauseSave(selectedDimension);
      return true;
    },
    debounceMs: 1500,
  });

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-2 block">Välj dimension:</label>
        <Select
          value={selectedDimension}
          onValueChange={(value) => onDimensionChange(value as DimensionKey)}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {dimension.icon} {dimension.label} ({scores[selectedDimension]}/10)
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {DIMENSIONS.map((dim) => (
              <SelectItem key={dim.key} value={dim.key}>
                {dim.icon} {dim.label} ({scores[dim.key]}/10)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
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

        <div>
          <div className="mb-2">
            <label htmlFor="causes" className="text-sm font-medium">
              Orsaker
            </label>
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
    </div>
  );
}

function MalPlanView({
  selectedDimension,
  scores,
  goals,
  tasks,
  onDimensionChange,
  onGoalChange,
  onGoalSave,
  setTasks,
  saveStatus,
  setSaveStatus,
}: {
  selectedDimension: DimensionKey;
  scores: Record<DimensionKey, number>;
  goals: Record<DimensionKey, string>;
  tasks: Record<DimensionKey, DimensionTask[]>;
  onDimensionChange: (dim: DimensionKey) => void;
  onGoalChange: (dim: DimensionKey, value: string) => void;
  onGoalSave: (dim: DimensionKey) => void;
  setTasks: React.Dispatch<React.SetStateAction<Record<DimensionKey, DimensionTask[]>>>;
  saveStatus: SaveStatus;
  setSaveStatus: (status: SaveStatus) => void;
}) {
  const dimension = DIMENSIONS.find((d) => d.key === selectedDimension)!;
  const dimensionTasks = tasks[selectedDimension] || [];

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
              {dimension.icon} {dimension.label} ({scores[selectedDimension]}/10)
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {DIMENSIONS.map((dim) => (
              <SelectItem key={dim.key} value={dim.key}>
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
    </div>
  );
}

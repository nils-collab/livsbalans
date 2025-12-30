"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadarChart } from "@/components/life-balance/radar-chart";
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
import { Settings, Download, Share2, LogOut } from "lucide-react";
import Link from "next/link";

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
  const [activeTab, setActiveTab] = useState<"nulage" | "orsaker" | "mal">("nulage");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

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
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setActiveTab("nulage")}
            className="text-3xl font-bold hover:text-primary transition-colors"
          >
            Livsbalans
          </button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleShare} title="Dela">
              <Share2 className="h-5 w-5" />
            </Button>
            <Link href="/pdf-export">
              <Button variant="ghost" size="icon" title="Exportera PDF">
                <Download className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" size="icon" title="Inställningar">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
            {isAdmin && (
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  Admin
                </Button>
              </Link>
            )}
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Logga ut">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 mb-6 h-14 p-1.5 bg-muted/80 rounded-xl">
            <TabsTrigger 
              value="nulage"
              className="h-full text-base font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg rounded-lg transition-all"
            >
              Nuläge
            </TabsTrigger>
            <TabsTrigger 
              value="orsaker"
              className="h-full text-base font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg rounded-lg transition-all"
            >
              Orsaker
            </TabsTrigger>
            <TabsTrigger 
              value="mal"
              className="h-full text-base font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg rounded-lg transition-all"
            >
              Mål & Plan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nulage" className="space-y-6">
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
        </Tabs>
      </div>
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
            <div className="bg-muted p-4 rounded-lg text-sm whitespace-pre-line">
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
            className="w-full min-h-[200px] p-4 border rounded-md bg-background resize-none"
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

  const { status: goalStatus } = useAutoSave({
    data: goals[selectedDimension],
    onSave: async () => {
      await onGoalSave(selectedDimension);
      return true;
    },
    debounceMs: 1500,
  });

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [formTaskType, setFormTaskType] = useState<TaskType>("borja");
  const [formText, setFormText] = useState("");
  const [formPriority, setFormPriority] = useState<1 | 2 | 3>(2);

  // Reset form when dimension changes
  useEffect(() => {
    setEditingTaskId(null);
    setFormTaskType("borja");
    setFormText("");
    setFormPriority(2);
  }, [selectedDimension]);

  const handleEditTask = (task: DimensionTask) => {
    setEditingTaskId(task.id);
    setFormTaskType(task.task_type);
    setFormText(task.text);
    setFormPriority(task.priority);
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setFormTaskType("borja");
    setFormText("");
    setFormPriority(2);
  };

  const handleSaveTask = async () => {
    if (!formText.trim()) {
      alert("Du måste fylla i vad du ska göra");
      return;
    }

    setSaveStatus("saving");
    
    if (editingTaskId) {
      // Update existing task
      const updatedTask = await saveTask({
        id: editingTaskId,
        dimension: selectedDimension,
        task_type: formTaskType,
        text: formText,
        priority: formPriority,
      });
      
      if (updatedTask) {
        setTasks((prev) => ({
          ...prev,
          [selectedDimension]: prev[selectedDimension].map((t) =>
            t.id === editingTaskId ? updatedTask : t
          ),
        }));
        setSaveStatus("saved");
        handleCancelEdit();
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        setSaveStatus("error");
      }
    } else {
      // Create new task
      const newTask = await saveTask({
        dimension: selectedDimension,
        task_type: formTaskType,
        text: formText,
        priority: formPriority,
      });
      
      if (newTask) {
        setTasks((prev) => ({
          ...prev,
          [selectedDimension]: [...prev[selectedDimension], newTask],
        }));
        setSaveStatus("saved");
        setFormTaskType("borja");
        setFormText("");
        setFormPriority(2);
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        setSaveStatus("error");
      }
    }
  };

  const removeTask = async (taskId: string) => {
    if (!confirm("Är du säker på att du vill ta bort denna uppgift?")) {
      return;
    }
    
    const success = await deleteTask(taskId);
    if (success) {
      setTasks((prev) => ({
        ...prev,
        [selectedDimension]: prev[selectedDimension].filter((t) => t.id !== taskId),
      }));
      if (editingTaskId === taskId) {
        handleCancelEdit();
      }
    }
  };

  const getTaskTypeLabel = (type: TaskType): string => {
    switch (type) {
      case "borja":
        return "🚀 Börja";
      case "sluta":
        return "🛑 Sluta";
      case "fortsatta":
        return "✅ Fortsätta";
      default:
        return type;
    }
  };

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
        <h3 className="font-semibold">
          Målbild och plan för {dimension.label.toLowerCase()}
        </h3>

        <div>
          <div className="mb-2">
            <label htmlFor="goal" className="text-sm font-medium">
              Målbild
            </label>
          </div>
          <textarea
            id="goal"
            value={goals[selectedDimension]}
            onChange={(e) => onGoalChange(selectedDimension, e.target.value)}
            placeholder="Skriv ditt svar här..."
            className="w-full min-h-[150px] p-4 border rounded-md bg-background resize-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-3 block">Plan</label>
          
          {/* Input formulär */}
          <div className="border rounded-lg p-4 bg-muted/30 mb-4">
            <div className="space-y-3">
              {/* Typ och Prio på samma rad */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Typ</label>
                  <select
                    value={formTaskType}
                    onChange={(e) => setFormTaskType(e.target.value as TaskType)}
                    className="w-full p-2 border rounded bg-background text-sm"
                  >
                    <option value="borja">🚀 Börja</option>
                    <option value="sluta">🛑 Sluta</option>
                    <option value="fortsatta">✅ Fortsätta</option>
                  </select>
                </div>
                <div className="w-28">
                  <label className="text-xs text-muted-foreground mb-1 block">Prio</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(parseInt(e.target.value) as 1 | 2 | 3)}
                    className="w-full p-2 border rounded bg-background text-sm"
                  >
                    <option value="1">1 - Hög</option>
                    <option value="2">2 - Mellan</option>
                    <option value="3">3 - Låg</option>
                  </select>
                </div>
              </div>
              
              {/* Att göra textfält */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Att göra</label>
                <textarea
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  placeholder="Beskriv vad du ska göra..."
                  className="w-full p-3 border rounded bg-background text-sm min-h-[80px] resize-none"
                />
              </div>
              
              {/* Knappar */}
              <div className="flex gap-2 justify-end">
                {editingTaskId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                  >
                    Avbryt
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={handleSaveTask}
                  disabled={saveStatus === "saving"}
                >
                  {saveStatus === "saving" 
                    ? "Sparar..." 
                    : editingTaskId 
                    ? "Uppdatera" 
                    : "Lägg till"}
                </Button>
              </div>
            </div>
          </div>

          {/* Lista med sparade uppgifter */}
          <div className="space-y-2">
            {dimensionTasks.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground border rounded-lg bg-muted/20">
                Inga uppgifter ännu. Fyll i formuläret ovan för att lägga till en uppgift.
              </div>
            ) : (
              [...dimensionTasks].sort((a, b) => a.priority - b.priority).map((task) => (
                <div
                  key={task.id}
                  className="border rounded-lg p-3 bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium">
                          {getTaskTypeLabel(task.task_type)}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          Prio: {task.priority}
                        </span>
                      </div>
                      <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                        {task.text}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTask(task)}
                        className="h-8 w-8 p-0"
                        title="Redigera"
                      >
                        ✏️
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTask(task.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        title="Ta bort"
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

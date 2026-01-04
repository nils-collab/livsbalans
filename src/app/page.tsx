"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NulageView, OrsakerView, MalPlanView } from "@/components/life-balance";
import { DimensionKey } from "@/types/dimensions";
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
  User,
} from "@/lib/api";
import {
  useAutoSave,
  SaveStatus,
} from "@/hooks/use-auto-save";
import { Header } from "@/components/layout";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [, setUser] = useState<User | null>(null);
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
  const { toast } = useToast();

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

  const handleShare = useCallback(async () => {
    const url = window.location.origin;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Kopierad",
        description: "Länk kopierad till urklipp!",
      });
    } catch {
      // Fallback if clipboard API fails
      const copied = prompt("Kopiera länken:", url);
      if (copied) {
        toast({
          title: "Länk redo",
          description: "Länken är klistrad i textfältet ovan",
        });
      }
    }
  }, [toast]);

  const handleDimensionClick = useCallback((dimension: DimensionKey) => {
    setSelectedDimension(dimension);
    setActiveTab("orsaker");
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Sticky Header */}
      <Header
        isAdmin={isAdmin}
        onShare={handleShare}
        onLogout={handleLogout}
      />

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex flex-col min-h-[calc(100vh-56px)]"
      >
        {/* Sticky Tabs */}
        <div className="sticky top-14 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
          <div className="container mx-auto px-4 py-2 max-w-4xl">
            <TabsList className="grid w-full grid-cols-3 h-10 p-1 bg-muted rounded-xl">
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
            </TabsList>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-4 pb-8 max-w-4xl flex-1">
          <TabsContent value="nulage" className="space-y-6 mt-0">
            <NulageView
              scores={scores}
              onDimensionClick={handleDimensionClick}
              onScoreChange={handleScoreChange}
            />
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
        </div>
      </Tabs>
    </main>
  );
}

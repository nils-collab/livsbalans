import { createClient } from "@/lib/supabase/client";
import { DimensionKey } from "@/types/dimensions";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = createClient() as any;

// Types
export interface DimensionScore {
  dimension: DimensionKey;
  score: number;
}

export interface DimensionCause {
  dimension: DimensionKey;
  causes: string;
}

export interface DimensionGoal {
  dimension: DimensionKey;
  goal: string;
}

export type TaskType = "borja" | "sluta" | "fortsatta";

export interface DimensionTask {
  id: string;
  dimension: DimensionKey;
  task_type: TaskType;
  text: string;
  priority: 1 | 2 | 3;
}

export interface UserProfile {
  id: string;
  email: string;
  is_admin: boolean;
}

// User Profile
export async function getUserProfile(): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .single();
  
  if (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
  return data;
}

// Dimension Scores
export async function getScores(): Promise<Record<DimensionKey, number>> {
  const { data, error } = await supabase
    .from("dimension_scores")
    .select("dimension, score");
  
  if (error) {
    console.error("Error fetching scores:", error);
    return getDefaultScores();
  }

  const scores = getDefaultScores();
  data?.forEach((item: { dimension: string; score: number }) => {
    scores[item.dimension as DimensionKey] = item.score;
  });
  return scores;
}

export async function saveScore(dimension: DimensionKey, score: number): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from("dimension_scores")
    .upsert({
      user_id: user.id,
      dimension,
      score,
    }, {
      onConflict: "user_id,dimension",
    });
  
  if (error) {
    console.error("Error saving score:", error);
    return false;
  }
  return true;
}

// Dimension Causes
export async function getCauses(): Promise<Record<DimensionKey, string>> {
  const { data, error } = await supabase
    .from("dimension_causes")
    .select("dimension, causes");
  
  if (error) {
    console.error("Error fetching causes:", error);
    return getDefaultCauses();
  }

  const causes = getDefaultCauses();
  data?.forEach((item: { dimension: string; causes: string | null }) => {
    causes[item.dimension as DimensionKey] = item.causes || "";
  });
  return causes;
}

export async function saveCause(dimension: DimensionKey, causes: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from("dimension_causes")
    .upsert({
      user_id: user.id,
      dimension,
      causes,
    }, {
      onConflict: "user_id,dimension",
    });
  
  if (error) {
    console.error("Error saving cause:", error);
    return false;
  }
  return true;
}

// Dimension Goals
export async function getGoals(): Promise<Record<DimensionKey, string>> {
  const { data, error } = await supabase
    .from("dimension_goals")
    .select("dimension, goal");
  
  if (error) {
    console.error("Error fetching goals:", error);
    return getDefaultGoals();
  }

  const goals = getDefaultGoals();
  data?.forEach((item: { dimension: string; goal: string | null }) => {
    goals[item.dimension as DimensionKey] = item.goal || "";
  });
  return goals;
}

export async function saveGoal(dimension: DimensionKey, goal: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from("dimension_goals")
    .upsert({
      user_id: user.id,
      dimension,
      goal,
    }, {
      onConflict: "user_id,dimension",
    });
  
  if (error) {
    console.error("Error saving goal:", error);
    return false;
  }
  return true;
}

// Dimension Tasks
export async function getTasks(): Promise<Record<DimensionKey, DimensionTask[]>> {
  const { data, error } = await supabase
    .from("dimension_tasks")
    .select("*")
    .order("created_at", { ascending: true });
  
  if (error) {
    console.error("Error fetching tasks:", error);
    return getDefaultTasks();
  }

  const tasks = getDefaultTasks();
  data?.forEach((item: { id: string; dimension: string; task_type: string | null; text: string; priority: number }) => {
    const task: DimensionTask = {
      id: item.id,
      dimension: item.dimension as DimensionKey,
      task_type: (item.task_type as TaskType) || "borja",
      text: item.text,
      priority: item.priority as 1 | 2 | 3,
    };
    tasks[item.dimension as DimensionKey].push(task);
  });
  return tasks;
}

export async function saveTask(task: Omit<DimensionTask, "id"> & { id?: string }): Promise<DimensionTask | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  if (task.id) {
    // Update existing task
    const { data, error } = await supabase
      .from("dimension_tasks")
      .update({
        task_type: task.task_type,
        text: task.text,
        priority: task.priority,
      })
      .eq("id", task.id)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating task:", error);
      return null;
    }
    return {
      id: data.id,
      dimension: data.dimension as DimensionKey,
      task_type: (data.task_type as TaskType) || "borja",
      text: data.text,
      priority: data.priority as 1 | 2 | 3,
    };
  } else {
    // Insert new task
    const { data, error } = await supabase
      .from("dimension_tasks")
      .insert({
        user_id: user.id,
        dimension: task.dimension,
        task_type: task.task_type,
        text: task.text,
        priority: task.priority,
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error inserting task:", error);
      return null;
    }
    return {
      id: data.id,
      dimension: data.dimension as DimensionKey,
      task_type: (data.task_type as TaskType) || "borja",
      text: data.text,
      priority: data.priority as 1 | 2 | 3,
    };
  }
}

export async function deleteTask(taskId: string): Promise<boolean> {
  const { error } = await supabase
    .from("dimension_tasks")
    .delete()
    .eq("id", taskId);
  
  if (error) {
    console.error("Error deleting task:", error);
    return false;
  }
  return true;
}

// Questions (admin-editable)
export async function getQuestions(): Promise<Record<DimensionKey, string>> {
  const { data, error } = await supabase
    .from("dimension_questions")
    .select("dimension, questions");
  
  if (error) {
    console.error("Error fetching questions:", error);
    return getDefaultQuestions();
  }

  const questions = getDefaultQuestions();
  data?.forEach((item: { dimension: string; questions: string }) => {
    questions[item.dimension as DimensionKey] = item.questions || "";
  });
  return questions;
}

export async function saveQuestion(dimension: DimensionKey, questions: string): Promise<boolean> {
  const { error } = await supabase
    .from("dimension_questions")
    .upsert({
      dimension,
      questions,
    }, {
      onConflict: "dimension",
    });
  
  if (error) {
    console.error("Error saving question:", error);
    return false;
  }
  return true;
}

// Focus Dimensions
export async function getFocusDimensions(): Promise<DimensionKey[]> {
  const { data, error } = await supabase
    .from("dimension_scores")
    .select("dimension")
    .eq("is_focus", true);
  
  if (error) {
    console.error("Error fetching focus dimensions:", error);
    return [];
  }

  return data?.map((item: { dimension: string }) => item.dimension as DimensionKey) || [];
}

export async function setFocusDimension(dimension: DimensionKey, isFocus: boolean): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // If setting focus to true, check if user already has 2 focus dimensions
  if (isFocus) {
    const currentFocus = await getFocusDimensions();
    if (currentFocus.length >= 2 && !currentFocus.includes(dimension)) {
      console.error("Cannot have more than 2 focus dimensions");
      return false;
    }
  }

  const { error } = await supabase
    .from("dimension_scores")
    .update({ is_focus: isFocus })
    .eq("user_id", user.id)
    .eq("dimension", dimension);
  
  if (error) {
    console.error("Error setting focus dimension:", error);
    return false;
  }
  return true;
}

// Delete user account
export async function deleteUserData(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Delete all user data from all tables (but keep user_profiles so account stays intact)
  const tables = [
    'dimension_tasks',
    'dimension_goals', 
    'dimension_causes',
    'dimension_scores',
  ];

  let hasError = false;
  
  for (const table of tables) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('user_id', user.id);
    
    if (error) {
      console.error(`Error deleting from ${table}:`, error);
      hasError = true;
      // Continue trying to delete from other tables
    }
  }

  // Return success even if some tables had no data
  return !hasError;
}

export async function deleteUserAccount(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Data will cascade delete due to ON DELETE CASCADE
  // We just need to delete the auth user
  const { error } = await supabase.rpc("delete_user");
  
  if (error) {
    console.error("Error deleting user:", error);
    return false;
  }
  
  await supabase.auth.signOut();
  return true;
}

// Export user data for data portability (GDPR Article 20)
export async function exportUserData(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  try {
    // Fetch all user data
    const [scoresData, causesData, goalsData, tasksData, profileData] = await Promise.all([
      supabase.from("dimension_scores").select("*").eq("user_id", user.id),
      supabase.from("dimension_causes").select("*").eq("user_id", user.id),
      supabase.from("dimension_goals").select("*").eq("user_id", user.id),
      supabase.from("dimension_tasks").select("*").eq("user_id", user.id).order("created_at", { ascending: true }),
      supabase.from("user_profiles").select("*").eq("id", user.id).single(),
    ]);

    // Get auth user info
    const authUser = user;

    // Structure the data
    const exportData = {
      exported_at: new Date().toISOString(),
      user_profile: profileData.data ? {
        id: profileData.data.id,
        email: profileData.data.email,
        created_at: profileData.data.created_at,
        updated_at: profileData.data.updated_at,
      } : null,
      auth_user: {
        id: authUser.id,
        email: authUser.email,
        created_at: authUser.created_at,
      },
      dimension_scores: scoresData.data || [],
      dimension_causes: causesData.data || [],
      dimension_goals: goalsData.data || [],
      dimension_tasks: tasksData.data || [],
    };

    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error("Error exporting user data:", error);
    return null;
  }
}

// Default values
function getDefaultScores(): Record<DimensionKey, number> {
  return {
    fysisk_halsa: 5,
    mental_halsa: 5,
    familj: 5,
    vanner: 5,
    boende: 5,
    jobb: 5,
  };
}

function getDefaultCauses(): Record<DimensionKey, string> {
  return {
    fysisk_halsa: "",
    mental_halsa: "",
    familj: "",
    vanner: "",
    boende: "",
    jobb: "",
  };
}

function getDefaultGoals(): Record<DimensionKey, string> {
  return {
    fysisk_halsa: "",
    mental_halsa: "",
    familj: "",
    vanner: "",
    boende: "",
    jobb: "",
  };
}

function getDefaultTasks(): Record<DimensionKey, DimensionTask[]> {
  return {
    fysisk_halsa: [],
    mental_halsa: [],
    familj: [],
    vanner: [],
    boende: [],
    jobb: [],
  };
}

function getDefaultQuestions(): Record<DimensionKey, string> {
  return {
    fysisk_halsa: "",
    mental_halsa: "",
    familj: "",
    vanner: "",
    boende: "",
    jobb: "",
  };
}


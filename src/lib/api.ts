import { createClient } from "@/lib/supabase/client";
import { DimensionKey } from "@/types/dimensions";

const supabase = createClient();

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

export interface DimensionTask {
  id: string;
  dimension: DimensionKey;
  text: string;
  priority: 1 | 2 | 3;
  due_date: string | null;
  completed: boolean;
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
  data?.forEach((item) => {
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
  data?.forEach((item) => {
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
  data?.forEach((item) => {
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
  data?.forEach((item) => {
    const task: DimensionTask = {
      id: item.id,
      dimension: item.dimension as DimensionKey,
      text: item.text,
      priority: item.priority as 1 | 2 | 3,
      due_date: item.due_date,
      completed: item.completed,
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
        text: task.text,
        priority: task.priority,
        due_date: task.due_date,
        completed: task.completed,
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
      text: data.text,
      priority: data.priority as 1 | 2 | 3,
      due_date: data.due_date,
      completed: data.completed,
    };
  } else {
    // Insert new task
    const { data, error } = await supabase
      .from("dimension_tasks")
      .insert({
        user_id: user.id,
        dimension: task.dimension,
        text: task.text,
        priority: task.priority,
        due_date: task.due_date,
        completed: task.completed,
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
      text: data.text,
      priority: data.priority as 1 | 2 | 3,
      due_date: data.due_date,
      completed: data.completed,
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
  data?.forEach((item) => {
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


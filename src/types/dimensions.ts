export type DimensionKey = 
  | "fysisk_halsa"
  | "mental_halsa"
  | "familj"
  | "vanner"
  | "boende"
  | "jobb";

export interface Dimension {
  key: DimensionKey;
  label: string;
  icon: string;
  color: string;
}

export const DIMENSIONS: Dimension[] = [
  {
    key: "fysisk_halsa",
    label: "Fysisk hälsa",
    icon: "💪",
    color: "#22c55e", // green-500
  },
  {
    key: "mental_halsa",
    label: "Mental hälsa",
    icon: "🧠",
    color: "#3b82f6", // blue-500
  },
  {
    key: "familj",
    label: "Familj",
    icon: "👨‍👩‍👧‍👦",
    color: "#f59e0b", // amber-500
  },
  {
    key: "vanner",
    label: "Vänner",
    icon: "👥",
    color: "#8b5cf6", // violet-500
  },
  {
    key: "boende",
    label: "Boende",
    icon: "🏠",
    color: "#ec4899", // pink-500
  },
  {
    key: "jobb",
    label: "Jobb",
    icon: "💼",
    color: "#06b6d4", // cyan-500
  },
];

export interface DimensionScore {
  dimension: DimensionKey;
  score: number; // 1-10
}

export interface DimensionData {
  dimension: DimensionKey;
  score: number;
  causes?: string;
  goal?: string;
  tasks?: Task[];
}

export interface Task {
  id: string;
  text: string;
  priority: 1 | 2 | 3;
  dueDate?: string;
  completed: boolean;
}


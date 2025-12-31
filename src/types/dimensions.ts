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
    color: "#FF9F43", // Orange (from gradient)
  },
  {
    key: "mental_halsa",
    label: "Mental hälsa",
    icon: "🧠",
    color: "#6C5CE7", // Purple (from gradient)
  },
  {
    key: "familj",
    label: "Familj",
    icon: "👨‍👩‍👧",
    color: "#00B894", // Green (from gradient)
  },
  {
    key: "vanner",
    label: "Vänner",
    icon: "👥",
    color: "#E17055", // Coral (from gradient)
  },
  {
    key: "boende",
    label: "Boende",
    icon: "🏠",
    color: "#FFC300", // Yellow (from gradient)
  },
  {
    key: "jobb",
    label: "Jobb",
    icon: "💼",
    color: "#00CEC9", // Cyan (from gradient)
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


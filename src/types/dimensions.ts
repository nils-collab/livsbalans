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
  description: string;
}

export const DIMENSIONS: Dimension[] = [
  {
    key: "fysisk_halsa",
    label: "Fysisk hälsa",
    icon: "💪",
    color: "#FF9F43",
    description:
      "Din kroppsliga hälsa och energi. Hur mår du fysiskt? Tänk på sömn, kost, motion, smärta och allmänt välbefinnande.",
  },
  {
    key: "mental_halsa",
    label: "Mental hälsa",
    icon: "🧠",
    color: "#6C5CE7",
    description:
      "Ditt psykiska mående och inre balans. Hur hanterar du stress, ångest och känslor? Känner du dig lugn, motiverad och närvarande?",
  },
  {
    key: "familj",
    label: "Familj",
    icon: "👨‍👩‍👧",
    color: "#00B894",
    description:
      "Dina nära relationer till partner, barn, föräldrar och syskon. Känner du samhörighet, trygghet och stöd i dina familjerelationer?",
  },
  {
    key: "vanner",
    label: "Vänner",
    icon: "👥",
    color: "#E17055",
    description:
      "Ditt sociala liv och vänskapsrelationer. Har du människor att dela glädje och motgångar med? Träffas ni tillräckligt ofta?",
  },
  {
    key: "boende",
    label: "Boende",
    icon: "🏠",
    color: "#FFC300",
    description:
      "Din boendesituation och hemmiljö. Trivs du där du bor? Känns hemmet tryggt, funktionellt och som en plats att ladda batterierna?",
  },
  {
    key: "jobb",
    label: "Jobb",
    icon: "💼",
    color: "#00CEC9",
    description:
      "Ditt arbetsliv och karriär. Känner du meningsfullhet, utveckling och balans i ditt arbete? Hur påverkar jobbet resten av livet?",
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


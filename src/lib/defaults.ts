import { DimensionKey } from "@/types/dimensions";
import { DimensionTask } from "@/lib/api";

export function getDefaultScores(): Record<DimensionKey, number> {
  return {
    fysisk_halsa: 5,
    mental_halsa: 5,
    familj: 5,
    vanner: 5,
    boende: 5,
    jobb: 5,
  };
}

export function getDefaultCauses(): Record<DimensionKey, string> {
  return {
    fysisk_halsa: "",
    mental_halsa: "",
    familj: "",
    vanner: "",
    boende: "",
    jobb: "",
  };
}

export function getDefaultGoals(): Record<DimensionKey, string> {
  return {
    fysisk_halsa: "",
    mental_halsa: "",
    familj: "",
    vanner: "",
    boende: "",
    jobb: "",
  };
}

export function getDefaultTasks(): Record<DimensionKey, DimensionTask[]> {
  return {
    fysisk_halsa: [],
    mental_halsa: [],
    familj: [],
    vanner: [],
    boende: [],
    jobb: [],
  };
}

export function getDefaultQuestions(): Record<DimensionKey, string> {
  return {
    fysisk_halsa: "",
    mental_halsa: "",
    familj: "",
    vanner: "",
    boende: "",
    jobb: "",
  };
}


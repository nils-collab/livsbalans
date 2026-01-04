"use client";

import { useState } from "react";
import { DimensionKey, DIMENSIONS } from "@/types/dimensions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAutoSave } from "@/hooks/use-auto-save";

interface OrsakerViewProps {
  selectedDimension: DimensionKey;
  scores: Record<DimensionKey, number>;
  causes: Record<DimensionKey, string>;
  questions: Record<DimensionKey, string>;
  onDimensionChange: (dim: DimensionKey) => void;
  onCauseChange: (dim: DimensionKey, value: string) => void;
  onCauseSave: (dim: DimensionKey) => void;
}

export function OrsakerView({
  selectedDimension,
  scores,
  causes,
  questions,
  onDimensionChange,
  onCauseChange,
  onCauseSave,
}: OrsakerViewProps) {
  const dimension = DIMENSIONS.find((d) => d.key === selectedDimension)!;
  const [isExpanded, setIsExpanded] = useState(true);

  useAutoSave({
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


"use client";

import { DimensionKey, DIMENSIONS } from "@/types/dimensions";
import { RadarChart } from "./radar-chart";

interface NulageViewProps {
  scores: Record<DimensionKey, number>;
  onDimensionClick: (dimension: DimensionKey) => void;
  onScoreChange: (dimension: DimensionKey, score: number) => void;
}

export function NulageView({
  scores,
  onDimensionClick,
  onScoreChange,
}: NulageViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center">
        <RadarChart
          scores={scores}
          onDimensionClick={onDimensionClick}
          onScoreChange={onScoreChange}
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
                onScoreChange(dim.key, parseInt(e.target.value))
              }
              className="w-full h-2 bg-primary/20 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        ))}
      </div>
    </div>
  );
}


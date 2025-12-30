"use client";

import { Dimension, DimensionKey, DIMENSIONS } from "@/types/dimensions";
import { useMemo } from "react";

interface RadarChartProps {
  scores: Record<DimensionKey, number>;
  onDimensionClick?: (dimension: DimensionKey) => void;
  size?: number;
}

export function RadarChart({
  scores,
  onDimensionClick,
  size = 300,
}: RadarChartProps) {
  const center = size / 2;
  const radius = size * 0.35;
  const numDimensions = DIMENSIONS.length;
  const angleStep = (2 * Math.PI) / numDimensions;

  const points = useMemo(() => {
    return DIMENSIONS.map((dim, index) => {
      const angle = index * angleStep - Math.PI / 2; // Start from top
      const scoreRadius = (radius * scores[dim.key]) / 10;
      const x = center + scoreRadius * Math.cos(angle);
      const y = center + scoreRadius * Math.sin(angle);
      return {
        ...dim,
        x,
        y,
        angle,
        score: scores[dim.key],
        labelX: center + (radius + 40) * Math.cos(angle),
        labelY: center + (radius + 40) * Math.sin(angle),
      };
    });
  }, [scores, center, radius, angleStep]);

  const pathData = useMemo(() => {
    return points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
      .join(" ") + " Z";
  }, [points]);

  const gridLines = useMemo(() => {
    const lines = [];
    for (let i = 1; i <= 5; i++) {
      const gridRadius = (radius * i * 2) / 10;
      const circlePath = DIMENSIONS.map((_, index) => {
        const angle = index * angleStep - Math.PI / 2;
        const x = center + gridRadius * Math.cos(angle);
        const y = center + gridRadius * Math.sin(angle);
        return { x, y };
      });

      const path =
        circlePath
          .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`)
          .join(" ") + " Z";

      lines.push({ path, radius: gridRadius });
    }
    return lines;
  }, [center, radius, angleStep]);

  const axisLines = useMemo(() => {
    return DIMENSIONS.map((_, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      return { x, y };
    });
  }, [center, radius, angleStep]);

  const getColorForScore = (score: number) => {
    if (score >= 8) return "#22c55e"; // green-500
    if (score >= 6) return "#84cc16"; // lime-500
    if (score >= 4) return "#eab308"; // yellow-500
    if (score >= 2) return "#f59e0b"; // amber-500
    return "#ef4444"; // red-500
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="overflow-visible">
        {/* Grid circles */}
        {gridLines.map((grid, i) => (
          <path
            key={i}
            d={grid.path}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="1"
            opacity="0.3"
          />
        ))}

        {/* Axis lines */}
        {axisLines.map((line, i) => (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={line.x}
            y2={line.y}
            stroke="hsl(var(--border))"
            strokeWidth="1"
            opacity="0.3"
          />
        ))}

        {/* Data area */}
        <path
          d={pathData}
          fill="url(#gradient)"
          fillOpacity="0.3"
          stroke="url(#gradient)"
          strokeWidth="2"
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>

        {/* Dimension points and labels */}
        {points.map((point, i) => {
          const isClickable = !!onDimensionClick;
          return (
            <g key={point.key}>
              {/* Clickable area (larger circle) */}
              {isClickable && (
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="20"
                  fill="transparent"
                  className="cursor-pointer hover:fill-current hover:fill-opacity-10"
                  onClick={() => onDimensionClick?.(point.key)}
                />
              )}
              
              {/* Score point */}
              <circle
                cx={point.x}
                cy={point.y}
                r="8"
                fill={getColorForScore(point.score)}
                stroke="white"
                strokeWidth="2"
                className={isClickable ? "cursor-pointer" : ""}
                onClick={() => onDimensionClick?.(point.key)}
              />

              {/* Dimension icon and label */}
              <g>
                <circle
                  cx={point.labelX}
                  cy={point.labelY}
                  r="24"
                  fill="hsl(var(--background))"
                  stroke={point.color}
                  strokeWidth="2"
                  className={isClickable ? "cursor-pointer hover:stroke-2" : ""}
                  onClick={() => onDimensionClick?.(point.key)}
                />
                <text
                  x={point.labelX}
                  y={point.labelY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="20"
                  className={isClickable ? "cursor-pointer" : ""}
                  onClick={() => onDimensionClick?.(point.key)}
                >
                  {point.icon}
                </text>
              </g>

              {/* Dimension label text */}
              <text
                x={point.labelX}
                y={point.labelY + 35}
                textAnchor="middle"
                fontSize="12"
                fontWeight="500"
                fill="hsl(var(--foreground))"
                className={isClickable ? "cursor-pointer" : ""}
                onClick={() => onDimensionClick?.(point.key)}
              >
                {point.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}


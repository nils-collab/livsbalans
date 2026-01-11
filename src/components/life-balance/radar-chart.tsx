"use client";

import { DimensionKey, DIMENSIONS } from "@/types/dimensions";
import { useMemo, useState, useRef, useCallback, useEffect } from "react";

interface RadarChartProps {
  scores: Record<DimensionKey, number>;
  onDimensionClick?: (dimension: DimensionKey) => void;
  onScoreChange?: (dimension: DimensionKey, score: number) => void;
  size?: number;
}

export function RadarChart({
  scores,
  onDimensionClick,
  onScoreChange,
  size = 300,
}: RadarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [draggingDimension, setDraggingDimension] = useState<DimensionKey | null>(null);
  
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
        index,
        x,
        y,
        angle,
        score: scores[dim.key],
        labelX: center + (radius + 50) * Math.cos(angle),
        labelY: center + (radius + 50) * Math.sin(angle),
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
    // Green spectrum (7-10)
    if (score >= 10) return "#15803d"; // green-700 (darkest green)
    if (score >= 9) return "#16a34a";  // green-600
    if (score >= 8) return "#22c55e";  // green-500
    if (score >= 7) return "#4ade80";  // green-400
    // Yellow spectrum (4-6)
    if (score >= 6) return "#facc15";  // yellow-400
    if (score >= 5) return "#eab308";  // yellow-500
    if (score >= 4) return "#ca8a04";  // yellow-600
    // Red spectrum (1-3)
    if (score >= 3) return "#f87171";  // red-400
    if (score >= 2) return "#ef4444";  // red-500
    return "#dc2626";                  // red-600 (darkest red)
  };

  // Calculate score from position
  const calculateScoreFromPosition = useCallback((clientX: number, clientY: number, dimensionIndex: number) => {
    if (!svgRef.current) return null;
    
    const rect = svgRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    // Calculate distance from center
    const dx = x - center;
    const dy = y - center;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Convert distance to score (1-10)
    const score = Math.round((distance / radius) * 10);
    return Math.max(1, Math.min(10, score));
  }, [center, radius]);

  // Handle drag start
  const handleDragStart = useCallback((dimension: DimensionKey, e: React.MouseEvent | React.TouchEvent) => {
    if (!onScoreChange) return;
    // Only prevent default for mouse events, allow touch scrolling to work
    if ('touches' in e) {
      // Don't prevent default on touch start - let the browser decide if it's a scroll
    } else {
      e.preventDefault();
    }
    e.stopPropagation();
    setDraggingDimension(dimension);
  }, [onScoreChange]);

  // Handle drag move
  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!draggingDimension || !onScoreChange) return;
    
    // Prevent scrolling while dragging
    e.preventDefault();
    e.stopPropagation();
    
    const dimensionIndex = DIMENSIONS.findIndex(d => d.key === draggingDimension);
    if (dimensionIndex === -1) return;
    
    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const newScore = calculateScoreFromPosition(clientX, clientY, dimensionIndex);
    if (newScore !== null && newScore !== scores[draggingDimension]) {
      onScoreChange(draggingDimension, newScore);
    }
  }, [draggingDimension, onScoreChange, calculateScoreFromPosition, scores]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setDraggingDimension(null);
  }, []);

  // Add/remove global event listeners for drag
  useEffect(() => {
    if (draggingDimension) {
      // Prevent page scroll while dragging
      document.body.style.overflow = 'hidden';
      
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove, { passive: false });
      window.addEventListener('touchend', handleDragEnd);
      
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
        window.removeEventListener('touchmove', handleDragMove);
        window.removeEventListener('touchend', handleDragEnd);
      };
    }
  }, [draggingDimension, handleDragMove, handleDragEnd]);

  const isDraggable = !!onScoreChange;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg 
        ref={svgRef}
        width={size} 
        height={size} 
        className="overflow-visible"
      >
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
        {points.map((point) => {
          const isClickable = !!onDimensionClick;
          const isDragging = draggingDimension === point.key;
          
          return (
            <g key={point.key}>
              {/* Draggable score point */}
              <circle
                cx={point.x}
                cy={point.y}
                r={isDragging ? 14 : isDraggable ? 12 : 8}
                fill={getColorForScore(point.score)}
                stroke="white"
                strokeWidth={isDragging ? 3 : 2}
                className={`${isDraggable ? "cursor-grab" : isClickable ? "cursor-pointer" : ""} ${isDragging ? "cursor-grabbing" : ""}`}
                style={{ 
                  transition: isDragging ? 'none' : 'all 0.15s ease-out',
                  filter: isDragging ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' : 'none'
                }}
                onMouseDown={(e) => isDraggable ? handleDragStart(point.key, e) : onDimensionClick?.(point.key)}
                onTouchStart={(e) => isDraggable ? handleDragStart(point.key, e) : undefined}
                onClick={(e) => {
                  if (!isDraggable && isClickable) {
                    e.stopPropagation();
                    onDimensionClick?.(point.key);
                  }
                }}
              />

              {/* Score label on point */}
              {isDraggable && (
                <text
                  x={point.x}
                  y={point.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="10"
                  fontWeight="bold"
                  fill="white"
                  className="pointer-events-none select-none"
                >
                  {point.score}
                </text>
              )}

              {/* Dimension icon and label */}
              <g>
                <circle
                  cx={point.labelX}
                  cy={point.labelY}
                  r="24"
                  fill="hsl(var(--background))"
                  stroke={point.color}
                  strokeWidth="2"
                  className={isClickable ? "cursor-pointer hover:stroke-[3px]" : ""}
                  onClick={() => onDimensionClick?.(point.key)}
                />
                <text
                  x={point.labelX}
                  y={point.labelY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="20"
                  className={isClickable ? "cursor-pointer" : "pointer-events-none"}
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
                fontSize="11"
                fontWeight="500"
                fill="hsl(var(--foreground))"
                className={isClickable ? "cursor-pointer" : "pointer-events-none"}
                onClick={() => onDimensionClick?.(point.key)}
              >
                {point.label.includes(" ") && point.label !== "Fysisk hälsa" ? (
                  <>
                    <tspan x={point.labelX} dy="0">{point.label.split(" ")[0]}</tspan>
                    <tspan x={point.labelX} dy="13">{point.label.split(" ")[1]}</tspan>
                  </>
                ) : (
                  point.label
                )}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

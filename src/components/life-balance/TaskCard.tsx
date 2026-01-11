"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Play, Square, RefreshCw } from "lucide-react";

export type TaskType = "borja" | "sluta" | "fortsatta";

interface TaskCardProps {
  id: string;
  taskType: TaskType;
  text: string;
  priority: 1 | 2 | 3;
  onEdit?: () => void;
  onDelete?: () => void;
}

// Task type configuration with icons and colors
const TASK_TYPE_CONFIG: Record<TaskType, { 
  label: string; 
  icon: typeof Play;
  color: string;
}> = {
  borja: { label: "Börja", icon: Play, color: "#22c55e" },      // Green
  sluta: { label: "Sluta", icon: Square, color: "#ef4444" },    // Red
  fortsatta: { label: "Fortsätta", icon: RefreshCw, color: "#3b82f6" }, // Blue
};

export function TaskCard({ 
  taskType, 
  text, 
  priority, 
  onEdit, 
  onDelete 
}: TaskCardProps) {
  const typeConfig = TASK_TYPE_CONFIG[taskType];
  const TypeIcon = typeConfig.icon;

  // Priority badge colors - monochromatic teal palette
  const getPriorityStyle = () => {
    switch (priority) {
      case 1:
        // Dark teal - highest priority
        return {
          background: "#125E6A",
          color: "white",
        };
      case 2:
        // Medium teal
        return {
          background: "#4A8A8F",
          color: "white",
        };
      case 3:
        // Light teal
        return {
          background: "#A5C5C8",
          color: "#1a1a1a",
        };
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-soft p-4 flex items-start gap-3 hover:shadow-md transition-shadow overflow-hidden relative">
      {/* Priority Badge */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
        style={getPriorityStyle()}
      >
        {priority}
      </div>

      {/* Task Content */}
      <div className="flex-1 min-w-0 pr-6">
        <p className="text-sm text-foreground leading-relaxed">
          {text}
        </p>
      </div>

      {/* Type Icon - subtle indicator in top right */}
      <div 
        className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center opacity-60"
        title={typeConfig.label}
        style={{ backgroundColor: `${typeConfig.color}15` }}
      >
        <TypeIcon 
          className="h-3 w-3" 
          style={{ color: typeConfig.color }}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1 shrink-0 mt-4">
        {onEdit && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="h-8 w-8"
            title="Redigera"
          >
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="h-8 w-8"
            title="Ta bort"
          >
            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
          </Button>
        )}
      </div>
    </div>
  );
}



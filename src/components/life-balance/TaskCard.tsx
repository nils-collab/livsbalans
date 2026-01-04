"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

export type TaskType = "borja" | "sluta" | "fortsatta";

interface TaskCardProps {
  id: string;
  taskType: TaskType;
  text: string;
  priority: 1 | 2 | 3;
  onEdit?: () => void;
  onDelete?: () => void;
}

const TASK_TYPE_LABELS: Record<TaskType, string> = {
  borja: "Börja",
  sluta: "Sluta",
  fortsatta: "Fortsätta",
};

export function TaskCard({ 
  taskType, 
  text, 
  priority, 
  onEdit, 
  onDelete 
}: TaskCardProps) {
  // Format text with task type prefix
  const formattedText = `${TASK_TYPE_LABELS[taskType].toLowerCase()} ${text}`;

  // Priority badge gradient/colors
  const getPriorityStyle = () => {
    switch (priority) {
      case 1:
        // Use physical gradient for highest priority
        return {
          background: "linear-gradient(135deg, #FF9F43, #FF6B6B)",
          color: "white",
        };
      case 2:
        return {
          background: "#FFC300",
          color: "#2D3436",
        };
      case 3:
        return {
          background: "#E1E8EB",
          color: "#636E72",
        };
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-soft p-4 flex items-start gap-3 hover:shadow-md transition-shadow overflow-hidden">
      {/* Priority Badge */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
        style={getPriorityStyle()}
      >
        {priority}
      </div>

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground capitalize leading-relaxed">
          {formattedText}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1 shrink-0">
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



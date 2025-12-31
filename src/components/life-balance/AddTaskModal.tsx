"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { TaskType } from "./TaskCard";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: { taskType: TaskType; text: string; priority: 1 | 2 | 3 }) => void;
  editTask?: {
    id: string;
    taskType: TaskType;
    text: string;
    priority: 1 | 2 | 3;
  } | null;
  isSaving?: boolean;
}

export function AddTaskModal({ 
  isOpen, 
  onClose, 
  onSave,
  editTask,
  isSaving = false,
}: AddTaskModalProps) {
  const [taskType, setTaskType] = useState<TaskType>("borja");
  const [text, setText] = useState("");
  const [priority, setPriority] = useState<1 | 2 | 3>(2);

  // Populate form when editing
  useEffect(() => {
    if (editTask) {
      setTaskType(editTask.taskType);
      setText(editTask.text);
      setPriority(editTask.priority);
    } else {
      setTaskType("borja");
      setText("");
      setPriority(2);
    }
  }, [editTask, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    onSave({ taskType, text: text.trim(), priority });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-4 bottom-4 z-50 sm:inset-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md">
        <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-heading font-semibold text-lg">
              {editTask ? "Redigera aktivitet" : "Ny aktivitet"}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Task Type */}
            <div>
              <label className="text-sm font-medium mb-2 block">Typ</label>
              <div className="grid grid-cols-3 gap-2">
                {(["borja", "sluta", "fortsatta"] as TaskType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setTaskType(type)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      taskType === type
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {type === "borja" ? "Börja" : type === "sluta" ? "Sluta" : "Fortsätta"}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium mb-2 block">Beskrivning</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Vad ska du göra?"
                className="w-full p-3 border border-border rounded-xl bg-background text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                autoFocus
              />
            </div>

            {/* Priority */}
            <div>
              <label className="text-sm font-medium mb-2 block">Prioritet</label>
              <div className="grid grid-cols-3 gap-2">
                {([1, 2, 3] as const).map((prio) => (
                  <button
                    key={prio}
                    type="button"
                    onClick={() => setPriority(prio)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      priority === prio
                        ? prio === 1
                          ? "bg-gradient-to-r from-[#FF9F43] to-[#FF6B6B] text-white"
                          : prio === 2
                          ? "bg-[#FFC300] text-[#2D3436]"
                          : "bg-muted text-foreground"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      prio === 1 
                        ? "bg-white/20" 
                        : prio === 2 
                        ? "bg-black/10" 
                        : "bg-black/10"
                    }`}>
                      {prio}
                    </span>
                    {prio === 1 ? "Hög" : prio === 2 ? "Mellan" : "Låg"}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Avbryt
              </Button>
              <Button
                type="submit"
                disabled={!text.trim() || isSaving}
                className="flex-1"
              >
                {isSaving ? "Sparar..." : editTask ? "Uppdatera" : "Lägg till"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}


"use client";

import { useState, useEffect } from "react";
import { DimensionKey, DIMENSIONS } from "@/types/dimensions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TaskCard, AddTaskModal } from "./";
import type { TaskType as CardTaskType } from "./TaskCard";
import { DimensionTask, TaskType, saveTask, deleteTask } from "@/lib/api";
import { useAutoSave, SaveStatus } from "@/hooks/use-auto-save";
import { Plus } from "lucide-react";

interface MalPlanViewProps {
  selectedDimension: DimensionKey;
  scores: Record<DimensionKey, number>;
  goals: Record<DimensionKey, string>;
  tasks: Record<DimensionKey, DimensionTask[]>;
  onDimensionChange: (dim: DimensionKey) => void;
  onGoalChange: (dim: DimensionKey, value: string) => void;
  onGoalSave: (dim: DimensionKey) => void;
  setTasks: React.Dispatch<React.SetStateAction<Record<DimensionKey, DimensionTask[]>>>;
  saveStatus: SaveStatus;
  setSaveStatus: (status: SaveStatus) => void;
}

export function MalPlanView({
  selectedDimension,
  scores,
  goals,
  tasks,
  onDimensionChange,
  onGoalChange,
  onGoalSave,
  setTasks,
  saveStatus,
  setSaveStatus,
}: MalPlanViewProps) {
  const dimension = DIMENSIONS.find((d) => d.key === selectedDimension)!;
  const dimensionTasks = tasks[selectedDimension] || [];

  // Auto-save for goals
  useAutoSave({
    data: goals[selectedDimension],
    onSave: async () => {
      await onGoalSave(selectedDimension);
      return true;
    },
    debounceMs: 1500,
  });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<{
    id: string;
    taskType: CardTaskType;
    text: string;
    priority: 1 | 2 | 3;
  } | null>(null);

  // Reset modal when dimension changes
  useEffect(() => {
    setIsModalOpen(false);
    setEditingTask(null);
  }, [selectedDimension]);

  const handleOpenAddModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: DimensionTask) => {
    setEditingTask({
      id: task.id,
      taskType: task.task_type as CardTaskType,
      text: task.text,
      priority: task.priority,
    });
    setIsModalOpen(true);
  };

  const handleSaveTask = async (taskData: { taskType: CardTaskType; text: string; priority: 1 | 2 | 3 }) => {
    setSaveStatus("saving");
    
    if (editingTask) {
      // Update existing task
      const updatedTask = await saveTask({
        id: editingTask.id,
        dimension: selectedDimension,
        task_type: taskData.taskType as TaskType,
        text: taskData.text,
        priority: taskData.priority,
      });
      
      if (updatedTask) {
        setTasks((prev) => ({
          ...prev,
          [selectedDimension]: prev[selectedDimension].map((t) =>
            t.id === editingTask.id ? updatedTask : t
          ),
        }));
        setSaveStatus("saved");
        setIsModalOpen(false);
        setEditingTask(null);
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        setSaveStatus("error");
      }
    } else {
      // Create new task
      const newTask = await saveTask({
        dimension: selectedDimension,
        task_type: taskData.taskType as TaskType,
        text: taskData.text,
        priority: taskData.priority,
      });
      
      if (newTask) {
        setTasks((prev) => ({
          ...prev,
          [selectedDimension]: [...prev[selectedDimension], newTask],
        }));
        setSaveStatus("saved");
        setIsModalOpen(false);
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        setSaveStatus("error");
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Är du säker på att du vill ta bort denna uppgift?")) {
      return;
    }
    
    const success = await deleteTask(taskId);
    if (success) {
      setTasks((prev) => ({
        ...prev,
        [selectedDimension]: prev[selectedDimension].filter((t) => t.id !== taskId),
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Dimension selector */}
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

      {/* Goal section */}
      <div>
        <label htmlFor="goal" className="text-sm font-medium mb-2 block">
          Målbild för {dimension.label.toLowerCase()}
        </label>
        <textarea
          id="goal"
          value={goals[selectedDimension]}
          onChange={(e) => onGoalChange(selectedDimension, e.target.value)}
          placeholder="Beskriv din målbild..."
          className="w-full h-[4.5rem] p-3 border border-border rounded-xl bg-card resize-none shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm overflow-y-auto"
        />
      </div>

      {/* Tasks section */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Handlingsplan</h3>
        
        {/* Task list */}
        {dimensionTasks.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground border border-dashed border-border rounded-xl bg-card/30">
            <p className="text-sm">Inga aktiviteter ännu.</p>
            <p className="text-xs mt-1">Lägg till din första aktivitet nedan.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {[...dimensionTasks]
              .sort((a, b) => a.priority - b.priority)
              .map((task) => (
                <TaskCard
                  key={task.id}
                  id={task.id}
                  taskType={task.task_type as CardTaskType}
                  text={task.text}
                  priority={task.priority}
                  onEdit={() => handleEditTask(task)}
                  onDelete={() => handleDeleteTask(task.id)}
                />
              ))}
          </div>
        )}

        {/* Add activity button */}
        <Button
          onClick={handleOpenAddModal}
          className="w-full h-12 text-base font-medium"
          size="lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Lägg till aktivitet
        </Button>
      </div>

      {/* Add/Edit Task Modal */}
      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        editTask={editingTask}
        isSaving={saveStatus === "saving"}
      />
    </div>
  );
}


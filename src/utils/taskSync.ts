import { Task } from '../store/taskStore';
import { useTaskStore } from '../store/taskStore';
import { useTeamStore } from '../store/teamStore';

// Synchronize task status across all components
export function syncTaskStatus(taskId: string, newStatus: Task['status']) {
  const { updateTask } = useTaskStore.getState();
  const { syncWorkload } = useTeamStore.getState();

  // Update task status
  updateTask(taskId, { status: newStatus });

  // Sync team workload
  syncWorkload();
}

// Validate task conflicts
export function validateTaskConflicts(task: Partial<Task>, technicianId: string): boolean {
  const { tasks } = useTaskStore.getState();
  const { members } = useTeamStore.getState();

  const technician = members.find(m => m.id === Number(technicianId));
  if (!technician) return false;

  const technicianTasks = tasks.filter(t => 
    t.technicianId === technicianId && 
    t.date === task.date &&
    t.id !== task.id
  );

  // Check for time conflicts
  const taskStart = getTimeInMinutes(task.startTime!);
  const taskEnd = taskStart + (task.duration || 0);

  const hasConflict = technicianTasks.some(existingTask => {
    const existingStart = getTimeInMinutes(existingTask.startTime);
    const existingEnd = existingStart + existingTask.duration;

    return (
      (taskStart >= existingStart && taskStart < existingEnd) ||
      (taskEnd > existingStart && taskEnd <= existingEnd) ||
      (taskStart <= existingStart && taskEnd >= existingEnd)
    );
  });

  return !hasConflict;
}

// Helper function to convert time to minutes
function getTimeInMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}
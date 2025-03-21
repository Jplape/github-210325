import { Task } from '../store/taskStore';
import { parseISO, isValid } from 'date-fns';

export function validateTaskTime(task: Task): boolean {
  if (!task.startTime || !task.date) return false;
  
  try {
    // Validate date
    const date = parseISO(task.date);
    if (!isValid(date)) return false;

    // Validate time format and values
    const [hours, minutes] = task.startTime.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return false;
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return false;

    // Validate duration
    if (typeof task.duration !== 'number' || task.duration <= 0) return false;

    return true;
  } catch {
    return false;
  }
}

export function getTaskPosition(task: Task, hourHeight: number, startHour: number): {
  top: number;
  height: number;
} {
  if (!validateTaskTime(task)) {
    return { top: 0, height: hourHeight };
  }

  const [hours, minutes] = task.startTime.split(':').map(Number);
  const startMinutes = hours * 60 + minutes;
  const relativeMinutes = startMinutes - startHour * 60;
  
  const top = (relativeMinutes / 60) * hourHeight;
  const height = Math.max((task.duration / 60) * hourHeight, 50); // Minimum height of 50px
  
  return { top, height };
}

export function sortTasksByTime(tasks: Task[]): Task[] {
  return [...tasks]
    .filter(validateTaskTime)
    .sort((a, b) => {
      // Sort by time first
      const timeCompare = a.startTime.localeCompare(b.startTime);
      if (timeCompare !== 0) return timeCompare;
      
      // Then by priority
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
}

export function formatTaskTime(time: string | undefined): string {
  if (!time) return '';
  
  try {
    const [hours, minutes] = time.split(':').map(Number);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } catch {
    return '';
  }
}
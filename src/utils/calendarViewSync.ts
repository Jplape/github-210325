import { Task } from '../store/taskStore';
import { isWithinInterval, parseISO, isValid } from 'date-fns';

export function filterTasksForDateRange(
  tasks: Task[],
  startDate: Date,
  endDate: Date,
  filters: { technician: string; client: string }
): Task[] {
  return tasks.filter(task => {
    try {
      // Parse and validate task date
      const taskDate = parseISO(task.date);
      if (!isValid(taskDate)) return false;

      // Apply date range filter
      const isInRange = isWithinInterval(taskDate, { start: startDate, end: endDate });
      if (!isInRange) return false;

      // Apply technician filter
      if (filters.technician !== 'all' && task.technicianId !== filters.technician) {
        return false;
      }

      // Apply client filter
      if (filters.client !== 'all' && task.client !== filters.client) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  });
}

export function groupTasksByDate(tasks: Task[]): Record<string, Task[]> {
  const grouped = tasks.reduce((acc, task) => {
    if (!task.date || !isValid(parseISO(task.date))) return acc;
    
    const dateKey = task.date;
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  // Sort tasks within each group
  Object.keys(grouped).forEach(date => {
    grouped[date].sort((a, b) => {
      const timeCompare = a.startTime.localeCompare(b.startTime);
      if (timeCompare !== 0) return timeCompare;
      
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  });

  return grouped;
}
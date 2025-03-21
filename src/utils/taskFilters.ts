import { Task } from '../store/taskStore';
import { isToday, isTomorrow, isThisWeek, isPast } from 'date-fns';

export function filterTasks(tasks: Task[], filters: any) {
  return tasks.filter(task => {
    // Filter by status
    if (filters.status !== 'all') {
      if (filters.status === 'overdue') {
        if (!isPast(new Date(`${task.date}T${task.startTime}`)) || task.status === 'completed') {
          return false;
        }
      } else if (task.status !== filters.status) {
        return false;
      }
    }

    // Filter by priority
    if (filters.priority !== 'all' && task.priority !== filters.priority) {
      return false;
    }

    // Filter by technician
    if (filters.technician !== 'all') {
      if (filters.technician === 'unassigned' && task.technicianId) {
        return false;
      } else if (filters.technician !== 'unassigned' && task.technicianId !== filters.technician) {
        return false;
      }
    }

    // Filter by client
    if (filters.client !== 'all' && task.client !== filters.client) {
      return false;
    }

    // Filter by equipment
    if (filters.equipment !== 'all' && task.equipment !== filters.equipment) {
      return false;
    }

    // Filter by assignment
    if (filters.assignment !== 'all') {
      if (filters.assignment === 'assigned' && !task.technicianId) {
        return false;
      } else if (filters.assignment === 'unassigned' && task.technicianId) {
        return false;
      }
    }

    // Filter by date
    if (filters.date !== 'all') {
      const taskDate = new Date(task.date);
      switch (filters.date) {
        case 'today':
          if (!isToday(taskDate)) return false;
          break;
        case 'tomorrow':
          if (!isTomorrow(taskDate)) return false;
          break;
        case 'week':
          if (!isThisWeek(taskDate)) return false;
          break;
        case 'overdue':
          if (!isPast(taskDate) || task.status === 'completed') return false;
          break;
      }
    }

    return true;
  });
}
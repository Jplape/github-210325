import { Task } from '../store/taskStore';
import { TeamMember } from '../store/teamStore';

export interface Stats {
  activeInterventions: number;
  completedTasks: number;
  pendingTasks: number;
  unassignedTasks: number;
  highPriorityTasks: number;
  todayTasks: number;
  todayCompletedTasks: number;
  activeTechnicians: number;
  availableTechnicians: number;
  totalTasks: number;
  totalMembers: number;
}

export function calculateStats(tasks: Task[], members: TeamMember[]): Stats {
  const currentDate = new Date();
  const dateStr = currentDate.toISOString().split('T')[0];

  const activeInterventions = tasks.filter(task => task.status === 'in_progress').length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const unassignedTasks = tasks.filter(task => !task.technicianId).length;
  const highPriorityTasks = tasks.filter(task => task.priority === 'high').length;
  const todayTasks = tasks.filter(task => task.date === dateStr);
  const todayCompletedTasks = todayTasks.filter(task => task.status === 'completed').length;
  const activeTechnicians = members.filter(member => member.status !== 'offline').length;
  const availableTechnicians = members.filter(member => member.status === 'available').length;

  return {
    activeInterventions,
    completedTasks,
    pendingTasks,
    unassignedTasks,
    highPriorityTasks,
    todayTasks: todayTasks.length,
    todayCompletedTasks,
    activeTechnicians,
    availableTechnicians,
    totalTasks: tasks.length,
    totalMembers: members.length
  };
}

export function generateChartData(tasks: Task[]) {
  const data = new Map();
  
  tasks.forEach(task => {
    const month = new Date(task.date).toLocaleString('fr-FR', { month: 'short' });
    if (!data.has(month)) {
      data.set(month, { month, completed: 0, pending: 0, inProgress: 0 });
    }
    const entry = data.get(month);
    
    if (task.status === 'completed') entry.completed++;
    else if (task.status === 'in_progress') entry.inProgress++;
    else entry.pending++;
  });

  return Array.from(data.values());
}
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Task } from '../store/taskStore';
import { TeamMember } from '../store/teamStore';
import { AlertTriangle, CheckCircle, AlertOctagon } from 'lucide-react';

export function calculateStats(tasks: Task[], members: TeamMember[]) {
  const currentDate = new Date();
  const dateStr = format(currentDate, 'yyyy-MM-dd');

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

export function generateAlerts(stats: ReturnType<typeof calculateStats>) {
  return [
    {
      type: 'warning' as const,
      message: `${stats.unassignedTasks} tâches non assignées`,
      icon: AlertTriangle,
      color: 'text-yellow-500',
      link: '/tasks?filter=unassigned'
    },
    {
      type: 'urgent' as const,
      message: `${stats.highPriorityTasks} interventions haute priorité`,
      icon: AlertOctagon,
      color: 'text-red-500',
      link: '/tasks?filter=high-priority'
    },
    {
      type: 'info' as const,
      message: `${stats.todayCompletedTasks}/${stats.todayTasks} tâches terminées aujourd'hui`,
      icon: CheckCircle,
      color: 'text-green-500',
      link: '/tasks?date=today'
    }
  ].filter(alert => {
    if (alert.type === 'warning' && stats.unassignedTasks === 0) return false;
    if (alert.type === 'urgent' && stats.highPriorityTasks === 0) return false;
    return true;
  });
}

export function generateWeekData(tasks: Task[]) {
  const currentDate = new Date();
  const startOfCurrentWeek = startOfWeek(currentDate, { locale: fr });
  
  return Array.from({ length: 7 }, (_, index) => {
    const day = addDays(startOfCurrentWeek, index);
    const dayTasks = tasks.filter(task => task.date === format(day, 'yyyy-MM-dd'));
    
    return {
      name: format(day, 'EEE', { locale: fr }),
      total: dayTasks.length,
      completed: dayTasks.filter(task => task.status === 'completed').length,
      inProgress: dayTasks.filter(task => task.status === 'in_progress').length,
      pending: dayTasks.filter(task => task.status === 'pending').length,
      isToday: isSameDay(day, currentDate),
    };
  });
}
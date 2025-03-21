import { Task } from '../store/taskStore';
import { isToday, isPast, addHours } from 'date-fns';

export interface Notification {
  id: string;
  type: 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  link: string;
  tasks?: Task[];
}

export function generateNotifications(tasks: Task[]): Notification[] {
  const notifications: Notification[] = [];
  const now = new Date();

  // Tâches en retard
  const overdueTasks = tasks.filter(task => 
    task.status !== 'completed' && 
    isPast(new Date(`${task.date}T${task.startTime}`))
  );

  if (overdueTasks.length > 0) {
    notifications.push({
      id: 'overdue',
      type: 'warning',
      title: 'Tâches en retard',
      message: `${overdueTasks.length} tâche(s) nécessite(nt) votre attention`,
      timestamp: now,
      link: '/tasks?filter=overdue',
      tasks: overdueTasks
    });
  }

  // Tâches du jour non assignées
  const unassignedTodayTasks = tasks.filter(task =>
    isToday(new Date(task.date)) && !task.technicianId
  );

  if (unassignedTodayTasks.length > 0) {
    notifications.push({
      id: 'unassigned-today',
      type: 'warning',
      title: 'Tâches non assignées',
      message: `${unassignedTodayTasks.length} tâche(s) du jour sans technicien`,
      timestamp: now,
      link: '/tasks?filter=unassigned&date=today',
      tasks: unassignedTodayTasks
    });
  }

  // Tâches terminées aujourd'hui
  const completedToday = tasks.filter(task =>
    isToday(new Date(task.date)) && task.status === 'completed'
  );

  if (completedToday.length > 0) {
    notifications.push({
      id: 'completed-today',
      type: 'success',
      title: 'Tâches terminées',
      message: `${completedToday.length} tâche(s) complétée(s) aujourd'hui`,
      timestamp: now,
      link: '/tasks?filter=completed&date=today',
      tasks: completedToday
    });
  }

  // Tâches à venir
  const upcomingTasks = tasks.filter(task => {
    const taskDateTime = new Date(`${task.date}T${task.startTime}`);
    return taskDateTime > now && taskDateTime <= addHours(now, 2);
  });

  if (upcomingTasks.length > 0) {
    notifications.push({
      id: 'upcoming',
      type: 'info',
      title: 'Tâches à venir',
      message: `${upcomingTasks.length} tâche(s) dans les 2 prochaines heures`,
      timestamp: now,
      link: '/calendar',
      tasks: upcomingTasks
    });
  }

  return notifications;
}
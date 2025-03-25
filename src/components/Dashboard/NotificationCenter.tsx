import { useState } from 'react';
import { Bell, AlertTriangle, Clock, CheckCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Task } from '../../store/taskStore';
import { format, isToday, isPast, addHours, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';

interface Notification {
  id: string;
  type: 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  link: string;
  tasks?: Task[];
}

interface NotificationCenterProps {
  tasks: Task[];
}

export default function NotificationCenter({ tasks }: NotificationCenterProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedType, setSelectedType] = useState<'all' | 'warning' | 'info' | 'success'>('all');

  const generateNotifications = (): Notification[] => {
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
        link: '/tasks?date=today',
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
        link: '/tasks?assignment=unassigned&status=all&priority=all&technician=all&client=all&equipment=all&date=all',
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

    return notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  const notifications = generateNotifications();
  const filteredNotifications = notifications.filter(
    notif => selectedType === 'all' || notif.type === selectedType
  );

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const getNotificationStyle = (type: Notification['type']) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 hover:border-yellow-300';
      case 'info':
        return 'bg-blue-50 border-blue-200 hover:border-blue-300';
      case 'success':
        return 'bg-green-50 border-green-200 hover:border-green-300';
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Bell className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
          </div>
        </div>
        <p className="text-sm text-gray-500 text-center py-4">
          Aucune notification pour le moment
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Bell className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
            <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
              {notifications.length}
            </span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>

        {isExpanded && (
          <div className="flex space-x-2 mt-4">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedType === 'all'
                  ? 'bg-gray-200 text-gray-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setSelectedType('warning')}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedType === 'warning'
                  ? 'bg-yellow-200 text-yellow-800'
                  : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
              }`}
            >
              Alertes
            </button>
            <button
              onClick={() => setSelectedType('info')}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedType === 'info'
                  ? 'bg-blue-200 text-blue-800'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
            >
              Info
            </button>
            <button
              onClick={() => setSelectedType('success')}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedType === 'success'
                  ? 'bg-green-200 text-green-800'
                  : 'bg-green-50 text-green-600 hover:bg-green-100'
              }`}
            >
              Succès
            </button>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
          {filteredNotifications.map(notification => (
            <div
              key={notification.id}
              className={`rounded-lg border p-4 ${getNotificationStyle(notification.type)}`}
            >
              <div className="flex items-start space-x-3">
                {getNotificationIcon(notification.type)}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900">
                    {notification.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(notification.timestamp, { 
                      addSuffix: true,
                      locale: fr 
                    })}
                  </p>

                  {notification.tasks && notification.tasks.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {notification.tasks.slice(0, 3).map(task => (
                        <Link
                          key={task.id}
                          to={`/tasks/${task.id}`}
                          className="block p-2 rounded bg-white bg-opacity-50 hover:bg-opacity-75 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">
                              {task.title}
                            </span>
                            <ExternalLink className="h-4 w-4 text-gray-400" />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {format(new Date(task.date), 'dd/MM/yyyy')} à {task.startTime}
                          </div>
                        </Link>
                      ))}
                      {notification.tasks.length > 3 && (
                        <Link
                          to={notification.link}
                          className="block text-xs text-center text-gray-600 hover:text-gray-900 mt-2"
                        >
                          Voir {notification.tasks.length - 3} tâche(s) supplémentaire(s)
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
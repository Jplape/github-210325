import { Bell, X } from 'lucide-react';
import { useState } from 'react';
import { useTaskStore } from '../store/taskStore';
import { format, isToday } from 'date-fns';

interface NotificationsPanelProps {
  onClose: () => void;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'warning' | 'success';
  read: boolean;
}

export default function NotificationsPanel({ onClose }: NotificationsPanelProps) {
  const { tasks } = useTaskStore();
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const todayTasks = tasks.filter(task => isToday(new Date(task.date)));
    const delayedTasks = tasks.filter(task => 
      new Date(`${task.date}T${task.startTime}`) < new Date() && 
      task.status !== 'completed'
    );

    const notifs: Notification[] = [];

    if (delayedTasks.length > 0) {
      notifs.push({
        id: 1,
        title: 'Tâches en retard',
        message: `${delayedTasks.length} tâche(s) en retard nécessite(nt) votre attention`,
        time: format(new Date(), 'HH:mm'),
        type: 'warning',
        read: false
      });
    }

    const completedToday = todayTasks.filter(task => task.status === 'completed');
    if (completedToday.length > 0) {
      notifs.push({
        id: 2,
        title: 'Tâches terminées',
        message: `${completedToday.length} tâche(s) terminée(s) aujourd'hui`,
        time: format(new Date(), 'HH:mm'),
        type: 'success',
        read: false
      });
    }

    return notifs;
  });

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg py-2 z-50">
      <div className="px-4 py-2 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-600">
                {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                Tout marquer comme lu
              </button>
            )}
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200 max-h-[calc(100vh-200px)] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-6 text-center text-gray-500">
            <Bell className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p>Aucune notification</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`px-4 py-3 hover:bg-gray-50 transition-colors ${
                !notification.read ? 'bg-indigo-50' : ''
              }`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <Bell className={`h-5 w-5 ${
                      notification.type === 'info' ? 'text-blue-400' :
                      notification.type === 'warning' ? 'text-yellow-400' :
                      'text-green-400'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {notification.message}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {notification.time}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification.id);
                  }}
                  className="ml-4 text-gray-400 hover:text-gray-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
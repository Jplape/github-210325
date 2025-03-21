import { Link } from 'react-router-dom';
import { Clock, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';
import { Task } from '../../store/taskStore';
import { isToday, isPast, isFuture } from 'date-fns';

interface ClientStatisticsProps {
  clientId: number;
  tasks: Task[];
}

export default function ClientStatistics({ clientId, tasks }: ClientStatisticsProps) {
  // Statistiques récentes
  const recentTasks = tasks.filter(task => {
    const taskDate = new Date(task.date);
    return isToday(taskDate) || isFuture(taskDate);
  });

  const todayTasks = tasks.filter(task => isToday(new Date(task.date)));
  const overdueTasks = tasks.filter(task => 
    task.status !== 'completed' && 
    isPast(new Date(`${task.date}T${task.startTime}`))
  );

  const stats = [
    {
      label: "Aujourd'hui",
      value: todayTasks.length,
      icon: Clock,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100',
      link: `/tasks?client=${clientId}&date=today`
    },
    {
      label: "En retard",
      value: overdueTasks.length,
      icon: AlertTriangle,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100',
      link: `/tasks?client=${clientId}&status=overdue`
    },
    {
      label: "À venir",
      value: recentTasks.length,
      icon: Calendar,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-100',
      link: `/tasks?client=${clientId}&period=upcoming`
    },
    {
      label: "Terminées (30j)",
      value: tasks.filter(task => 
        task.status === 'completed' &&
        new Date(task.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ).length,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-100',
      link: `/tasks?client=${clientId}&status=completed&period=30days`
    }
  ];

  return (
    <div className="mt-6 border-t pt-6">
      <h4 className="text-sm font-medium text-gray-900 mb-4">Aperçu des interventions</h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="group p-4 rounded-lg border border-gray-200 hover:border-indigo-500 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <span className="text-2xl font-semibold text-gray-900">{stat.value}</span>
            </div>
            <span className="text-sm text-gray-600 group-hover:text-indigo-600">
              {stat.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
import { Clock, AlertCircle, User } from 'lucide-react';
import { Task } from '../../store/taskStore';
import { useTeamStore } from '../../store/teamStore';

interface TaskBadgeProps {
  task: Task;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  compact?: boolean;
}

export default function TaskBadge({ task, onClick, onContextMenu, compact = false }: TaskBadgeProps) {
  const { members } = useTeamStore();
  const technician = task.technicianId 
    ? members.find(m => m.id === Number(task.technicianId))
    : null;

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-red-200 hover:bg-red-100 text-red-700';
      case 'medium':
        return 'bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-700';
      case 'low':
        return 'bg-green-50 border-green-200 hover:bg-green-100 text-green-700';
      default:
        return 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700';
    }
  };

  return (
    <div
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={`
        rounded-md border px-2 py-1.5 cursor-pointer
        transition-all duration-200 hover:shadow-sm
        ${getPriorityStyle(task.priority)}
      `}
    >
      <div className="flex items-start justify-between gap-1">
        <span className="text-xs font-medium truncate flex-1">
          {task.title}
        </span>
        {task.priority === 'high' && (
          <AlertCircle className="h-3 w-3 flex-shrink-0 text-red-500" />
        )}
      </div>

      {!compact && (
        <>
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-600">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-0.5" />
              {task.startTime}
            </div>
            {technician && (
              <div className="flex items-center">
                <User className="h-3 w-3 mr-0.5" />
                <span className="truncate">{technician.name}</span>
              </div>
            )}
          </div>

          <div className="mt-1">
            <span className={`
              inline-flex items-center px-1.5 py-0.5 rounded-full text-xs
              ${task.status === 'completed' ? 'bg-green-100 text-green-800' :
                task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'}
            `}>
              {task.status === 'completed' ? 'Terminée' :
               task.status === 'in_progress' ? 'En cours' :
               'En attente'}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
import { format } from 'date-fns';
import { Plus, ChevronDown } from 'lucide-react';
import { Task } from '../../store/taskStore';
import { DroppableDay } from './DroppableDay';
import TaskBadge from './TaskBadge';
import { useState } from 'react';

interface MonthDayProps {
  day: {
    date: Date;
    dateStr: string;
    isCurrentMonth: boolean;
    tasks: Task[];
  };
  onNewTask: (date: string) => void;
  onEditTask: (task: Task) => void;
  onContextMenu: (e: React.MouseEvent, task: Task) => void;
  isOver: boolean;
}

const MAX_VISIBLE_TASKS = 3;

export default function MonthDay({
  day,
  onNewTask,
  onEditTask,
  onContextMenu,
  isOver
}: MonthDayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { date, dateStr, isCurrentMonth, tasks } = day;

  const visibleTasks = isExpanded ? tasks : tasks.slice(0, MAX_VISIBLE_TASKS);
  const hasMoreTasks = tasks.length > MAX_VISIBLE_TASKS;

  return (
    <DroppableDay date={dateStr} isOver={isOver}>
      <div className={`min-h-[140px] ${
        !isCurrentMonth ? 'bg-gray-50' : 'bg-white'
      }`}>
        <div className="p-2">
          <div className="flex items-center justify-between">
            <time
              dateTime={format(date, 'yyyy-MM-dd')}
              className={`inline-flex items-center justify-center rounded-full w-7 h-7 text-sm ${
                !isCurrentMonth 
                  ? 'text-gray-400' 
                  : 'text-gray-900'
              }`}
            >
              {format(date, 'd')}
            </time>
            {tasks.length > 0 && (
              <span className="text-xs font-medium text-gray-500">
                {tasks.length} tâche{tasks.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="mt-2 space-y-1">
            {visibleTasks.map(task => (
              <TaskBadge
                key={task.id}
                task={task}
                onClick={() => onEditTask(task)}
                onContextMenu={(e) => onContextMenu(e, task)}
                compact
              />
            ))}

            {hasMoreTasks && !isExpanded && (
              <button
                onClick={() => setIsExpanded(true)}
                className="w-full mt-1 py-1 px-2 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-sm flex items-center justify-center gap-1 transition-colors"
              >
                <span>{tasks.length - MAX_VISIBLE_TASKS} de plus</span>
                <ChevronDown className="h-3 w-3" />
              </button>
            )}

            {isExpanded && (
              <button
                onClick={() => setIsExpanded(false)}
                className="w-full mt-1 py-1 px-2 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-sm transition-colors"
              >
                Réduire
              </button>
            )}
          </div>

          <button
            onClick={() => onNewTask(dateStr)}
            className="w-full mt-2 p-1 text-xs text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
          >
            <Plus className="h-3 w-3 mx-auto" />
          </button>
        </div>
      </div>
    </DroppableDay>
  );
}

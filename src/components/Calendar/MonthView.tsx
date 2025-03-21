import { format, startOfWeek, addDays, isSameMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, ChevronDown } from 'lucide-react';
import { Task } from '../../store/taskStore';
import { DroppableDay } from './DroppableDay';
import TaskCard from './TaskCard';

interface MonthViewProps {
  currentDate: Date;
  tasks: Task[];
  onNewTask: (date: string) => void;
  onEditTask: (task: Task) => void;
  onContextMenu: (e: React.MouseEvent, task: Task) => void;
  draggedOverDate: string | null;
}

export default function MonthView({
  currentDate,
  tasks,
  onNewTask,
  onEditTask,
  onContextMenu,
  draggedOverDate
}: MonthViewProps) {
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const startDate = startOfWeek(monthStart, { locale: fr });
  const weeks = [];

  let currentWeek = [];
  let day = startDate;

  for (let i = 0; i < 42; i++) {
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayTasks = tasks.filter(task => task.date === dateStr);
    
    currentWeek.push({
      date: day,
      dateStr,
      isCurrentMonth: isSameMonth(day, monthStart),
      tasks: dayTasks
    });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }

    day = addDays(day, 1);
  }

  const weekDays = Array.from({ length: 7 }, (_, i) => 
    format(addDays(startDate, i), 'EEE', { locale: fr })
  );

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden flex flex-col h-[calc(100vh-16rem)]">
      <div className="grid grid-cols-7 border-b">
        {weekDays.map((day, index) => (
          <div
            key={index}
            className="py-2 text-center text-sm font-semibold text-gray-700 border-r last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-7 h-auto">
          {weeks.map((week) => (
            week.map((day) => (
              <DroppableDay
                key={day.dateStr}
                date={day.dateStr}
                isOver={draggedOverDate === day.dateStr}
              >
                <div
                  className={`min-h-[120px] p-2 border-r border-b last:border-r-0 ${
                    !day.isCurrentMonth ? 'bg-gray-50' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${
                      !day.isCurrentMonth ? 'text-gray-400' : 'text-gray-900'
                    }`}>
                      {format(day.date, 'd')}
                    </span>
                    {day.tasks.length > 0 && (
                      <span className="text-xs text-gray-500">
                        {day.tasks.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    {day.tasks.slice(0, 3).map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={onEditTask}
                        onContextMenu={onContextMenu}
                        compact
                      />
                    ))}
                    {day.tasks.length > 3 && (
                      <div className="text-xs text-center text-gray-500">
                        +{day.tasks.length - 3} plus
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => onNewTask(day.dateStr)}
                    className="w-full mt-2 text-xs text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded p-1 transition-colors"
                  >
                    <Plus className="h-3 w-3 mx-auto" />
                  </button>
                </div>
              </DroppableDay>
            ))
          ))}
        </div>
      </div>
    </div>
  );
}
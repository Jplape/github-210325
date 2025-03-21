import { Task } from '../../store/taskStore';
import MonthDay from './MonthDay';

interface MonthGridProps {
  days: Array<{
    date: Date;
    dateStr: string;
    isCurrentMonth: boolean;
    tasks: Task[];
  }>;
  weekDays: string[];
  onNewTask: (date: string) => void;
  onEditTask: (task: Task) => void;
  onContextMenu: (e: React.MouseEvent, task: Task) => void;
  draggedOverDate: string | null;
}

export default function MonthGrid({
  days,
  weekDays,
  onNewTask,
  onEditTask,
  onContextMenu,
  draggedOverDate
}: MonthGridProps) {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Header with weekday names */}
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {weekDays.map((day) => (
          <div
            key={day}
            className="bg-gray-50 py-2 text-center text-sm font-semibold text-gray-700 uppercase"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {days.map((day) => (
          <MonthDay
            key={day.dateStr}
            day={day}
            onNewTask={onNewTask}
            onEditTask={onEditTask}
            onContextMenu={onContextMenu}
            isOver={draggedOverDate === day.dateStr}
          />
        ))}
      </div>
    </div>
  );
}
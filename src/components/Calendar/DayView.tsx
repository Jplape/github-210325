import { format, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, Clock, User, MapPin, AlertCircle } from 'lucide-react';
import { Task } from '../../store/taskStore';
import { useTeamStore } from '../../store/teamStore';
import { DroppableDay } from './DroppableDay';
import { validateTaskTime, getTaskPosition, sortTasksByTime } from '../../utils/calendarTaskSync';

interface DayViewProps {
  currentDate: Date;
  tasks: Task[];
  onNewTask: (date: string) => void;
  onEditTask: (task: Task) => void;
  onContextMenu: (e: React.MouseEvent, task: Task) => void;
  draggedOverDate: string | null;
}

const HOUR_HEIGHT = 80;
const START_HOUR = 7;
const END_HOUR = 18;

export default function DayView({
  currentDate,
  tasks,
  onNewTask,
  onEditTask,
  onContextMenu,
  draggedOverDate
}: DayViewProps) {
  const { members } = useTeamStore();
  const dateStr = format(currentDate, 'yyyy-MM-dd');
  const validTasks = tasks.filter(validateTaskTime);
  const sortedTasks = sortTasksByTime(validTasks);

  const hours = Array.from(
    { length: END_HOUR - START_HOUR + 1 },
    (_, i) => START_HOUR + i
  );

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden h-[calc(100vh-12rem)]">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {format(currentDate, 'EEEE d MMMM yyyy', { locale: fr })}
          </h3>
          <div className="text-sm text-gray-500">
            {sortedTasks.length} tâche{sortedTasks.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-16 flex-shrink-0 bg-gray-50 border-r">
            {hours.map(hour => (
              <div
                key={hour}
                className="relative"
                style={{ height: HOUR_HEIGHT }}
              >
                <div className="absolute right-2 top-0 -translate-y-1/2">
                  <span className="text-sm font-medium text-gray-500">
                    {`${hour}:00`}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex-1 relative overflow-y-auto">
            <DroppableDay
              date={dateStr}
              isOver={draggedOverDate === dateStr}
            >
              <div className="absolute inset-0">
                {hours.map(hour => (
                  <div
                    key={hour}
                    className="border-t border-gray-100"
                    style={{ height: HOUR_HEIGHT }}
                  >
                    <div className="h-1/2 border-t border-gray-50 border-dashed" />
                  </div>
                ))}
              </div>

              <div className="absolute inset-0">
                {sortedTasks.map(task => {
                  const position = getTaskPosition(task, HOUR_HEIGHT, START_HOUR);
                  const technician = task.technicianId 
                    ? members.find(m => m.id === Number(task.technicianId))
                    : null;

                  return (
                    <div
                      key={task.id}
                      className="absolute left-1 right-1"
                      style={{ 
                        top: `${position.top}px`, 
                        height: `${position.height}px` 
                      }}
                      onClick={() => onEditTask(task)}
                      onContextMenu={(e) => onContextMenu(e, task)}
                    >
                      <div className={`
                        h-full rounded-lg border p-2 cursor-pointer
                        ${task.priority === 'high' 
                          ? 'bg-red-50 border-red-200 hover:bg-red-100' 
                          : task.priority === 'medium'
                          ? 'bg-orange-50 border-orange-200 hover:bg-orange-100'
                          : 'bg-green-50 border-green-200 hover:bg-green-100'}
                      `}>
                        <div className="flex items-start justify-between mb-1">
                          <span className="text-sm font-medium truncate">
                            {task.title}
                          </span>
                          {task.priority === 'high' && (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>

                        <div className="space-y-1 text-xs text-gray-600">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {task.startTime}
                          </div>
                          {technician && (
                            <div className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              <span className="truncate">{technician.name}</span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span className="truncate">{task.client}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {isToday(currentDate) && (
                <div
                  className="absolute left-0 right-0 flex items-center pointer-events-none z-20"
                  style={{
                    top: `${((new Date().getHours() - START_HOUR) * 60 + new Date().getMinutes()) * (HOUR_HEIGHT / 60)}px`,
                  }}
                >
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <div className="flex-1 border-t-2 border-red-500" />
                </div>
              )}
            </DroppableDay>
          </div>
        </div>

        <button
          onClick={() => onNewTask(dateStr)}
          className="absolute bottom-4 right-4 p-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
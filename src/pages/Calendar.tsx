import { useState } from 'react';
import { Plus } from 'lucide-react';
import { DndContext, DragEndEvent, DragStartEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { useTaskStore } from '../store/taskStore';
import { useCalendarStore } from '../store/calendarStore';
import { useCalendarSync } from '../hooks/useCalendarSync';
import { useCalendarNavigation } from '../hooks/useCalendarNavigation';
import CalendarNavigation from '../components/Calendar/CalendarNavigation';
import NewTaskModal from '../components/Calendar/NewTaskModal';
import MonthView from '../components/Calendar/MonthView';
import WeekView from '../components/Calendar/WeekView';
import DayView from '../components/Calendar/DayView';
import CalendarFilters from '../components/Calendar/CalendarFilters';
import TaskContextMenu from '../components/Calendar/TaskContextMenu';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { Task } from '../store/taskStore';

export default function Calendar() {
  const { moveTask } = useTaskStore();
  const { filters, setFilters } = useCalendarStore();
  const { tasks } = useCalendarSync();
  const {
    currentDate,
    view,
    setView,
    navigate  } = useCalendarNavigation();
  
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [, setActiveId] = useState<string | null>(null);
  const [draggedOverDate, setDraggedOverDate] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    task: Task;
    position: { x: number; y: number };
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleNewTask = (date: string) => {
    setSelectedDate(date);
    setTaskToEdit(null);
    setIsNewTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsNewTaskModalOpen(true);
  };

  const handleContextMenu = (e: React.MouseEvent, task: Task) => {
    e.preventDefault();
    setContextMenu({
      task,
      position: { x: e.clientX, y: e.clientY }
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      setDraggedOverDate(null);
      return;
    }

    const taskId = active.id as string;
    const dropDate = over.id as string;

    try {
      moveTask(taskId, dropDate);
      toast.success("Tâche déplacée avec succès");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Une erreur est survenue lors du déplacement de la tâche");
      }
    }

    setActiveId(null);
    setDraggedOverDate(null);
  };

  const handleDragOver = (event: any) => {
    const { over } = event;
    if (over) {
      setDraggedOverDate(over.id as string);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <CalendarNavigation
          currentDate={currentDate}
          view={view}
          onViewChange={setView}
          onNavigate={navigate}
        />
        
        <div className="flex items-center space-x-4">
          <CalendarFilters
            clients={Array.from(new Set(tasks.map(task => task.client)))}
            filters={filters}
            onFilterChange={setFilters}
          />
          
          <button
            onClick={() => {
              setSelectedDate(format(currentDate, 'yyyy-MM-dd'));
              setTaskToEdit(null);
              setIsNewTaskModalOpen(true);
            }}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle tâche
          </button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        {view === 'month' && (
          <MonthView
            currentDate={currentDate}
            tasks={tasks}
            onNewTask={handleNewTask}
            onEditTask={handleEditTask}
            onContextMenu={handleContextMenu}
            draggedOverDate={draggedOverDate}
          />
        )}
        {view === 'week' && (
          <WeekView
            currentDate={currentDate}
            tasks={tasks}
            onNewTask={handleNewTask}
            onEditTask={handleEditTask}
            onContextMenu={handleContextMenu}
            draggedOverDate={draggedOverDate}
          />
        )}
        {view === 'day' && (
          <DayView
            currentDate={currentDate}
            tasks={tasks}
            onNewTask={handleNewTask}
            onEditTask={handleEditTask}
            onContextMenu={handleContextMenu}
            draggedOverDate={draggedOverDate}
          />
        )}
      </DndContext>

      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => {
          setIsNewTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        selectedDate={selectedDate}
        taskToEdit={taskToEdit}
      />

      {contextMenu && (
        <TaskContextMenu
          task={contextMenu.task}
          position={contextMenu.position}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task } from './taskStore';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';

type CalendarView = 'month' | 'week' | 'day';

interface CalendarState {
  currentDate: Date;
  view: CalendarView;
  selectedTask: Task | null;
  draggedTask: Task | null;
  filters: {
    technician: string;
    client: string;
  };
  lastSync: number;
  setCurrentDate: (date: Date) => void;
  setView: (view: CalendarView) => void;
  setSelectedTask: (task: Task | null) => void;
  setDraggedTask: (task: Task | null) => void;
  setFilters: (filters: { technician: string; client: string }) => void;
  updateLastSync: () => void;
  getVisibleDateRange: () => { start: Date; end: Date };
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      currentDate: new Date(),
      view: 'month',
      selectedTask: null,
      draggedTask: null,
      filters: {
        technician: 'all',
        client: 'all'
      },
      lastSync: Date.now(),

      setCurrentDate: (date) => set({ currentDate: date }),
      setView: (view) => set({ view }),
      setSelectedTask: (task) => set({ selectedTask: task }),
      setDraggedTask: (task) => set({ draggedTask: task }),
      setFilters: (filters) => set({ filters }),
      updateLastSync: () => set({ lastSync: Date.now() }),

      getVisibleDateRange: () => {
        const { currentDate, view } = get();
        switch (view) {
          case 'day':
            return {
              start: startOfDay(currentDate),
              end: endOfDay(currentDate)
            };
          case 'week':
            return {
              start: startOfWeek(currentDate, { weekStartsOn: 1 }),
              end: endOfWeek(currentDate, { weekStartsOn: 1 })
            };
          case 'month':
            return {
              start: startOfMonth(currentDate),
              end: endOfMonth(currentDate)
            };
        }
      }
    }),
    {
      name: 'calendar-storage',
      version: 1,
      partialize: (state) => ({
        view: state.view,
        filters: state.filters
      })
    }
  )
);
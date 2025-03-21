import { useEffect, useRef, useCallback } from 'react';
import { useTaskStore } from '../store/taskStore';
import { useCalendarStore } from '../store/calendarStore';
import { parseISO, isValid } from 'date-fns';

export function useTaskSync() {
  const { tasks, lastUpdate } = useTaskStore();
  const { lastSync, updateLastSync } = useCalendarStore();
  const isInitialMount = useRef(true);

  const validateTasks = useCallback(() => {
    const invalidTasks = tasks.filter(task => {
      try {
        return !task.date || !isValid(parseISO(task.date));
      } catch {
        return true;
      }
    });

    if (invalidTasks.length > 0) {
      console.warn('Invalid tasks detected:', invalidTasks);
    }
  }, [tasks]);

  useEffect(() => {
    if (isInitialMount.current) {
      validateTasks();
      isInitialMount.current = false;
      return;
    }

    if (lastUpdate > lastSync) {
      validateTasks();
      updateLastSync();
    }
  }, [lastUpdate, lastSync, updateLastSync, validateTasks]);

  return null;
}
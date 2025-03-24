import { useEffect, useRef, useCallback } from 'react';
import { useTaskStore } from '../store/taskStore';
import { useCalendarStore } from '../store/calendarStore';
import { parseISO, isValid } from 'date-fns';
import { supabase } from '../../lib/supabase';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import type { Task } from '../types/task';

interface TaskWithOrigin extends Task {
  origin?: 'local' | 'remote';
}

// Type guard pour vérifier les tâches incomplètes
function isCompleteTask(task: Partial<Task>): task is Task {
  return !!task.id && !!task.title && !!task.client && !!task.date &&
         !!task.startTime && !!task.status && !!task.priority;
}

export function useTaskSync() {
  const { tasks, lastUpdate, addTask, updateTask, deleteTask } = useTaskStore();
  const { lastSync, updateLastSync } = useCalendarStore();
  const isInitialMount = useRef(true);
  const pendingSyncs = useRef<Set<string>>(new Set());

  // Validation des tâches locales
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

  // Synchronisation des changements distants
  useEffect(() => {
    const subscription = supabase
      .channel('tasks-sync')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks'
      }, (payload: RealtimePostgresChangesPayload<Task>) => {
        // Ignorer les événements déclenchés localement
        const incomingId = payload.new?.id || payload.old?.id;
        if (!incomingId || pendingSyncs.current.has(incomingId)) {
          return;
        }

        const taskWithOrigin = {
          ...payload.new || payload.old,
          origin: 'remote'
        };

        switch (payload.eventType) {
          case 'INSERT':
            addTask(taskWithOrigin);
            break;
          case 'UPDATE':
            updateTask(taskWithOrigin.id, taskWithOrigin);
            break;
          case 'DELETE':
            deleteTask(payload.old.id);
            break;
        }
        updateLastSync(new Date().toISOString());
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [addTask, updateTask, deleteTask, updateLastSync]);

  // Envoi des modifications locales au serveur
  const syncLocalChanges = useCallback(async (task: TaskWithOrigin) => {
    if (task.origin === 'remote') return;

    pendingSyncs.current.add(task.id);
    try {
      const { error } = await supabase
        .from('tasks')
        .upsert({ ...task, origin: undefined });

      if (error) throw error;
    } finally {
      pendingSyncs.current.delete(task.id);
    }
  }, []);

  // Synchronisation des changements locaux
  useEffect(() => {
    if (isInitialMount.current) {
      validateTasks();
      isInitialMount.current = false;
      return;
    }

    if (lastUpdate > lastSync) {
      validateTasks();
      // Synchroniser uniquement les tâches modifiées localement
      tasks
        .filter(task => !task.origin || task.origin === 'local')
        .forEach(syncLocalChanges);
      updateLastSync();
    }
  }, [lastUpdate, lastSync, tasks, updateLastSync, validateTasks, syncLocalChanges]);

  // Synchronisation des changements locaux
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
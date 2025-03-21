import { useState, useCallback } from 'react';
import { addDays, addMonths, subMonths, subDays, startOfWeek, endOfWeek } from 'date-fns';

export function useCalendarNavigation(initialDate = new Date()) {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');

  const navigate = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate(currentDate => {
      switch (view) {
        case 'month':
          return direction === 'prev' 
            ? subMonths(currentDate, 1)
            : addMonths(currentDate, 1);
        case 'week':
          return direction === 'prev'
            ? subDays(currentDate, 7)
            : addDays(currentDate, 7);
        case 'day':
          return direction === 'prev'
            ? subDays(currentDate, 1)
            : addDays(currentDate, 1);
        default:
          return currentDate;
      }
    });
  }, [view]);

  const getVisibleRange = useCallback(() => {
    switch (view) {
      case 'month':
        return {
          start: startOfWeek(currentDate, { weekStartsOn: 1 }),
          end: endOfWeek(addMonths(currentDate, 1), { weekStartsOn: 1 })
        };
      case 'week':
        return {
          start: startOfWeek(currentDate, { weekStartsOn: 1 }),
          end: endOfWeek(currentDate, { weekStartsOn: 1 })
        };
      case 'day':
        return {
          start: currentDate,
          end: currentDate
        };
    }
  }, [currentDate, view]);

  return {
    currentDate,
    view,
    setView,
    navigate,
    getVisibleRange
  };
}
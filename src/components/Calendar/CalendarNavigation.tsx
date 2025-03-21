import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CalendarNavigationProps {
  currentDate: Date;
  view: 'month' | 'week' | 'day';
  onViewChange: (view: 'month' | 'week' | 'day') => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export default function CalendarNavigation({
  currentDate,
  view,
  onViewChange,
  onNavigate
}: CalendarNavigationProps) {
  return (
    <div className="flex items-center space-x-4">
      <h2 className="text-lg font-semibold text-gray-900">
        {format(currentDate, 'MMMM yyyy', { locale: fr })}
      </h2>
      
      <div className="flex space-x-2">
        <button
          onClick={() => onViewChange('month')}
          className={`px-3 py-1 rounded transition-colors ${
            view === 'month' 
              ? 'bg-indigo-100 text-indigo-600' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Mois
        </button>
        <button
          onClick={() => onViewChange('week')}
          className={`px-3 py-1 rounded transition-colors ${
            view === 'week'
              ? 'bg-indigo-100 text-indigo-600'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Semaine
        </button>
        <button
          onClick={() => onViewChange('day')}
          className={`px-3 py-1 rounded transition-colors ${
            view === 'day'
              ? 'bg-indigo-100 text-indigo-600'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Jour
        </button>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => onNavigate('prev')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Mois précédent"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        <button
          onClick={() => onNavigate('next')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Mois suivant"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
}
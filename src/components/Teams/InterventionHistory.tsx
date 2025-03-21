import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ChevronDown, ChevronUp, Calendar, MapPin, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TeamMember } from '../../store/teamStore';
import { useTaskStore } from '../../store/taskStore';

interface InterventionHistoryProps {
  member: TeamMember;
}

export default function InterventionHistory({ member }: InterventionHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { tasks } = useTaskStore();
  
  const memberTasks = tasks
    .filter(task => task.technicianId === member.id.toString())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const completedTasks = memberTasks.filter(task => task.status === 'completed');

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-gray-400" />
          <h4 className="text-sm font-medium text-gray-900">Historique des interventions</h4>
          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
            {completedTasks.length}
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {memberTasks.length > 0 ? (
            <>
              <div className="space-y-3">
                {memberTasks.slice(0, 5).map(task => (
                  <Link
                    key={task.id}
                    to={`/intervention-reports?task=${task.id}`}
                    className="block p-3 rounded-lg border border-gray-200 hover:border-indigo-500 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 group-hover:text-indigo-600">
                        {task.title}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusStyle(task.status)}`}>
                          {task.status === 'completed' ? 'Terminée' :
                           task.status === 'in_progress' ? 'En cours' : 'En attente'}
                        </span>
                        <ExternalLink className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {format(new Date(task.date), 'dd MMMM yyyy', { locale: fr })}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {task.client}
                      </div>
                    </div>
                    {task.equipment && (
                      <div className="mt-1 text-xs text-gray-500">
                        Équipement: {task.equipment}
                        {task.serialNumber && ` (${task.serialNumber})`}
                      </div>
                    )}
                  </Link>
                ))}
              </div>

              {memberTasks.length > 5 && (
                <Link
                  to={`/intervention-reports?technician=${member.id}`}
                  className="block text-sm text-center text-indigo-600 hover:text-indigo-700 py-2"
                >
                  Voir toutes les interventions
                </Link>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              Aucune intervention enregistrée
            </p>
          )}
        </div>
      )}
    </div>
  );
}
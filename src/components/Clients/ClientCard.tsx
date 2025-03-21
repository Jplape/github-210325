import { useState } from 'react';
import { Building2, MapPin, Phone, Calendar, FileText, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTaskStore } from '../../store/taskStore';
import EquipmentList from './EquipmentList';
import ClientStatistics from './ClientStatistics';

interface Client {
  id: number;
  name: string;
  address: string;
  phone: string;
  installations: number;
  lastService: string;
  status: 'active' | 'inactive';
}

interface ClientCardProps {
  client: Client;
}

export default function ClientCard({ client }: ClientCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { tasks } = useTaskStore();
  const clientTasks = tasks.filter(task => task.client === client.name);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-gray-100 rounded-full p-3">
              <Building2 className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {client.name}
              </h3>
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {client.status}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="h-4 w-4 mr-2" />
            {client.address}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Phone className="h-4 w-4 mr-2" />
            {client.phone}
          </div>
        </div>

        <ClientStatistics clientId={client.id} tasks={clientTasks} />

        {isExpanded && (
          <div className="mt-6 space-y-6">
            <EquipmentList tasks={clientTasks} clientId={client.id} />

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Dernières interventions</h4>
              <div className="space-y-3">
                {clientTasks.slice(0, 3).map(task => (
                  <Link
                    key={task.id}
                    to={`/tasks/${task.id}`}
                    className="block p-3 rounded-lg border border-gray-200 hover:border-indigo-500 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{task.title}</span>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                          {task.status === 'completed' ? 'Terminée' :
                           task.status === 'in_progress' ? 'En cours' : 'En attente'}
                        </span>
                        <ExternalLink className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(new Date(task.date), 'dd MMMM yyyy', { locale: fr })} à {task.startTime}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <Link
                to={`/tasks?client=${client.id}`}
                className="block mt-3 text-sm text-center text-indigo-600 hover:text-indigo-700"
              >
                Voir toutes les interventions
              </Link>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Rapports d'intervention</h4>
              <Link
                to={`/intervention-reports?client=${client.id}`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <FileText className="h-4 w-4 mr-2" />
                Consulter les rapports
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
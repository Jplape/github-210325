import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, ChevronDown, ChevronUp, Calendar, ExternalLink, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Task } from '../../store/taskStore';

interface EquipmentListProps {
  tasks: Task[];
  clientId: number;
}

interface GroupedEquipment {
  [key: string]: {
    equipment: string;
    brand?: string;
    model?: string;
    serialNumber?: string;
    tasks: Task[];
    lastMaintenance?: string;
    status: 'ok' | 'warning' | 'maintenance';
  };
}

export default function EquipmentList({ tasks, clientId }: EquipmentListProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const groupedEquipment = tasks.reduce((acc: GroupedEquipment, task) => {
    if (!task.equipment) return acc;

    if (!acc[task.equipment]) {
      acc[task.equipment] = {
        equipment: task.equipment,
        brand: task.brand,
        model: task.model,
        serialNumber: task.serialNumber,
        tasks: [],
        status: 'ok'
      };
    }

    acc[task.equipment].tasks.push(task);

    // Mettre à jour la dernière maintenance
    const completedTasks = acc[task.equipment].tasks.filter(t => t.status === 'completed');
    if (completedTasks.length > 0) {
      acc[task.equipment].lastMaintenance = completedTasks
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date;
    }

    // Déterminer le statut
    const hasOverdueTasks = acc[task.equipment].tasks.some(t => 
      t.status === 'pending' && new Date(t.date) < new Date()
    );
    const hasPendingMaintenance = acc[task.equipment].tasks.some(t => 
      t.status === 'pending' && t.priority === 'high'
    );

    if (hasOverdueTasks) {
      acc[task.equipment].status = 'warning';
    } else if (hasPendingMaintenance) {
      acc[task.equipment].status = 'maintenance';
    }

    return acc;
  }, {});

  const equipmentList = Object.values(groupedEquipment);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'warning':
        return 'text-yellow-500';
      case 'maintenance':
        return 'text-blue-500';
      default:
        return 'text-green-500';
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Wrench className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">Équipements</h3>
          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
            {equipmentList.length}
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
        <div className="space-y-4">
          {equipmentList.map((item, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 hover:border-indigo-500 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <Wrench className={`h-5 w-5 ${getStatusStyle(item.status)}`} />
                    <h4 className="text-lg font-medium text-gray-900">
                      {item.equipment}
                    </h4>
                  </div>
                  {(item.brand || item.model) && (
                    <p className="mt-1 text-sm text-gray-500">
                      {item.brand} {item.model}
                    </p>
                  )}
                  {item.serialNumber && (
                    <p className="text-sm text-gray-500">
                      N° série: {item.serialNumber}
                    </p>
                  )}
                </div>
                {item.status === 'warning' && (
                  <div className="flex items-center text-yellow-500">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="ml-2 text-sm">Maintenance en retard</span>
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Dernière maintenance: {item.lastMaintenance ? 
                      format(new Date(item.lastMaintenance), 'dd MMMM yyyy', { locale: fr }) :
                      'Aucune'
                    }
                  </div>
                  <Link
                    to={`/tasks?client=${clientId}&equipment=${encodeURIComponent(item.equipment)}`}
                    className="flex items-center text-indigo-600 hover:text-indigo-700"
                  >
                    Voir l'historique
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center">
                    <span className="text-2xl font-semibold text-gray-900">
                      {item.tasks.filter(t => t.status === 'completed').length}
                    </span>
                    <span className="block text-sm text-gray-500">Interventions terminées</span>
                  </div>
                  <div className="text-center">
                    <span className="text-2xl font-semibold text-gray-900">
                      {item.tasks.filter(t => t.status === 'in_progress').length}
                    </span>
                    <span className="block text-sm text-gray-500">En cours</span>
                  </div>
                  <div className="text-center">
                    <span className="text-2xl font-semibold text-gray-900">
                      {item.tasks.filter(t => t.status === 'pending').length}
                    </span>
                    <span className="block text-sm text-gray-500">En attente</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
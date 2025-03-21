import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MaintenanceHistory } from '../../types/equipment';
import { FileText, PenTool as Tool, Calendar, Download, Link as LinkIcon, Hash } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTaskStore } from '../../store/taskStore';
import { useReportStore } from '../../store/reportStore';

interface MaintenanceHistoryListProps {
  history: MaintenanceHistory[];
  onAddMaintenance?: () => void;
  equipmentId: string;
}

export default function MaintenanceHistoryList({
  history,
  onAddMaintenance,
  equipmentId
}: MaintenanceHistoryListProps) {
  const { tasks } = useTaskStore();
  const { reports } = useReportStore();

  // Fonction pour trouver la tâche associée à une maintenance
  const findAssociatedTask = (maintenance: MaintenanceHistory) => {
    return tasks.find(task => 
      task.type === 'maintenance' &&
      task.equipment === maintenance.equipment &&
      task.date === maintenance.date &&
      task.technicianId === maintenance.technician
    );
  };

  // Fonction pour trouver le rapport associé à une maintenance
  const findAssociatedReport = (maintenance: MaintenanceHistory) => {
    return reports.find(report => 
      report.equipmentId === equipmentId &&
      report.date === maintenance.date &&
      report.technicianId === maintenance.technician
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Historique des maintenances
        </h3>
        {onAddMaintenance && (
          <button
            onClick={onAddMaintenance}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
          >
            <Tool className="h-4 w-4 mr-1.5" />
            Ajouter une maintenance
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <p className="text-center text-sm text-gray-500 py-4">
          Aucun historique de maintenance
        </p>
      ) : (
        <div className="flow-root">
          <ul className="-mb-8">
            {history.map((maintenance, idx) => {
              const associatedTask = findAssociatedTask(maintenance);
              const associatedReport = findAssociatedReport(maintenance);

              return (
                <li key={maintenance.id}>
                  <div className="relative pb-8">
                    {idx !== history.length - 1 && (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    )}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={`
                          h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white
                          ${maintenance.type === 'preventive' 
                            ? 'bg-blue-500' 
                            : 'bg-yellow-500'
                          }
                        `}>
                          <Tool className="h-5 w-5 text-white" />
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-gray-900">
                            {maintenance.type === 'preventive' 
                              ? 'Maintenance préventive'
                              : 'Maintenance corrective'
                            }
                          </div>
                          {associatedTask && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Hash className="h-4 w-4 mr-1" />
                              <span>Tâche {associatedTask.id}</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {format(new Date(maintenance.date), 'dd MMMM yyyy', { locale: fr })}
                            </span>
                          </div>

                          {/* Liens vers la tâche et le rapport */}
                          <div className="mt-2 flex flex-wrap gap-2">
                            {associatedTask && (
                              <Link 
                                to={`/tasks/${associatedTask.id}`}
                                className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
                              >
                                <LinkIcon className="h-4 w-4 mr-1" />
                                Voir la tâche
                              </Link>
                            )}
                            {associatedReport && (
                              <Link 
                                to={`/intervention-reports/${associatedReport.id}`}
                                className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                Voir le rapport
                              </Link>
                            )}
                          </div>

                          <div className="mt-2">
                            <p className="text-sm text-gray-700">
                              {maintenance.description}
                            </p>
                            {maintenance.actions.length > 0 && (
                              <ul className="mt-2 list-disc list-inside text-sm text-gray-600">
                                {maintenance.actions.map((action, index) => (
                                  <li key={index}>{action}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                          {maintenance.nextMaintenanceDate && (
                            <div className="mt-2 flex items-center text-sm text-blue-600">
                              <Calendar className="h-4 w-4 mr-1.5" />
                              Prochaine maintenance prévue le{' '}
                              {format(new Date(maintenance.nextMaintenanceDate), 'dd MMMM yyyy', { locale: fr })}
                            </div>
                          )}
                          {maintenance.attachments && maintenance.attachments.length > 0 && (
                            <div className="mt-2 flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-gray-400" />
                              <div className="flex space-x-2">
                                {maintenance.attachments.map((attachment, index) => (
                                  <a
                                    key={index}
                                    href={attachment}
                                    className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-900"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Download className="h-4 w-4 mr-1" />
                                    Document {index + 1}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
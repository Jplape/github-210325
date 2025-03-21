import { useState, useEffect } from 'react';
import { X, Search, Calendar, User, MapPin } from 'lucide-react';
import { useTaskStore } from '../../store/taskStore';
import { useTeamStore } from '../../store/teamStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface NewReportFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (report: any) => void;
}

export default function NewReportForm({ isOpen, onClose, onSubmit }: NewReportFormProps) {
  const { tasks } = useTaskStore();
  const { members } = useTeamStore();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    findings: '',
    recommendations: '',
    nextMaintenanceDate: ''
  });

  const filteredTasks = tasks.filter(task => 
    task.status !== 'pending' &&
    (task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     task.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
     task.equipment?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    if (selectedTask) {
      const nextMaintenanceDate = format(
        new Date(selectedTask.date).setMonth(
          new Date(selectedTask.date).getMonth() + 3
        ),
        'yyyy-MM-dd'
      );
      
      setFormData({
        findings: selectedTask.status === 'completed' ? 'Maintenance effectuée selon les spécifications' : '',
        recommendations: selectedTask.status === 'completed' ? 'Prochaine maintenance planifiée dans 3 mois' : '',
        nextMaintenanceDate
      });
    }
  }, [selectedTask]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    const report = {
      id: `R${selectedTask.id}`,
      taskId: selectedTask.id,
      date: selectedTask.date,
      equipment: selectedTask.equipment || 'Non spécifié',
      client: selectedTask.client,
      technicianId: selectedTask.technicianId || '',
      status: selectedTask.status,
      description: selectedTask.description || '',
      ...formData
    };

    onSubmit(report);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              Nouveau rapport d'intervention
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sélectionner une tâche
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Rechercher une tâche..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
              {filteredTasks.map(task => {
                const technician = members.find(m => m.id === Number(task.technicianId));
                
                return (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedTask?.id === task.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{task.title}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        task.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {task.status === 'completed' ? 'Terminée' : 'En cours'}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {format(new Date(task.date), 'dd MMM yyyy', { locale: fr })}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {task.client}
                      </div>
                      {technician && (
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {technician.name}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedTask && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Constatations
                </label>
                <textarea
                  value={formData.findings}
                  onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Détails des constatations..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recommandations
                </label>
                <textarea
                  value={formData.recommendations}
                  onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Recommandations pour le suivi..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prochaine maintenance prévue
                </label>
                <input
                  type="date"
                  value={formData.nextMaintenanceDate}
                  onChange={(e) => setFormData({ ...formData, nextMaintenanceDate: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Créer le rapport
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
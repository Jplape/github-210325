import { useState } from 'react';
import { useTaskStore } from '../../store/taskStore';
import { useTeamStore } from '../../store/teamStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FileText, Calendar, User, PenTool as Tool, Hash } from 'lucide-react';

interface InterventionReportFormProps {
  taskId?: string | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function InterventionReportForm({ taskId, onSubmit, onCancel }: InterventionReportFormProps) {
  const { tasks } = useTaskStore();
  const { members } = useTeamStore();
  const task = taskId ? tasks.find(t => t.id === taskId) : undefined;
  const technician = task?.technicianId ? members.find(m => m.id === Number(task.technicianId)) : undefined;

  const [formData, setFormData] = useState({
    taskId: task?.id || '',
    date: task?.date || format(new Date(), 'yyyy-MM-dd'),
    clientName: task?.client || '',
    service: '',
    equipmentType: task?.equipment || '',
    serialNumber: task?.serialNumber || '',
    brand: task?.brand || '',
    specifications: '',
    description: task?.description || '',
    findings: task?.actions?.join('\n') || '',
    recommendations: '',
    nextMaintenanceDate: task?.nextMaintenanceDate || '',
    technicianId: task?.technicianId || '',
    equipmentId: task?.equipment || '',
    technicianSignature: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.technicianSignature) {
      return;
    }

    const reportData = {
      taskId: formData.taskId,
      date: formData.date,
      clientName: formData.clientName,
      service: formData.service,
      equipmentType: formData.equipmentType,
      serialNumber: formData.serialNumber,
      brand: formData.brand,
      specifications: formData.specifications,
      description: formData.description,
      findings: formData.findings.split('\n').filter(Boolean),
      recommendations: formData.recommendations.split('\n').filter(Boolean),
      nextMaintenanceDate: formData.nextMaintenanceDate || undefined,
      technicianId: formData.technicianId,
      equipmentId: formData.equipmentId
    };

    onSubmit(reportData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* En-tête du rapport */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="h-16 w-32 bg-gray-100 flex items-center justify-center text-gray-400">
              LOGO
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold">Rapport d'Intervention</h2>
            <p className="text-gray-600">Gabon (Libreville)</p>
            <p className="text-gray-600">E.S.T.T.M & Co</p>
          </div>
        </div>
      </div>

      {/* Informations principales */}
      <div className="bg-white p-6 rounded-lg border space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date d'intervention</label>
            <div className="mt-1 flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-2" />
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="block w-full border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Technicien</label>
            <div className="mt-1 flex items-center">
              <User className="h-5 w-5 text-gray-400 mr-2" />
              <input
                type="text"
                value={technician?.name || ''}
                readOnly
                className="block w-full border-gray-300 rounded-md shadow-sm bg-gray-50"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Client</label>
            <input
              type="text"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Service</label>
            <input
              type="text"
              value={formData.service}
              onChange={(e) => setFormData({ ...formData, service: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Informations sur l'équipement */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Équipement</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Type d'appareil</label>
            <div className="mt-1 flex items-center">
              <Tool className="h-5 w-5 text-gray-400 mr-2" />
              <input
                type="text"
                value={formData.equipmentType}
                onChange={(e) => setFormData({ ...formData, equipmentType: e.target.value })}
                className="block w-full border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">N° de série</label>
            <input
              type="text"
              value={formData.serialNumber}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Marque</label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Spécifications</label>
            <input
              type="text"
              value={formData.specifications}
              onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Détails de l'intervention */}
      <div className="bg-white p-6 rounded-lg border space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Détails de l'intervention</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Actions réalisées</label>
          <textarea
            value={formData.findings}
            onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
            rows={4}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            placeholder="Une action par ligne"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Recommandations</label>
          <textarea
            value={formData.recommendations}
            onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
            rows={4}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            placeholder="Une recommandation par ligne"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Prochaine maintenance prévue</label>
          <input
            type="date"
            value={formData.nextMaintenanceDate}
            onChange={(e) => setFormData({ ...formData, nextMaintenanceDate: e.target.value })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          />
        </div>
      </div>

      {/* Signature */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="signature"
            checked={formData.technicianSignature}
            onChange={(e) => setFormData({ ...formData, technicianSignature: e.target.checked })}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="signature" className="text-sm text-gray-700">
            Je confirme que les informations fournies sont exactes
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={!formData.technicianSignature}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Générer le rapport
        </button>
      </div>
    </form>
  );
}
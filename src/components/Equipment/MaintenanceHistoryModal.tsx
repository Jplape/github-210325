import { useState } from 'react';
import { X, Info } from 'lucide-react';
import { MaintenanceHistory } from '../../types/equipment';
import { useTeamStore } from '../../store/teamStore';
import { useTaskStore } from '../../store/taskStore';
import { toast } from 'react-hot-toast';
import TaskForm from '../Tasks/TaskForm';

interface MaintenanceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (history: Omit<MaintenanceHistory, 'id'>) => void;
  equipmentName: string;
  clientName: string;
  equipmentBrand?: string;
  equipmentModel?: string;
  equipmentSerialNumber?: string;
}

function generateMaintenanceTaskId(): string {
  const prefix = 'MAINT';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
}

export default function MaintenanceHistoryModal({
  isOpen,
  onClose,
  onSubmit,
  equipmentName,
  clientName,
  equipmentBrand,
  equipmentModel,
  equipmentSerialNumber
}: MaintenanceHistoryModalProps) {
  const { addTask } = useTaskStore();
  const { members } = useTeamStore();
  const [selectedTechnician, setSelectedTechnician] = useState('');

  const handleSubmit = (formData: any) => {
    if (!formData.title || !formData.date || !formData.startTime) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Créer l'historique de maintenance
    const maintenanceData: Omit<MaintenanceHistory, 'id'> = {
      date: formData.date,
      type: formData.type || 'preventive',
      technician: formData.technicianId || '',
      description: formData.description || '',
      actions: formData.actions || [],
      nextMaintenanceDate: formData.nextMaintenanceDate,
      parts: formData.parts || [],
      cost: formData.cost || 0,
      attachments: formData.attachments || []
    };

    // Créer la tâche associée
    const taskId = generateMaintenanceTaskId();
    const taskData = {
      id: taskId,
      title: `Maintenance - ${equipmentName}`,
      date: formData.date,
      startTime: formData.startTime,
      duration: formData.duration || 60,
      client: clientName,
      description: formData.description || '',
      equipment: equipmentName,
      brand: equipmentBrand || '',
      model: equipmentModel || '',
      serialNumber: equipmentSerialNumber || '',
      technicianId: formData.technicianId || '',
      status: 'pending',
      priority: formData.priority || 'medium',
      type: 'maintenance',
      maintenanceType: formData.type || 'preventive',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      // Ajouter la tâche
      addTask(taskData);
      
      // Ajouter l'historique de maintenance
      onSubmit(maintenanceData);
      
      toast.success('Maintenance et tâche associée créées avec succès');
      onClose();
    } catch (error) {
      toast.error('Erreur lors de la création de la maintenance');
      console.error('Erreur:', error);
    }
  };

  if (!isOpen) return null;

  const initialData = {
    title: `Maintenance - ${equipmentName}`,
    client: clientName,
    equipment: equipmentName,
    brand: equipmentBrand,
    model: equipmentModel,
    serialNumber: equipmentSerialNumber,
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    priority: 'medium' as const,
    status: 'pending' as const,
    type: 'preventive' as const
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">
            Nouvelle intervention de maintenance
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="bg-blue-50 border-b border-blue-200 p-3">
          <div className="flex items-start">
            <Info className="h-4 w-4 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-sm text-blue-700">
              Une tâche sera automatiquement créée et associée à cette intervention de maintenance.
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <TaskForm
            initialData={initialData}
            onSubmit={handleSubmit}
            showMaintenanceFields={true}
          />
        </div>
      </div>
    </div>
  );
}
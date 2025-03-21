import { useState } from 'react';
import { Equipment, MaintenanceContract } from '../../types/equipment';
import { useClientStore } from '../../store/clientStore';
import { AlertCircle } from 'lucide-react';

interface EquipmentFormProps {
  initialData?: Partial<Equipment>;
  onSubmit: (data: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt' | 'maintenanceHistory'>) => void;
  onClose: () => void;
}

interface FormErrors {
  [key: string]: string;
}

function generateEquipmentNumber(): string {
  const prefix = 'EQP';
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}${random}`;
}

export default function EquipmentForm({ initialData, onSubmit, onClose }: EquipmentFormProps) {
  const { clients } = useClientStore();
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState({
    number: initialData?.number || generateEquipmentNumber(),
    name: initialData?.name || '',
    brand: initialData?.brand || '',
    model: initialData?.model || '',
    serialNumber: initialData?.serialNumber || '',
    status: initialData?.status || 'functional',
    installationDate: initialData?.installationDate || '',
    client: initialData?.client || { id: '', name: '' },
    location: initialData?.location || '',
    department: initialData?.department || '',
    specifications: initialData?.specifications || {},
    notes: initialData?.notes || '',
    maintenanceContract: initialData?.maintenanceContract || {
      type: 'maintenance',
      startDate: '',
      endDate: '',
      provider: '',
      terms: '',
      coverage: []
    } as MaintenanceContract
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validation des champs obligatoires
    if (!formData.number.trim()) {
      newErrors.number = "Le numéro d'équipement est requis";
    } else if (!/^EQP-\d{7}$/.test(formData.number)) {
      newErrors.number = "Format invalide. Le format doit être EQP-XXXXXXX";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Le nom de l'équipement est requis";
    }

    if (!formData.brand.trim()) {
      newErrors.brand = "La marque est requise";
    }

    if (!formData.model.trim()) {
      newErrors.model = "Le modèle est requis";
    }

    if (!formData.client.id) {
      newErrors.client = "Le client est requis";
    }

    if (!formData.status) {
      newErrors.status = "L'état est requis";
    }

    // Validation du contrat de maintenance si présent
    if (formData.maintenanceContract.provider || formData.maintenanceContract.startDate) {
      if (!formData.maintenanceContract.provider) {
        newErrors.provider = "Le prestataire est requis si un contrat est spécifié";
      }
      if (!formData.maintenanceContract.startDate) {
        newErrors.startDate = "La date de début est requise si un contrat est spécifié";
      }
      if (!formData.maintenanceContract.endDate) {
        newErrors.endDate = "La date de fin est requise si un contrat est spécifié";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Section Informations générales */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Informations générales</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Numéro d'équipement *
            </label>
            <input
              type="text"
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.number ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
              required
              readOnly
            />
            {errors.number && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.number}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nom *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
              required
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Marque *
            </label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.brand ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
              required
            />
            {errors.brand && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.brand}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Modèle *
            </label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.model ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
              required
            />
            {errors.model && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.model}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Numéro de série
            </label>
            <input
              type="text"
              value={formData.serialNumber}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              État *
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Equipment['status'] })}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.status ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
              required
            >
              <option value="functional">Fonctionnel</option>
              <option value="partial">Partiellement fonctionnel</option>
              <option value="non_functional">Non fonctionnel</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.status}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Section Client et Localisation */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Client et Localisation</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Client *
            </label>
            <select
              value={formData.client.id}
              onChange={(e) => {
                const client = clients.find(c => c.id.toString() === e.target.value);
                if (client) {
                  setFormData({
                    ...formData,
                    client: { id: client.id.toString(), name: client.name }
                  });
                }
              }}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.client ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
              required
            >
              <option value="">Sélectionner un client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            {errors.client && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.client}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date d'installation
            </label>
            <input
              type="date"
              value={formData.installationDate}
              onChange={(e) => setFormData({ ...formData, installationDate: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Localisation
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Service ou département"
            />
          </div>
        </div>
      </div>

      {/* Section Contrat de maintenance */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Contrat de maintenance</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Type de contrat
            </label>
            <select
              value={formData.maintenanceContract.type}
              onChange={(e) => setFormData({
                ...formData,
                maintenanceContract: {
                  ...formData.maintenanceContract,
                  type: e.target.value as 'warranty' | 'maintenance'
                }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="warranty">Garantie</option>
              <option value="maintenance">Contrat de maintenance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Prestataire
            </label>
            <input
              type="text"
              value={formData.maintenanceContract.provider}
              onChange={(e) => setFormData({
                ...formData,
                maintenanceContract: {
                  ...formData.maintenanceContract,
                  provider: e.target.value
                }
              })}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.provider ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
            />
            {errors.provider && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.provider}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date de début
            </label>
            <input
              type="date"
              value={formData.maintenanceContract.startDate}
              onChange={(e) => setFormData({
                ...formData,
                maintenanceContract: {
                  ...formData.maintenanceContract,
                  startDate: e.target.value
                }
              })}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.startDate ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.startDate}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date de fin
            </label>
            <input
              type="date"
              value={formData.maintenanceContract.endDate}
              onChange={(e) => setFormData({
                ...formData,
                maintenanceContract: {
                  ...formData.maintenanceContract,
                  endDate: e.target.value
                }
              })}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.endDate ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
            />
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.endDate}
              </p>
            )}
          </div>
        </div>
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
          {initialData ? 'Mettre à jour' : 'Ajouter'}
        </button>
      </div>
    </form>
  );
}
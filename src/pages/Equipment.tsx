import { useState } from 'react';
import { Search, Plus, AlertTriangle, Clock, CheckCircle, History, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { useClientStore } from '../store/clientStore';
import { useEquipmentStore } from '../store/equipmentStore';
import type { Equipment } from '../types/equipment';
import EquipmentForm from '../components/Equipment/EquipmentForm';
import MaintenanceHistoryModal from '../components/Equipment/MaintenanceHistoryModal';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type SortField = 'number' | 'name' | 'client' | 'status' | 'lastMaintenance';
type SortDirection = 'asc' | 'desc';

const STATUS_COLORS = {
  functional: { bg: 'bg-green-100', text: 'text-green-800', label: 'Fonctionnel' },
  partial: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Partiellement fonctionnel' },
  non_functional: { bg: 'bg-red-100', text: 'text-red-800', label: 'Non fonctionnel' }
};

export default function EquipmentPage() {
  const { equipment, addEquipment, addMaintenanceHistory } = useEquipmentStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Equipment['status']>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>('number');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showFilters, setShowFilters] = useState(false);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredEquipment = equipment.filter(eq => {
    const matchesSearch = 
      eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.client.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || eq.status === statusFilter;

    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    
    switch (sortField) {
      case 'number':
        return direction * a.number.localeCompare(b.number);
      case 'name':
        return direction * a.name.localeCompare(b.name);
      case 'client':
        return direction * a.client.name.localeCompare(b.client.name);
      case 'status':
        return direction * a.status.localeCompare(b.status);
      case 'lastMaintenance':
        const aDate = a.maintenanceHistory[0]?.date || '';
        const bDate = b.maintenanceHistory[0]?.date || '';
        return direction * aDate.localeCompare(bDate);
      default:
        return 0;
    }
  });

  const handleAddEquipment = (data: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt' | 'maintenanceHistory'>) => {
    addEquipment(data);
    setIsFormModalOpen(false);
  };

  const handleAddMaintenance = (equipmentId: string) => {
    setSelectedEquipment(equipment.find(eq => eq.id === equipmentId) || null);
    setIsMaintenanceModalOpen(true);
  };

  const handleMaintenanceSubmit = (history: Parameters<typeof addMaintenanceHistory>[1]) => {
    if (selectedEquipment) {
      addMaintenanceHistory(selectedEquipment.id, history);
    }
    setIsMaintenanceModalOpen(false);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Équipements</h2>
          <p className="mt-1 text-sm text-gray-500">
            Gérez et suivez l'état de vos équipements
          </p>
        </div>
        <button
          onClick={() => setIsFormModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouvel équipement
        </button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Rechercher un équipement..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtres
              {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 flex items-center space-x-2">
              {Object.entries(STATUS_COLORS).map(([status, { bg, text, label }]) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status === statusFilter ? 'all' : status as Equipment['status'])}
                  className={`px-3 py-1 rounded-full text-sm ${
                    status === statusFilter ? `${bg} ${text}` : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('number')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Numéro</span>
                    <SortIcon field="number" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Équipement</span>
                    <SortIcon field="name" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('client')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Client</span>
                    <SortIcon field="client" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center space-x-1">
                    <span>État</span>
                    <SortIcon field="status" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('lastMaintenance')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Dernière maintenance</span>
                    <SortIcon field="lastMaintenance" />
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEquipment.map((eq) => {
                const lastMaintenance = eq.maintenanceHistory[0];
                return (
                  <tr key={eq.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {eq.number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{eq.name}</div>
                        <div className="text-sm text-gray-500">{eq.brand} {eq.model}</div>
                        <div className="text-xs text-gray-500">N° série: {eq.serialNumber}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{eq.client.name}</div>
                      <div className="text-sm text-gray-500">{eq.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${STATUS_COLORS[eq.status].bg} ${STATUS_COLORS[eq.status].text}`}>
                        {STATUS_COLORS[eq.status].label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {lastMaintenance ? (
                        <div>
                          <div>{format(new Date(lastMaintenance.date), 'dd MMMM yyyy', { locale: fr })}</div>
                          <div className="text-xs text-gray-400">{lastMaintenance.type === 'preventive' ? 'Préventive' : 'Corrective'}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Aucune maintenance</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleAddMaintenance(eq.id)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Maintenance
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'ajout */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium">Ajouter un équipement</h3>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Fermer</span>
                <ChevronDown className="h-6 w-6" />
              </button>
            </div>
            <EquipmentForm
              onSubmit={handleAddEquipment}
              onClose={() => setIsFormModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Modal de maintenance */}
      {isMaintenanceModalOpen && selectedEquipment && (
        <MaintenanceHistoryModal
          isOpen={isMaintenanceModalOpen}
          onClose={() => setIsMaintenanceModalOpen(false)}
          onSubmit={handleMaintenanceSubmit}
          equipmentName={selectedEquipment.name}
          clientName={selectedEquipment.client.name}
          equipmentBrand={selectedEquipment.brand}
          equipmentModel={selectedEquipment.model}
          equipmentSerialNumber={selectedEquipment.serialNumber}
        />
      )}
    </div>
  );
}
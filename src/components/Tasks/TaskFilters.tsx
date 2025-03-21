import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X } from 'lucide-react';
import { useTeamStore } from '../../store/teamStore';

interface TaskFiltersProps {
  onFilterChange: (filters: any) => void;
  clients: string[];
}

export default function TaskFilters({ onFilterChange, clients }: TaskFiltersProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { members } = useTeamStore();
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const [filters, setFilters] = useState({
    status: searchParams.get('status') || 'all',
    priority: searchParams.get('priority') || 'all',
    technician: searchParams.get('technician') || 'all',
    client: searchParams.get('client') || 'all',
    equipment: searchParams.get('equipment') || 'all',
    assignment: searchParams.get('assignment') || 'all',
    date: searchParams.get('date') || 'all'
  });

  useEffect(() => {
    const newFilters = [];
    if (filters.status !== 'all') newFilters.push('status');
    if (filters.priority !== 'all') newFilters.push('priority');
    if (filters.technician !== 'all') newFilters.push('technician');
    if (filters.client !== 'all') newFilters.push('client');
    if (filters.equipment !== 'all') newFilters.push('equipment');
    if (filters.assignment !== 'all') newFilters.push('assignment');
    if (filters.date !== 'all') newFilters.push('date');
    setActiveFilters(newFilters);

    // Update URL params
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== 'all') {
        params.set(key, value);
      }
    });
    setSearchParams(params);

    onFilterChange(filters);
  }, [filters, onFilterChange, setSearchParams]);

  const clearFilter = (filterName: string) => {
    setFilters(prev => ({ ...prev, [filterName]: 'all' }));
  };

  const clearAllFilters = () => {
    setFilters({
      status: 'all',
      priority: 'all',
      technician: 'all',
      client: 'all',
      equipment: 'all',
      assignment: 'all',
      date: 'all'
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filtres</span>
          {activeFilters.length > 0 && (
            <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-600">
              {activeFilters.length} actif{activeFilters.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        {activeFilters.length > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Réinitialiser
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Statut
          </label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="in_progress">En cours</option>
            <option value="completed">Terminée</option>
            <option value="overdue">En retard</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priorité
          </label>
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="all">Toutes les priorités</option>
            <option value="low">Basse</option>
            <option value="medium">Moyenne</option>
            <option value="high">Haute</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Technicien
          </label>
          <select
            value={filters.technician}
            onChange={(e) => setFilters({ ...filters, technician: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="all">Tous les techniciens</option>
            <option value="unassigned">Non assigné</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Client
          </label>
          <select
            value={filters.client}
            onChange={(e) => setFilters({ ...filters, client: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="all">Tous les clients</option>
            {clients.map((client) => (
              <option key={client} value={client}>
                {client}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Équipement
          </label>
          <select
            value={filters.equipment}
            onChange={(e) => setFilters({ ...filters, equipment: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
        </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assignation
          </label>
          <select
            value={filters.assignment}
            onChange={(e) => setFilters({ ...filters, assignment: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="all">Toutes les tâches</option>
            <option value="assigned">Tâches assignées</option>
            <option value="unassigned">Tâches non assignées</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <select
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="all">Toutes les dates</option>
            <option value="today">Aujourd'hui</option>
            <option value="tomorrow">Demain</option>
            <option value="week">Cette semaine</option>
            <option value="overdue">En retard</option>
          </select>
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {activeFilters.map((filter) => (
            <span
              key={filter}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-700"
            >
              {filter}
              <button
                onClick={() => clearFilter(filter)}
                className="ml-2 hover:text-indigo-900"
              >
                <X className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
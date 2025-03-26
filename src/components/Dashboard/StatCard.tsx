import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StatCardProps {
  name: string;
  value: string;
  icon: LucideIcon;
  color: string;
  description: string;
  trend: {
    value: string;
    label: string;
  };
}

export default function StatCard({ name, value, icon: Icon, color, description, trend }: StatCardProps) {
  return (
    <Link
      to={
        name === "Tâches du jour" ? "/tasks?date=today" :
        name === "Tâches non assignées" ? "/tasks?assignment=unassigned" :
        name === "Interventions en cours" ? "/tasks?status=pending" :
        name === "Clients" ? "/clients" :
        name === "Équipements" ? "/equipment" :
        name === "Statistiques" ? "/statistics" :
        name === "Rapports" ? "/reports" :
        "/dashboard"
      }
      className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md group hover:scale-[1.02] transform transition-all duration-200"
    >
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 p-3 rounded-md ${color} transition-colors group-hover:opacity-90`}>
            <Icon className="h-6 w-6 text-white" aria-hidden="true" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate group-hover:text-gray-700 transition-colors">
                {name}
              </dt>
              <dd className="text-lg font-semibold text-gray-900">
                {value}
              </dd>
            </dl>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">{description}</p>
            <p className="text-sm font-medium text-indigo-600">{trend.value}%</p>
          </div>
          <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all group-hover:bg-indigo-500"
              style={{ width: `${trend.value}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 group-hover:text-gray-700 transition-colors">{trend.label}</p>
        </div>
      </div>
    </Link>
  );
}
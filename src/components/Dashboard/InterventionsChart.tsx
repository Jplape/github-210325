import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartData {
  name: string;
  completed: number;
  inProgress: number;
  pending: number;
  isToday: boolean;
}

interface InterventionsChartProps {
  data: ChartData[];
}

export default function InterventionsChart({ data }: InterventionsChartProps) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Suivi des interventions
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Vue d'ensemble de la semaine en cours
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Terminées</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">En cours</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <span className="text-sm text-gray-600">En attente</span>
          </div>
        </div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} stackOffset="sign">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#6B7280' }}
              tickLine={{ stroke: '#6B7280' }}
            />
            <YAxis 
              tick={{ fill: '#6B7280' }}
              tickLine={{ stroke: '#6B7280' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: '0.375rem'
              }}
              formatter={(value: number, name: string) => {
                const label = name === 'completed' ? 'Terminées' :
                            name === 'inProgress' ? 'En cours' :
                            'En attente';
                return [value, label];
              }}
            />
            <Bar 
              dataKey="completed" 
              stackId="status"
              fill="#10B981" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="inProgress" 
              stackId="status"
              fill="#3B82F6" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="pending" 
              stackId="status"
              fill="#D1D5DB" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
import { Mail, Phone, Users, Calendar, Award, AlertTriangle } from 'lucide-react';
import type { TeamMember } from '../store/teamStore';

interface TeamMemberCardProps {
  member: TeamMember;
  onDelete: (member: TeamMember) => void;
}

export default function TeamMemberCard({ member, onDelete }: TeamMemberCardProps) {
  const getStatusColor = (status: TeamMember['status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800';
      case 'offline':
        return 'bg-gray-100 text-gray-800';
    }
  };

  const taskLoadPercentage = (member.assignments / member.maxConcurrentTasks) * 100;
  const isNearMaxCapacity = taskLoadPercentage >= 80;

  return (
    <div className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-gray-100 rounded-full p-3">
              <Users className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">{member.name}</h3>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-500">{member.role}</p>
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                    member.status
                  )}`}
                >
                  {member.status}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onDelete(member)}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <span className="sr-only">Supprimer</span>
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm text-gray-500">
            <Mail className="h-4 w-4 mr-2" />
            {member.email}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Phone className="h-4 w-4 mr-2" />
            {member.phone}
          </div>
          {member.currentTask && (
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-2" />
              {member.currentTask}
            </div>
          )}
          {member.skills && (
            <div className="flex items-center text-sm text-gray-500">
              <Award className="h-4 w-4 mr-2" />
              <div className="flex flex-wrap gap-1">
                {member.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 text-xs bg-gray-100 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">
              Charge de travail
            </span>
            <span className="text-sm text-gray-500">
              {member.assignments}/{member.maxConcurrentTasks} tâches
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                taskLoadPercentage >= 90
                  ? 'bg-red-500'
                  : taskLoadPercentage >= 70
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(taskLoadPercentage, 100)}%` }}
            />
          </div>
          {isNearMaxCapacity && (
            <div className="mt-2 flex items-center text-sm text-yellow-600">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Proche de la capacité maximale
            </div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <span className="block text-2xl font-semibold text-gray-900">
              {member.assignments}
            </span>
            <span className="block text-sm text-gray-500">
              Tâches en cours
            </span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-semibold text-gray-900">
              {member.completedTasks}
            </span>
            <span className="block text-sm text-gray-500">
              Tâches terminées
            </span>
          </div>
        </div>

        {member.nextAvailableDate && member.status === 'busy' && (
          <div className="mt-4 text-sm text-gray-500 text-center">
            Disponible à partir du{' '}
            {new Date(member.nextAvailableDate).toLocaleDateString('fr-FR')}
          </div>
        )}
      </div>
    </div>
  );
}
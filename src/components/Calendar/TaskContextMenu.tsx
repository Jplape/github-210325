import { Link } from 'react-router-dom';
import { ExternalLink, User, FileText } from 'lucide-react';
import { Task } from '../../store/taskStore';
import { useTeamStore } from '../../store/teamStore';

interface TaskContextMenuProps {
  task: Task;
  position: { x: number; y: number };
  onClose: () => void;
}

export default function TaskContextMenu({ task, position }: TaskContextMenuProps) {
  const { members } = useTeamStore();
  const technician = task.technicianId ? 
    members.find(m => m.id === Number(task.technicianId)) : null;

  return (
    <div 
      className="fixed bg-white rounded-lg shadow-lg py-1 z-50 min-w-[200px]"
      style={{ 
        top: position.y,
        left: position.x
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <Link
        to={`/tasks/${task.id}`}
        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <FileText className="h-4 w-4 mr-2" />
        Voir les détails
        <ExternalLink className="h-3 w-3 ml-auto" />
      </Link>

      {technician && (
        <Link
          to={`/teams/${technician.id}`}
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <User className="h-4 w-4 mr-2" />
          Voir le technicien
          <ExternalLink className="h-3 w-3 ml-auto" />
        </Link>
      )}

      <Link
        to={`/intervention-reports/${task.id}`}
        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t"
      >
        <FileText className="h-4 w-4 mr-2" />
        Rapport d'intervention
        <ExternalLink className="h-3 w-3 ml-auto" />
      </Link>
    </div>
  );
}
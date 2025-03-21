import { Pencil, Trash2 } from 'lucide-react';

interface TaskActionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

export default function TaskActions({ onEdit, onDelete }: TaskActionsProps) {
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        className="p-1 text-indigo-600 hover:text-indigo-900 transition-colors"
        title="Modifier"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="p-1 text-red-600 hover:text-red-900 transition-colors"
        title="Supprimer"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
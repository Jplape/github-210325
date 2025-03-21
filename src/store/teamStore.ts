import { create } from 'zustand';
import { calculateTeamWorkload } from '../utils/teamTaskSync';
import { useTaskStore } from './taskStore';

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  status: 'available' | 'busy' | 'offline';
  assignments: number;
  currentTask?: string;
  nextAvailableDate?: string;
  completedTasks: number;
  skills: string[];
  maxConcurrentTasks: number;
}

interface TeamState {
  members: TeamMember[];
  addMember: (member: Omit<TeamMember, 'id' | 'assignments' | 'completedTasks' | 'maxConcurrentTasks'>) => void;
  updateMember: (id: number, updates: Partial<TeamMember>) => void;
  deleteMember: (id: number) => void;
  syncWorkload: () => void;
}

const initialMembers: TeamMember[] = [
  {
    id: 1,
    name: 'Thomas Martin',
    role: 'Technicien Senior',
    email: 'thomas.martin@biomedical.com',
    phone: '+225 07 12 34 56',
    status: 'available',
    assignments: 0,
    completedTasks: 0,
    skills: ['Radiologie', 'IRM', 'Scanner', 'Maintenance préventive'],
    maxConcurrentTasks: 5
  },
  {
    id: 2,
    name: 'Sophie Bernard',
    role: 'Technicienne Senior',
    email: 'sophie.bernard@biomedical.com',
    phone: '+225 05 23 45 67',
    status: 'available',
    assignments: 0,
    completedTasks: 0,
    skills: ['Échographie', 'Radiologie', 'Maintenance préventive'],
    maxConcurrentTasks: 5
  },
  {
    id: 3,
    name: 'Marc Dubois',
    role: 'Technicien',
    email: 'marc.dubois@biomedical.com',
    phone: '+225 07 89 01 23',
    status: 'available',
    assignments: 0,
    completedTasks: 0,
    skills: ['Laboratoire', 'Analyseurs', 'Maintenance préventive'],
    maxConcurrentTasks: 4
  },
  {
    id: 4,
    name: 'Julie Lambert',
    role: 'Technicienne',
    email: 'julie.lambert@biomedical.com',
    phone: '+225 05 67 89 01',
    status: 'available',
    assignments: 0,
    completedTasks: 0,
    skills: ['Moniteurs', 'Ventilateurs', 'Maintenance préventive'],
    maxConcurrentTasks: 4
  },
  {
    id: 5,
    name: 'Pierre Moreau',
    role: 'Technicien Senior',
    email: 'pierre.moreau@biomedical.com',
    phone: '+225 07 34 56 78',
    status: 'available',
    assignments: 0,
    completedTasks: 0,
    skills: ['IRM', 'Scanner', 'Radiologie', 'Maintenance préventive'],
    maxConcurrentTasks: 5
  },
  {
    id: 6,
    name: 'Emma Petit',
    role: 'Technicienne Junior',
    email: 'emma.petit@biomedical.com',
    phone: '+225 05 90 12 34',
    status: 'available',
    assignments: 0,
    completedTasks: 0,
    skills: ['Laboratoire', 'Maintenance préventive'],
    maxConcurrentTasks: 3
  },
  {
    id: 7,
    name: 'Lucas Roux',
    role: 'Technicien Junior',
    email: 'lucas.roux@biomedical.com',
    phone: '+225 07 45 67 89',
    status: 'available',
    assignments: 0,
    completedTasks: 0,
    skills: ['Moniteurs', 'Maintenance préventive'],
    maxConcurrentTasks: 3
  },
  {
    id: 8,
    name: 'Sarah Leroy',
    role: 'Technicienne',
    email: 'sarah.leroy@biomedical.com',
    phone: '+225 05 78 90 12',
    status: 'available',
    assignments: 0,
    completedTasks: 0,
    skills: ['Échographie', 'Radiologie', 'Maintenance préventive'],
    maxConcurrentTasks: 4
  }
];

export const useTeamStore = create<TeamState>((set, get) => ({
  members: initialMembers,
  
  addMember: (member) => set((state) => ({
    members: [
      ...state.members,
      {
        ...member,
        id: Math.max(0, ...state.members.map((m) => m.id)) + 1,
        assignments: 0,
        completedTasks: 0,
        maxConcurrentTasks: member.role.includes('Senior') ? 5 : 
                          member.role.includes('Junior') ? 3 : 4,
      },
    ],
  })),

  updateMember: (id, updates) => set((state) => ({
    members: state.members.map((member) =>
      member.id === id ? { ...member, ...updates } : member
    ),
  })),

  deleteMember: (id) => set((state) => ({
    members: state.members.filter((member) => member.id !== id),
  })),

  syncWorkload: () => {
    const tasks = useTaskStore.getState().tasks;
    const currentMembers = get().members;
    const updatedMembers = calculateTeamWorkload(tasks, currentMembers);
    set({ members: updatedMembers });
  },
}));

// Écouter les changements de tâches pour mettre à jour la charge de travail

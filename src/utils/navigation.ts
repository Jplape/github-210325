import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Building2, 
  ClipboardList,
  BarChart3,
  FileText,
  MessageSquare,
  Settings,
  Wrench
} from 'lucide-react';

export const navigation = [
  { name: 'Tableau de bord', to: '/', icon: LayoutDashboard },
  { name: 'Calendrier', to: '/calendar', icon: Calendar },
  { name: 'Équipes', to: '/teams', icon: Users },
  { name: 'Clients', to: '/clients', icon: Building2 },
  { name: 'Équipements', to: '/equipment', icon: Wrench },
  { name: 'Tâches', to: '/tasks', icon: ClipboardList },
  { name: 'Statistiques', to: '/statistics', icon: BarChart3 },
  { name: 'Chatbot', to: '/chatbot', icon: MessageSquare },
  { name: 'Paramètres', to: '/settings', icon: Settings },
  { name: 'Rapports d\'intervention', to: '/intervention-reports', icon: FileText },
];
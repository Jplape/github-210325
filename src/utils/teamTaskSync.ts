import { Task } from '../store/taskStore';
import { TeamMember } from '../store/teamStore';
import { isToday, isFuture } from 'date-fns';

export function calculateTeamWorkload(tasks: Task[], members: TeamMember[]) {
  const updates = members.map(member => {
    const memberTasks = tasks.filter(task => task.technicianId === member.id.toString());
    
    // Calcul des tâches actives
    const activeTasks = memberTasks.filter(task => 
      task.status === 'in_progress' || 
      (task.status === 'pending' && (isToday(new Date(task.date)) || isFuture(new Date(task.date))))
    );

    // Calcul des tâches terminées
    const completedTasks = memberTasks.filter(task => task.status === 'completed');

    // Détermination du statut
    let status: TeamMember['status'] = 'available';
    if (activeTasks.length >= member.maxConcurrentTasks) {
      status = 'busy';
    } else if (activeTasks.length === 0) {
      status = 'available';
    }

    // Calcul de la prochaine date de disponibilité
    let nextAvailableDate: string | undefined;
    if (status === 'busy') {
      const lastTask = memberTasks
        .filter(task => task.status !== 'completed')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      
      if (lastTask) {
        nextAvailableDate = lastTask.date;
      }
    }

    // Tâche en cours
    const currentTask = memberTasks.find(task => 
      task.status === 'in_progress' && 
      isToday(new Date(task.date))
    );

    return {
      ...member,
      assignments: activeTasks.length,
      completedTasks: completedTasks.length,
      status,
      nextAvailableDate,
      currentTask: currentTask?.title
    };
  });

  return updates;
}
import { addDays, format, subDays } from 'date-fns';
import { Task } from '../types/task';

const clients = [
  'Hôpital Central', 'Clinique du Parc', 'Centre Médical Est',
  'Laboratoire BioAnalyse', 'Clinique Saint-Jean', 'Centre d\'Imagerie Médicale',
  'Hôpital Universitaire', 'Polyclinique du Sud'
];

const equipments = [
  { 
    name: 'IRM', 
    brand: 'Siemens', 
    model: 'MAGNETOM Altea', 
    serial: 'MAG'
  },
  { 
    name: 'Scanner', 
    brand: 'GE Healthcare', 
    model: 'Revolution CT', 
    serial: 'REV'
  },
  { 
    name: 'Échographe', 
    brand: 'Philips', 
    model: 'EPIQ Elite', 
    serial: 'EPQ'
  }
];

const maintenanceTypes = [
  'Maintenance préventive',
  'Calibration',
  'Mise à jour logiciel',
  'Remplacement pièces',
  'Contrôle qualité'
];

export function generateDemoTasks(): Task[] {
  const startDate = new Date();
  const tasks: Task[] = [];
  let taskId = 1;

  // Generate tasks for the past 15 days and next 25 days
  for (let i = -15; i <= 25; i++) {
    const date = format(addDays(startDate, i), 'yyyy-MM-dd');
    const tasksPerDay = Math.floor(Math.random() * 4) + 2; // 2-5 tasks per day

    for (let j = 0; j < tasksPerDay; j++) {
      const hour = 8 + Math.floor(Math.random() * 8); // Between 8h and 16h
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      
      const equipment = equipments[Math.floor(Math.random() * equipments.length)];
      const client = clients[Math.floor(Math.random() * clients.length)];
      const maintenanceType = maintenanceTypes[Math.floor(Math.random() * maintenanceTypes.length)];
      
      // Assign technicians (1-8)
      const technicianId = (Math.floor(Math.random() * 8) + 1).toString();
      
      // Vary statuses based on date
      let status: Task['status'];
      if (i < 0) {
        status = Math.random() > 0.2 ? 'completed' : 'pending';
      } else if (i === 0) {
        status = Math.random() > 0.5 ? 'in_progress' : 'pending';
      } else {
        status = 'pending';
      }
      
      // Vary priorities
      const priority: Task['priority'] = 
        Math.random() < 0.2 ? 'high' :
        Math.random() < 0.5 ? 'medium' : 
        'low';

      tasks.push({
        id: `task-${taskId++}`,
        title: `${maintenanceType} - ${equipment.name}`,
        client,
        date,
        startTime,
        duration: 120, // 2 heures par défaut
        technicianId,
        status,
        priority,
        equipment: equipment.name,
        brand: equipment.brand,
        model: equipment.model,
        serialNumber: `${equipment.serial}-${(taskId).toString().padStart(3, '0')}`,
        description: `${maintenanceType} programmée pour ${equipment.name} ${equipment.model}`,
        createdAt: subDays(new Date(), 30).toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  }

  return tasks;
}
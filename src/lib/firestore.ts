import admin from 'firebase-admin';

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const firestore = admin.firestore();

// Initialize collections with schema validation
const collections = {
  Users: firestore.collection('Users'),
  Clients: firestore.collection('Clients'),
  Equipment: firestore.collection('Equipment'),
  Interventions: firestore.collection('Interventions'),
  Reports: firestore.collection('Reports'),
  Notifications: firestore.collection('Notifications'),
  ChatMessages: firestore.collection('ChatMessages'),
  MaintenanceSchedules: firestore.collection('MaintenanceSchedules'),
  AuditLogs: firestore.collection('AuditLogs'),
  Settings: firestore.collection('Settings'),
  Teams: firestore.collection('Teams')
};

// Collection schemas
const schemas = {
  Users: {
    id: 'string',
    email: 'string',
    role: ['admin', 'technician', 'client'],
    fcmTokens: 'array',
    createdAt: 'timestamp',
    updatedAt: 'timestamp'
  },
  Clients: {
    id: 'string',
    name: 'string',
    address: 'string',
    contactEmail: 'string',
    contactPhone: 'string',
    createdAt: 'timestamp',
    updatedAt: 'timestamp'
  },
  Equipment: {
    id: 'string',
    clientId: 'string',
    name: 'string',
    type: 'string',
    serialNumber: 'string',
    installationDate: 'timestamp',
    lastMaintenanceDate: 'timestamp',
    createdAt: 'timestamp',
    updatedAt: 'timestamp'
  },
  Interventions: {
    id: 'string',
    clientId: 'string',
    equipmentId: 'string',
    technicianId: 'string',
    startDate: 'timestamp',
    endDate: 'timestamp',
    status: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    createdAt: 'timestamp',
    updatedAt: 'timestamp'
  },
  Reports: {
    id: 'string',
    interventionId: 'string',
    technicianId: 'string',
    clientId: 'string',
    equipmentId: 'string',
    description: 'string',
    actionsTaken: 'array',
    recommendations: 'array',
    status: ['draft', 'submitted', 'approved', 'rejected'],
    createdAt: 'timestamp',
    updatedAt: 'timestamp'
  },
  Notifications: {
    id: 'string',
    userId: 'string',
    title: 'string',
    body: 'string',
    read: 'boolean',
    data: 'map',
    createdAt: 'timestamp'
  },
  ChatMessages: {
    id: 'string',
    senderId: 'string',
    receiverId: 'string',
    message: 'string',
    read: 'boolean',
    createdAt: 'timestamp'
  },
  MaintenanceSchedules: {
    id: 'string',
    equipmentId: 'string',
    frequency: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
    lastPerformed: 'timestamp',
    nextDue: 'timestamp',
    createdAt: 'timestamp',
    updatedAt: 'timestamp'
  },
  AuditLogs: {
    id: 'string',
    userId: 'string',
    action: 'string',
    details: 'map',
    timestamp: 'timestamp'
  },
  Settings: {
    id: 'string',
    key: 'string',
    value: 'any',
    createdAt: 'timestamp',
    updatedAt: 'timestamp'
  },
  Teams: {
    id: 'string',
    name: 'string',
    members: 'array',
    leaderId: 'string',
    createdAt: 'timestamp',
    updatedAt: 'timestamp'
  }
};

export { firestore, collections, schemas };
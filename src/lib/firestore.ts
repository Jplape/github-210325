import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const syncInterventionReports = {
  // Sauvegarder un rapport
  async saveReport(reportData: any) {
    try {
      const reportRef = doc(collection(db, 'interventionReports'));
      await setDoc(reportRef, {
        ...reportData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return reportRef.id;
    } catch (error) {
      console.error('Error saving report:', error);
      throw error;
    }
  },

  // Écouter les changements
  subscribeToReports(callback: (reports: any[]) => void) {
    return onSnapshot(collection(db, 'interventionReports'), (snapshot) => {
      const reports = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(reports);
    });
  },

  // Mettre à jour un rapport
  async updateReport(reportId: string, updates: any) {
    try {
      const reportRef = doc(db, 'interventionReports', reportId);
      await setDoc(reportRef, {
        ...updates,
        updatedAt: new Date()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating report:', error);
      throw error;
    }
  }
};
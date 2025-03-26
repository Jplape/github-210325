import { useEffect } from 'react';
import { useReportStore } from '../store/reportStore';

export default function useSyncReports() {
  const initializeSync = useReportStore(state => state.initialize);

  useEffect(() => {
    const unsubscribe = initializeSync();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [initializeSync]);
}
import { PropsWithChildren } from 'react';
import { useAuthStore } from '../store/authStore';

export function MockAuthProvider({ children }: PropsWithChildren) {
  const { loading } = useAuthStore();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}
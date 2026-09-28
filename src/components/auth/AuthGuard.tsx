import React from 'react';
import { useAuth } from '../../lib/auth';
import { LoginView } from './LoginView';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-6 h-6 border-2 border-[#333333] border-t-white rounded-full animate-spin" />
        <p className="text-xs font-mono text-[#707070]">Loading workspace...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  return <>{children}</>;
};

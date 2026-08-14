import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Compass, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center shadow-glow-brand animate-pulse">
            <Compass className="w-8 h-8 text-white" />
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
            <Loader2 className="w-4 h-4 animate-spin text-sky-500" />
            <span>Authenticating...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    // Redirect unauthenticated user to login page with intent return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProfilePanel from './Profile/ProfilePanel.tsx';
import { 
  LogOut, 
  Moon, 
  Users,
  User,
  Network,
  AlertTriangle, 
  Zap,
  Calendar,
  Clock,
  Inbox,
  History
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { logout, user } = useAuthStore();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="glass w-64 p-4 flex flex-col fixed h-full">
        <div className="flex items-center gap-3 mb-8">
          <Moon className="h-8 w-8 text-indigo-400" />
          <h1 className="text-xl font-bold">PixelLunar</h1>
        </div>

        <nav className="flex-1">
          <div className="space-y-6">
            {/* Rapports Section */}
            <div className="space-y-2">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">
                Rapports
              </h2>
              <div className="space-y-1">
                <button
                  onClick={() => navigate('/dashboard')}
                  className={`flex items-center gap-3 w-full p-3 rounded-lg ${
                    isActive('/dashboard') 
                      ? 'bg-indigo-500/20 text-indigo-300' 
                      : 'glass-hover'
                  }`}
                >
                  <Users className="h-5 w-5" />
                  Rapports
                </button>
                <button
                  onClick={() => navigate('/dashboard/new-report')}
                  className={`flex items-center gap-3 w-full p-3 rounded-lg ${
                    isActive('/dashboard/new-report') 
                      ? 'bg-indigo-500/20 text-indigo-300' 
                      : 'glass-hover'
                  }`}
                >
                  <AlertTriangle className="h-5 w-5" />
                  Nouveau rapport
                </button>
              </div>
            </div>

            {/* Graphique Section */}
            <div className="space-y-2">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">
                Graphique
              </h2>
              <div className="space-y-1">
                <button
                  onClick={() => navigate('/dashboard/graph')}
                  className={`flex items-center gap-3 w-full p-3 rounded-lg ${
                    isActive('/dashboard/graph') 
                      ? 'bg-indigo-500/20 text-indigo-300' 
                      : 'glass-hover'
                  }`}
                >
                  <Network className="h-5 w-5" />
                  Graphique Utilisateurs
                </button>
              </div>
            </div>

            {/* Avatars Section */}
            <div className="space-y-2">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">
                Avatars
              </h2>
              <div className="space-y-1">
                <button
                  onClick={() => navigate('/dashboard/avatars/crash')}
                  className={`flex items-center gap-3 w-full p-3 rounded-lg ${
                    isActive('/dashboard/avatars/crash') 
                      ? 'bg-indigo-500/20 text-indigo-300' 
                      : 'glass-hover'
                  }`}
                >
                  <Zap className="h-5 w-5" />
                  Avatars Crashs
                </button>
              </div>
            </div>

            {/* Emploi du temps Section */}
            <div className="space-y-2">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">
                Emploi du temps
              </h2>
              <div className="space-y-1">
                <button
                  onClick={() => navigate('/dashboard/schedule/availability')}
                  className={`flex items-center gap-3 w-full p-3 rounded-lg ${
                    isActive('/dashboard/schedule/availability') 
                      ? 'bg-indigo-500/20 text-indigo-300' 
                      : 'glass-hover'
                  }`}
                >
                  <Calendar className="h-5 w-5" />
                  Gestion des disponibilités
                </button>
                <button
                  onClick={() => navigate('/dashboard/schedule/booking')}
                  className={`flex items-center gap-3 w-full p-3 rounded-lg ${
                    isActive('/dashboard/schedule/booking') 
                      ? 'bg-indigo-500/20 text-indigo-300' 
                      : 'glass-hover'
                  }`}
                >
                  <Clock className="h-5 w-5" />
                  Réservation de rendez-vous
                </button>
              </div>
            </div>

            {/* Logs Section */}
            <div className="space-y-2">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">
                Logs
              </h2>
              <div className="space-y-1">
                <button
                  onClick={() => navigate('/dashboard/logs')}
                  className={`flex items-center gap-3 w-full p-3 rounded-lg ${
                    isActive('/dashboard/logs') 
                      ? 'bg-indigo-500/20 text-indigo-300' 
                      : 'glass-hover'
                  }`}
                >
                  <History className="h-5 w-5" />
                  Logs système
                </button>
              </div>
            </div>

            {/* Notifications/Mail Section */}
            <div className="space-y-2">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">
                Notifications/Mail
              </h2>
              <div className="space-y-1">
                <button
                  onClick={() => navigate('/dashboard/inbox')}
                  className={`flex items-center gap-3 w-full p-3 rounded-lg ${
                    isActive('/dashboard/inbox') 
                      ? 'bg-indigo-500/20 text-indigo-300' 
                      : 'glass-hover'
                  }`}
                >
                  <Inbox className="h-5 w-5" />
                  Boîte de réception
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="border-t border-gray-700 pt-4">
          <button
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-3 w-full p-3 rounded-lg glass-hover mb-3"
          >
            <User className="h-5 w-5 text-indigo-400" />
            <div className="flex-1 text-left">
              <span className="text-sm font-medium">{user?.username}</span>
              <span className="block text-xs text-gray-400">Voir le profil</span>
            </div>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-3 rounded-lg glass-hover text-red-400"
          >
            <LogOut className="h-5 w-5" />
            Déconnexion
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-64 flex-1 p-8">
        {children}
      </div>
      
      <ProfilePanel
        key={isProfileOpen ? 'open' : 'closed'}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
}
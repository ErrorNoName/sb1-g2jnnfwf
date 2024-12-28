import React from 'react';
import { User, Shield, BarChart2, Calendar, Clock } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { ActivityChart } from './ActivityChart';
import { StatsCard } from './StatsCard';
import { formatDate, formatTimeAgo } from '../../utils/dateUtils';
import { useEffect, useState } from 'react';
import { getUserReportStats } from '../../services/reportAnalytics';

interface ProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserStats {
  totalReports: number;
  totalAvatars: number;
  monthlyReports: number;
}

export default function ProfilePanel({ isOpen, onClose }: ProfilePanelProps) {
  const user = useAuthStore(state => state.user);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && isOpen) {
      loadUserStats();
    }
  }, [user, isOpen]);

  const loadUserStats = async () => {
    try {
      setIsLoading(true);
      const data = await getUserReportStats(user!.id);
      setStats(data);
    } catch (error) {
      console.error('Failed to load user stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="absolute right-0 h-full w-full max-w-2xl">
        <div className="h-full glass animate-slide-left overflow-y-auto">
          <div className="p-6 space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500/20 rounded-xl">
                  <User className="w-8 h-8 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{user.username}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-emerald-400">Modérateur</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
              >
                <span className="sr-only">Fermer</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
              {isLoading && (
                <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <StatsCard
                icon={BarChart2}
                label="Rapports soumis"
                value={stats?.totalReports.toString() || '0'}
                trend={`${stats?.monthlyReports || 0} ce mois`}
                trendUp={true}
              />
              <StatsCard
                icon={Shield}
                label="Avatars signalés"
                value={stats?.totalAvatars.toString() || '0'}
                trend="Depuis le début"
                trendUp={true}
              />
            </div>

            {/* Activity Chart */}
            <div className="glass p-6 rounded-xl space-y-4">
              <h3 className="text-lg font-medium">Activité mensuelle</h3>
              <ActivityChart />
            </div>

            {/* Details */}
            <div className="glass p-6 rounded-xl space-y-6">
              <h3 className="text-lg font-medium">Informations détaillées</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Membre depuis</p>
                    <p className="font-medium">{formatDate(new Date())}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Dernière activité</p>
                    <p className="font-medium">Il y a 2 heures</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
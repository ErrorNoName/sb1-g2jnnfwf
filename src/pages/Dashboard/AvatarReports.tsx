import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { createAvatarReport, getAvatarReports } from '../../services/avatarReportService';
import AvatarReportForm from '../../components/AvatarReport/AvatarReportForm';
import AvatarReportList from '../../components/AvatarReport/AvatarReportList';
import type { AvatarCrashReport, AvatarCrashReportFormData } from '../../types/avatarReport';
import { useEffect } from 'react';

export default function AvatarReports() {
  const [reports, setReports] = useState<AvatarCrashReport[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const data = await getAvatarReports();
      setReports(data);
    } catch (err) {
      setError('Erreur lors du chargement des rapports');
    }
  };

  const handleSubmit = async (data: AvatarCrashReportFormData) => {
    if (!user) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await createAvatarReport(data.avatar_id, user.username);
      await loadReports();
    } catch (err) {
      setError('Erreur lors de la création du rapport');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Rapports d'avatars crash</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <AvatarReportForm 
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
        <AvatarReportList reports={reports} />
      </div>
    </div>
  );
}
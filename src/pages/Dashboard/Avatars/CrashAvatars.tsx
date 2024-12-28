import React from 'react';
import AvatarCrashForm from '../../../components/AvatarCrash/AvatarCrashForm';
import AvatarCrashList from '../../../components/AvatarCrash/AvatarCrashList';
import { useAvatarReports } from '../../../hooks/useAvatarReports';

export default function CrashAvatars() {
  const { reports, isLoading, error, createReport, deleteReport } = useAvatarReports();

  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="text-2xl font-bold">Signalement d'Avatars Crash</h1>
      
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
          {error}
        </div>
      )}

      <AvatarCrashForm onSubmit={createReport} />
      <AvatarCrashList 
        reports={reports} 
        isLoading={isLoading} 
        onDelete={deleteReport}
      />
    </div>
  );
}
import React from 'react';
import { X } from 'lucide-react';
import type { Report } from '../../types/report';
import ReportStats from '../Reports/ReportStats';

interface UserDetailsProps {
  username: string;
  reports: Report[];
  onClose: () => void;
}

export default function UserDetails({ username, reports, onClose }: UserDetailsProps) {
  return (
    <div className="glass p-6 rounded-lg space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">{username}</h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-800/50 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <ReportStats reports={reports} username={username} />

      <div className="space-y-4">
        <h4 className="font-medium text-gray-400">Historique des rapports</h4>
        <div className="space-y-2">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-gray-800/50 p-4 rounded-lg"
            >
              <div className="flex justify-between text-sm">
                <span>{new Date(report.created_at).toLocaleDateString()}</span>
                <span className="text-gray-400">
                  Par {report.reported_by}
                </span>
              </div>
              <div className="mt-2 space-x-2">
                {report.warnings > 0 && (
                  <span className="text-yellow-500">
                    {report.warnings} avertissement(s)
                  </span>
                )}
                {report.kicks > 0 && (
                  <span className="text-red-500">
                    {report.kicks} expulsion(s)
                  </span>
                )}
                {report.mutes > 0 && (
                  <span className="text-orange-500">
                    {report.mutes} mute(s)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
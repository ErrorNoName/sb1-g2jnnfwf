import React from 'react';
import { ExternalLink } from 'lucide-react';
import type { AvatarCrashReport } from '../../types/avatarReport';

interface AvatarReportListProps {
  reports: AvatarCrashReport[];
}

export default function AvatarReportList({ reports }: AvatarReportListProps) {
  if (reports.length === 0) {
    return (
      <div className="glass p-6 rounded-lg">
        <p className="text-gray-400">Aucun rapport d'avatar pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              ID Avatar
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Rapporteur
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {reports.map((report) => (
            <tr key={report.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {report.avatar_id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {new Date(report.created_at).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {report.reported_by}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                <a
                  href={`https://vrchat.com/home/avatar/${report.avatar_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
                >
                  VRChat
                  <ExternalLink size={14} />
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
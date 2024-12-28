import React from 'react';
import { ExternalLink, Loader, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import type { AvatarReport } from '../../types/avatar';

interface AvatarCrashListProps {
  reports: AvatarReport[];
  isLoading: boolean;
  onDelete: (reportId: string) => Promise<void>;
}

export default function AvatarCrashList({ reports, isLoading, onDelete }: AvatarCrashListProps) {
  const [selectedReport, setSelectedReport] = React.useState<string | null>(null);

  const handleDelete = async () => {
    if (selectedReport) {
      await onDelete(selectedReport);
      setSelectedReport(null);
    }
  };

  if (isLoading) {
    return (
      <div className="glass p-6 rounded-lg flex justify-center">
        <Loader className="animate-spin text-indigo-400" />
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="glass p-6 rounded-lg">
        <p className="text-gray-400">Aucun avatar signalé pour le moment.</p>
      </div>
    );
  }

  return (
    <>
      <div className="glass rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Avatar ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-800/30">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {report.avatar_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {new Date(report.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`https://vrchat.com/home/avatar/${report.avatar_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
                      >
                        VRChat
                        <ExternalLink size={14} />
                      </a>
                      <button
                        onClick={() => setSelectedReport(report.id)}
                        className="p-1 rounded hover:bg-gray-700/50 text-gray-400 hover:text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        onConfirm={handleDelete}
        title="Supprimer le signalement"
        message="Êtes-vous sûr de vouloir supprimer ce signalement d'avatar ?"
      />
    </>
  );
}
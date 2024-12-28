import React from 'react';
import { Clock, AlertTriangle, Ban, VolumeX, Trash2 } from 'lucide-react';
import { RULES } from '../../constants/rules';
import { useDeleteReport } from '../../hooks/useDeleteReport';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import ReportMedia from './ReportMedia';
import type { Report } from '../../types/report';

interface ReportCardProps {
  report: Report;
}

export default function ReportCard({ report }: ReportCardProps) {
  const [showConfirm, setShowConfirm] = React.useState(false);
  const { handleDelete, isDeleting } = useDeleteReport();

  const formattedDate = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short'
  }).format(new Date(report.created_at));

  const onDelete = async () => {
    const success = await handleDelete(report.id);
    if (success) {
      setShowConfirm(false);
    }
  };

  return (
    <div className="glass p-4 rounded-lg space-y-4 transition-opacity duration-300" 
         style={{ opacity: isDeleting ? 0.5 : 1 }}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{report.username}</h3>
          <p className="text-sm text-gray-400 flex items-center gap-1">
            <Clock size={14} />
            {formattedDate}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {report.warnings > 0 && (
              <div className="flex items-center gap-1 text-yellow-500">
                <AlertTriangle size={16} />
                <span className="text-sm">{report.warnings}</span>
              </div>
            )}
            {report.kicks > 0 && (
              <div className="flex items-center gap-1 text-red-500">
                <Ban size={16} />
                <span className="text-sm">{report.kicks}</span>
              </div>
            )}
            {report.mutes > 0 && (
              <div className="flex items-center gap-1 text-orange-500">
                <VolumeX size={16} />
                <span className="text-sm">{report.mutes}</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowConfirm(true)}
            disabled={isDeleting}
            className="p-2 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {report.proof_url && (
        <ReportMedia url={report.proof_url} className="mt-4" />
      )}

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Infractions :</h4>
        <div className="flex flex-wrap gap-2">
          {report.rules.map(ruleId => (
            <span 
              key={ruleId}
              className="px-2 py-1 rounded-full text-xs bg-indigo-500/20 text-indigo-300"
            >
              {RULES[ruleId]}
            </span>
          ))}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={onDelete}
        title="Supprimer le rapport"
        message="Êtes-vous sûr de vouloir supprimer ce rapport ? Cette action est irréversible et supprimera également la preuve associée."
        confirmLabel={isDeleting ? "Suppression..." : "Supprimer"}
        confirmDisabled={isDeleting}
      />
    </div>
  );
}
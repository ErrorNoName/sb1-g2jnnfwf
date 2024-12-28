import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ReportCard from './ReportCard';
import ReportStats from './ReportStats';
import type { Report } from '../../types/report';

interface ReportGroupProps {
  username: string;
  reports: Report[];
}

export default function ReportGroup({ username, reports }: ReportGroupProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const totalSanctions = reports.reduce((sum, report) => 
    sum + report.warnings + report.kicks + report.mutes, 0
  );

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 glass rounded-lg hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <h3 className="font-medium">{username}</h3>
          <span className="text-sm text-gray-400">
            {reports.length} rapport{reports.length > 1 ? 's' : ''} •{' '}
            {totalSanctions} sanction{totalSanctions > 1 ? 's' : ''}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="space-y-4 pl-4">
          <ReportStats reports={reports} username={username} />
          <div className="space-y-2">
            {reports.map(report => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
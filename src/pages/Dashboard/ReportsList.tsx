import React, { useState, useMemo } from 'react';
import { useRealtimeReports } from '../../hooks/useRealtimeReports';
import { useReports } from '../../hooks/useReports';
import ReportCard from '../../components/Reports/ReportCard';
import ReportGroup from '../../components/Reports/ReportGroup';
import ReportFilters from '../../components/Reports/ReportFilters';
import { Loader } from 'lucide-react';

export default function ReportsList() {
  const [groupByUser, setGroupByUser] = useState(true);
  const { 
    loading, 
    error,
    dateRange,
    setDateRange,
    sortOrder,
    setSortOrder,
  } = useReports();
  
  const { reports } = useRealtimeReports();

  const groupedReports = useMemo(() => {
    if (!groupByUser) return null;

    const groups = reports.reduce((acc, report) => {
      if (!acc[report.username]) {
        acc[report.username] = [];
      }
      acc[report.username].push(report);
      return acc;
    }, {} as Record<string, typeof reports>);

    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [reports, groupByUser]);
  if (error) {
    return (
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold mb-6">Rapports de modération</h1>
        <div className="glass p-6 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Rapports de modération</h1>
      
      <ReportFilters
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        groupByUser={groupByUser}
        onGroupByUserChange={setGroupByUser}
      />

      {loading ? (
        <div className="glass p-6 rounded-lg flex justify-center">
          <Loader className="animate-spin text-indigo-400" />
        </div>
      ) : reports.length === 0 ? (
        <div className="glass p-6 rounded-lg">
          <p className="text-gray-400">Aucun rapport pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupByUser ? (
            groupedReports?.map(([username, userReports]) => (
              <ReportGroup
                key={username}
                username={username}
                reports={userReports}
              />
            ))
          ) : (
            reports.map(report => (
              <ReportCard
                key={report.id}
                report={report}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
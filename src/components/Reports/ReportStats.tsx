import React from 'react';
import { BarChart3, AlertTriangle, Ban, VolumeX } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import type { Report } from '../../types/report';

interface ReportStatsProps {
  reports: Report[];
  username: string;
}

export default function ReportStats({ reports, username }: ReportStatsProps) {
  const totalWarnings = reports.reduce((sum, report) => sum + report.warnings, 0);
  const totalKicks = reports.reduce((sum, report) => sum + report.kicks, 0);
  const totalMutes = reports.reduce((sum, report) => sum + report.mutes, 0);

  // Données pour le graphique d'évolution
  const chartData = {
    labels: reports.map(r => new Date(r.created_at).toLocaleDateString()),
    datasets: [
      {
        label: 'Avertissements',
        data: reports.map(r => r.warnings),
        borderColor: '#eab308',
        tension: 0.4,
      },
      {
        label: 'Expulsions',
        data: reports.map(r => r.kicks),
        borderColor: '#ef4444',
        tension: 0.4,
      },
      {
        label: 'Mutes',
        data: reports.map(r => r.mutes),
        borderColor: '#f97316',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="glass p-6 rounded-lg space-y-6">
      <h3 className="text-xl font-semibold">Statistiques pour {username}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 bg-gray-800/50 p-4 rounded-lg">
          <div className="p-3 bg-yellow-500/20 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Avertissements</p>
            <p className="text-2xl font-bold">{totalWarnings}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-gray-800/50 p-4 rounded-lg">
          <div className="p-3 bg-red-500/20 rounded-lg">
            <Ban className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Expulsions</p>
            <p className="text-2xl font-bold">{totalKicks}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-gray-800/50 p-4 rounded-lg">
          <div className="p-3 bg-orange-500/20 rounded-lg">
            <VolumeX className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Mutes</p>
            <p className="text-2xl font-bold">{totalMutes}</p>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <h4 className="text-sm font-medium text-gray-400 mb-4">Évolution des sanctions</h4>
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
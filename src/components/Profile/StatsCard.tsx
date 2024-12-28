import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
}

export function StatsCard({ icon: Icon, label, value, trend, trendUp }: StatsCardProps) {
  return (
    <div className="glass p-6 rounded-xl">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-indigo-500/20 rounded-xl">
          <Icon className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <p className="text-sm text-gray-400">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
          <div className="flex items-center gap-1 mt-1">
            {trendUp ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <span className={`text-sm ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
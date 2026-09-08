import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  colorScheme?: 'blue' | 'rose' | 'amber' | 'emerald' | 'purple' | 'slate';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  colorScheme = 'blue',
}) => {
  const schemeStyles = {
    blue: {
      iconBg: 'bg-blue-50 text-blue-600',
      border: 'border-blue-100/60',
    },
    rose: {
      iconBg: 'bg-rose-50 text-rose-600',
      border: 'border-rose-100/60',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600',
      border: 'border-amber-100/60',
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600',
      border: 'border-emerald-100/60',
    },
    purple: {
      iconBg: 'bg-purple-50 text-purple-600',
      border: 'border-purple-100/60',
    },
    slate: {
      iconBg: 'bg-slate-100 text-slate-600',
      border: 'border-slate-200/60',
    },
  };

  const scheme = schemeStyles[colorScheme];

  return (
    <div
      className={`bg-white rounded-xl border p-5 shadow-xs transition-all hover:shadow-md ${scheme.border}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2.5 rounded-lg ${scheme.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3">
        <h4 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h4>
        {(description || trend) && (
          <div className="mt-1 flex items-center gap-2 text-xs">
            {trend && (
              <span
                className={`font-semibold ${
                  trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {trend.value}
              </span>
            )}
            {description && <span className="text-slate-500">{description}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

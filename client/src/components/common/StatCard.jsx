import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'orange', trend }) => {
  const colorMap = {
    orange: { bg: 'bg-[#fff0ed]', text: 'text-[#e84b2c]', border: 'border-[#ffd0c4]' },
    blue:   { bg: 'bg-blue-50',   text: 'text-blue-500',   border: 'border-blue-200' },
    amber:  { bg: 'bg-amber-50',  text: 'text-amber-500',  border: 'border-amber-200' },
    green:  { bg: 'bg-green-50',  text: 'text-green-600',  border: 'border-green-200' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-500', border: 'border-purple-200' },
    rose:   { bg: 'bg-red-50',    text: 'text-red-500',    border: 'border-red-200' },
    // legacy aliases
    emerald: { bg: 'bg-green-50',  text: 'text-green-600', border: 'border-green-200' },
  };

  const c = colorMap[color] || colorMap.orange;

  return (
    <div className="surface surface-hover p-5 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</p>
          <h3 className="mt-1 text-2xl font-bold text-gray-900 tracking-tight">{value}</h3>
          {subtitle && <p className="mt-1 text-xs text-gray-400">{subtitle}</p>}
        </div>

        {Icon && (
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${c.bg} ${c.border}`}>
            <Icon className={`h-5 w-5 ${c.text}`} />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold">
          <span className={trend.positive ? 'text-green-600' : 'text-[#e84b2c]'}>
            {trend.value}
          </span>
          <span className="text-gray-400 font-normal">{trend.label}</span>
        </div>
      )}
    </div>
  );
};

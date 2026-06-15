import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  valueUsd: string;
  valueCdf: string;
  growth?: {
    value: number;
    isPositive: boolean;
  };
  icon: LucideIcon;
  iconBgColor: string;
  iconTextColor: string;
}

export default function StatCard({
  title,
  valueUsd,
  valueCdf,
  growth,
  icon: Icon,
  iconBgColor,
  iconTextColor,
}: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 hover-card-effect shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-500">{title}</span>
        <div className={`p-2.5 rounded-xl ${iconBgColor} ${iconTextColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
          {valueUsd}
        </h3>
        <p className="text-xs font-semibold text-slate-400">
          {valueCdf}
        </p>
      </div>

      {growth && (
        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-1.5">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
            growth.isPositive 
              ? 'bg-emerald-50 text-emerald-600' 
              : 'bg-rose-50 text-rose-600'
          }`}>
            {growth.isPositive ? '+' : ''}{growth.value}%
          </span>
          <span className="text-xs font-medium text-slate-400">
            vs mois précédent
          </span>
        </div>
      )}
    </div>
  );
}

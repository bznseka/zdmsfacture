import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AdminStatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  iconBgColor: string;
  iconTextColor: string;
}

export default function AdminStatCard({ title, value, icon: Icon, iconBgColor, iconTextColor }: AdminStatCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 hover-card-effect shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-500">{title}</span>
        <div className={`p-2.5 rounded-xl ${iconBgColor} ${iconTextColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <h3 className="mt-4 text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
    </div>
  );
}

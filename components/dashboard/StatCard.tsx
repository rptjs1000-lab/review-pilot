'use client';

import React from 'react';

// StatCard — 아이콘 원형배경 + 숫자(font-grotesk) + 라벨
interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBgClass: string; // 예: "bg-primary-light", "bg-red-50", "bg-amber-50", "bg-emerald-50"
}

export default function StatCard({ label, value, icon, iconBgClass }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-bdr shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-full ${iconBgClass} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-txt-sub">{label}</p>
        <p className="text-[28px] font-bold text-txt font-grotesk leading-[1.2]">{value}</p>
      </div>
    </div>
  );
}

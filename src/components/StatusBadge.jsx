import React from 'react';

export default function StatusBadge({ status }) {
  const normStatus = (status || '').toLowerCase();

  let styles = 'bg-slate-100 text-slate-800 border-slate-200';

  if (normStatus === 'available' || normStatus === 'paid' || normStatus === 'completed' || normStatus === 'active') {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20';
  } else if (normStatus === 'occupied') {
    styles = 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20';
  } else if (normStatus === 'reserved' || normStatus === 'pending') {
    styles = 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20';
  } else if (normStatus === 'maintenance') {
    styles = 'bg-slate-100 text-slate-600 border-slate-200 ring-slate-500/20';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75"></span>
      {status || 'Unknown'}
    </span>
  );
}

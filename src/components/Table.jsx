import React from 'react';

export default function Table({ headers = [], children, emptyMessage = 'No records found.' }) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm text-slate-600">
        <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
          <tr>
            {headers.map((header, idx) => (
              <th key={idx} className="px-6 py-3.5">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {React.Children.count(children) === 0 ? (
            <tr>
              <td colSpan={headers.length} className="px-6 py-8 text-center text-slate-400 italic">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}

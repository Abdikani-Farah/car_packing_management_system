import React from 'react';
import Table from './Table.jsx';
import Button from './Button.jsx';
import { Edit3, Trash2 } from 'lucide-react';

export default function CustomerTable({ customers = [], onEdit, onDelete }) {
  const headers = ['Name', 'Phone', 'Email', 'Address', 'Associated Vehicle', 'Actions'];

  return (
    <Table headers={headers} emptyMessage="No customers recorded yet.">
      {customers.map((c) => (
        <tr key={c._id} className="hover:bg-slate-50/80 transition-colors">
          <td className="px-6 py-4 font-bold text-slate-900">{c.name}</td>
          <td className="px-6 py-4 font-medium text-slate-800">{c.phone}</td>
          <td className="px-6 py-4 text-slate-600">{c.email || 'N/A'}</td>
          <td className="px-6 py-4 text-slate-600">{c.address || 'N/A'}</td>
          <td className="px-6 py-4">
            {c.vehicle ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700">
                {c.vehicle.plateNumber} ({c.vehicle.type})
              </span>
            ) : (
              <span className="text-slate-400 italic text-xs">None</span>
            )}
          </td>
          <td className="px-6 py-4">
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="ghost" onClick={() => onEdit(c)}>
                <Edit3 className="w-4 h-4 text-slate-500" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onDelete(c)}>
                <Trash2 className="w-4 h-4 text-rose-500" />
              </Button>
            </div>
          </td>
        </tr>
      ))}
    </Table>
  );
}

import React from 'react';
import Table from './Table.jsx';
import Button from './Button.jsx';
import { Edit3, Trash2 } from 'lucide-react';

export default function VehicleTable({ vehicles = [], onEdit, onDelete }) {
  const headers = ['Plate Number', 'Type', 'Model & Color', 'Owner', 'Phone', 'Actions'];

  return (
    <Table headers={headers} emptyMessage="No vehicles registered yet.">
      {vehicles.map((v) => (
        <tr key={v._id} className="hover:bg-slate-50/80 transition-colors">
          <td className="px-6 py-4 font-bold text-slate-900">{v.plateNumber}</td>
          <td className="px-6 py-4">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700">
              {v.type}
            </span>
          </td>
          <td className="px-6 py-4 text-slate-700">
            {v.model || 'N/A'} {v.color && <span className="text-xs text-slate-400">({v.color})</span>}
          </td>
          <td className="px-6 py-4 font-medium text-slate-800">{v.ownerName || 'N/A'}</td>
          <td className="px-6 py-4 text-slate-600">{v.ownerPhone || 'N/A'}</td>
          <td className="px-6 py-4">
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="ghost" onClick={() => onEdit(v)}>
                <Edit3 className="w-4 h-4 text-slate-500" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onDelete(v)}>
                <Trash2 className="w-4 h-4 text-rose-500" />
              </Button>
            </div>
          </td>
        </tr>
      ))}
    </Table>
  );
}

import React from 'react';
import { HoldEntry } from '../../types';
import { Button } from '../ui/Button';

interface HoldListItemProps {
  item: HoldEntry;
  onResume: (id: string) => void;
}

export const HoldListItem: React.FC<HoldListItemProps> = ({ item, onResume }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg mb-3">
      <div>
        <div className="flex items-center gap-2">
          <h4 className="font-bold text-slate-800">{item.patientName}</h4>
          <span className="text-xs font-mono bg-amber-200 px-2 py-0.5 rounded text-amber-800">
            {item.tokenId}
          </span>
        </div>
        <p className="text-sm text-slate-600 mt-1">
          <span className="font-medium">Reason:</span> {item.reason}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">On hold since: {item.timeOnHold}</p>
      </div>
      <Button 
        variant="outline" 
        onClick={() => onResume(item.id)}
        className="text-amber-700 border-amber-600 hover:bg-amber-100 focus:ring-amber-500"
      >
        Resume
      </Button>
    </div>
  );
};
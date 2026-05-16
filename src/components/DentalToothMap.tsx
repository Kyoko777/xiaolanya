import React from 'react';
import { X } from 'lucide-react';

/*
  FDI World Dental Federation notation (Permanent):
  18-11 (UR), 21-28 (UL), 48-41 (LR), 31-38 (LL)

  Primary teeth (Deciduous) notation:
  55-51 (UR), 61-65 (UL), 85-81 (LR), 71-75 (LL)
  OR Roman: V-I, I-V, V-I, I-V in quadrants 5,6,7,8
*/

export const formatToothDisplay = (toothId: string) => {
  const quad = parseInt(toothId[0]);
  const num = parseInt(toothId[1]);
  
  // Permanent Teeth (Quadrants 1-4)
  if (quad >= 1 && quad <= 4) {
    return toothId; 
  }
  
  // Primary Teeth (Quadrants 5-8) - Convert to Roman
  const romanMap = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
  if (quad >= 5 && quad <= 8) {
    return `${quad}${romanMap[num - 1] || num}`;
  }
  
  return toothId;
};

interface ToothGridProps {
  quadrant: number;
  selectedTeeth: string[];
  onToggle: (tooth: string) => void;
  isPrimary?: boolean;
}

const ToothGrid: React.FC<ToothGridProps> = ({ quadrant, selectedTeeth, onToggle, isPrimary }) => {
  const count = isPrimary ? 5 : 8;
  const teeth = quadrant === 2 || quadrant === 3 || quadrant === 6 || quadrant === 7
    ? Array.from({length: count}, (_, i) => i + 1)
    : Array.from({length: count}, (_, i) => count - i);

  return (
    <div className={`grid ${isPrimary ? 'grid-cols-5' : 'grid-cols-8'} gap-1 p-2 bg-slate-50/50 rounded-xl border border-white/50`}>
      {teeth.map(num => {
        const toothId = `${quadrant}${num}`;
        return (
          <button
            key={toothId}
            onClick={() => onToggle(toothId)}
            className="aspect-square flex items-center justify-center text-[10px] font-black rounded-lg transition-all bg-white text-slate-400 border border-slate-100 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 hover:scale-110 active:scale-125 active:bg-blue-500 active:text-white active:z-10 border"
          >
            {formatToothDisplay(toothId).replace(quadrant.toString(), '')}
          </button>
        );
      })}
    </div>
  );
};

interface DentalToothMapProps {
  selectedTeeth: string[];
  onToggle: (tooth: string) => void;
}

const DentalToothMap: React.FC<DentalToothMapProps> = ({ selectedTeeth, onToggle }) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Permanent Teeth */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-4">
          <ToothGrid quadrant={1} selectedTeeth={selectedTeeth} onToggle={onToggle} />
          <ToothGrid quadrant={2} selectedTeeth={selectedTeeth} onToggle={onToggle} />
          <ToothGrid quadrant={4} selectedTeeth={selectedTeeth} onToggle={onToggle} />
          <ToothGrid quadrant={3} selectedTeeth={selectedTeeth} onToggle={onToggle} />
        </div>
      </div>

      {/* Primary Teeth */}
      <div className="space-y-2 opacity-80 scale-95 origin-top">
        <div className="grid grid-cols-2 gap-4">
          <ToothGrid quadrant={5} selectedTeeth={selectedTeeth} onToggle={onToggle} isPrimary />
          <ToothGrid quadrant={6} selectedTeeth={selectedTeeth} onToggle={onToggle} isPrimary />
          <ToothGrid quadrant={8} selectedTeeth={selectedTeeth} onToggle={onToggle} isPrimary />
          <ToothGrid quadrant={7} selectedTeeth={selectedTeeth} onToggle={onToggle} isPrimary />
        </div>
      </div>
    </div>
  );
};

export default DentalToothMap;

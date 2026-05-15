import React, { useState } from 'react';
import { Plus, X, Search } from 'lucide-react';

interface ToothGridProps {
  quadrant: 1 | 2 | 3 | 4;
  selectedTeeth: string[];
  onToggle: (tooth: string) => void;
}

const ToothGrid: React.FC<ToothGridProps> = ({ quadrant, selectedTeeth, onToggle }) => {
  const teeth = quadrant === 2 || quadrant === 3 
    ? [1, 2, 3, 4, 5, 6, 7, 8]
    : [8, 7, 6, 5, 4, 3, 2, 1];

  return (
    <div className="grid grid-cols-4 gap-2 p-3 bg-slate-50/30 rounded-2xl border border-white/50 backdrop-blur-sm shadow-inner">
      {teeth.map(num => {
        const toothId = `${quadrant}${num}`;
        const isSelected = selectedTeeth.includes(toothId);
        return (
          <button
            key={toothId}
            onClick={() => onToggle(toothId)}
            className={`
              aspect-square flex flex-col items-center justify-center gap-1 text-[11px] font-black rounded-xl transition-all duration-300
              ${isSelected 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105 z-10' 
                : 'bg-white text-slate-400 border border-slate-100 hover:border-blue-400 hover:text-blue-600 hover:scale-105 shadow-sm'}
            `}
          >
            <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/40' : 'bg-slate-200'}`} />
            {toothId}
          </button>
        );
      })}
    </div>
  );
};

interface DentalToothMapProps {
  selectedTeeth: string[];
  onToggle: (tooth: string) => void;
  onInputChange: (value: string) => void;
}

const DentalToothMap: React.FC<DentalToothMapProps> = ({ selectedTeeth, onToggle, onInputChange }) => {
  const [inputValue, setInputValue] = useState('');

  const handleManualInput = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      const parts = inputValue.split(/[ ,，]+/).filter(p => p.length > 0);
      parts.forEach(p => {
        if (!selectedTeeth.includes(p)) {
          onToggle(p);
        }
      });
      setInputValue('');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4">
        <ToothGrid quadrant={1} selectedTeeth={selectedTeeth} onToggle={onToggle} />
        <ToothGrid quadrant={2} selectedTeeth={selectedTeeth} onToggle={onToggle} />
        <ToothGrid quadrant={4} selectedTeeth={selectedTeeth} onToggle={onToggle} />
        <ToothGrid quadrant={3} selectedTeeth={selectedTeeth} onToggle={onToggle} />
      </div>

      <form onSubmit={handleManualInput} className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="快捷输入牙号 (如: 11, 46)..."
          className="w-full pl-11 pr-14 py-4 bg-slate-100/50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-200 transition-all outline-none"
        />
        <button 
          type="submit"
          className="absolute right-2 top-2 p-2 bg-blue-600 shadow-lg shadow-blue-100 rounded-xl text-white hover:bg-blue-700 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
        </button>
      </form>
      
      {selectedTeeth.length > 0 && (
        <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-500">
          {[...selectedTeeth].sort((a, b) => a.localeCompare(b)).map(t => (
            <span 
              key={t} 
              className="px-4 py-1.5 bg-blue-600 text-white text-[11px] font-black rounded-full shadow-lg shadow-blue-100 flex items-center gap-2 group hover:scale-105 transition-transform"
            >
              牙位 {t}
              <button 
                type="button"
                onClick={() => onToggle(t)} 
                className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default DentalToothMap;

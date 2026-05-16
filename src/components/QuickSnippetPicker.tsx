"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useSnippets, Snippet } from '../hooks/useSnippets';
import { ChevronDown, Plus } from 'lucide-react';

interface QuickSnippetPickerProps {
  onSelect: (content: string) => void;
  category?: string;
}

const QuickSnippetPicker: React.FC<QuickSnippetPickerProps> = ({ onSelect, category }) => {
  const { snippets } = useSnippets();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDisease, setSelectedDisease] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter snippets by current board category (e.g., "主诉")
  // Include global snippets (category is null, empty, 'custom', or '通用')
  const categorySnippets = category 
    ? snippets.filter(s => s.category === category || s.category === 'custom' || s.category === '通用' || !s.category || s.category === '')
    : snippets;

  // Get unique diseases in this category
  const diseases = Array.from(new Set(categorySnippets.map(s => s.disease || '通用')));

  // Snippets to show based on selected disease
  const displaySnippets = selectedDisease 
    ? categorySnippets.filter(s => (s.disease || '通用') === selectedDisease)
    : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedDisease(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setSelectedDisease(null);
        }}
        className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-[10px] font-black text-slate-400 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all uppercase tracking-tighter"
      >
        <Plus className="w-3 h-3" />
        <span>快捷录入</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-[1.5rem] shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden">
          <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {selectedDisease ? selectedDisease : `选择病种 (${category})`}
            </span>
            {selectedDisease && (
              <button 
                onClick={() => setSelectedDisease(null)}
                className="text-[9px] font-black text-blue-600 hover:underline"
              >
                返回
              </button>
            )}
          </div>
          
          <div className="max-h-[260px] overflow-y-auto custom-scrollbar">
            {!selectedDisease ? (
              // Disease Selection Level
              <div className="p-2 grid grid-cols-1 gap-1">
                {diseases.length > 0 ? (
                  diseases.map(dis => (
                    <button
                      key={dis}
                      onClick={() => setSelectedDisease(dis)}
                      className="w-full px-4 py-3 text-left hover:bg-blue-50 rounded-xl transition-all flex items-center justify-between group"
                    >
                      <span className="text-xs font-bold text-slate-700 group-hover:text-blue-700">{dis}</span>
                      <span className="text-[9px] font-black text-slate-300 group-hover:text-blue-300">
                        {categorySnippets.filter(s => (s.disease || '通用') === dis).length} 项
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="p-8 text-center text-[10px] text-slate-400 font-bold uppercase">
                    该分类下暂无短语
                  </div>
                )}
              </div>
            ) : (
              // Snippet Selection Level
              <div className="p-2 grid grid-cols-1 gap-1">
                {displaySnippets.map((snippet) => (
                  <button
                    key={snippet.id}
                    onClick={() => {
                      onSelect(snippet.content);
                      setIsOpen(false);
                      setSelectedDisease(null);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-emerald-50 rounded-xl transition-all flex flex-col gap-0.5 group"
                  >
                    <span className="text-xs font-bold text-slate-700 group-hover:text-emerald-700">{snippet.trigger}</span>
                    <span className="text-[10px] text-slate-400 line-clamp-2">{snippet.content}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickSnippetPicker;

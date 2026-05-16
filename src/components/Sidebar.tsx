'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Search, Plus, Settings, User, Trash2, Database, Folder } from 'lucide-react';

interface Patient {
  id: number;
  name: string;
  phone: string;
  created_at: string;
}

interface SidebarProps {
  onSelectView?: (view: 'records' | 'settings' | 'doctors' | 'data') => void;
  onSelectPatient?: (patient: Patient) => void;
  onOpenAddPatient?: () => void;
  activeView?: 'records' | 'settings' | 'doctors' | 'data';
  activePatientId?: number;
  onOpenDoctorSettings?: () => void;
  doctorName?: string;
}

export default function Sidebar({ onSelectView, onSelectPatient, onOpenAddPatient, activeView, activePatientId, onOpenDoctorSettings, doctorName }: SidebarProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPatients = async () => {
    try {
      // @ts-ignore
      const result = await window.electron.ipcRenderer.invoke('db:get-patients');
      setPatients(result || []);
    } catch (err) {
      console.error('Failed to fetch patients:', err);
    }
  };

  const filteredPatients = useMemo(() => {
    if (!patients) return [];
    return patients.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (p.phone && p.phone.includes(searchQuery))
    );
  }, [patients, searchQuery]);

  const handleDeletePatient = async (e: React.MouseEvent, id: number, name: string) => {
    e.stopPropagation();
    if (confirm(`确定要删除患者 ${name} 及其所有记录吗？`)) {
      try {
        // @ts-ignore
        await window.electron.ipcRenderer.invoke('db:delete-patient', id);
        fetchPatients();
      } catch (err) {
        console.error('Failed to delete patient:', err);
      }
    }
  };

  useEffect(() => {
    fetchPatients();
    // @ts-ignore
    const removeListener = window.electron.ipcRenderer.on('db:refresh-patients', () => {
      fetchPatients();
    });
    return () => { if (typeof removeListener === 'function') removeListener(); };
  }, []);

  return (
    <div className="flex flex-col h-full p-2">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索患者 (姓名/电话)..."
          className="w-full frosted-input rounded-xl py-2.5 pl-9 pr-4 text-sm outline-none"
        />
      </div>

      <nav className="flex-1 overflow-hidden flex flex-col">
        <div className="text-xs font-black text-slate-500/80 px-3 py-2 uppercase tracking-[0.2em] flex justify-between items-center mb-1">
          <span>患者列表</span>
          <Plus className="w-4 h-4 cursor-pointer hover:text-blue-600 transition-colors" onClick={onOpenAddPatient} />
        </div>
        
        <div className="space-y-1 max-h-[260px] overflow-y-auto custom-scrollbar px-1 flex-1">
          {filteredPatients.map(p => (
            <div key={p.id} className="relative group">
              <button 
                onClick={() => {
                  onSelectPatient?.(p);
                  onSelectView?.('records');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-300 ${
                  activePatientId === p.id && activeView === 'records' ? 'bg-white/40 scale-[1.02]' : 'hover:bg-white/20'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-500 backdrop-blur-md border overflow-hidden ${
                    activePatientId === p.id && activeView === 'records'
                      ? 'bg-[#f0f9f4]/40 border-white/60 text-emerald-700/80' 
                      : 'bg-white/10 border-white/10 text-slate-400'
                  }`}>
                    {activePatientId === p.id && activeView === 'records' ? (
                      <img src="logo.png" className="w-full h-full object-cover" alt="Selected" />
                    ) : (
                      <span className="font-black text-xs">{p.name[0]}</span>
                    )}
                  </div>
                  <div className="text-left">
                    <p className={`text-sm font-bold ${activePatientId === p.id && activeView === 'records' ? 'text-emerald-900' : 'text-slate-700'}`}>{p.name}</p>
                    <p className="text-[10px] font-medium text-slate-400">{p.phone || '无记录'}</p>
                  </div>
                </div>
              </button>
              
              <button 
                onClick={(e) => handleDeletePatient(e, p.id, p.name)}
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all z-10"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </nav>

      <div className="mt-auto border-t border-white/10 pt-4 space-y-1 px-1">
        <button 
          onClick={() => onSelectView?.('settings')}
          className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-300 ${activeView === 'settings' ? 'bg-white/60 border border-white/40 text-blue-600' : 'text-slate-500 hover:bg-white/20'}`}
        >
          <Settings className={`w-4 h-4 ${activeView === 'settings' ? 'text-blue-500' : 'text-blue-400'}`} />
          <span className="font-bold">短语库管理</span>
        </button>
        <button 
          onClick={() => onSelectView?.('doctors')}
          className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-300 ${activeView === 'doctors' ? 'bg-white/60 border border-white/40 text-blue-600' : 'text-slate-500 hover:bg-white/20'}`}
        >
          <User className={`w-4 h-4 ${activeView === 'doctors' ? 'text-blue-500' : 'text-emerald-500'}`} />
          <span className="font-bold">医生增添管理</span>
        </button>
        <button 
          onClick={() => onSelectView?.('data')}
          className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-300 ${activeView === 'data' ? 'bg-white/60 border border-white/40 text-blue-600' : 'text-slate-500 hover:bg-white/20'}`}
        >
          <Folder className={`w-4 h-4 ${activeView === 'data' ? 'text-blue-500' : 'text-indigo-500'}`} />
          <span className="font-bold">病历存储及备份</span>
        </button>
      </div>
    </div>
  );
}
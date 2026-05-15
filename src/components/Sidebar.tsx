'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Search, Plus, Settings, User } from 'lucide-react';
import AddPatientModal from './AddPatientModal';

interface Patient {
  id: number;
  name: string;
  phone: string;
  created_at: string;
}

interface SidebarProps {
  onSelectView?: (view: 'records' | 'settings') => void;
  onSelectPatient?: (patient: Patient) => void;
  activeView?: 'records' | 'settings';
  activePatientId?: number;
}

export default function Sidebar({ onSelectView, onSelectPatient, activeView, activePatientId }: SidebarProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPatients = async () => {
    // @ts-ignore
    const result = await window.electron.ipcRenderer.invoke('db:get-patients');
    setPatients(result || []);
  };

  const filteredPatients = useMemo(() => {
    if (!patients) return [];
    return patients.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (p.phone && p.phone.includes(searchQuery))
    );
  }, [patients, searchQuery]);

  const handleAddSuccess = (newPatient: any) => {
    fetchPatients();
    onSelectPatient?.(newPatient);
    onSelectView?.('records');
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
    <div className="flex flex-col h-full p-4">
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索患者 (姓名/电话)..."
          className="w-full bg-gray-100 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
        />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar px-1">
        <div className="text-[10px] font-black text-slate-400 px-3 py-2 uppercase tracking-widest flex justify-between items-center">
          <span>患者列表</span>
          <Plus className="w-3.5 h-3.5 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => setIsModalOpen(true)} />
        </div>
        
        <div className="space-y-1">
          {filteredPatients.map(p => (
            <button 
              key={p.id} 
              onClick={() => {
                onSelectPatient?.(p);
                onSelectView?.('records');
              }}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all group ${
                activePatientId === p.id && activeView === 'records' ? 'bg-blue-50 shadow-sm' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs transition-all ${
                  activePatientId === p.id && activeView === 'records'
                    ? 'bg-blue-600 text-white rotate-2' 
                    : 'bg-white border border-slate-100 text-slate-400 group-hover:bg-blue-500 group-hover:text-white'
                }`}>
                  {p.name[0]}
                </div>
                <div className="text-left">
                  <p className={`text-sm font-bold ${activePatientId === p.id && activeView === 'records' ? 'text-blue-900' : 'text-slate-700'}`}>{p.name}</p>
                  <p className="text-[10px] font-medium text-slate-400">{p.phone || '无记录'}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="text-[10px] font-black text-slate-400 px-3 py-2 mt-6 uppercase tracking-widest">系统</div>
        <button 
          onClick={() => onSelectView?.('settings')}
          className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-sm transition-all ${activeView === 'settings' ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <Settings className={`w-4 h-4 ${activeView === 'settings' ? 'text-blue-400' : ''}`} />
          <span className="font-bold">短语库管理</span>
        </button>
      </nav>

      <AddPatientModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleAddSuccess}
      />
    </div>
  );
}

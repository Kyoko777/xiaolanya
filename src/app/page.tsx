"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Editor from '../components/Editor';
import Sidebar from '../components/Sidebar';
import DentalToothMap, { formatToothDisplay } from '../components/DentalToothMap';
import QuickSnippetPicker from '../components/QuickSnippetPicker';
import SettingsPage from './settings/page';
import AddPatientModal from '../components/AddPatientModal';
import { FileText, CheckCircle2, Clock, User, Activity, PlusCircle, History, Trash2, Calendar, Shield, Phone, X, Share, Save, Plus, Settings, Database, FolderOpen, Download, Upload, Folder, ChevronLeft, ChevronRight } from 'lucide-react';

const DentalCalendar = ({ onSelectDate, currentDate, initialVisitDate, onSetInitialDate, viewMonth, viewYear, prevMonth, nextMonth }: { 
  onSelectDate: (d: string) => void, 
  currentDate: string, 
  initialVisitDate: string, 
  onSetInitialDate: (d: string) => void,
  viewMonth: number,
  viewYear: number,
  prevMonth: () => void,
  nextMonth: () => void
}) => {
  const [markedDates, setMarkedDates] = useState<{[key: string]: 'red' | 'green' | 'blue'}>({
    '12': 'green', '20': 'blue'
  });
  
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const startDay = new Date(viewYear, viewMonth, 1).getDay();
  const days = Array.from({length: daysInMonth(viewYear, viewMonth)}, (_, i) => i + 1);

  const cycleColor = (day: number) => {
    const newDate = `${viewYear}-${(viewMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    onSelectDate(newDate);

    const dateKey = `${viewYear}-${viewMonth}-${day}`;
    const isCurrentRed = initialVisitDate && initialVisitDate === newDate;
    
    if (isCurrentRed) {
      onSetInitialDate('');
      setMarkedDates({...markedDates, [dateKey]: 'green'});
    } else if (!initialVisitDate) {
      onSetInitialDate(newDate);
      const updated = {...markedDates};
      delete updated[dateKey];
      setMarkedDates(updated);
    } else {
      const current = markedDates[dateKey];
      if (!current) setMarkedDates({...markedDates, [dateKey]: 'green'});
      else if (current === 'green') setMarkedDates({...markedDates, [dateKey]: 'blue'});
      else {
        const updated = {...markedDates};
        delete updated[dateKey];
        setMarkedDates(updated);
      }
    }
  };

  return (
    <div className="bg-white/40 rounded-[2rem] border border-white p-6 relative overflow-hidden group/cal backdrop-blur-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-1 hover:bg-white/60 rounded-lg transition-all"><ChevronLeft className="w-3.5 h-3.5 text-slate-400" /></button>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{viewYear}年 {viewMonth + 1}月</h3>
          <button onClick={nextMonth} className="p-1 hover:bg-white/60 rounded-lg transition-all"><ChevronRight className="w-3.5 h-3.5 text-slate-400" /></button>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500" /><span className="text-[9px] font-bold text-slate-400">初诊</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-[9px] font-bold text-slate-400">复诊</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-[9px] font-bold text-slate-400">预约</span></div>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center mb-3">
        {['日','一','二','三','四','五','六'].map(d => <span key={d} className="text-[10px] font-black text-slate-300 uppercase">{d}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({length: 42}).map((_, i) => {
          const dayIndex = i - startDay + 1;
          const isCurrentMonth = dayIndex > 0 && dayIndex <= days.length;
          
          if (!isCurrentMonth) return <div key={`empty-${i}`} className="aspect-square" />;

          const dateKey = `${viewYear}-${viewMonth}-${dayIndex}`;
          const newDate = `${viewYear}-${(viewMonth + 1).toString().padStart(2, '0')}-${dayIndex.toString().padStart(2, '0')}`;
          const color = markedDates[dateKey];
          const isInitial = initialVisitDate && initialVisitDate === newDate;
          const isSelected = currentDate === newDate;
          
          return (
            <button 
              key={dayIndex} 
              onClick={() => cycleColor(dayIndex)}
              className={`aspect-square flex flex-col items-center justify-center text-[10px] font-black rounded-xl transition-all duration-300 relative ${
                isSelected 
                ? 'scale-110 z-10 border-2 border-white ' 
                : 'border border-transparent'
              } ${
                isInitial ? 'bg-red-500 text-white' :
                color === 'green' ? 'bg-emerald-500 text-white' :
                color === 'blue' ? 'bg-blue-500 text-white' :
                isSelected ? 'bg-white text-slate-800' : 'text-slate-400 bg-white/10 hover:bg-white/40 hover:text-slate-600'
              }`}>
              <span className="relative z-10">{dayIndex}</span>
              {isSelected && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white animate-pulse z-20" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const RecordEditor = () => {
  const [view, setView] = useState<'records' | 'settings' | 'doctors' | 'data'>('records');
  const [storagePath, setStoragePath] = useState('');

  useEffect(() => {
    const fetchPath = async () => {
      // @ts-ignore
      const p = await window.electron.ipcRenderer.invoke('db:get-storage-path');
      setStoragePath(p);
    };
    fetchPath();
  }, []);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [patient, setPatient] = useState<any>({});

  const [selectedTeeth, setSelectedTeeth] = useState<string[]>([]);
  const [diagnosis, setDiagnosis] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [specialExam, setSpecialExamination] = useState('');
  const [treatment, setTreatment] = useState('');
  const [finalDiagnosis, setFinalDiagnosis] = useState('');
  const [followups, setFollowups] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [activeField, setActiveField] = useState<string>('specialExam');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [initialVisitDate, setInitialVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [patientRecords, setPatientRecords] = useState<any[]>([]);
  const [sidebarKey, setSidebarKey] = useState(0);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [editingDoctor, setEditingDoctor] = useState<any>(null);
  const [selectedHomeDate, setSelectedHomeDate] = useState<number | null>(new Date().getDate());
  const [allAppointments, setAllAppointments] = useState<{[key: number]: any[]}>({});
  const [appointmentsForDate, setAppointmentsForDate] = useState<any[]>([]);
  const [devMode, setDevMode] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'D') {
        setDevMode(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initialize mock data once
  useEffect(() => {
    const mock: {[key: number]: any[]} = {};
    for (let i = 1; i <= 31; i++) {
      if (i % 5 === 0) {
        mock[i] = [
          { id: Math.random(), name: '王医生', type: '初诊', time: '10:00' },
          { id: Math.random(), name: '李四', type: '复诊', time: '14:30' }
        ];
      } else if (i % 3 === 0) {
        mock[i] = [
          { id: Math.random(), name: '赵世杰', type: '复诊', time: '09:00' }
        ];
      }
    }
    setAllAppointments(mock);
  }, []);

  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Update visible appointments when date changes
  useEffect(() => {
    if (selectedHomeDate) {
      setAppointmentsForDate(allAppointments[selectedHomeDate] || []);
    }
  }, [selectedHomeDate, allAppointments]);

  const handleRemoveAppointment = (id: number) => {
    if (!selectedHomeDate) return;
    setAllAppointments(prev => ({
      ...prev,
      [selectedHomeDate]: (prev[selectedHomeDate] || []).filter(a => a.id !== id)
    }));
  };

  const fetchDoctors = useCallback(async () => {
    // @ts-ignore
    const res = await window.electron.ipcRenderer.invoke('db:get-doctors');
    setDoctors(res || []);
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const loadRecord = useCallback(async (patientId: number) => {
    try {
      // @ts-ignore
      const allRecords = await window.electron.ipcRenderer.invoke('db:get-records', patientId);
      setPatientRecords(allRecords || []);

      // @ts-ignore
      const record = await window.electron.ipcRenderer.invoke('db:get-latest-record', patientId);
      if (record) {
        setSelectedTeeth(record.tooth_positions || []);
        setDiagnosis(record.diagnosis || '');
        setTreatment(record.treatment || '');
        setFinalDiagnosis(record.final_diagnosis || '');
        try {
          const extra = JSON.parse(record.notes || '{}');
          setMedicalHistory(extra.medicalHistory || '');
          setSpecialExamination(extra.specialExam || '');
          setFollowups(Array.isArray(extra.followups) ? extra.followups : []);
        } catch {
          setFollowups([]); setMedicalHistory(''); setSpecialExamination('');
        }
        if (record.date) setVisitDate(record.date);
      } else {
        setSelectedTeeth([]); setDiagnosis(''); setTreatment(''); setFinalDiagnosis(''); setMedicalHistory(''); setSpecialExamination(''); setFollowups([]);
        setVisitDate(new Date().toISOString().split('T')[0]);
      }
    } catch (err) {
      console.error('Load failed:', err);
    }
  }, []);

  const handleExportPDF = async () => {
    setSaveStatus('saving');
    const exportData = {
      patient,
      record: {
        diagnosis,
        medicalHistory,
        specialExam,
        finalDiagnosis,
        treatment,
        followups,
        date: visitDate,
        selectedTeeth
      }
    };

    // @ts-ignore
    const res = await window.electron.ipcRenderer.invoke('pdf:export', exportData);
    setSaveStatus('idle');
    if (res.success) {
      alert('病历导出成功！');
    }
  };

  const handleSelectPatient = (p: any) => {
    setPatient({ ...p, id_number: `P-${p.id.toString().padStart(3, '0')}` });
    setVisitDate(new Date().toISOString().split('T')[0]);
    loadRecord(p.id);
    setView('records');
  };

  const handleAppointmentDoubleClick = async (name: string) => {
    try {
      // @ts-ignore
      const allPatients = await window.electron.ipcRenderer.invoke('db:get-patients');
      const target = (allPatients || []).find((p: any) => p.name === name);
      if (target) {
        handleSelectPatient(target);
      } else {
        alert(`未找到患者 "${name}" 的正式档案，请先在侧边栏建立档案。`);
      }
    } catch (err) {
      console.error('Failed to find patient:', err);
    }
  };

  const toggleTooth = (tooth: string) => {
    // Keep track of state but always update text
    setSelectedTeeth(prev => prev.includes(tooth) ? prev.filter(t => t !== tooth) : [...prev, tooth]);
    
    const quad = parseInt(tooth[0]);
    const numPart = formatToothDisplay(tooth).slice(1);
    
    const romanOrder = ['I', 'II', 'III', 'IV', 'V'];
    const sortTeeth = (teethStr: string) => {
      // Split into individual teeth (handle multi-char Roman numerals)
      // Regex matches Arabic digits or Roman numerals I, II, III, IV, V
      const matches = teethStr.match(/V|IV|III|II|I|\d/g) || [];
      const unique = Array.from(new Set([...matches, numPart]));
      
      return unique.sort((a, b) => {
        const aIsRoman = romanOrder.includes(a);
        const bIsRoman = romanOrder.includes(b);
        
        if (aIsRoman && bIsRoman) return romanOrder.indexOf(a) - romanOrder.indexOf(b);
        if (aIsRoman) return 1; // Roman after Arabic
        if (bIsRoman) return -1;
        return parseInt(a) - parseInt(b);
      }).join('');
    };

    let singleNotation = '';
    switch(quad) {
      case 1: case 5: singleNotation = `${numPart}┛`; break;
      case 2: case 6: singleNotation = `┗${numPart}`; break;
      case 4: case 8: singleNotation = `${numPart}┓`; break;
      case 3: case 7: singleNotation = `┏${numPart}`; break;
    }

    const updateText = (prev: string) => {
      const patterns = {
        1: { regex: /([\dIVX]+)┛/g, format: (m: string) => `${sortTeeth(m)}┛` },
        5: { regex: /([\dIVX]+)┛/g, format: (m: string) => `${sortTeeth(m)}┛` },
        2: { regex: /┗([\dIVX]+)/g, format: (m: string) => `┗${sortTeeth(m)}` },
        6: { regex: /┗([\dIVX]+)/g, format: (m: string) => `┗${sortTeeth(m)}` },
        4: { regex: /([\dIVX]+)┓/g, format: (m: string) => `${sortTeeth(m)}┓` },
        8: { regex: /([\dIVX]+)┓/g, format: (m: string) => `${sortTeeth(m)}┓` },
        3: { regex: /┏([\dIVX]+)/g, format: (m: string) => `┏${sortTeeth(m)}` },
        7: { regex: /┏([\dIVX]+)/g, format: (m: string) => `┏${sortTeeth(m)}` },
      };

      const config = patterns[quad as keyof typeof patterns];
      
      if (config && prev.match(config.regex)) {
        return prev.replace(config.regex, (match, m) => {
           return config.format(m);
        });
      } else {
        return prev ? `${prev} ${singleNotation}` : singleNotation;
      }
    };

    const targetField = (['specialExam', 'finalDiagnosis', 'treatment'].includes(activeField) || activeField.startsWith('followup-')) 
      ? activeField 
      : 'specialExam';

    if (targetField === 'specialExam') setSpecialExamination(prev => updateText(prev || ''));
    else if (targetField === 'finalDiagnosis') setFinalDiagnosis(prev => updateText(prev || ''));
    else if (targetField === 'treatment') setTreatment(prev => updateText(prev || ''));
    else if (targetField.startsWith('followup-')) {
      const idx = parseInt(targetField.split('-')[1]);
      if (!isNaN(idx)) {
        setFollowups(prev => {
          const next = [...prev];
          next[idx] = updateText(next[idx] || '');
          return next;
        });
      }
    }
  };

  const saveToDb = useCallback(async () => {
    if (!patient.id) return;
    setSaveStatus('saving');
    try {
      // @ts-ignore
      await window.electron.ipcRenderer.invoke('db:save-record', {
        id: patient.id + '_' + visitDate,
        patient_id: patient.id,
        date: visitDate,
        diagnosis,
        medicalHistory,
        specialExam,
        finalDiagnosis,
        treatment,
        followups,
        selectedTeeth
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      setSaveStatus('idle');
      console.error('Save failed:', err);
    }
  }, [patient.id, diagnosis, medicalHistory, specialExam, finalDiagnosis, treatment, followups, selectedTeeth, visitDate]);

  const handleUpdateProfile = async () => {
    try {
      // @ts-ignore
      await window.electron.ipcRenderer.invoke('db:save-patient', {
        ...patient,
        address: patient.address || ''
      });
      // Also save the current record because visitDate might have changed
      await saveToDb();
      setIsEditingProfile(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('保存失败，请检查数据格式');
    }
  };

  const handleAddPatientSuccess = (newPatient: any) => {
    setSidebarKey(prev => prev + 1);
    handleSelectPatient(newPatient);
  };

  return (
    <div className="flex h-screen bg-transparent relative overflow-hidden font-sans">
      {isEditingProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/20 backdrop-blur-md p-4">
            <div className="glass-panel w-full max-w-lg p-10">
               <div className="flex justify-between items-center mb-10">
                  <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">修改患者资料</h3>
                    <p className="text-[10px] font-black text-blue-500/60 uppercase tracking-widest mt-1">Update Profile</p>
                  </div>
                  <button onClick={() => setIsEditingProfile(false)} className="p-3 bg-white/20 hover:bg-white/40 rounded-2xl transition-all"><X className="w-5 h-5" /></button>
               </div>
               <div className="grid grid-cols-2 gap-8 mb-10">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">姓名</label>
                    <input value={patient.name} onChange={e => setPatient({...patient, name: e.target.value})} className="w-full frosted-input rounded-2xl py-3 px-4 text-sm outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">电话</label>
                    <input value={patient.phone} onChange={e => setPatient({...patient, phone: e.target.value})} className="w-full frosted-input rounded-2xl py-3 px-4 text-sm outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">性别</label>
                    <select value={patient.gender} onChange={e => setPatient({...patient, gender: e.target.value})} className="w-full frosted-input rounded-2xl py-3 px-4 text-sm outline-none appearance-none">
                      <option value="男">男</option><option value="女">女</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">年龄</label>
                    <input type="number" value={patient.age} onChange={e => setPatient({...patient, age: e.target.value})} className="w-full frosted-input rounded-2xl py-3 px-4 text-sm outline-none" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">初诊日期</label>
                    <input type="date" value={initialVisitDate} onChange={e => { setInitialVisitDate(e.target.value); setVisitDate(e.target.value); }} className="w-full frosted-input rounded-2xl py-3 px-4 text-sm outline-none" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">修复品名</label>
                    <input value={patient.product} onChange={e => setPatient({...patient, product: e.target.value})} className="w-full frosted-input rounded-2xl py-3 px-4 text-sm outline-none" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">主治医生</label>
                    <select 
                      value={patient.attending_doctor || ''} 
                      onChange={e => setPatient({...patient, attending_doctor: e.target.value})} 
                      className="w-full frosted-input rounded-2xl py-3 px-4 text-sm outline-none appearance-none cursor-pointer"
                    >
                      {doctors.map(dr => (
                        <option key={dr.id} value={dr.name}>{dr.name} ({dr.title || '医师'})</option>
                      ))}
                    </select>
                  </div>
               </div>
                <div className="flex gap-6">
                   <button onClick={() => setIsEditingProfile(false)} className="flex-1 py-4 bg-white/40 border border-white/60 rounded-2xl text-slate-500 text-xs font-black hover:bg-white transition-all">取消</button>
                   <button onClick={handleUpdateProfile} className="flex-[2] py-4 bg-white/80 text-slate-800 rounded-2xl text-xs font-black  relative overflow-hidden group border border-white  active:scale-95 transition-all">
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-400/10 via-blue-400/10 to-emerald-400/10 opacity-50 group-hover:opacity-80 transition-opacity" />
                      <span className="relative z-10">立即保存修改</span>
                   </button>
                </div>
            </div>
        </div>
      )}

      <AddPatientModal 
        isOpen={isAddPatientOpen} 
        onClose={() => setIsAddPatientOpen(false)} 
        onSuccess={handleAddPatientSuccess} 
        doctors={doctors}
      />

      <aside className="w-64 glass-panel !rounded-none !border-y-0 !border-l-0 border-r border-white/20 flex flex-col z-20 overflow-visible">
        <div 
          onClick={() => { setPatient({} as any); setView('records'); }}
          className="h-28 px-6 pt-10 flex items-center gap-5 border-b border-white/10 cursor-pointer hover:opacity-80 active:scale-95 transition-all group"
        >
          <div className="relative">
            <img src="logo.png" className="w-12 h-12 object-contain  group-hover:rotate-12 transition-transform duration-500 relative z-10" alt="Logo" />
            <div className="absolute inset-0 bg-blue-400/20 blur-xl rounded-full scale-150 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-black italic text-transparent bg-clip-text bg-gradient-to-br from-blue-600 via-indigo-500 to-sky-400 text-2xl leading-none tracking-tight ">小蓝牙</h1>
            <span className="text-[8px] font-black text-blue-400/60 uppercase tracking-[0.4em] mt-1 ml-0.5">Dental System</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 py-8 custom-scrollbar space-y-10">
          <Sidebar key={sidebarKey} onSelectView={setView} onSelectPatient={handleSelectPatient} onOpenAddPatient={() => setIsAddPatientOpen(true)} doctorName={doctors[0]?.name || "王医生"} activeView={view} activePatientId={patient.id} />
        </div>
        <div className="p-4 border-t border-white/10 flex items-center justify-between">
          <span 
            onClick={() => setDevMode(!devMode)}
            className="text-[9px] font-black text-slate-300 cursor-pointer hover:text-blue-400 transition-colors uppercase tracking-widest"
          >
            v1.0.0 {devMode && <span className="ml-2 text-blue-500 animate-pulse">● DEV MODE</span>}
          </span>
        </div>
      </aside>

      <div className="flex-1 flex flex-col relative overflow-y-auto min-w-0 custom-scrollbar">
        {view === 'records' && patient.id ? (
          <div className="flex flex-col min-h-full">
            <header className="h-28 bg-white/40 backdrop-blur-md border-b border-white/20 px-8 pt-10 sticky top-0 z-10">
              <div className="max-w-[1600px] w-full mx-auto flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 px-6 py-2 bg-amber-50/40 rounded-full border border-amber-200/30 overflow-hidden w-[300px]">
                    <Activity className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                    <div className="relative h-5 flex-1 overflow-hidden">
                      <div className="animate-vertical-scroll flex flex-col">
                        <span className="h-5 text-[11px] font-bold text-amber-700/80 flex items-center">✨ 牙好胃口就好，身体倍儿棒！</span>
                        <span className="h-5 text-[11px] font-bold text-amber-700/80 flex items-center">💖 爱笑的人运气都不会太差哦~</span>
                        <span className="h-5 text-[11px] font-bold text-amber-700/80 flex items-center">🦷 一口好牙，自信笑容每一天。</span>
                        <span className="h-5 text-[11px] font-bold text-amber-700/80 flex items-center">🌈 每一颗牙齿都值得被温柔对待。</span>
                        <span className="h-5 text-[11px] font-bold text-amber-700/80 flex items-center">🦷 小蓝牙祝您笑口常开，天天开心！</span>
                        <span className="h-5 text-[11px] font-bold text-amber-700/80 flex items-center">✨ 牙好胃口就好，身体倍儿棒！</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handleExportPDF} 
                    className="group relative flex items-center gap-3 px-6 py-2.5 bg-white/70 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 hover:text-blue-600  border border-white active:scale-95 transition-all overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/10 via-indigo-400/10 to-sky-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Share className="w-3.5 h-3.5 text-blue-400 group-hover:rotate-12 transition-transform" />
                    <span className="relative z-10">导出 PDF</span>
                  </button>
                  
                  <button 
                    onClick={saveToDb} 
                    className={`group relative flex items-center gap-3 px-8 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]  border border-white active:scale-95 transition-all overflow-hidden ${
                      saveStatus === 'saved' ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-white/80 text-slate-700'
                    }`}
                  >
                    {saveStatus !== 'saved' && (
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-400/10 via-blue-400/10 to-emerald-400/10 opacity-60" />
                    )}
                    <Save className={`w-3.5 h-3.5 relative z-10 ${saveStatus === 'saved' ? 'text-white' : 'text-indigo-400 group-hover:scale-110 transition-transform'}`} />
                    <span className="relative z-10">{saveStatus === 'saving' ? '正在保存...' : saveStatus === 'saved' ? '保存完成' : '保存全部'}</span>
                  </button>
                </div>
              </div>
            </header>

            <main className="p-8 flex flex-col gap-8">
              <div className="max-w-[1600px] w-full mx-auto flex gap-8">
                <div className="w-[300px] flex flex-col gap-8 flex-shrink-0">
                  <div onClick={() => setIsEditingProfile(true)} className="glass-panel p-8 relative group cursor-pointer hover:scale-[1.02] transition-all duration-500">
                     <div className="flex items-end gap-3 mb-6 text-slate-800 "><span className="text-2xl font-black">{patient.name}</span><span className="text-sm font-bold text-slate-400 mb-1">{patient.gender || '?'} · {patient.age || '0'}岁</span></div>
                     <div className="space-y-5">
                        <div className="flex items-center gap-3 text-slate-600"><Phone className="w-4 h-4 text-blue-500 " /><span className="text-xs font-bold tracking-tight">{patient.phone}</span></div>
                        <div className="pt-5 border-t border-white/40 space-y-3">
                           <div className="flex justify-between items-center text-[10px] font-black tracking-wider">
                             <span className="text-slate-400 uppercase">初诊日期</span>
                             <input 
                                type="date" 
                                value={initialVisitDate} 
                                onChange={(e) => { setInitialVisitDate(e.target.value); setVisitDate(e.target.value); }}
                                className="bg-blue-50/50 text-blue-600 font-black tracking-tight px-2 py-0.5 rounded-md backdrop-blur-sm border-none outline-none cursor-pointer hover:bg-blue-100/50 transition-colors" 
                             />
                           </div>
                           <div className="flex justify-between items-center text-[10px] font-black tracking-wider"><span className="text-slate-400 uppercase">修复品名</span><span className="text-slate-700">{patient.product || '未录入'}</span></div>
                           <div className="flex justify-between items-center text-[10px] font-black tracking-wider"><span className="text-slate-400 uppercase">质保至</span><div className="bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-md backdrop-blur-sm"><span>{patient.warranty || '未设置'}</span></div></div>
                           <div className="flex justify-between items-center text-[10px] font-black tracking-wider mt-1 pt-3 border-t border-white/20"><span className="text-slate-400 uppercase">主治医生</span><div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" /><span className="text-blue-600">{patient.attending_doctor || '未指定'}</span></div></div>
                        </div>
                     </div>
                  </div>
                  <div className="glass-panel p-6">
                    <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-6 ">牙位图记录</h3>
                    <DentalToothMap selectedTeeth={selectedTeeth} onToggle={toggleTooth} />
                    <div className="mt-8">
                      <DentalCalendar 
                        initialVisitDate={initialVisitDate} 
                        onSetInitialDate={setInitialVisitDate} 
                        onSelectDate={setVisitDate} 
                        currentDate={visitDate}
                        viewMonth={viewMonth}
                        viewYear={viewYear}
                        prevMonth={prevMonth}
                        nextMonth={nextMonth}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-8 min-w-0">
                  <div className="glass-panel  flex flex-col divide-y divide-white/20">
                    <div className="bg-white/30 p-8 flex flex-col gap-8">
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest ">主诉</h3>
                            <QuickSnippetPicker onSelect={(val) => setDiagnosis(prev => prev ? `${prev} ${val}` : val)} category="主诉" />
                          </div>
                          <div className="min-h-[60px] h-auto frosted-input rounded-2xl">
                            <Editor value={diagnosis} onChange={setDiagnosis} onFocus={() => setActiveField('none')} placeholder="主诉..." />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest ">现病史及既往史</h3>
                            <QuickSnippetPicker onSelect={(val) => setMedicalHistory(prev => prev ? `${prev} ${val}` : val)} category="现病史" />
                          </div>
                          <div className="min-h-[60px] h-auto frosted-input rounded-2xl">
                            <Editor value={medicalHistory} onChange={setMedicalHistory} onFocus={() => setActiveField('none')} placeholder="既往史..." />
                          </div>
                        </div>
                    </div>
                    <div className="px-10 py-8">
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest ">专科检查</h3>
                        <QuickSnippetPicker onSelect={(val) => setSpecialExamination(prev => prev ? `${prev} ${val}` : val)} category="专科检查" />
                      </div>
                      <div className="min-h-[160px] h-auto">
                        <Editor value={specialExam} onChange={setSpecialExamination} onFocus={() => setActiveField('specialExam')} placeholder="输入详细专科检查结果..." />
                      </div>
                    </div>
                    <div className="px-10 py-8 bg-blue-50/10">
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest ">诊断</h3>
                        <QuickSnippetPicker onSelect={(val) => setFinalDiagnosis(prev => prev ? `${prev} ${val}` : val)} category="诊断" />
                      </div>
                      <div className="min-h-[70px] h-auto">
                        <Editor value={finalDiagnosis} onChange={setFinalDiagnosis} onFocus={() => setActiveField('finalDiagnosis')} placeholder="根据检查结果给出的明确诊断..." />
                      </div>
                    </div>
                    <div className="px-10 py-8 bg-emerald-50/10">
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest ">首次处置与医嘱</h3>
                        <QuickSnippetPicker onSelect={(val) => setTreatment(prev => prev ? `${prev} ${val}` : val)} category="处置" />
                      </div>
                      <div className="min-h-[140px] h-auto">
                        <Editor value={treatment} onChange={setTreatment} onFocus={() => setActiveField('treatment')} placeholder="输入首次治疗方案及医嘱..." />
                      </div>
                    </div>
                    {followups.map((text, idx) => (
                      <div key={idx} className="px-10 py-10 bg-indigo-50/10 relative group/card">
                         <div className="flex items-center justify-between mb-6">
                           <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest ">第 {idx + 1} 次复诊</h3>
                           <div className="flex items-center gap-3">
                             <QuickSnippetPicker onSelect={(val) => {const f = [...followups]; f[idx] = f[idx] ? `${f[idx]} ${val}` : val; setFollowups(f)}} category="复诊" />
                             <button onClick={() => {const f = [...followups]; f.splice(idx,1); setFollowups(f)}} className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover/card:opacity-100 transition-all duration-300"><Trash2 className="w-4 h-4" /></button>
                           </div>
                         </div>
                         <div className="min-h-[150px]">
                           <Editor value={text} onChange={(val) => {const f = [...followups]; f[idx]=val; setFollowups(f)}} onFocus={() => setActiveField(`followup-${idx}`)} placeholder="复诊诊疗详情..." />
                         </div>
                      </div>
                    ))}

                    <div className="p-6 flex justify-center bg-slate-50/30">
                      <button onClick={() => setFollowups([...followups, ''])} className="flex items-center gap-2 px-8 py-3 rounded-2xl border-2 border-dashed border-slate-300 text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:bg-white text-[10px] font-black active:scale-95 transition-all">+ 添加复诊记录</button>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        ) : view === 'records' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12">
             <div className="relative w-full max-w-6xl flex items-stretch gap-12">
                {/* Large Minimalist Desk Calendar Design */}
                <div className="glass-panel flex-1 flex flex-col overflow-hidden shadow-[0_30px_100px_-20px_rgba(0,0,0,0.15)] border-white/40 p-12">
                   <div className="mb-12 flex items-center gap-6 justify-start">
                      <div className="flex items-baseline gap-4">
                        <span className="text-6xl font-black text-slate-800 ">{new Date().getDate()}</span>
                        <span className="text-2xl font-bold text-slate-400 uppercase tracking-widest">{new Date(viewYear, viewMonth).toLocaleString('zh-CN', { month: 'long' })}</span>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button onClick={() => { if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); } else { setViewMonth(m => m - 1); } }} className="p-2 hover:bg-white/60 rounded-xl transition-all border border-white/40"><ChevronLeft className="w-5 h-5 text-slate-400" /></button>
                        <button onClick={() => { if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); } else { setViewMonth(m => m + 1); } }} className="p-2 hover:bg-white/60 rounded-xl transition-all border border-white/40"><ChevronRight className="w-5 h-5 text-slate-400" /></button>
                      </div>
                      <span className="ml-auto text-sm font-black text-slate-300 uppercase tracking-[0.3em]">{viewYear}</span>
                   </div>
                   <div className="flex-1">
                      <div className="grid grid-cols-7 gap-4">
                         {Array.from({length: 42}).map((_, i) => {
                            const startOffset = new Date(viewYear, viewMonth, 1).getDay();
                            const daysCount = new Date(viewYear, viewMonth + 1, 0).getDate();
                            const d = i - startOffset + 1;
                            const isCurrentMonth = d > 0 && d <= daysCount;

                            if (!isCurrentMonth) return <div key={`empty-h-${i}`} className="aspect-square" />;

                            return (
                              <div 
                               key={i} 
                               onClick={() => setSelectedHomeDate(d)}
                               className={`flex flex-col items-center justify-center aspect-square rounded-2xl border cursor-pointer transition-all duration-500 ${selectedHomeDate === d ? 'bg-white/60  shadow-[0_15px_35px_-5px_rgba(59,130,246,0.2)] scale-110 border-white relative after:absolute after:inset-0 after:rounded-2xl after:bg-gradient-to-br after:from-pink-400/10 after:via-blue-400/10 after:to-emerald-400/10' : 'bg-white/10 border-white/10 hover:bg-white/30 text-slate-400'}`}
                              >
                                <span className={`text-lg font-black relative z-10 ${selectedHomeDate === d ? 'text-slate-800' : ''}`}>{d}</span>
                                <span className={`text-[8px] opacity-60 uppercase font-bold relative z-10 ${selectedHomeDate === d ? 'text-slate-500' : ''}`}>{['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][new Date(viewYear, viewMonth, d).getDay()]}</span>
                              </div>
                            );
                         })}
                      </div>
                   </div>
                </div>

                {/* Appointment Side Panel */}
                <div className="w-[340px] flex flex-col gap-6">
                   <div className="glass-panel p-8 flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest ">{selectedHomeDate}日 预约动态</h3>
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <Clock className="w-4 h-4 text-blue-500" />
                        </div>
                      </div>

                      <div className="flex-1 space-y-4">
                        {appointmentsForDate.length > 0 ? appointmentsForDate.map((apt, idx) => (
                          <div 
                            key={apt.id || idx} 
                            onDoubleClick={() => handleAppointmentDoubleClick(apt.name)}
                            className="glass-panel !bg-white/40 p-4 border-white/60 hover:scale-[1.02] hover:bg-white/60 transition-all duration-300 group cursor-pointer relative"
                            title="双击进入病历"
                          >
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveAppointment(apt.id);
                              }}
                              className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all z-20 bg-white/50 hover:bg-white rounded-lg"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{apt.time}</span>
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${apt.type === '初诊' ? 'bg-amber-400/20 text-amber-600' : 'bg-emerald-400/20 text-emerald-600'}`}>{apt.type}</span>
                            </div>
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center font-black text-xs text-slate-600 border border-white/80">{apt.name[0]}</div>
                               <div className="text-sm font-black text-slate-800">{apt.name}</div>
                            </div>
                          </div>
                        )) : (
                          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                             <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-300 mb-4 flex items-center justify-center">
                                <PlusCircle className="w-5 h-5 text-slate-400" />
                             </div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">今日暂无预约记录</p>
                          </div>
                        )}
                      </div>

                      <button className="mt-8 w-full py-4 bg-white/40 border border-white/60 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-white hover:text-blue-500 transition-all active:scale-95">
                        + 添加当日备注
                      </button>
                   </div>
                </div>

                {/* Floating Decoration Background */}
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-400/10 blur-[100px] -z-10 rounded-full"></div>
             </div>
          </div>
        ) : view === 'doctors' ? (
          <div className="flex-1 p-12 overflow-y-auto">
             <div className="max-w-4xl mx-auto">
                <div className="mb-12">
                   <h2 className="text-3xl font-black text-slate-800 ">医生团队管理</h2>
                   <p className="text-sm font-bold text-slate-400 mt-2">MEDICAL TEAM MANAGEMENT</p>
                </div>
                
                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <div className="glass-panel p-8 bg-white/40">
                         <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-6">在职医生列表</h3>
                         <div className="space-y-3">
                            {doctors.map(dr => (
                              <div key={dr.id} className={`p-4 rounded-2xl border transition-all flex items-center justify-between group ${editingDoctor?.id === dr.id ? 'bg-white border-blue-200  ' : 'bg-white/50 border-white/60 hover:bg-white'}`}>
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white font-black text-xs  shadow-blue-200">{dr.name[0]}</div>
                                  <div>
                                    <p className="text-sm font-black text-slate-700">{dr.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{dr.title || '普通医师'}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => setEditingDoctor(dr)} className="p-2 hover:bg-blue-50 text-blue-400 rounded-xl transition-all"><Settings className="w-4 h-4" /></button>
                                  <button onClick={async () => { 
                                    if(confirm('确定要删除该医生吗？')) {
                                      // @ts-ignore
                                      await window.electron.ipcRenderer.invoke('db:delete-doctor', dr.id);
                                      fetchDoctors();
                                    }
                                  }} className="p-2 hover:bg-red-50 text-red-400 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              </div>
                            ))}
                            <button 
                              onClick={() => setEditingDoctor({ id: Date.now().toString(), name: '', title: '' })}
                              className="w-full py-5 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-[10px] font-black uppercase tracking-widest hover:border-blue-300 hover:text-blue-500 hover:bg-white transition-all flex items-center justify-center gap-2"
                            >
                              <Plus className="w-3.5 h-3.5" /> 新增医生档案
                            </button>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      {editingDoctor ? (
                        <div className="glass-panel p-8 bg-white/60">
                           <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-8">{editingDoctor.name ? '编辑医生信息' : '创建新医生'}</h3>
                           <div className="space-y-6">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">全名</label>
                                <input value={editingDoctor.name} onChange={e => setEditingDoctor({...editingDoctor, name: e.target.value})} className="w-full frosted-input rounded-2xl py-4 px-5 text-sm font-bold outline-none" placeholder="输入姓名..." />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">专业头衔</label>
                                <input value={editingDoctor.title} onChange={e => setEditingDoctor({...editingDoctor, title: e.target.value})} className="w-full frosted-input rounded-2xl py-4 px-5 text-sm font-bold outline-none" placeholder="如: 主任医师 / 牙科博士" />
                              </div>
                              <div className="pt-6 flex gap-4">
                                <button onClick={() => setEditingDoctor(null)} className="flex-1 py-4 bg-white/40 border border-white/60 rounded-2xl text-xs font-black text-slate-500 hover:bg-white transition-all">取消</button>
                                <button onClick={async () => {
                                  if(!editingDoctor.name) return;
                                  // @ts-ignore
                                  await window.electron.ipcRenderer.invoke('db:save-doctor', editingDoctor);
                                  setEditingDoctor(null);
                                  fetchDoctors();
                                }} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl text-xs font-black  shadow-blue-200 active:scale-95 transition-all">确认并保存</button>
                              </div>
                           </div>
                        </div>
                      ) : (
                        <div className="glass-panel p-12 bg-white/20 border-dashed flex flex-col items-center justify-center text-center opacity-40">
                           <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                              <User className="w-8 h-8 text-slate-400" />
                           </div>
                           <p className="text-sm font-bold text-slate-500 leading-relaxed">请选择左侧医生进行编辑<br/>或点击下方按钮添加新成员</p>
                        </div>
                      )}
                   </div>
                </div>
             </div>
          </div>
        ) : view === 'data' ? (
          <div className="flex-1 p-12 overflow-y-auto">
             <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-6 mb-12">
                   <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center  border border-indigo-500/10">
                      <Folder className="w-8 h-8 text-indigo-600 " />
                   </div>
                   <div>
                      <h2 className="text-3xl font-black text-slate-800  tracking-tight">病历存储及备份</h2>
                      <p className="text-[10px] font-black text-indigo-500/60 uppercase tracking-[0.3em] mt-1">Storage, Synchronization & Universal Backup</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* 存储路径设置 */}
                  <div className="glass-panel p-10 bg-white/40 flex flex-col justify-between border-white/60">
                    <div>
                      <div className="flex items-center gap-3 mb-8">
                        <FolderOpen className="w-5 h-5 text-blue-500" />
                        <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">病历数据库位置</h3>
                      </div>
                      <p className="text-xs text-slate-400 font-bold mb-6 leading-relaxed">您可以选择将数据库存储在云端同步目录（如 iCloud, OneDrive）以实现多端同步。</p>
                      <div className="frosted-input rounded-2xl p-5 bg-slate-50/50 border border-slate-200/50 break-all group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="text-[10px] font-mono font-bold text-slate-600 relative z-10">{storagePath || '正在获取路径...'}</span>
                      </div>
                    </div>
                    <button 
                      onClick={async () => {
                         // @ts-ignore
                         const newPath = await window.electron.ipcRenderer.invoke('db:set-storage-path');
                         if(newPath) setStoragePath(newPath);
                      }}
                      className="mt-10 w-full py-4 bg-white text-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white  shadow-black/5 hover:bg-slate-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      <Settings className="w-3 h-3 text-blue-500" /> 更改存储位置
                    </button>
                  </div>

                  {/* 导入导出 */}
                  <div className="glass-panel p-10 bg-white/40 border-white/60">
                    <div className="flex items-center gap-3 mb-8">
                      <Download className="w-5 h-5 text-emerald-500" />
                      <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">全平台数据互通 (ZIP)</h3>
                    </div>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">开始日期</label>
                          <input type="date" className="w-full frosted-input rounded-xl py-3 px-4 text-[11px] font-bold outline-none" defaultValue={new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]} id="exp-start" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">结束日期</label>
                          <input type="date" className="w-full frosted-input rounded-xl py-3 px-4 text-[11px] font-bold outline-none" defaultValue={new Date().toISOString().split('T')[0]} id="exp-end" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <button 
                          onClick={async () => {
                            const start = (document.getElementById('exp-start') as HTMLInputElement).value;
                            const end = (document.getElementById('exp-end') as HTMLInputElement).value;
                            // @ts-ignore
                            const res = await window.electron.ipcRenderer.invoke('db:export-data', { startDate: start, endDate: end });
                            if(res?.success) alert('导出成功');
                          }}
                          className="flex flex-col items-center gap-2 p-6 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 rounded-2xl transition-all active:scale-95 group"
                        >
                          <Download className="w-5 h-5 text-emerald-600 group-hover:-translate-y-1 transition-transform" />
                          <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">导出备份</span>
                        </button>
                        <button 
                          onClick={async () => {
                            if(!confirm('导入将合并数据，是否继续？')) return;
                            // @ts-ignore
                            const res = await window.electron.ipcRenderer.invoke('db:import-data');
                            if(res?.success) alert('导入成功');
                          }}
                          className="flex flex-col items-center gap-2 p-6 bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/20 rounded-2xl transition-all active:scale-95 group"
                        >
                          <Upload className="w-5 h-5 text-blue-600 group-hover:-translate-y-1 transition-transform" />
                          <span className="text-[9px] font-black text-blue-700 uppercase tracking-widest">导入合并</span>
                        </button>
                      </div>
                      <p className="text-[9px] text-slate-400 font-bold text-center mt-4 leading-relaxed bg-slate-50/80 p-3 rounded-xl border border-slate-100">导出的 ZIP 文件包含 JSON 数据，可在 Mac/Win/iOS/Android 互通。</p>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        ) : (
          <main key="settings" className="flex-1 p-10 overflow-y-auto"><SettingsPage /></main>
        )}
      </div>
    </div>
  );
};

export default RecordEditor;

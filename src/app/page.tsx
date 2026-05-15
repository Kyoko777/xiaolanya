"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Editor from '../components/Editor';
import Sidebar from '../components/Sidebar';
import DentalToothMap from '../components/DentalToothMap';
import SettingsPage from './settings/page';
import { FileText, CheckCircle2, Clock, User, Activity, PlusCircle, History, Trash2, Shield, Phone, X } from 'lucide-react';

const RecordEditor = () => {
  const [view, setView] = useState<'records' | 'settings'>('records');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [patient, setPatient] = useState({ 
    id: 1, name: '加载中...', gender: '男', age: '0', phone: '',
    project: '', product: '', warranty: '', id_number: 'P-000' 
  });

  const [selectedTeeth, setSelectedTeeth] = useState<string[]>([]);
  const [diagnosis, setDiagnosis] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [specialExam, setSpecialExamination] = useState('');
  const [treatment, setTreatment] = useState('');
  const [followups, setFollowups] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const loadRecord = useCallback(async (patientId: number) => {
    try {
      // @ts-ignore
      const record = await window.electron.ipcRenderer.invoke('db:get-latest-record', patientId);
      if (record) {
        setSelectedTeeth(record.tooth_positions || []);
        setDiagnosis(record.diagnosis || '');
        setTreatment(record.treatment || '');
        try {
          const extra = JSON.parse(record.notes || '{}');
          setMedicalHistory(extra.medicalHistory || '');
          setSpecialExamination(extra.specialExam || '');
          setFollowups(Array.isArray(extra.followups) ? extra.followups : []);
        } catch {
          setFollowups([]); setMedicalHistory(''); setSpecialExamination('');
        }
      } else {
        setSelectedTeeth([]); setDiagnosis(''); setTreatment(''); setMedicalHistory(''); setSpecialExamination(''); setFollowups([]);
      }
    } catch (err) {
      console.error('Load failed:', err);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        // @ts-ignore
        const patients = await window.electron.ipcRenderer.invoke('db:get-patients');
        if (patients && patients.length > 0) {
          const first = patients[0];
          setPatient({ ...first, id_number: `P-${first.id.toString().padStart(3, '0')}` });
          loadRecord(first.id);
        }
      } catch (err) {}
    };
    init();
  }, [loadRecord]);

  const handleUpdateProfile = async () => {
    try {
      // @ts-ignore
      await window.electron.ipcRenderer.invoke('db:update-patient-profile', patient);
      setIsEditingProfile(false);
      // @ts-ignore
      window.electron.ipcRenderer.send('db:refresh-patients');
    } catch (err) {}
  };

  const handleSelectPatient = (p: any) => {
    setPatient({ ...p, id_number: `P-${p.id.toString().padStart(3, '0')}` });
    loadRecord(p.id);
    setView('records');
  };

  const toggleTooth = (tooth: string) => {
    setSelectedTeeth(prev => prev.includes(tooth) ? prev.filter(t => t !== tooth) : [...prev, tooth]);
  };

  const saveToDb = useCallback(async () => {
    setSaveStatus('saving');
    try {
      const extraData = { medicalHistory, specialExam, followups };
      // @ts-ignore
      await window.electron.ipcRenderer.invoke('db:save-record', {
        patientId: patient.id,
        toothPositions: selectedTeeth,
        diagnosis,
        treatment,
        notes: JSON.stringify(extraData)
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      setSaveStatus('idle');
    }
  }, [patient.id, selectedTeeth, diagnosis, treatment, medicalHistory, specialExam, followups]);

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in">
           <div className="bg-white w-[500px] rounded-[3rem] shadow-2xl p-10 relative animate-in zoom-in">
              <h3 className="text-xl font-black mb-8">修改档案</h3>
              <div className="grid grid-cols-2 gap-6 text-slate-600">
                 <div className="flex flex-col gap-1.5"><label className="text-[10px] font-black opacity-40">姓名</label><input value={patient.name} onChange={(e) => setPatient({...patient, name: e.target.value})} className="bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20" /></div>
                 <div className="flex flex-col gap-1.5"><label className="text-[10px] font-black opacity-40">电话</label><input value={patient.phone} onChange={(e) => setPatient({...patient, phone: e.target.value})} className="bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20" /></div>
                 <div className="flex flex-col gap-1.5"><label className="text-[10px] font-black opacity-40">性别</label><input value={patient.gender} onChange={(e) => setPatient({...patient, gender: e.target.value})} className="bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20" /></div>
                 <div className="flex flex-col gap-1.5"><label className="text-[10px] font-black opacity-40">年龄</label><input value={patient.age} onChange={(e) => setPatient({...patient, age: e.target.value})} className="bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20" /></div>
                 <div className="flex flex-col gap-1.5 col-span-2"><label className="text-[10px] font-black opacity-40">修复品名</label><input value={patient.product} onChange={(e) => setPatient({...patient, product: e.target.value})} className="bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20" /></div>
                 <div className="flex flex-col gap-1.5 col-span-2"><label className="text-[10px] font-black opacity-40">质保至</label><input type="date" value={patient.warranty} onChange={(e) => setPatient({...patient, warranty: e.target.value})} className="bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20" /></div>
              </div>
              <div className="flex gap-4 mt-10">
                 <button onClick={() => setIsEditingProfile(false)} className="flex-1 py-4 text-xs font-black uppercase text-slate-400">取消</button>
                 <button onClick={handleUpdateProfile} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl text-xs font-black shadow-xl">保存</button>
              </div>
           </div>
        </div>
      )}

      <aside className="w-72 bg-white border-r border-slate-200/50 flex flex-col z-20">
        <div className="p-8 flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg">D</div>
          <h1 className="font-black text-slate-900 text-base uppercase leading-none">Dental Pro</h1>
        </div>
        <div className="flex-1 overflow-y-auto px-5 custom-scrollbar">
          <Sidebar onSelectView={setView} onSelectPatient={handleSelectPatient} activeView={view} activePatientId={patient.id} />
        </div>
      </aside>

      <div className="flex-1 flex flex-col relative overflow-y-auto min-w-0 custom-scrollbar">
        {view === 'records' ? (
          <div className="flex flex-col min-h-full">
            <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 flex items-center justify-between px-10 sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">{patient.name}</h2>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-0.5 rounded-full uppercase tracking-widest text-xs">UID: {patient.id_number}</span>
              </div>
              <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all ${saveStatus === 'saved' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                {saveStatus === 'saving' ? <Clock className="w-3 h-3 animate-spin" /> : (saveStatus === 'saved' ? <CheckCircle2 className="w-3 h-3" /> : <Activity className="w-3 h-3 text-blue-500" />)}
                <span className="text-xs font-black uppercase tracking-widest ml-1">{saveStatus === 'idle' ? 'Ready' : saveStatus}</span>
              </div>
            </header>

            <main className="p-8 flex flex-col gap-8">
              <div className="max-w-7xl w-full mx-auto grid grid-cols-12 gap-8">
                <div className="col-span-4 flex flex-col gap-6">
                  <div onClick={() => setIsEditingProfile(true)} className="bg-white rounded-[2rem] border border-slate-200 p-7 relative group cursor-pointer hover:border-blue-400 transition-all hover:shadow-md">
                     <div className="flex items-end gap-3 mb-5 text-slate-900"><span className="text-2xl font-black">{patient.name}</span><span className="text-sm font-bold text-slate-400 mb-1">{patient.gender || '?'} · {patient.age || '0'}岁</span></div>
                     <div className="space-y-4">
                        <div className="flex items-center gap-2.5 text-slate-500"><Phone className="w-4 h-4 text-blue-500" /><span className="text-xs font-bold">{patient.phone}</span></div>
                        <div className="pt-4 border-t border-slate-50 space-y-2.5">
                           <div className="flex justify-between items-center text-[10px] font-black"><span className="text-slate-400">修复品名</span><span className="text-slate-700">{patient.product || '未录入'}</span></div>
                           <div className="flex justify-between items-center text-[10px] font-black"><span className="text-slate-400">质保至</span><div className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md"><span>{patient.warranty || '未设置'}</span></div></div>
                        </div>
                     </div>
                  </div>
                  <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
                    <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-6">牙位图记录</h3>
                    <DentalToothMap selectedTeeth={selectedTeeth} onToggle={toggleTooth} onInputChange={() => {}} />
                  </div>
                </div>

                <div className="col-span-8 flex flex-col gap-6">
                  <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col divide-y divide-slate-100">
                    <div className="px-10 pt-8 pb-4 font-black"><h3 className="text-sm text-slate-900 uppercase mb-4">主诉与检查</h3><div className="h-[70px]"><Editor value={diagnosis} onChange={setDiagnosis} placeholder="主诉(20字以内)及简要检查..." /></div></div>
                    <div className="px-10 pt-8 pb-4 bg-slate-50/10 font-black"><h3 className="text-sm text-slate-900 uppercase mb-4">现病史及既往史</h3><div className="min-h-[100px]"><Editor value={medicalHistory} onChange={setMedicalHistory} placeholder="输入过敏史、既往病史等..." /></div></div>
                    <div className="px-10 pt-8 pb-4 font-black"><h3 className="text-sm text-slate-900 uppercase mb-4">专科检查</h3><div className="min-h-[120px]"><Editor value={specialExam} onChange={setSpecialExamination} placeholder="输入详细专科检查结果..." /></div></div>
                    <div className="px-10 pt-8 pb-8 bg-emerald-50/5 font-black"><h3 className="text-sm text-slate-900 uppercase mb-4">首次处置与医嘱</h3><div className="min-h-[180px]"><Editor value={treatment} onChange={setTreatment} placeholder="输入首次治疗方案及医嘱..." /></div></div>
                    {followups.map((text, idx) => (
                      <div key={idx} className="px-10 pt-8 pb-8 bg-indigo-50/5 relative group/card">
                         <div className="flex items-center justify-between mb-4 font-black"><h3 className="text-sm text-indigo-600 uppercase">第 {idx + 1} 次复诊</h3><button onClick={() => {const f = [...followups]; f.splice(idx,1); setFollowups(f)}} className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover/card:opacity-100"><Trash2 className="w-4 h-4" /></button></div>
                         <div className="min-h-[150px]"><Editor value={text} onChange={(val) => {const f = [...followups]; f[idx]=val; setFollowups(f)}} placeholder="复诊诊疗详情..." /></div>
                      </div>
                    ))}
                    <div className="p-6 flex justify-center bg-slate-50/30"><button onClick={() => setFollowups([...followups, ''])} className="flex items-center gap-2 px-8 py-3 rounded-2xl border-2 border-dashed border-slate-300 text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:bg-white text-[10px] font-black active:scale-95 transition-all">+ 添加复诊记录</button></div>
                  </div>
                  <div className="flex items-center justify-end px-6 mt-2 mb-10"><button onClick={saveToDb} className="bg-slate-900 text-white px-10 py-3.5 rounded-[1.5rem] font-black text-[10px] uppercase shadow-2xl active:scale-95">保存全部</button></div>
                </div>
              </div>
            </main>
          </div>
        ) : (
          <main key="settings" className="flex-1 p-10 overflow-y-auto"><SettingsPage /></main>
        )}
      </div>
    </div>
  );
};

export default RecordEditor;

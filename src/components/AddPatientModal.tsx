'use client';

import React, { useState } from 'react';
import { X, User, Phone, Briefcase, Calendar, Shield, Hash, MapPin, PlusCircle } from 'lucide-react';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newPatient: any) => void;
  doctors: any[];
}

export default function AddPatientModal({ isOpen, onClose, onSuccess, doctors }: AddPatientModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    gender: '男',
    age: '',
    phone: '',
    project: '通用诊疗',
    product: '',
    warranty: '',
    address: '',
    attending_doctor: doctors?.[0]?.name || ''
  });

  React.useEffect(() => {
    if (doctors?.length > 0) {
      if (!formData.attending_doctor || !doctors.some(d => d.name === formData.attending_doctor)) {
        setFormData(prev => ({ ...prev, attending_doctor: doctors[0].name }));
      }
    } else {
      setFormData(prev => ({ ...prev, attending_doctor: '' }));
    }
  }, [doctors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      const patientId = Date.now().toString();
      // @ts-ignore
      const result = await window.electron.ipcRenderer.invoke('db:save-patient', {
        id: patientId,
        ...formData
      });

      if (result.success) {
        onSuccess({ id: patientId, ...formData });
        onClose();
        setFormData({
          name: '', gender: '男', age: '', phone: '', project: '通用诊疗', product: '', warranty: '', address: '', attending_doctor: doctors?.[0]?.name || ''
        });
      }
    } catch (err) {
      console.error('Failed to add patient:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/10 backdrop-blur-xl animate-in fade-in duration-700">
      <div className="glass-panel w-full max-w-3xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] overflow-hidden relative animate-in zoom-in slide-in-from-bottom-12 duration-700 border-white/40">
        
        {/* Spacious Header */}
        <div className="relative p-12 pb-8">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter title-shadow mb-2">建立患者数字档案</h3>
              <p className="text-blue-500/60 text-xs font-black uppercase tracking-[0.3em]">Digital Patient Registration System</p>
            </div>
            <button onClick={onClose} className="p-4 bg-white/30 hover:bg-white/60 rounded-2xl transition-all text-slate-400 hover:text-slate-700 border border-white/60 shadow-sm active:scale-90">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-12 pb-12 space-y-10">
          <div className="grid grid-cols-2 gap-x-12 gap-y-8">
            
            {/* Column 1: Basic Info */}
            <div className="space-y-8">
               <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">患者姓名</label>
                  <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/50 group-focus-within:text-blue-500 transition-colors" />
                    <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="输入姓名" className="w-full frosted-input rounded-[1.25rem] py-4 pl-14 pr-4 text-sm font-bold outline-none" />
                  </div>
               </div>
               
               <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">联系电话</label>
                  <div className="relative group">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/50 group-focus-within:text-blue-500 transition-colors" />
                    <input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="输入11位手机号" className="w-full frosted-input rounded-[1.25rem] py-4 pl-14 pr-4 text-sm font-bold outline-none" />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">性别</label>
                    <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full frosted-input rounded-[1.25rem] py-4 px-6 text-sm font-bold outline-none appearance-none cursor-pointer">
                      <option value="男">男</option>
                      <option value="女">女</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">年龄</label>
                    <div className="relative group">
                      <Hash className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/50 group-focus-within:text-blue-500 transition-colors" />
                      <input type="number" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} placeholder="岁" className="w-full frosted-input rounded-[1.25rem] py-4 pl-14 pr-4 text-sm font-bold outline-none" />
                    </div>
                  </div>
               </div>
            </div>

            {/* Column 2: Clinical Details */}
            <div className="space-y-8">
               <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">主要修复品名</label>
                  <div className="relative group">
                    <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/50 group-focus-within:text-blue-500 transition-colors" />
                    <input value={formData.product} onChange={(e) => setFormData({...formData, product: e.target.value})} placeholder="例如: Lava / 泽康 / 氧化锆" className="w-full frosted-input rounded-[1.25rem] py-4 pl-14 pr-4 text-sm font-bold outline-none" />
                  </div>
               </div>

               <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">质保到期日</label>
                  <div className="relative group">
                    <Shield className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/50 group-focus-within:text-blue-500 transition-colors" />
                    <input type="date" value={formData.warranty} onChange={(e) => setFormData({...formData, warranty: e.target.value})} className="w-full frosted-input rounded-[1.25rem] py-4 pl-14 pr-4 text-sm font-bold outline-none cursor-pointer" />
                  </div>
               </div>

               <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">联系地址 (选填)</label>
                  <div className="relative group">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/50 group-focus-within:text-blue-500 transition-colors" />
                    <input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="省/市/区/街道" className="w-full frosted-input rounded-[1.25rem] py-4 pl-14 pr-4 text-sm font-bold outline-none" />
                  </div>
               </div>
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">选择主治医生</label>
                  <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/50 group-focus-within:text-emerald-500 transition-colors" />
                    <select value={formData.attending_doctor} onChange={(e) => setFormData({...formData, attending_doctor: e.target.value})} className="w-full frosted-input rounded-[1.25rem] py-4 pl-14 pr-4 text-sm font-bold outline-none appearance-none cursor-pointer">
                      <option value="">未指定 / 请选择医生...</option>
                      {doctors?.map(dr => (
                        <option key={dr.id} value={dr.name}>{dr.name} ({dr.title || '医师'})</option>
                      ))}
                    </select>
                  </div>
                </div>
            </div>
          </div>
          
          <div className="pt-6">
                <button type="submit" className="w-full h-20 bg-white/80 text-slate-800 rounded-[2rem] font-black text-sm uppercase tracking-[0.5em] hover:bg-white transition-all shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] active:scale-[0.98] border border-white ring-2 ring-blue-400/20 flex items-center justify-center gap-4 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-400/10 via-blue-400/10 to-emerald-400/10 opacity-50 group-hover:opacity-80 transition-opacity" />
                  <PlusCircle className="w-5 h-5 text-blue-500 relative z-10" />
                  <span className="relative z-10">立即完成档案录入</span>
                </button>
          </div>
        </form>
      </div>
    </div>
  );
}

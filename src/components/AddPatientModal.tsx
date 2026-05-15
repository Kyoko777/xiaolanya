'use client';

import React, { useState } from 'react';
import { X, User, Phone, Briefcase, Calendar, Shield, Hash } from 'lucide-react';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newPatient: any) => void;
}

export default function AddPatientModal({ isOpen, onClose, onSuccess }: AddPatientModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    gender: '男',
    age: '',
    phone: '',
    project: '通用诊疗',
    product: '',
    warranty: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      // @ts-ignore
      const id = await window.electron.ipcRenderer.invoke('db:add-patient', {
        name: formData.name,
        phone: formData.phone
      });

      onSuccess({ id, ...formData });
      onClose();
      setFormData({
        name: '', gender: '男', age: '', phone: '', project: '通用诊疗', product: '', warranty: ''
      });
    } catch (err) {
      console.error('Failed to add patient:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative animate-in zoom-in duration-300">
        <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black tracking-tight">新增患者档案</h3>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Create Patient Profile</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">姓名</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="姓名" className="w-full bg-slate-50 border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">电话</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="手机号" className="w-full bg-slate-50 border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">性别</label>
              <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none appearance-none">
                <option value="男">男</option>
                <option value="女">女</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">年龄</label>
              <div className="relative">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input type="number" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} placeholder="年龄" className="w-full bg-slate-50 border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" />
              </div>
            </div>
            <div className="flex flex-col gap-2 col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">修复品名</label>
              <input value={formData.product} onChange={(e) => setFormData({...formData, product: e.target.value})} placeholder="Lava / 泽康..." className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" />
            </div>
            <div className="flex flex-col gap-2 col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">质保至</label>
              <input type="date" value={formData.warranty} onChange={(e) => setFormData({...formData, warranty: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" />
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-blue-700 transition-all shadow-xl active:scale-95">完成录入</button>
        </form>
      </div>
    </div>
  );
}

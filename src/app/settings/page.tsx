"use client";

import React, { useState } from 'react';
import { useSnippets } from '../../hooks/useSnippets';
import { Settings, Plus, Trash2, Save, X, Database, Download, Upload, FolderOpen, Calendar } from 'lucide-react';

const CATEGORIES = ['主诉', '现病史', '专科检查', '诊断', '处置', '复诊', '通用'];

const SettingsPage = () => {
  const { snippets, addSnippet, deleteSnippet, updateSnippet } = useSnippets();
  const [storagePath, setStoragePath] = React.useState('');
  const [exportStartDate, setExportStartDate] = React.useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [exportEndDate, setExportEndDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [isExporting, setIsExporting] = React.useState(false);
  const [isImporting, setIsImporting] = React.useState(false);

  React.useEffect(() => {
    const fetchStorage = async () => {
      // @ts-ignore
      const path = await window.electron.ipcRenderer.invoke('db:get-storage-path');
      setStoragePath(path);
    };
    fetchStorage();
  }, []);

  const handleSetStorage = async () => {
    // @ts-ignore
    const newPath = await window.electron.ipcRenderer.invoke('db:set-storage-path');
    if (newPath) setStoragePath(newPath);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // @ts-ignore
      const result = await window.electron.ipcRenderer.invoke('db:export-data', { startDate: exportStartDate, endDate: exportEndDate });
      if (result?.success) alert('病历导出成功！路径：' + result.path);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    if (!confirm('导入数据将合并至当前数据库，是否继续？')) return;
    setIsImporting(true);
    try {
      // @ts-ignore
      const result = await window.electron.ipcRenderer.invoke('db:import-data');
      if (result?.success) alert(`成功合并 ${result.count} 条病历记录！`);
    } finally {
      setIsImporting(false);
    }
  };

  const [newTrigger, setNewTrigger] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('通用');
  const [newDisease, setNewDisease] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTrigger, setEditTrigger] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDisease, setEditDisease] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrigger || !newContent) return;
    const trigger = newTrigger.startsWith('/') ? newTrigger : `/${newTrigger}`;
    await addSnippet(trigger, newContent, newCategory || '通用', newDisease || '');
    setNewTrigger('');
    setNewContent('');
    setNewCategory('通用');
    setNewDisease('');
  };

  const startEdit = (s: any) => {
    setEditingId(s.id);
    setEditTrigger(s.trigger);
    setEditContent(s.content);
    setEditCategory(s.category || '通用');
    setEditDisease(s.disease || '');
  };

  const handleUpdate = async (id: number) => {
    await updateSnippet(id, editTrigger, editContent, editCategory, editDisease);
    setEditingId(null);
  };

  return (
    <div className="p-12 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-16">
      <div>
        <div className="flex items-center gap-5 mb-12">
          <div className="w-14 h-14 rounded-[1.5rem] glass-panel flex items-center justify-center shadow-lg">
            <Settings className="w-7 h-7 text-blue-500 icon-shadow" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight title-shadow">短语库管理</h1>
            <p className="text-[10px] font-black text-blue-500/60 uppercase tracking-[0.3em] mt-1">Snippet & Phrase Management</p>
          </div>
        </div>

        <form onSubmit={handleAdd} className="mb-16 glass-panel p-10 !bg-white/30">
          <h2 className="text-sm font-black text-slate-600 uppercase tracking-[0.2em] mb-10 flex items-center gap-3 title-shadow">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> 添加快捷短语
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">触发词 (/xb)</label>
                <input
                  className="w-full frosted-input rounded-2xl py-3.5 px-4 text-sm font-bold outline-none text-slate-800 placeholder:text-slate-400"
                  value={newTrigger}
                  onChange={e => setNewTrigger(e.target.value)}
                  placeholder="/xb"
                />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">疾病</label>
                <input
                  className="w-full frosted-input rounded-2xl py-3.5 px-4 text-sm font-bold outline-none text-slate-800 placeholder:text-slate-400"
                  value={newDisease}
                  onChange={e => setNewDisease(e.target.value)}
                  placeholder="如：牙周炎"
                />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">分类</label>
                <select
                  className="w-full frosted-input rounded-2xl py-3.5 px-4 text-sm font-bold outline-none appearance-none cursor-pointer text-slate-800"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <div className="md:col-span-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">内容</label>
                <input
                  className="w-full frosted-input rounded-2xl py-3.5 px-4 text-sm font-bold outline-none text-slate-800 placeholder:text-slate-400"
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  placeholder="请输入短语内容..."
                />
            </div>
            <div className="md:col-span-2 flex items-end">
              <button
                type="submit"
                className="w-full h-[48px] bg-white/70 text-slate-800 rounded-2xl hover:bg-white transition-all flex items-center justify-center gap-2 text-xs font-black shadow-lg shadow-black/5 active:scale-95 border border-white ring-1 ring-blue-400/20 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400/10 via-blue-400/10 to-emerald-400/10 opacity-40 group-hover:opacity-70 transition-opacity" />
                <Save className="w-4 h-4 text-blue-500 relative z-10" />
                <span className="relative z-10">保存</span>
              </button>
            </div>
          </div>
        </form>

        <div className="grid gap-4">
          <div className="bg-white/40 p-4 rounded-xl border border-white/60 grid grid-cols-12 text-[10px] font-black text-slate-400 uppercase tracking-widest px-6">
            <div className="col-span-2">触发词</div>
            <div className="col-span-2">病症</div>
            <div className="col-span-2">分类</div>
            <div className="col-span-5">内容</div>
            <div className="col-span-1 text-right">操作</div>
          </div>
          {snippets.map(s => (
            <div key={s.id} className="glass-panel !bg-white/20 p-4 px-6 flex items-center justify-between group hover:border-blue-400/40 hover:bg-white transition-all duration-300">
              {editingId === s.id ? (
                <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-2"><input className="w-full frosted-input rounded-xl py-2 px-3 text-xs font-bold outline-none border-blue-400 text-slate-800" value={editTrigger} onChange={e => setEditTrigger(e.target.value)} /></div>
                  <div className="col-span-2"><input className="w-full frosted-input rounded-xl py-2 px-3 text-xs font-bold outline-none border-blue-400 text-slate-800" value={editDisease} onChange={e => setEditDisease(e.target.value)} /></div>
                  <div className="col-span-2">
                    <select 
                      className="w-full frosted-input rounded-xl py-2 px-3 text-xs font-bold outline-none appearance-none cursor-pointer text-slate-800" 
                      value={editCategory} 
                      onChange={e => setEditCategory(e.target.value)}
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="col-span-4"><input className="w-full frosted-input rounded-xl py-2 px-3 text-xs font-bold outline-none border-blue-400 text-slate-800" value={editContent} onChange={e => setEditContent(e.target.value)} /></div>
                  <div className="col-span-2 flex gap-2 justify-end">
                    <button onClick={() => handleUpdate(s.id)} className="bg-emerald-500 text-white p-2 rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"><Save className="w-3.5 h-3.5 mx-auto" /></button>
                    <button onClick={() => setEditingId(null)} className="bg-slate-200 text-slate-500 p-2 rounded-xl hover:bg-slate-300"><X className="w-3.5 h-3.5 mx-auto" /></button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                <div className="col-span-2">
                  <span className="font-mono font-black text-blue-600 text-xs bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/10 tracking-tighter">{s.trigger || '-'}</span>
                </div>
                <div className="col-span-2 truncate">
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter bg-indigo-50 px-2 py-0.5 rounded-md">{s.disease || '通用'}</span>
                </div>
                <div className="col-span-2 truncate">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{s.category || '通用'}</span>
                </div>
                <div className="col-span-5 text-slate-700 text-xs font-bold truncate pr-4">
                  {s.content || '(无内容)'}
                </div>
                  <div className="col-span-1 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => startEdit(s)}
                      className="p-2 text-blue-400 hover:bg-blue-50 rounded-lg transition-all"
                      title="编辑"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => { if(confirm('确定删除?')) deleteSnippet(s.id); }}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="删除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

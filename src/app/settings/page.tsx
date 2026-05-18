"use client";

import React, { useState } from 'react';
import { useSnippets } from '../../hooks/useSnippets';
import { Settings, Plus, Trash2, Save, X, Database, Download, Upload, FolderOpen, Calendar, Sparkles } from 'lucide-react';

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

  // Single Snippet State
  const [newTrigger, setNewTrigger] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('通用');
  const [newDisease, setNewDisease] = useState('');

  // Smart Parse State
  const [activeTab, setActiveTab] = useState<'single' | 'smart'>('single');
  const [rawRecord, setRawRecord] = useState('');
  const [smartDisease, setSmartDisease] = useState('');
  const [parsedItems, setParsedItems] = useState<any[]>([]);

  // Editing State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTrigger, setEditTrigger] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDisease, setEditDisease] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrigger || !newContent) {
      alert('请填写触发词和内容');
      return;
    }
    try {
      const trigger = newTrigger.startsWith('/') ? newTrigger : `/${newTrigger}`;
      await addSnippet(trigger, newContent, newCategory || '通用', newDisease || '通用');
      setNewTrigger('');
      setNewContent('');
      setNewCategory('通用');
      setNewDisease('');
    } catch (err) {
      alert('保存失败，请重试');
    }
  };

  // Smart Medical Record parser
  const handleSmartParse = () => {
    if (!rawRecord.trim()) {
      alert('请先输入或粘贴完整的病历内容');
      return;
    }

    const sections = [
      { keys: ['主诉'], category: '主诉', suffix: 'zs' },
      { keys: ['现病史及既往史', '现病史', '既往史', '病史'], category: '现病史', suffix: 'xbs' },
      { keys: ['专科检查', '口腔检查', '临床检查', '检查'], category: '专科检查', suffix: 'jc' },
      { keys: ['最终诊断', '临床诊断', '诊断结果', '诊断'], category: '诊断', suffix: 'zd' },
      { keys: ['治疗计划', '治疗方案', '处置计划', '处置', '治疗', '医嘱'], category: '处置', suffix: 'cz' },
    ];

    const foundMarkers: any[] = [];
    sections.forEach((sec) => {
      sec.keys.forEach((key) => {
        const regex = new RegExp(`(?:^|\\n|\\r)\\s*(?:【?\\s*${key}\\s*】?\\s*[:：\\s])`, 'gi');
        let match;
        while ((match = regex.exec(rawRecord)) !== null) {
          foundMarkers.push({
            index: match.index,
            matchStr: match[0],
            key: key,
            category: sec.category,
            suffix: sec.suffix
          });
        }
      });
    });

    // Sort markers by position
    foundMarkers.sort((a, b) => a.index - b.index);

    // De-duplicate overlapping markers
    const markers: any[] = [];
    let lastIndex = -1;
    for (const m of foundMarkers) {
      if (m.index >= lastIndex) {
        markers.push(m);
        lastIndex = m.index + m.matchStr.length;
      }
    }

    const items: any[] = [];
    for (let i = 0; i < markers.length; i++) {
      const curr = markers[i];
      const next = markers[i + 1];
      
      const startPos = curr.index + curr.matchStr.length;
      const endPos = next ? next.index : rawRecord.length;
      
      let content = rawRecord.substring(startPos, endPos).trim();
      content = content.replace(/^[\s:：]+/, '').trim();
      
      if (content) {
        const diseasePrefix = smartDisease.trim() || 'bl';
        const trigger = `/${diseasePrefix}_${curr.suffix}`;
        items.push({
          tempId: Date.now() + Math.random(),
          category: curr.category,
          content: content,
          disease: smartDisease.trim() || '通用',
          trigger: trigger
        });
      }
    }

    // Fallback: line-by-line starting keyword match
    if (items.length === 0) {
      const lines = rawRecord.split('\n');
      lines.forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed) return;
        
        for (const sec of sections) {
          for (const key of sec.keys) {
            if (trimmed.startsWith(key)) {
              let content = trimmed.substring(key.length).trim();
              content = content.replace(/^[:：\s]+/, '').trim();
              if (content) {
                const diseasePrefix = smartDisease.trim() || 'bl';
                items.push({
                  tempId: Date.now() + Math.random(),
                  category: sec.category,
                  content: content,
                  disease: smartDisease.trim() || '通用',
                  trigger: `/${diseasePrefix}_${sec.suffix}`
                });
                return;
              }
            }
          }
        }
      });
    }

    if (items.length === 0) {
      alert('未能识别出标准病历结构。请检查输入是否包含“主诉：”、“现病史：”、“专科检查：”、“诊断：”、“处置：”等标准标识符。');
      return;
    }

    setParsedItems(items);
  };

  const handleSaveAllSmart = async () => {
    if (parsedItems.length === 0) return;
    
    // Validate fields
    for (const item of parsedItems) {
      if (!item.trigger.trim() || !item.content.trim()) {
        alert('请确保所有识别到的短语的“触发词”与“内容”均已填写完毕！');
        return;
      }
    }

    try {
      for (const item of parsedItems) {
        const trigger = item.trigger.startsWith('/') ? item.trigger : `/${item.trigger}`;
        await addSnippet(trigger, item.content, item.category, item.disease || '通用');
      }
      alert(`🎉 成功批量解析并导入 ${parsedItems.length} 条快捷短语到短语库！`);
      setParsedItems([]);
      setRawRecord('');
      setSmartDisease('');
    } catch (err) {
      alert('批量保存失败，请检查数据后重试');
    }
  };

  const startEdit = (s: any) => {
    setEditingId(s.id);
    setEditTrigger(s.trigger);
    setEditContent(s.content);
    setEditCategory(s.category || '通用');
    setEditDisease(s.disease || '');
  };

  const handleUpdate = async (id: number) => {
    try {
      if (!editTrigger || !editContent) {
        alert('触发词和内容不能为空');
        return;
      }
      await updateSnippet(id, editTrigger, editContent, editCategory, editDisease);
      setEditingId(null);
    } catch (err) {
      alert('修改失败');
    }
  };

  return (
    <div className="p-12 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-16">
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

        <div className="mb-16 glass-panel p-10 !bg-white/30">
          {/* Tab Switcher */}
          <div className="flex border-b border-slate-100 mb-8 gap-6">
            <button
              type="button"
              onClick={() => setActiveTab('single')}
              className={`pb-3 text-sm font-black transition-all relative ${
                activeTab === 'single'
                  ? 'text-blue-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              添加单个快捷短语
              {activeTab === 'single' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('smart')}
              className={`pb-3 text-sm font-black transition-all relative flex items-center gap-1.5 ${
                activeTab === 'smart'
                  ? 'text-blue-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              智能解析整篇病历导入
              {activeTab === 'smart' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
              )}
            </button>
          </div>

          {activeTab === 'single' ? (
            <form onSubmit={handleAdd}>
              <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> 单个短语录入
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-2">
                  <label className="ui-label">触发词 (/xb)</label>
                  <input
                    className="ui-input"
                    value={newTrigger}
                    onChange={e => setNewTrigger(e.target.value)}
                    placeholder="/xb"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="ui-label">疾病</label>
                  <input
                    className="ui-input"
                    value={newDisease}
                    onChange={e => setNewDisease(e.target.value)}
                    placeholder="如：牙周炎"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="ui-label">分类</label>
                  <select
                    className="ui-input appearance-none cursor-pointer"
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="md:col-span-4">
                  <label className="ui-label">内容</label>
                  <input
                    className="ui-input"
                    value={newContent}
                    onChange={e => setNewContent(e.target.value)}
                    placeholder="请输入短语内容..."
                  />
                </div>
                <div className="md:col-span-2 flex flex-col justify-end">
                  <button
                    type="submit"
                    className="ui-btn-primary w-full flex items-center justify-center gap-2 shadow-lg shadow-black/5 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-400/10 via-blue-400/10 to-emerald-400/10 opacity-40 group-hover:opacity-70 transition-opacity" />
                    <Save className="w-4 h-4 text-blue-500 relative z-10" />
                    <span className="relative z-10">保存</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div>
              <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" /> 粘贴完整病历进行智能段落分割与自动归类
              </h2>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="ui-label flex items-center gap-1">
                    <span>疾病/病症名称</span>
                    <span className="text-[10px] text-slate-400 font-normal">(用于自动生成快捷触发词前缀，如 “牙周炎” 会生成 “/牙周炎_zs”)</span>
                  </label>
                  <input
                    className="ui-input max-w-md"
                    value={smartDisease}
                    onChange={e => setSmartDisease(e.target.value)}
                    placeholder="如：慢性牙髓炎、深龋、阻生齿拔除"
                  />
                </div>
                <div>
                  <label className="ui-label">完整病历内容</label>
                  <textarea
                    className="w-full h-44 ui-input p-4 font-mono text-xs leading-relaxed"
                    value={rawRecord}
                    onChange={e => setRawRecord(e.target.value)}
                    placeholder="请在这里粘贴整篇病历文本。系统将智能识别 “主诉”、“现病史”（既往史）、“专科检查”、“诊断”、“处置” 等标准段落。
【范例输入】：
主诉：左下后牙吃冷饮痛2周。
现病史：自述2周前左下后牙遇冷水刺激发酸敏感，去除刺激后酸痛即刻消失...
专科检查：36牙合面见深龋洞，探酸软，未穿髓，冷测敏痛，叩(-)...
诊断：36中龋。
处置：36去腐干净，玻璃离子垫底，3M纳米树脂充填保护..."
                  />
                </div>
                <div className="flex justify-start">
                  <button
                    type="button"
                    onClick={handleSmartParse}
                    className="ui-btn-primary flex items-center justify-center gap-2 shadow-lg shadow-black/5 relative overflow-hidden group px-6 py-2.5"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-emerald-400/10 to-indigo-400/10 opacity-40 group-hover:opacity-70 transition-opacity" />
                    <Sparkles className="w-4 h-4 text-blue-500 relative z-10" />
                    <span className="relative z-10 font-bold">智能解析段落</span>
                  </button>
                </div>
              </div>

              {/* Parsed snippets editable preview */}
              {parsedItems.length > 0 && (
                <div className="mt-10 border-t border-slate-100 pt-10">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      识别并拆分的短语预览 (支持实时编辑修改)
                    </h3>
                    <button
                      type="button"
                      onClick={() => setParsedItems([])}
                      className="text-xs text-slate-400 hover:text-red-500 font-bold"
                    >
                      清空结果
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 grid grid-cols-12 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 gap-4">
                      <div className="col-span-2">分类</div>
                      <div className="col-span-2">触发词</div>
                      <div className="col-span-2">病症</div>
                      <div className="col-span-5">内容</div>
                      <div className="col-span-1 text-right">操作</div>
                    </div>

                    {parsedItems.map((item, idx) => (
                      <div key={item.tempId} className="bg-white/60 p-4 rounded-xl border border-slate-200 grid grid-cols-12 gap-4 items-center hover:border-blue-400/30 transition-all">
                        <div className="col-span-2">
                          <select
                            className="w-full frosted-input rounded-xl py-1.5 px-3 text-xs font-bold outline-none cursor-pointer text-slate-800"
                            value={item.category}
                            onChange={(e) => {
                              const updated = [...parsedItems];
                              updated[idx].category = e.target.value;
                              setParsedItems(updated);
                            }}
                          >
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="col-span-2">
                          <input
                            className="w-full frosted-input rounded-xl py-1.5 px-3 text-xs font-bold outline-none border-blue-400 text-slate-800"
                            value={item.trigger}
                            onChange={(e) => {
                              const updated = [...parsedItems];
                              updated[idx].trigger = e.target.value;
                              setParsedItems(updated);
                            }}
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            className="w-full frosted-input rounded-xl py-1.5 px-3 text-xs font-bold outline-none border-blue-400 text-slate-800"
                            value={item.disease}
                            onChange={(e) => {
                              const updated = [...parsedItems];
                              updated[idx].disease = e.target.value;
                              setParsedItems(updated);
                            }}
                          />
                        </div>
                        <div className="col-span-5">
                          <textarea
                            className="w-full frosted-input rounded-xl py-1.5 px-3 text-xs font-bold outline-none border-blue-400 text-slate-800 min-h-[38px] resize-y"
                            value={item.content}
                            onChange={(e) => {
                              const updated = [...parsedItems];
                              updated[idx].content = e.target.value;
                              setParsedItems(updated);
                            }}
                          />
                        </div>
                        <div className="col-span-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = parsedItems.filter((_, i) => i !== idx);
                              setParsedItems(updated);
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="删除此项"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        type="button"
                        onClick={() => setParsedItems([])}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all"
                      >
                        放弃导入
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveAllSmart}
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
                      >
                        <Save className="w-4 h-4" />
                        批量保存到短语库
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

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
  {editingId !== null && editingId === s.id ? (
    <div className="flex-1 grid grid-cols-12 gap-4 items-center">
      <div className="col-span-2"><input className="w-full frosted-input rounded-xl py-2 px-3 text-xs font-bold outline-none border-blue-400 text-slate-800" value={editTrigger || ''} onChange={e => setEditTrigger(e.target.value)} /></div>
      <div className="col-span-2"><input className="w-full frosted-input rounded-xl py-2 px-3 text-xs font-bold outline-none border-blue-400 text-slate-800" value={editDisease || ''} onChange={e => setEditDisease(e.target.value)} /></div>
      <div className="col-span-2">
        <select 
          className="w-full frosted-input rounded-xl py-2 px-3 text-xs font-bold outline-none appearance-none cursor-pointer text-slate-800" 
          value={editCategory || '通用'} 
          onChange={e => setEditCategory(e.target.value)}
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="col-span-4"><input className="w-full frosted-input rounded-xl py-2 px-3 text-xs font-bold outline-none border-blue-400 text-slate-800" value={editContent || ''} onChange={e => setEditContent(e.target.value)} /></div>
      <div className="col-span-2 flex gap-2 justify-end">
        <button onClick={() => handleUpdate(s.id)} className="bg-emerald-500 text-white p-2 rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"><Save className="w-3.5 h-3.5 mx-auto" /></button>
        <button onClick={() => setEditingId(null)} className="bg-slate-200 text-slate-500 p-2 rounded-xl hover:bg-slate-300"><X className="w-3.5 h-3.5 mx-auto" /></button>
      </div>
    </div>
  ) : (
                <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                <div className="col-span-2">
                  <span className="font-mono font-bold text-blue-600 text-sm">{s.trigger || '-'}</span>
                </div>
                <div className="col-span-2 truncate">
                  <span className="text-sm font-medium text-slate-500">{s.disease || '通用'}</span>
                </div>
                <div className="col-span-2 truncate">
                  <span className="text-sm font-medium text-slate-400">{s.category || '通用'}</span>
                </div>
                <div className="col-span-5 text-slate-800 text-sm font-medium truncate pr-4">
                  {s.content || '(无内容)'}
                </div>
                  <div className="col-span-1 flex items-center justify-end gap-2 transition-all">
                    <button 
                      onClick={() => startEdit(s)}
                      className="p-2 text-blue-400 hover:bg-blue-50 rounded-lg transition-all"
                      title="编辑"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={async () => { 
                        if(confirm('确定永久删除这条短语吗？')) {
                          try {
                            await deleteSnippet(s.id);
                          } catch (err) {
                            alert('删除失败');
                          }
                        } 
                      }}
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

"use client";

import React, { useState } from 'react';
import { useSnippets } from '../../hooks/useSnippets';
import { Settings, Plus, Trash2, Save, X } from 'lucide-react';

const SettingsPage = () => {
  const { snippets, addSnippet, deleteSnippet, updateSnippet } = useSnippets();
  const [newTrigger, setNewTrigger] = useState('');
  const [newContent, setNewContent] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTrigger, setEditTrigger] = useState('');
  const [editContent, setEditContent] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrigger || !newContent) return;
    const trigger = newTrigger.startsWith('/') ? newTrigger : `/${newTrigger}`;
    await addSnippet(trigger, newContent);
    setNewTrigger('');
    setNewContent('');
  };

  const startEdit = (s: any) => {
    setEditingId(s.id);
    setEditTrigger(s.trigger);
    setEditContent(s.content);
  };

  const handleUpdate = async (id: number) => {
    await updateSnippet(id, editTrigger, editContent);
    setEditingId(null);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="w-8 h-8 text-slate-400" />
        <h1 className="text-3xl font-bold text-slate-800">设置 - 快捷短语库</h1>
      </div>

      <form onSubmit={handleAdd} className="mb-12 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" /> 新增短语
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            className="md:col-span-1 p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="触发词 (如 /xb)"
            value={newTrigger}
            onChange={e => setNewTrigger(e.target.value)}
          />
          <input
            className="md:col-span-2 p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="内容 (如 洗牙+全口检查)"
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> 保存
          </button>
        </div>
      </form>

      <div className="grid gap-4">
        {snippets.map(s => (
          <div key={s.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group">
            {editingId === s.id ? (
              <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 mr-4">
                <input
                  className="md:col-span-1 p-2 border border-blue-200 rounded-lg"
                  value={editTrigger}
                  onChange={e => setEditTrigger(e.target.value)}
                />
                <input
                  className="md:col-span-2 p-2 border border-blue-200 rounded-lg"
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                />
                <div className="flex gap-2">
                  <button onClick={() => handleUpdate(s.id)} className="text-green-600 p-2 hover:bg-green-50 rounded-lg">
                    <Save className="w-5 h-5" />
                  </button>
                  <button onClick={() => setEditingId(null)} className="text-slate-400 p-2 hover:bg-slate-50 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 flex items-center gap-8">
                  <span className="font-mono font-bold text-blue-600 w-24">{s.trigger}</span>
                  <span className="text-slate-700">{s.content}</span>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => startEdit(s)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    编辑
                  </button>
                  <button 
                    onClick={() => deleteSnippet(s.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsPage;

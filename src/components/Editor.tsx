"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useSnippets, Snippet } from '../hooks/useSnippets';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onFocus?: () => void;
}

const Editor: React.FC<EditorProps> = ({ value, onChange, placeholder, onFocus }) => {
  const { snippets } = useSnippets();
  const [showMenu, setShowMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [filter, setFilter] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const filteredSnippets = snippets.filter(s => 
    s.trigger.toLowerCase().includes(filter.toLowerCase()) || 
    s.content.toLowerCase().includes(filter.toLowerCase())
  );

  useEffect(() => {
    if (showMenu) {
      setSelectedIndex(0);
    }
  }, [filter, showMenu]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showMenu) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredSnippets.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredSnippets.length) % filteredSnippets.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredSnippets[selectedIndex]) {
          insertSnippet(filteredSnippets[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        setShowMenu(false);
      }
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursor = e.target.selectionStart;
    onChange(newValue);
    
    // Auto-expand height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }

    const lastSlashIndex = newValue.lastIndexOf('/', cursor - 1);
    if (lastSlashIndex !== -1) {
      const textAfterSlash = newValue.slice(lastSlashIndex + 1, cursor);
      if (!textAfterSlash.includes(' ') && !textAfterSlash.includes('\n')) {
        setFilter(textAfterSlash);
        setShowMenu(true);
        updateMenuPosition();
        return;
      }
    }
    setShowMenu(false);
  };

  const updateMenuPosition = () => {
    if (textareaRef.current) {
      // Simple approximation for menu position
      const rect = textareaRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.top + 30, // Rough offset
        left: rect.left + 10
      });
    }
  };

  const insertSnippet = (snippet: Snippet) => {
    const cursor = textareaRef.current?.selectionStart || 0;
    const slashPos = value.lastIndexOf('/', cursor - 1);
    if (slashPos === -1) return;
    
    const newValue = value.slice(0, slashPos) + snippet.content + value.slice(cursor);
    onChange(newValue);
    setShowMenu(false);
    
    setTimeout(() => {
      textareaRef.current?.focus();
      const newCursor = slashPos + snippet.content.length;
      textareaRef.current?.setSelectionRange(newCursor, newCursor);
    }, 0);
  };

  return (
    <div className="relative w-full min-h-full flex flex-col">
      <textarea
        ref={textareaRef}
        className="w-full p-2 bg-transparent border-none focus:outline-none resize-none text-slate-700 text-sm leading-relaxed overflow-hidden"
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        placeholder={placeholder}
      />

      {showMenu && filteredSnippets.length > 0 && (
        <div 
          className="fixed z-50 w-64 bg-white/80 backdrop-blur-md border border-slate-200 rounded-lg shadow-xl overflow-hidden"
          style={{ top: menuPos.top, left: menuPos.left }}
        >
          <div className="p-2 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
            快捷短语 ({filteredSnippets.length})
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredSnippets.map((s, i) => (
              <div
                key={s.id}
                className={`p-2 cursor-pointer text-sm flex flex-col ${i === selectedIndex ? 'bg-blue-500 text-white' : 'text-slate-700 hover:bg-slate-50'}`}
                onClick={() => insertSnippet(s)}
              >
                <span className="font-mono font-bold">{s.trigger}</span>
                <span className={`text-xs truncate ${i === selectedIndex ? 'text-blue-100' : 'text-slate-400'}`}>
                  {s.content}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;

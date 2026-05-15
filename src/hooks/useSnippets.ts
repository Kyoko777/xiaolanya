import { useState, useEffect } from 'react';

export interface Snippet {
  id: number;
  trigger: string;
  content: string;
  category: string;
}

export function useSnippets() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSnippets = async () => {
    try {
      // @ts-ignore
      const data = await window.electron.ipcRenderer.invoke('db:get-snippets');
      setSnippets(data);
    } catch (err) {
      console.error('Failed to fetch snippets:', err);
    } finally {
      setLoading(false);
    }
  };

  const addSnippet = async (trigger: string, content: string, category: string = 'custom') => {
    try {
      // @ts-ignore
      await window.electron.ipcRenderer.invoke('db:add-snippet', { trigger, content, category });
      await fetchSnippets();
    } catch (err) {
      console.error('Failed to add snippet:', err);
    }
  };

  const deleteSnippet = async (id: number) => {
    try {
      // @ts-ignore
      await window.electron.ipcRenderer.invoke('db:delete-snippet', id);
      await fetchSnippets();
    } catch (err) {
      console.error('Failed to delete snippet:', err);
    }
  };

  const updateSnippet = async (id: number, trigger: string, content: string) => {
    try {
      // @ts-ignore
      await window.electron.ipcRenderer.invoke('db:update-snippet', { id, trigger, content });
      await fetchSnippets();
    } catch (err) {
      console.error('Failed to update snippet:', err);
    }
  };

  useEffect(() => {
    fetchSnippets();
  }, []);

  return { snippets, loading, fetchSnippets, addSnippet, deleteSnippet, updateSnippet };
}

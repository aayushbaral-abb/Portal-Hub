
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Search, 
  Edit3,
  ArrowLeft
} from 'lucide-react';

interface Memo {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

const Memos: React.FC = () => {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [search, setSearch] = useState('');

  const fetchMemos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('memos')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMemos(data);
    } else if (error) {
      console.error("Error fetching memos:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMemos();
  }, []);

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }
    
    if (selectedMemo && !isAdding) {
      const { error } = await supabase.from('memos').update({ title, content }).match({ id: selectedMemo.id });
      if (!error) {
        fetchMemos();
        // Update local state to reflect changes if currently viewing
        setSelectedMemo(prev => prev ? { ...prev, title, content } : null);
      } else {
        alert("Update failed: " + error.message);
      }
    } else {
      const { error } = await supabase.from('memos').insert([{ title, content }]);
      if (!error) {
        setIsAdding(false);
        setTitle('');
        setContent('');
        fetchMemos();
      } else {
        alert("Insert failed: " + error.message);
      }
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete memo?')) return;
    const { error } = await supabase.from('memos').delete().match({ id });
    if (!error) {
      if (selectedMemo?.id === id) {
        setSelectedMemo(null);
        setTitle('');
        setContent('');
      }
      fetchMemos();
    }
  };

  const filteredMemos = memos.filter(m => {
    const memoTitle = (m.title || '').toLowerCase();
    const memoContent = (m.content || '').toLowerCase();
    const query = (search || '').toLowerCase();
    return memoTitle.includes(query) || memoContent.includes(query);
  });

  const isEditing = !!(selectedMemo || isAdding);

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-12rem)] flex gap-6">
      {/* Sidebar List - Hidden on mobile if editing */}
      <div className={`w-full md:w-80 flex flex-col gap-4 ${isEditing ? 'hidden md:flex' : 'flex'}`}>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={() => {
              setIsAdding(true);
              setSelectedMemo(null);
              setTitle('');
              setContent('');
            }}
            className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {loading ? (
             <div className="flex justify-center py-10">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
             </div>
          ) : filteredMemos.map((memo) => (
            <button
              key={memo.id}
              onClick={() => {
                setSelectedMemo(memo);
                setIsAdding(false);
                setTitle(memo.title || '');
                setContent(memo.content || '');
              }}
              className={`w-full p-4 rounded-2xl text-left border transition-all ${
                selectedMemo?.id === memo.id 
                  ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-slate-800 line-clamp-1">{memo.title || 'Untitled'}</h4>
                <div onClick={(e) => handleDelete(memo.id, e)} className="p-1 hover:bg-red-100 rounded text-slate-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-sm text-slate-500 line-clamp-2 mb-2">{memo.content || 'No content'}</p>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                <Calendar className="w-3 h-3" />
                {new Date(memo.created_at).toLocaleDateString()}
              </div>
            </button>
          ))}
          {!loading && filteredMemos.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-sm">No memos found.</div>
          )}
        </div>
      </div>

      {/* Editor Area - Visible on desktop always, or mobile if editing */}
      <div className={`flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex-col ${isEditing ? 'flex' : 'hidden md:flex'}`}>
        {isEditing ? (
          <>
            <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 md:hidden">
                <button 
                  onClick={() => { setSelectedMemo(null); setIsAdding(false); }} 
                  className="p-2 text-slate-500"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Memo Title..."
                className="text-xl md:text-2xl font-bold text-slate-800 outline-none w-full bg-transparent"
              />
              <button
                onClick={handleSave}
                className="px-4 md:px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-md active:scale-95 whitespace-nowrap"
              >
                Save
              </button>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start typing your thoughts here..."
              className="flex-1 p-6 md:p-8 outline-none text-slate-600 leading-relaxed resize-none bg-slate-50/30 font-medium"
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Edit3 className="w-10 h-10 opacity-20" />
            </div>
            <h3 className="text-xl font-bold text-slate-700">Select a memo or create one</h3>
            <p className="max-w-xs mt-2">Your private notes are encrypted and only accessible by you.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Memos;

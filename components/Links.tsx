
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Plus, Trash2, ExternalLink, Search, Globe, Link as LinkIcon, Edit2, CheckCircle2, XCircle } from 'lucide-react';

interface Link {
  id: string;
  title: string;
  url: string;
  created_at: string;
}

const Links: React.FC = () => {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  
  // Edit state
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  
  const [search, setSearch] = useState('');

  const fetchLinks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setLinks(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;

    const { error } = await supabase
      .from('links')
      .insert([{ title: newTitle || newUrl, url: newUrl }]);

    if (!error) {
      setNewTitle('');
      setNewUrl('');
      setIsAdding(false);
      fetchLinks();
    }
  };

  const handleUpdateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUrl || !editId) return;

    const { error } = await supabase
      .from('links')
      .update({ title: editTitle || editUrl, url: editUrl })
      .match({ id: editId });

    if (!error) {
      setEditId(null);
      setEditTitle('');
      setEditUrl('');
      fetchLinks();
    } else {
      alert("Update failed: " + error.message);
    }
  };

  const startEditing = (link: Link) => {
    setEditId(link.id);
    setEditTitle(link.title);
    setEditUrl(link.url);
    setIsAdding(false); // Close add form if open
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this link?')) return;
    const { error } = await supabase.from('links').delete().match({ id });
    if (!error) fetchLinks();
  };

  const filteredLinks = links.filter(l => {
    const title = (l.title || '').toLowerCase();
    const url = (l.url || '').toLowerCase();
    const query = (search || '').toLowerCase();
    return title.includes(query) || url.includes(query);
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search your links..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
          />
        </div>
        <button
          onClick={() => {
            setIsAdding(true);
            setEditId(null);
          }}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl transition-all shadow-md active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Add Link
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl border-2 border-indigo-100 shadow-sm animate-in fade-in zoom-in duration-200">
          <form onSubmit={handleAddLink} className="space-y-4">
            <h3 className="font-bold text-lg text-slate-800">Add New Resource</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Title</label>
                <input
                  type="text"
                  placeholder="Website Name"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-slate-500 hover:text-slate-700 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-100 transition-all"
              >
                Save Link
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLinks.map((link) => (
            <div key={link.id} className="group relative">
              {editId === link.id ? (
                <div className="bg-white p-5 rounded-2xl border-2 border-indigo-500 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 z-10">
                  <form onSubmit={handleUpdateLink} className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Editing Link</span>
                      <div className="flex gap-2">
                        <button type="submit" className="text-green-500 hover:text-green-600 p-1"><CheckCircle2 className="w-5 h-5" /></button>
                        <button type="button" onClick={() => setEditId(null)} className="text-red-400 hover:text-red-500 p-1"><XCircle className="w-5 h-5" /></button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Title"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        autoFocus
                      />
                      <input
                        type="url"
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        placeholder="URL"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </form>
                </div>
              ) : (
                <div className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-xl transition-all relative overflow-hidden flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                      <Globe className="w-6 h-6 text-slate-400 group-hover:text-indigo-500" />
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEditing(link)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Edit Link"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(link.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Link"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800 line-clamp-1 mb-1 group-hover:text-indigo-700 transition-colors">{link.title}</h4>
                    <p className="text-xs text-slate-400 truncate mb-4 font-medium">{link.url}</p>
                  </div>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2 bg-slate-50 group-hover:bg-indigo-600 text-slate-600 group-hover:text-white rounded-xl font-bold text-sm transition-all"
                  >
                    Visit Site
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          ))}
          {filteredLinks.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full text-slate-400">
                <LinkIcon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-700">No links found</h3>
                <p className="text-slate-500 text-sm">Add your first link or refine your search.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Links;

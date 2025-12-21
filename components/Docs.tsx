
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Upload, 
  File, 
  Download, 
  Trash2, 
  Eye, 
  FileText, 
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Edit2,
  Search,
  Table,
  Presentation,
  Archive,
  Music,
  Video
} from 'lucide-react';

interface DocRecord {
  id: string;
  name: string;
  storage_path: string;
  size: number;
  mime_type: string;
  created_at: string;
}

const BUCKET_NAME = 'personal-documents';

const Docs: React.FC = () => {
  const [docs, setDocs] = useState<DocRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [preservedExt, setPreservedExt] = useState('');
  const [search, setSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocs = async () => {
  setLoading(true);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    setLoading(false);
    return;
  }

  const { data, error } = await supabase
    .from('docs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (!error && data) {
    setDocs(data);
  }
  setLoading(false);
};

  useEffect(() => {
    fetchDocs();
  }, []);


  const handleUpload = async (fileList: FileList | null) => {
  if (!fileList || fileList.length === 0) return;
  const file = fileList[0];

  if (file.size > 50 * 1024 * 1024) {
    alert('File size exceeds 50MB limit.');
    return;
    }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    alert("Please log in to upload files.");
    return;
  }

  setUploading(true);

  // FOLDER CREATION: user.id becomes the folder name
  const storagePath = `${user.id}/${Date.now()}_${file.name}`;

  try {
    // Upload to Storage
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, file);

    if (storageError) throw storageError;

    // Save to Database with user_id
    const { error: dbError } = await supabase
      .from('docs')
      .insert([{
        name: file.name,
        storage_path: storagePath,
        size: file.size,
        mime_type: file.type || 'application/octet-stream',
        user_id: user.id // <--- Important: links file to user
      }]);

    if (dbError) throw dbError;

    fetchDocs();
  } catch (err: any) {
    alert('Upload failed: ' + err.message);
  } finally {
    setUploading(false);
  }
};

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) handleUpload(e.dataTransfer.files);
  };

  const handleDelete = async (doc: DocRecord) => {
    if (!confirm(`Permanently delete ${doc.name}?`)) return;

    try {
      const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([doc.storage_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('docs')
        .delete()
        .match({ id: doc.id });

      if (dbError) throw dbError;

      fetchDocs();
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  };

  const handleDownload = async (doc: DocRecord) => {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(doc.storage_path);
    
    if (error) {
      alert("Download failed: " + error.message);
      return;
    }
    
    const url = window.URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.name;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleView = async (doc: DocRecord) => {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(doc.storage_path, 120);

    if (!error && data) {
      window.open(data.signedUrl, '_blank');
    }
  };

  const startRename = (doc: DocRecord) => {
    const lastDotIndex = doc.name.lastIndexOf('.');
    if (lastDotIndex > 0) {
      setNewName(doc.name.substring(0, lastDotIndex));
      setPreservedExt(doc.name.substring(lastDotIndex));
    } else {
      setNewName(doc.name);
      setPreservedExt('');
    }
    setRenameId(doc.id);
  };

  const handleRenameSubmit = async (doc: DocRecord) => {
    const trimmedName = newName.trim();
    if (!trimmedName) {
      setRenameId(null);
      return;
    }

    const finalFullName = trimmedName + preservedExt;
    
    if (finalFullName === doc.name) {
      setRenameId(null);
      return;
    }

    const { error } = await supabase
      .from('docs')
      .update({ name: finalFullName })
      .match({ id: doc.id });

    if (!error) {
      setRenameId(null);
      fetchDocs();
    } else {
      alert('Rename failed: ' + error.message);
    }
  };

  const getFileIcon = (doc: DocRecord) => {
    const { mime_type, name } = doc;
    const extension = name.split('.').pop()?.toLowerCase() || '';

    // Images
    if (mime_type.startsWith('image/')) return <ImageIcon className="w-10 h-10 text-blue-500" />;
    
    // PDFs
    if (mime_type === 'application/pdf' || extension === 'pdf') return <FileText className="w-10 h-10 text-red-500" />;
    
    // Word Docs
    if (
      mime_type.includes('word') || 
      mime_type.includes('officedocument.wordprocessingml') || 
      ['doc', 'docx'].includes(extension)
    ) return <FileText className="w-10 h-10 text-blue-600" />;
    
    // Excel / Sheets
    if (
      mime_type.includes('excel') || 
      mime_type.includes('spreadsheetml') || 
      mime_type.includes('csv') ||
      ['xls', 'xlsx', 'csv'].includes(extension)
    ) return <Table className="w-10 h-10 text-green-600" />;
    
    // PowerPoint / Slides
    if (
      mime_type.includes('powerpoint') || 
      mime_type.includes('presentationml') || 
      ['ppt', 'pptx'].includes(extension)
    ) return <Presentation className="w-10 h-10 text-orange-600" />;

    // Text files
    if (mime_type.startsWith('text/') || extension === 'txt' || extension === 'log') return <FileText className="w-10 h-10 text-slate-500" />;

    // Compressed archives
    if (mime_type.includes('zip') || mime_type.includes('compressed') || ['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) return <Archive className="w-10 h-10 text-amber-500" />;

    // Audio
    if (mime_type.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a'].includes(extension)) return <Music className="w-10 h-10 text-purple-500" />;

    // Video
    if (mime_type.startsWith('video/') || ['mp4', 'mov', 'avi', 'mkv'].includes(extension)) return <Video className="w-10 h-10 text-pink-500" />;

    // Default
    return <File className="w-10 h-10 text-slate-400" />;
  };

  const filteredDocs = docs.filter(d => 
    (d.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div 
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer ${
          dragActive 
            ? 'border-indigo-500 bg-indigo-50 scale-[1.01]' 
            : 'border-slate-200 bg-white hover:bg-slate-50 shadow-sm'
        }`}
      >
        <input 
          type="file" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={(e) => handleUpload(e.target.files)} 
        />
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all ${
          uploading ? 'bg-indigo-100' : 'bg-slate-100'
        }`}>
          {uploading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          ) : (
            <Upload className={`w-8 h-8 ${dragActive ? 'text-indigo-500' : 'text-slate-400'}`} />
          )}
        </div>
        <h3 className="text-xl font-bold text-slate-800">
          {uploading ? 'Uploading your file...' : 'Drop your files here'}
        </h3>
        <p className="text-slate-500 mt-2">Maximum file size 50MB at one time</p>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800">Your Documents ({filteredDocs.length})</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {loading ? (
            <div className="py-20 flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredDocs.map((doc) => (
            <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-all group">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {getFileIcon(doc)}
                <div className="flex-1 min-w-0">
                  {renameId === doc.id ? (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center flex-1 bg-slate-100 border border-indigo-300 rounded overflow-hidden max-w-sm">
                        <input
                          type="text"
                          value={newName}
                          autoFocus
                          onChange={(e) => setNewName(e.target.value)}
                          className="px-2 py-1 outline-none w-full bg-transparent font-semibold text-slate-700"
                        />
                        <span className="px-2 py-1 bg-slate-200 text-slate-500 text-sm font-medium border-l border-slate-300">
                          {preservedExt}
                        </span>
                      </div>
                      <button onClick={() => handleRenameSubmit(doc)} className="text-green-500 hover:text-green-600"><CheckCircle2 className="w-5 h-5" /></button>
                      <button onClick={() => setRenameId(null)} className="text-red-500 hover:text-red-600"><XCircle className="w-5 h-5" /></button>
                    </div>
                  ) : (
                    <>
                      <h4 className="font-bold text-slate-700 truncate text-base">{doc.name}</h4>
                      <p className="text-xs text-slate-400 font-medium">
                        {new Date(doc.created_at).toLocaleDateString()} • {(doc.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 md:gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleView(doc)}
                  className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                  title="View Temporary Link"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleDownload(doc)}
                  className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => startRename(doc)}
                  className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                  title="Rename"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleDelete(doc)}
                  className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}

          {!loading && filteredDocs.length === 0 && (
            <div className="py-24 text-center text-slate-400">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <File className="w-10 h-10 opacity-20" />
              </div>
              <p className="text-lg font-medium">No documents found.</p>
              <p className="text-sm">Upload your first file to see it here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Docs;

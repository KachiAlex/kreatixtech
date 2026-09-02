import React, { useState, useEffect, useRef } from 'react';
import { Upload, Download, Trash2, FileText, File as FileIcon, Star } from 'lucide-react';
import { filesApi } from '../api';
import type { FileItem } from '../types';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1073741824).toFixed(1)} GB`;
}

function getFileIcon(mime: string): React.ElementType {
  if (mime.startsWith('image/')) return FileIcon;
  if (mime.startsWith('video/')) return FileIcon;
  return FileText;
}

const Files: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadFiles(); }, []);

  const loadFiles = async () => {
    try { const data = await filesApi.list(); setFiles(data.files); } catch (e) { console.error(e); }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setUploading(true);
    try {
      for (const file of Array.from(e.target.files)) {
        await filesApi.upload(file);
      }
      loadFiles();
    } catch (err: any) { alert(err.message || 'Upload failed'); } finally { setUploading(false); }
  };

  const handleDelete = async (id: string) => {
    try { await filesApi.delete(id); loadFiles(); } catch (e) { console.error(e); }
  };

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  return (
    <div style={{ height: '100%', overflow: 'auto', padding: '31px clamp(28px,4vw,68px) 50px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <span className="eyebrow">FILES</span>
          <h1 style={{ margin: 0, fontSize: 28, letterSpacing: '-.03em' }}>All Files</h1>
          <small style={{ color: 'var(--muted)', fontSize: 13 }}>{files.length} files · {formatBytes(totalSize)} total</small>
        </div>
        <div>
          <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={handleUpload} />
          <button className="compose-main" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            <Upload /> {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>

      {files.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, color: '#999' }}>
          <FileIcon style={{ width: 48, height: 48, margin: '0 auto 12px' }} />
          <p>No files uploaded yet</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, maxWidth: 900 }}>
          {files.map(file => {
            const Icon = getFileIcon(file.mime_type);
            return (
              <div key={file.id} style={{ padding: 16, border: '1px solid var(--line)', borderRadius: 12, background: '#fbfaf8', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div className="file-icon"><Icon /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong style={{ fontSize: 13, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.filename}</strong>
                    <small style={{ color: 'var(--muted)', fontSize: 11 }}>{formatBytes(file.size)}</small>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  <a href={filesApi.downloadUrl(file.id)} download={file.filename} className="reply-btn" style={{ fontSize: 12, padding: '6px 14px', textDecoration: 'none' }}>
                    <Download style={{ width: 14, height: 14 }} /> Download
                  </a>
                  <button className="icon-btn" onClick={() => handleDelete(file.id)} title="Delete" style={{ width: 32, height: 32 }}><Trash2 /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Files;

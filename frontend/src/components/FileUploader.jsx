import { useRef, useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Button from './Button';
import { useToast } from '../context/ToastContext';
import './FileUploader.css';

/**
 * Drag-and-drop PDF upload component.
 * @param {(file: File) => Promise<any>} onUpload — async upload handler
 */
export default function FileUploader({ onUpload }) {
  const toast = useToast();
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle'); // idle | uploading | success | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const reset = () => {
    setFile(null);
    setProgress(0);
    setStatus('idle');
    setResult(null);
    setError('');
  };

  const handleFile = useCallback(
    async (f) => {
      if (!f || !f.name.toLowerCase().endsWith('.pdf')) {
        setError('Please select a PDF file.');
        setStatus('error');
        toast.error('Please select a PDF file.');
        return;
      }
      if (f.size > 10 * 1024 * 1024) {
        setError('File exceeds the 10 MB limit.');
        setStatus('error');
        toast.error('File exceeds the 10 MB limit.');
        return;
      }

      setFile(f);
      setStatus('uploading');
      setProgress(0);
      setError('');

      try {
        const res = await onUpload(f, (e) => {
          const pct = Math.round((e.loaded * 100) / e.total);
          setProgress(pct);
        });
        setResult(res);
        setStatus('success');
        toast.success('PDF uploaded successfully');
        toast.success('Knowledge base updated');
      } catch (err) {
        const errorMsg = err?.response?.data?.detail || err.message || 'Upload failed';
        setError(errorMsg);
        setStatus('error');
        toast.error('Upload failed');
      }
    },
    [onUpload, toast]
  );

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    handleFile(f);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = () => setDragOver(false);

  const onSelectFile = (e) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  return (
    <div className="file-uploader">
      {status === 'idle' && (
        <div
          className={`upload-zone ${dragOver ? 'upload-zone-active' : ''}`}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            hidden
            onChange={onSelectFile}
          />
          <div className="upload-zone-icon">
            <Upload size={32} />
          </div>
          <p className="upload-zone-title">
            Drag & drop your PDF here
          </p>
          <p className="upload-zone-hint">
            or <span className="upload-zone-link">browse files</span> · Max 10 MB
          </p>
        </div>
      )}

      {status === 'uploading' && (
        <div className="upload-progress-card glass-card-solid">
          <div className="upload-file-info">
            <FileText size={22} className="upload-file-icon" />
            <div>
              <p className="upload-file-name">{file?.name}</p>
              <p className="upload-file-size">
                {(file?.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <Loader2 size={20} className="upload-spinner" />
          </div>
          <div className="upload-progress-bar">
            <div
              className="upload-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="upload-progress-label">
            {progress < 100 ? 'Uploading PDF...' : 'Processing PDF...'}
          </p>
        </div>
      )}

      {status === 'success' && (
        <div className="upload-result-card upload-result-success glass-card-solid">
          <CheckCircle2 size={40} className="upload-result-icon" />
          <h3>Upload Successful!</h3>
          <p>
            <strong>{result?.filename}</strong> has been ingested into the knowledge base.
          </p>
          {result?.chunk_count && (
            <p className="upload-result-meta">
              {result.chunk_count} chunks indexed · {result.text_length?.toLocaleString()} characters
            </p>
          )}
          <Button variant="secondary" size="sm" onClick={reset}>
            Upload Another
          </Button>
        </div>
      )}

      {status === 'error' && (
        <div className="upload-result-card upload-result-error glass-card-solid">
          <XCircle size={40} className="upload-result-icon" />
          <h3>Upload Failed</h3>
          <p>{error}</p>
          <Button variant="danger" size="sm" onClick={reset}>
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { FileText, CheckCircle2, XCircle, Loader2, PlayCircle } from 'lucide-react';
import Button from './Button';
import { useDemoPDF } from '../api/client';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import './DemoPDFCard.css';

const LOADING_STEPS = [
  'Loading Demo PDF...',
  'Generating embeddings...',
  'Building knowledge base...',
  'Almost ready...',
];

/** Format bytes into a human-readable string (KB or MB). */
function formatSize(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

/**
 * Card displaying a single demo PDF with a one-click ingest flow.
 *
 * @param {string}   filename
 * @param {string}   description
 * @param {number}   sizeBytes
 * @param {function} onSuccess   — called after successful ingestion
 */
export default function DemoPDFCard({ filename, description, sizeBytes, onSuccess }) {
  const toast = useToast();
  const navigate = useNavigate();
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [stepIndex, setStepIndex] = useState(0);
  const intervalRef = useRef(null);

  // Cycle through loading step labels while loading
  useEffect(() => {
    if (status === 'loading') {
      setStepIndex(0);
      intervalRef.current = setInterval(() => {
        setStepIndex((i) => Math.min(i + 1, LOADING_STEPS.length - 1));
      }, 1200);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [status]);

  const handleUse = async () => {
    if (status === 'loading') return;
    setStatus('loading');

    try {
      await useDemoPDF(filename);
      setStatus('success');
      toast.success(`✅ "${filename}" loaded into knowledge base`);
      onSuccess?.();
    } catch (err) {
      setStatus('error');
      toast.error('Unable to load demo PDF. Please try again.');
    }
  };

  const reset = () => setStatus('idle');

  return (
    <div className={`demo-pdf-card glass-card-solid ${status}`}>
      {/* Top accent bar */}
      <div className="demo-card-accent" />

      {/* Icon + meta */}
      <div className="demo-card-body">
        <div className="demo-card-icon-wrap">
          <FileText size={28} className="demo-card-icon" />
        </div>

        <div className="demo-card-meta">
          <p className="demo-card-filename" title={filename}>{filename}</p>
          <p className="demo-card-desc">{description}</p>
          {sizeBytes > 0 && (
            <span className="demo-card-size badge badge-primary">
              {formatSize(sizeBytes)}
            </span>
          )}
        </div>
      </div>

      {/* Action area */}
      <div className="demo-card-footer">
        {status === 'idle' && (
          <Button
            variant="primary"
            size="sm"
            pill
            icon={<PlayCircle size={15} />}
            onClick={handleUse}
            className="demo-use-btn"
          >
            Use Demo PDF
          </Button>
        )}

        {status === 'loading' && (
          <div className="demo-loading-row">
            <Loader2 size={16} className="demo-spinner" />
            <span className="demo-loading-label">{LOADING_STEPS[stepIndex]}</span>
          </div>
        )}

        {status === 'success' && (
          <div className="demo-result-row demo-result-success">
            <CheckCircle2 size={16} />
            <span>Demo PDF loaded successfully.</span>
            <button className="demo-ask-link" onClick={() => navigate('/ask')}>
              Ask questions →
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="demo-result-row demo-result-error">
            <XCircle size={16} />
            <span>Unable to load demo PDF. Please try again.</span>
            <button className="demo-retry-btn" onClick={reset}>Retry</button>
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Database,
  HardDrive,
  FileText,
  Search,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import Header from '../components/Header';
import Button from '../components/Button';
import { checkHealth } from '../api/client';
import { API } from '../config/api';
import './KnowledgeBase.css';

export default function KnowledgeBase() {
  const navigate = useNavigate();
  const [health, setHealth] = useState(null);
  const [checking, setChecking] = useState(false);

  const refresh = async () => {
    setChecking(true);
    try {
      await checkHealth();
      setHealth('online');
    } catch {
      setHealth('offline');
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <>
      <Header
        title="Knowledge Base"
        subtitle="Manage your indexed documents and FAISS vector store"
      />

      <div className="page-content">
        {/* Status cards */}
        <div className="kb-status-grid">
          <div className="kb-status-card glass-card-solid">
            <div className="kb-status-header">
              <div className="kb-status-icon kb-icon-green">
                <HardDrive size={20} />
              </div>
              <span className={`badge ${health === 'online' ? 'badge-success' : 'badge-danger'}`}>
                {health === 'online' ? 'Online' : health === 'offline' ? 'Offline' : 'Checking…'}
              </span>
            </div>
            <h4>Backend Server</h4>
            <p>FastAPI + Uvicorn · {API ? new URL(API).host : ''}</p>
          </div>

          <div className="kb-status-card glass-card-solid">
            <div className="kb-status-header">
              <div className="kb-status-icon kb-icon-purple">
                <Database size={20} />
              </div>
              <span className="badge badge-primary">FAISS</span>
            </div>
            <h4>Vector Store</h4>
            <p>Flat Inner Product · Cosine similarity</p>
          </div>

          <div className="kb-status-card glass-card-solid">
            <div className="kb-status-header">
              <div className="kb-status-icon kb-icon-teal">
                <Search size={20} />
              </div>
              <span className="badge badge-primary">384D</span>
            </div>
            <h4>Embedding Model</h4>
            <p>all-MiniLM-L6-v2 · Sentence Transformers</p>
          </div>
        </div>

        {/* Architecture diagram */}
        <section className="kb-architecture glass-card-solid">
          <div className="section-header">
            <Database size={20} />
            <h3>RAG Pipeline Architecture</h3>
            <Button
              variant="ghost"
              size="sm"
              icon={<RefreshCw size={14} />}
              loading={checking}
              onClick={refresh}
            >
              Refresh
            </Button>
          </div>

          <div className="kb-pipeline">
            <div className="kb-pipeline-step">
              <div className="pipeline-icon pipeline-purple">
                <FileText size={20} />
              </div>
              <span className="pipeline-label">PDF Upload</span>
            </div>
            <div className="pipeline-arrow">→</div>
            <div className="kb-pipeline-step">
              <div className="pipeline-icon pipeline-teal">
                <span style={{ fontWeight: 700, fontSize: '0.7rem' }}>TXT</span>
              </div>
              <span className="pipeline-label">Text Extract</span>
            </div>
            <div className="pipeline-arrow">→</div>
            <div className="kb-pipeline-step">
              <div className="pipeline-icon pipeline-orange">
                <span style={{ fontWeight: 700, fontSize: '0.7rem' }}>CHK</span>
              </div>
              <span className="pipeline-label">Chunk (1000/200)</span>
            </div>
            <div className="pipeline-arrow">→</div>
            <div className="kb-pipeline-step">
              <div className="pipeline-icon pipeline-green">
                <span style={{ fontWeight: 700, fontSize: '0.7rem' }}>EMB</span>
              </div>
              <span className="pipeline-label">Embed</span>
            </div>
            <div className="pipeline-arrow">→</div>
            <div className="kb-pipeline-step">
              <div className="pipeline-icon pipeline-purple">
                <Database size={16} />
              </div>
              <span className="pipeline-label">FAISS Index</span>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="kb-actions">
          <Button
            variant="primary"
            icon={<FileText size={18} />}
            iconRight={<ArrowRight size={16} />}
            onClick={() => navigate('/upload')}
          >
            Upload a Document
          </Button>
          <Button
            variant="accent"
            icon={<Search size={18} />}
            iconRight={<ArrowRight size={16} />}
            onClick={() => navigate('/ask')}
          >
            Query Knowledge Base
          </Button>
        </div>
      </div>
    </>
  );
}

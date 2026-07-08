import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  MessageSquareText,
  Activity,
  Database,
  ArrowRight,
  Sparkles,
  Upload,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import StatsCard from '../components/StatsCard';
import Button from '../components/Button';
import Header from '../components/Header';
import { checkHealth } from '../api/client';
import './Dashboard.css';

const QUICK_QUESTIONS = [
  'How to store Paracetamol?',
  'What is the standard dosage of insulin?',
  'List temperature-sensitive medications',
  'Expiry management best practices',
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [health, setHealth] = useState(null);

  useEffect(() => {
    checkHealth()
      .then(() => setHealth('online'))
      .catch(() => setHealth('offline'));
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <>
      <Header title="Dashboard" subtitle={`${greeting()}! Welcome back.`} />

      <div className="page-content">
        {/* Hero banner */}
        <section className="dashboard-hero">
          <div className="dashboard-hero-text">
            <h2 className="dashboard-hero-title">
              How can <span className="text-gradient">MedInventory AI</span> help
              you today?
            </h2>
            <p className="dashboard-hero-desc">
              Upload medical documents, ask questions about inventory, and get
              AI-powered insights from your knowledge base.
            </p>
            <div className="dashboard-hero-actions">
              <Button
                variant="primary"
                icon={<Upload size={18} />}
                onClick={() => navigate('/upload')}
              >
                Upload Document
              </Button>
              <Button
                variant="secondary"
                icon={<MessageSquareText size={18} />}
                onClick={() => navigate('/ask')}
              >
                Ask the Agent
              </Button>
            </div>
          </div>
          <div className="dashboard-hero-visual">
            <div className="hero-orb hero-orb-1" />
            <div className="hero-orb hero-orb-2" />
            <div className="hero-orb hero-orb-3" />
            <Sparkles size={64} className="hero-sparkle" />
          </div>
        </section>

        {/* Stats */}
        <section className="dashboard-stats">
          <StatsCard
            icon={<Activity size={20} />}
            label="System Status"
            value={health === 'online' ? 'Online' : health === 'offline' ? 'Offline' : '…'}
            trend={health === 'online' ? 'Healthy' : ''}
            trendDir={health === 'online' ? 'up' : 'down'}
            color="green"
            className="stagger-1"
          />
          <StatsCard
            icon={<FileText size={20} />}
            label="Documents Indexed"
            value="—"
            trend="Ready"
            trendDir="neutral"
            color="purple"
            className="stagger-2"
          />
          <StatsCard
            icon={<Database size={20} />}
            label="Knowledge Base"
            value="FAISS"
            trend="Active"
            trendDir="up"
            color="teal"
            className="stagger-3"
          />
          <StatsCard
            icon={<TrendingUp size={20} />}
            label="AI Model"
            value="Llama 3.3"
            trend="70B"
            trendDir="up"
            color="orange"
            className="stagger-4"
          />
        </section>

        {/* Quick Questions + Capabilities */}
        <div className="dashboard-grid">
          {/* Quick questions */}
          <section className="dashboard-quick glass-card-solid">
            <div className="section-header">
              <HelpCircle size={20} />
              <h3>Quick Questions</h3>
            </div>
            <div className="quick-questions-list">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  className="quick-question-item"
                  onClick={() => navigate('/ask', { state: { question: q } })}
                >
                  <MessageSquareText size={16} />
                  <span>{q}</span>
                  <ArrowRight size={14} className="quick-question-arrow" />
                </button>
              ))}
            </div>
          </section>

          {/* Capabilities */}
          <section className="dashboard-capabilities glass-card-solid">
            <div className="section-header">
              <Sparkles size={20} />
              <h3>Agent Capabilities</h3>
            </div>
            <div className="capabilities-list">
              {[
                {
                  title: 'PDF Analysis',
                  desc: 'Upload and extract text from medical PDFs automatically',
                  color: 'purple',
                },
                {
                  title: 'RAG Retrieval',
                  desc: 'Semantic search across ingested documents using FAISS',
                  color: 'teal',
                },
                {
                  title: 'AI Answers',
                  desc: 'Get contextual answers powered by Llama 3.3 70B via Groq',
                  color: 'orange',
                },
                {
                  title: 'Smart Inventory',
                  desc: 'Storage conditions, dosages, expiry management',
                  color: 'green',
                },
              ].map((cap) => (
                <div key={cap.title} className="capability-item">
                  <div className={`capability-dot cap-dot-${cap.color}`} />
                  <div>
                    <p className="capability-title">{cap.title}</p>
                    <p className="capability-desc">{cap.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

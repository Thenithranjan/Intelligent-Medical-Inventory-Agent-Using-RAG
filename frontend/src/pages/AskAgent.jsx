import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, Eraser, Sparkles } from 'lucide-react';
import Header from '../components/Header';
import ChatBubble from '../components/ChatBubble';
import Button from '../components/Button';
import { askAgent } from '../api/client';
import './AskAgent.css';

const SUGGESTIONS = [
  'Give me storage instructions for insulin',
  'Temperature requirements for vaccines',
  'What is the standard dosage for Amoxicillin',
  'What are the PRE-OPERATIVE ASSESSMENT steps in the surgery',
];

export default function AskAgent() {
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Pre-fill from quick question navigation
  useEffect(() => {
    if (location.state?.question) {
      setInput(location.state.question);
      inputRef.current?.focus();
    }
  }, [location.state]);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (question) => {
    const q = (question || input).trim();
    if (!q || loading) return;

    const userMsg = { role: 'user', text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Show typing indicator
    setMessages((prev) => [...prev, { role: 'agent', isTyping: true }]);

    try {
      const res = await askAgent(q);
      setMessages((prev) => {
        const filtered = prev.filter((m) => !m.isTyping);
        return [
          ...filtered,
          {
            role: 'agent',
            text: res.data.answer,
            sources: res.data.sources,
          },
        ];
      });
    } catch (err) {
      setMessages((prev) => {
        const filtered = prev.filter((m) => !m.isTyping);
        return [
          ...filtered,
          {
            role: 'agent',
            text: err?.response?.data?.detail || 'Sorry, something went wrong. Make sure the backend is running and a PDF has been ingested.',
          },
        ];
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setInput('');
  };

  return (
    <>
      <Header title="Ask the Agent" subtitle="AI-powered medical inventory assistant" />

      <div className="page-content ask-page">
        <div className="chat-container glass-card-solid">
          {/* Messages area */}
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="chat-empty">
                <div className="chat-empty-icon">
                  <Sparkles size={48} />
                </div>
                <h3>Ask anything about your medical inventory</h3>
                <p>
                  Your AI assistant uses RAG to search through ingested documents
                  and provide accurate, context-aware answers.
                </p>
                <div className="chat-suggestions">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      className="chat-suggestion-chip"
                      onClick={() => handleSend(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <ChatBubble key={i} {...msg} />
                ))}
                <div ref={chatEndRef} />
              </>
            )}
          </div>

          {/* Input area */}
          <div className="chat-input-area">
            <div className="chat-input-wrapper">
              <textarea
                ref={inputRef}
                className="chat-input"
                placeholder="Type your question…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={loading}
              />
              <div className="chat-input-actions">
                {messages.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    iconOnly
                    icon={<Eraser size={16} />}
                    onClick={clearChat}
                    title="Clear chat"
                  />
                )}
                <Button
                  variant="primary"
                  size="sm"
                  pill
                  iconOnly
                  icon={<Send size={16} />}
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                  loading={loading}
                  title="Send"
                />
              </div>
            </div>
            <p className="chat-disclaimer">
              Responses are generated from your ingested documents. Always verify critical medical information.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

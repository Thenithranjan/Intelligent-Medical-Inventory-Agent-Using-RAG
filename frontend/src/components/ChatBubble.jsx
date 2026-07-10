import { Bot, User } from 'lucide-react';
import './ChatBubble.css';

/**
 * Chat message bubble.
 * @param {'user'|'agent'} role
 * @param {string} text
 * @param {boolean} isTyping — shows typing animation
 * @param {Array} sources — RAG source chunks
 */
export default function ChatBubble({ role, text, isTyping, sources, typingText }) {
  const isAgent = role === 'agent';

  return (
    <div className={`chat-bubble-row ${isAgent ? 'chat-agent' : 'chat-user'}`}>
      <div className={`chat-avatar ${isAgent ? 'chat-avatar-agent' : 'chat-avatar-user'}`}>
        {isAgent ? <Bot size={18} /> : <User size={18} />}
      </div>

      <div className={`chat-bubble ${isAgent ? 'bubble-agent' : 'bubble-user'}`}>
        {isTyping ? (
          <div className="typing-indicator-container" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div className="typing-indicator">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
            {typingText && (
              <span className="typing-status-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', animation: 'pulse 1.5s infinite' }}>
                {typingText}
              </span>
            )}
          </div>
        ) : (
          <>
            <p className="chat-text">{text}</p>
            {sources && sources.length > 0 && (
              <div className="chat-sources">
                <span className="chat-sources-label">Sources</span>
                {sources.map((s, i) => (
                  <div key={i} className="chat-source-item">
                    <span className="chat-source-score">
                      {(s.score * 100).toFixed(0)}%
                    </span>
                    <span className="chat-source-text">{s.chunk.slice(0, 120)}…</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

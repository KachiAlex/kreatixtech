import React, { useState, useEffect, useRef } from 'react';
import { Send, Plus, X, MessageCircle, Trash2, ArrowLeft } from 'lucide-react';
import { chatApi } from '../api';
import { useAuth } from '../auth-context';
import type { ChatConversation, ChatMessage } from '../types';

const Chat: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConv, setActiveConv] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [showNewConv, setShowNewConv] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const msgEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadConversations(); }, []);
  useEffect(() => { if (activeConv) loadMessages(activeConv.id); }, [activeConv]);
  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const loadConversations = async () => {
    try { const data = await chatApi.conversations(); setConversations(data.conversations); } catch (e) { console.error(e); }
  };

  const loadMessages = async (convId: number) => {
    try { const data = await chatApi.messages(convId); setMessages(data.messages); } catch (e) { console.error(e); }
  };

  const handleSend = async () => {
    if (!input.trim() || !activeConv) return;
    const body = input.trim();
    setInput('');
    try {
      await chatApi.sendMessage(activeConv.id, body, user?.email, user?.display_name, 'outbound');
      loadMessages(activeConv.id);
      loadConversations();
    } catch (e) { console.error(e); }
  };

  const handleCreateConv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;
    try {
      await chatApi.createConversation(newEmail, newName);
      setShowNewConv(false);
      setNewEmail('');
      setNewName('');
      loadConversations();
    } catch (e) { console.error(e); }
  };

  const handleDeleteConv = async (id: number) => {
    try { await chatApi.deleteConversation(id); if (activeConv?.id === id) setActiveConv(null); loadConversations(); } catch (e) { console.error(e); }
  };

  const avatarColors = ['#F2782E', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#F59E0B'];
  const getColor = (name: string) => { let h = 0; for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h); return avatarColors[Math.abs(h) % avatarColors.length]; };

  return (
    <div style={{ height: '100%', minHeight: 0, display: 'flex', overflow: 'hidden', position: 'relative' } as any}>
      <div className="chat-mobile-list" style={{ borderRight: '1px solid var(--line)', display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
        <div style={{ padding: '20px 16px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span className="eyebrow">CHAT</span>
            <h1 style={{ margin: 0, fontSize: 20 }}>Conversations</h1>
          </div>
          <button className="icon-btn" onClick={() => setShowNewConv(true)} title="New chat"><Plus /></button>
        </div>
        <div style={{ flex: 1, overflow: 'auto', '-webkit-overflow-scrolling': 'touch' } as any}>
          {conversations.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#999', fontSize: 13 }}>No conversations yet</div>
          ) : (
            conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => setActiveConv(conv)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #efede9', background: activeConv?.id === conv.id ? '#fff7f1' : 'transparent' }}
              >
                <div className="sender-avatar" style={{ background: getColor(conv.participant_name || conv.participant_email), width: 36, height: 36 }}>
                  {(conv.participant_name || conv.participant_email)[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ fontSize: 13, display: 'block' }}>{conv.participant_name || conv.participant_email}</strong>
                  <small style={{ color: 'var(--muted)', fontSize: 11 }}>{conv.last_message || 'No messages yet'}</small>
                </div>
                {conv.unread_count > 0 && <b style={{ fontSize: 11, color: 'var(--orange)' }}>{conv.unread_count}</b>}
                <button className="icon-btn" onClick={(e) => { e.stopPropagation(); handleDeleteConv(conv.id); }} style={{ width: 28, height: 28 }}><Trash2 /></button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className={`chat-mobile-chat${activeConv ? ' show-mobile' : ''}`} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
        {activeConv ? (
          <>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <button className="icon-btn" onClick={() => setActiveConv(null)} style={{ flexShrink: 0 }} title="Back"><ArrowLeft /></button>
              <div className="sender-avatar" style={{ background: getColor(activeConv.participant_name || activeConv.participant_email), width: 32, height: 32 }}>
                {(activeConv.participant_name || activeConv.participant_email)[0].toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <strong style={{ fontSize: 14 }}>{activeConv.participant_name || activeConv.participant_email}</strong>
                <small style={{ display: 'block', color: 'var(--muted)', fontSize: 11 }}>{activeConv.participant_email}</small>
              </div>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '20px', '-webkit-overflow-scrolling': 'touch' } as any}>
              {messages.map(msg => (
                <div key={msg.id} style={{ display: 'flex', justifyContent: msg.direction === 'outbound' ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
                  <div style={{
                    maxWidth: '75%', padding: '10px 14px', borderRadius: 14, fontSize: 14, lineHeight: 1.5,
                    background: msg.direction === 'outbound' ? '#F2782E' : '#f3f1ed',
                    color: msg.direction === 'outbound' ? '#fff' : '#36383c',
                  }}>
                    {msg.body}
                    <div style={{ fontSize: 10, marginTop: 4, opacity: 0.6 }}>{new Date(msg.created_at + (msg.created_at.includes('T') ? '' : 'Z')).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</div>
                  </div>
                </div>
              ))}
              <div ref={msgEndRef} />
            </div>
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--line)', display: 'flex', gap: 8, flexShrink: 0 }}>
              <input
                type="text"
                placeholder="Type a message..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                style={{ flex: 1, height: 40, border: '1px solid var(--line)', borderRadius: 20, padding: '0 16px', fontSize: 14, outline: 'none' }}
              />
              <button className="compose-main" onClick={handleSend} style={{ height: 40, padding: '0 16px' }}><Send style={{ width: 16, height: 16 }} /></button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
            <div style={{ textAlign: 'center' }}>
              <MessageCircle style={{ width: 48, height: 48, margin: '0 auto 12px' }} />
              <p>Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {showNewConv && (
        <>
          <div className="overlay show" onClick={() => setShowNewConv(false)} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 22, background: '#fff', borderRadius: 14, boxShadow: 'var(--shadow)', padding: 28, width: 'min(400px,90vw)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>New Conversation</h2>
              <button className="icon-btn" onClick={() => setShowNewConv(false)}><X /></button>
            </div>
            <form onSubmit={handleCreateConv} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input placeholder="Participant email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required style={{ height: 42, border: '1px solid var(--line)', borderRadius: 8, padding: '0 12px', fontSize: 14 }} />
              <input placeholder="Name (optional)" value={newName} onChange={e => setNewName(e.target.value)} style={{ height: 42, border: '1px solid var(--line)', borderRadius: 8, padding: '0 12px', fontSize: 14 }} />
              <button type="submit" className="compose-main" style={{ height: 40 }}>Start Conversation</button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default Chat;

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Send, Paperclip, FileText, Download, 
  Clock, User, Building2, Shield, CheckCircle, 
  AlertCircle, MoreVertical, X, Loader2, Check, CheckCheck,
  Wifi, WifiOff
} from 'lucide-react';
import { usePortal } from '../../contexts/PortalContext';

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_REVIEW: 'bg-blue-100 text-blue-800',
  APPROVED: 'bg-green-100 text-green-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  REPORTING: 'bg-orange-100 text-orange-800',
  COMPLETE: 'bg-green-100 text-green-800',
  ON_HOLD: 'bg-gray-100 text-gray-800'
};

const statusLabels = {
  PENDING: 'Pending Review',
  IN_REVIEW: 'In Review',
  APPROVED: 'Scope Approved',
  IN_PROGRESS: 'Testing In Progress',
  REPORTING: 'Report Generation',
  COMPLETE: 'Complete',
  ON_HOLD: 'On Hold'
};

export default function AssessmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { apiCall, socket, user, isAdmin } = usePortal();
  
  const [assessment, setAssessment] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [readReceipts, setReadReceipts] = useState({});
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const fetchAssessment = useCallback(async () => {
    try {
      const response = await apiCall(`/api/assessments/${id}`);
      const data = await response.json();
      
      if (response.ok) {
        setAssessment(data);
        setMessages(data.messages || []);
      } else {
        navigate('/portal/dashboard');
      }
    } catch (error) {
      console.error('Failed to fetch assessment:', error);
    } finally {
      setIsLoading(false);
    }
  }, [apiCall, id, navigate]);

  useEffect(() => {
    fetchAssessment();
  }, [fetchAssessment]);

  useEffect(() => {
    if (socket && id) {
      socket.emit('join-assessment', id);
      
      socket.on('new-message', (message) => {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      });

      socket.on('assessment-updated', (updatedAssessment) => {
        setAssessment(prev => ({ ...prev, ...updatedAssessment }));
      });

      socket.on('files-uploaded', (data) => {
        // Refresh messages to show file upload notification
        fetchAssessment();
      });

      socket.on('user-typing', (data) => {
        setTypingUsers(prev => {
          const filtered = prev.filter(u => u.userId !== data.userId);
          return [...filtered, { ...data, timestamp: Date.now() }];
        });
        
        // Clear existing timeout for this user
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        // Auto-remove typing indicator after 3 seconds
        typingTimeoutRef.current = setTimeout(() => {
          setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
        }, 3000);
      });
      
      socket.on('user-stop-typing', (data) => {
        setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
      });
      
      socket.on('user-online', (data) => {
        setOnlineUsers(prev => new Set([...prev, data.userId]));
      });
      
      socket.on('user-offline', (data) => {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
      });
      
      socket.on('user-joined', (data) => {
        // Could show a toast notification
        console.log('User joined:', data);
      });
      
      socket.on('message-read-receipt', (data) => {
        setReadReceipts(prev => ({
          ...prev,
          [data.messageId]: {
            userId: data.userId,
            readAt: data.readAt
          }
        }));
      });
      
      socket.on('connect', () => {
        setConnectionStatus('connected');
      });
      
      socket.on('disconnect', () => {
        setConnectionStatus('disconnected');
      });

      return () => {
        socket.emit('leave-assessment', id);
        socket.off('new-message');
        socket.off('assessment-updated');
        socket.off('files-uploaded');
        socket.off('user-typing');
      };
    }
  }, [socket, id, fetchAssessment]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSending(true);

    try {
      const response = await apiCall('/api/messages', {
        method: 'POST',
        body: JSON.stringify({
          assessmentId: id,
          message: newMessage
        })
      });

      if (response.ok) {
        setNewMessage('');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = () => {
    if (socket) {
      socket.emit('typing', {
        assessmentId: id,
        name: user.name
      });
      
      // Emit stop typing after 2 seconds of no input
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop-typing', { assessmentId: id });
      }, 2000);
    }
  };
  
  const handleMessageRead = (messageId) => {
    if (socket) {
      socket.emit('message-read', {
        assessmentId: id,
        messageId
      });
    }
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    setIsUploading(true);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      const response = await fetch(`http://localhost:5000/api/uploads/assessment/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('portalToken')}`
        },
        body: formData
      });

      if (response.ok) {
        fetchAssessment();
      }
    } catch (error) {
      console.error('Failed to upload files:', error);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      const response = await apiCall(`/api/assessments/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const updated = await response.json();
        setAssessment(updated);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  if (isLoading || !assessment) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offwhite">
      <div className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/portal/dashboard')}
                className="inline-flex items-center text-grey hover:text-ink mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-ink">{assessment.title}</h1>
                <div className="flex items-center text-sm text-grey">
                  <Building2 className="h-4 w-4 mr-1" />
                  {assessment.organization?.name}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[assessment.status]}`}>
                {statusLabels[assessment.status]}
              </span>
              
              {isAdmin && (
                <div className="relative group">
                  <button className="p-2 text-grey hover:text-ink">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-border hidden group-hover:block">
                    <div className="py-1">
                      {Object.entries(statusLabels).map(([status, label]) => (
                        <button
                          key={status}
                          onClick={() => updateStatus(status)}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-offwhite"
                        >
                          Set to: {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-border h-[calc(100vh-200px)] flex flex-col">
              <div className="p-4 border-b border-border bg-offwhite rounded-t-xl">
                <h2 className="font-semibold text-ink">Messages</h2>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <Shield className="h-12 w-12 text-grey mx-auto mb-4" />
                    <p className="text-grey">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === user.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                          message.senderId === user.id
                            ? 'bg-orange text-white'
                            : 'bg-offwhite text-ink'
                        }`}
                      >
                        <div className="flex items-center mb-1 text-xs opacity-75">
                          <span className="font-medium">{message.sender?.name}</span>
                          <span className="mx-2">•</span>
                          <span>{new Date(message.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <p>{message.message}</p>
                        
                        {message.attachments?.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {message.attachments.map(attachment => (
                              <a
                                key={attachment.id}
                                href={`http://localhost:5000${attachment.fileUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center text-xs underline ${
                                  message.senderId === user.id ? 'text-white/80' : 'text-orange'
                                }`}
                              >
                                <FileText className="h-3 w-3 mr-1" />
                                {attachment.fileName}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                
                {typingUsers.length > 0 && (
                  <div className="flex justify-start">
                    <div className="bg-offwhite rounded-2xl px-4 py-2 text-sm text-grey">
                      {typingUsers.map(u => u.name).join(', ')} typing...
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-border">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    multiple
                    className="hidden"
                  />
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="p-3 text-grey hover:text-orange border border-border rounded-xl disabled:opacity-50"
                  >
                    {isUploading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Paperclip className="h-5 w-5" />
                    )}
                  </button>
                  
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleTyping}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-orange focus:border-transparent"
                  />
                  
                  <button
                    type="submit"
                    disabled={isSending || !newMessage.trim()}
                    className="p-3 bg-orange text-white rounded-xl hover:bg-orange-deep disabled:opacity-50"
                  >
                    {isSending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="font-semibold text-ink mb-4">Assessment Details</h3>
              
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-grey">Status</span>
                  <p className="font-medium text-ink mt-1">{statusLabels[assessment.status]}</p>
                </div>
                
                <div>
                  <span className="text-grey">Testing Type</span>
                  <p className="font-medium text-ink mt-1">{assessment.testingType.replace('_', ' ')}</p>
                </div>
                
                <div>
                  <span className="text-grey">Created</span>
                  <p className="font-medium text-ink mt-1">
                    {new Date(assessment.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                {assessment.assignedAdmin && (
                  <div>
                    <span className="text-grey">Assigned To</span>
                    <p className="font-medium text-ink mt-1">{assessment.assignedAdmin.name}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="font-semibold text-ink mb-4">Scope</h3>
              <p className="text-sm text-grey-dark whitespace-pre-wrap">
                {assessment.scopeDescription}
              </p>
            </div>

            {assessment.targetUrls?.length > 0 && (
              <div className="bg-white rounded-xl border border-border p-6">
                <h3 className="font-semibold text-ink mb-4">Target URLs</h3>
                <ul className="space-y-2">
                  {assessment.targetUrls.map((url, index) => (
                    <li key={index} className="text-sm">
                      <a 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-orange hover:underline flex items-center"
                      >
                        <Globe className="h-4 w-4 mr-1" />
                        {url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {assessment.attachments?.length > 0 && (
              <div className="bg-white rounded-xl border border-border p-6">
                <h3 className="font-semibold text-ink mb-4">Attachments</h3>
                <ul className="space-y-2">
                  {assessment.attachments.map((attachment) => (
                    <li key={attachment.id}>
                      <a
                        href={`http://localhost:5000${attachment.fileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-orange hover:underline"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {attachment.fileName}
                        <span className="text-grey ml-2">
                          ({(attachment.fileSize / 1024).toFixed(1)} KB)
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {assessment.specialReqs && (
              <div className="bg-white rounded-xl border border-border p-6">
                <h3 className="font-semibold text-ink mb-4">Special Requirements</h3>
                <p className="text-sm text-grey-dark whitespace-pre-wrap">
                  {assessment.specialReqs}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

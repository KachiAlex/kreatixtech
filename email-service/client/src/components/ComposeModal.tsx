import React, { useState } from 'react';
import { X, Maximize2, Minimize2, Trash2 } from 'lucide-react';

interface ComposeModalProps {
  onClose: () => void;
  onSend: (to: string, subject: string, body: string) => Promise<void>;
}

const ComposeModal: React.FC<ComposeModalProps> = ({ onClose, onSend }) => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await onSend(to, subject, body);
      onClose();
    } catch (error) {
      alert('Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-0 right-16 w-[600px] bg-white rounded-t-xl shadow-2xl flex flex-col z-50 overflow-hidden border border-gray-200">
      <div className="bg-orange-light px-4 py-3 flex items-center justify-between cursor-pointer border-b border-orange/10">
        <span className="text-sm font-bold text-ink">New Message</span>
        <div className="flex items-center gap-2">
          <button className="p-1 hover:bg-gray-200 rounded text-gray-600">
            <Minimize2 className="w-4 h-4" />
          </button>
          <button className="p-1 hover:bg-gray-200 rounded text-gray-600">
            <Maximize2 className="w-4 h-4" />
          </button>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col flex-1">
        <div className="px-4 py-2 border-b border-gray-100 flex items-center gap-2">
          <span className="text-sm text-gray-500 w-8">To</span>
          <input
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="flex-1 outline-none text-sm"
            required
          />
        </div>
        <div className="px-4 py-2 border-b border-gray-100 flex items-center gap-2">
          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="flex-1 outline-none text-sm"
            required
          />
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="flex-1 px-4 py-4 outline-none text-sm min-h-[300px] resize-none"
          required
        />

        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={isSending}
              className="px-6 py-2 bg-orange text-white rounded-full text-sm font-bold hover:bg-orange-deep disabled:opacity-50 transition-colors shadow-sm"
            >
              {isSending ? 'Sending...' : 'Send'}
            </button>
            <div className="flex items-center gap-2 text-gray-500">
                {/* Formatting tools could go here */}
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded text-gray-600">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ComposeModal;

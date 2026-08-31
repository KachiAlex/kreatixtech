import React from 'react';
import { Square, Star, Archive, Trash2, MailOpen, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Email } from '../types';

interface EmailListProps {
  emails: Email[];
  onSelectEmail: (email: Email) => void;
  onDeleteEmail: (id: number) => void;
}

const EmailList: React.FC<EmailListProps> = ({ emails, onSelectEmail, onDeleteEmail }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-white rounded-t-2xl shadow-sm mr-4">
      <div className="flex items-center gap-4 p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-gray-100 rounded text-gray-500">
            <Square className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded text-gray-500">
            <Archive className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded text-gray-500">
            <Trash2 className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded text-gray-500">
            <MailOpen className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded text-gray-500">
            <Clock className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col">
        {emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <p className="text-lg">No emails found.</p>
          </div>
        ) : (
          emails.map((email) => (
            <div
              key={email.id}
              onClick={() => onSelectEmail(email)}
              className={`flex items-center gap-4 px-4 py-2 border-b border-gray-100 cursor-pointer hover:shadow-md transition-shadow group ${
                email.is_read ? 'bg-white text-gray-600' : 'bg-orange-light/20 font-bold text-ink ring-inset ring-l-4 ring-orange'
              }`}
            >
              <div className="flex items-center gap-2 shrink-0">
                <Square className="w-4 h-4 text-gray-300 group-hover:text-gray-400" />
                <Star className="w-4 h-4 text-gray-300 group-hover:text-gray-400" />
              </div>

              <div className="w-1/4 truncate text-sm">
                {email.from_name || email.from_address}
              </div>

              <div className="flex-1 flex items-center gap-2 truncate text-sm">
                <span className="text-gray-900">{email.subject}</span>
                <span className="text-gray-500 font-normal">- {email.text}</span>
              </div>

              <div className="shrink-0 text-xs text-gray-500">
                {format(new Date(email.received_at), 'MMM d')}
              </div>

              <div className="hidden group-hover:flex items-center gap-2 absolute right-8 bg-white/90 pl-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteEmail(email.id);
                  }}
                  className="p-2 hover:bg-gray-100 rounded text-gray-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EmailList;

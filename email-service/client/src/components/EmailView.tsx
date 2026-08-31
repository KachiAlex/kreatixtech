import React from 'react';
import { ArrowLeft, Archive, Trash2, Mail, Clock, MoreVertical, Printer, ExternalLink, CornerUpLeft, CornerUpRight, Star } from 'lucide-react';
import { format } from 'date-fns';
import { Email } from '../types';

interface EmailViewProps {
  email: Email;
  onBack: () => void;
  onDelete: (id: number) => void;
}

const EmailView: React.FC<EmailViewProps> = ({ email, onBack, onDelete }) => {
  return (
    <div className="flex-1 flex flex-col bg-white rounded-t-2xl shadow-sm mr-4 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1">
            <button className="p-2 hover:bg-gray-100 rounded text-gray-500">
              <Archive className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onDelete(email.id)}
              className="p-2 hover:bg-gray-100 rounded text-gray-500"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded text-gray-500">
              <Mail className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded text-gray-500">
              <Clock className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">1 of 10</span>
            <button className="p-2 hover:bg-gray-100 rounded text-gray-500">
                <MoreVertical className="w-4 h-4" />
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl text-gray-800">{email.subject}</h2>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded text-gray-500">
              <Printer className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded text-gray-500">
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {email.from_name ? email.from_name[0] : email.from_address[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">{email.from_name || email.from_address}</span>
                <span className="text-xs text-gray-500">&lt;{email.from_address}&gt;</span>
              </div>
              <div className="text-xs text-gray-500">to me</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {format(new Date(email.received_at), 'MMM d, yyyy, h:mm a')}
            <button className="p-1 hover:bg-gray-100 rounded">
              <Star className="w-4 h-4" />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded">
              <CornerUpLeft className="w-4 h-4" />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
          {email.html ? (
            <div dangerouslySetInnerHTML={{ __html: email.html }} />
          ) : (
            email.text
          )}
        </div>

        <div className="mt-12 flex gap-3">
          <button className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-50 transition-colors">
            <CornerUpLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Reply</span>
          </button>
          <button className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-50 transition-colors">
            <CornerUpRight className="w-4 h-4" />
            <span className="text-sm font-medium">Forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailView;

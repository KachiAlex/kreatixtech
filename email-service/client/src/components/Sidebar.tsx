import React from 'react';
import { Inbox, Star, Clock, Send, File, Trash2, ChevronDown, Plus, Shield } from 'lucide-react';

interface SidebarProps {
  currentFolder: string;
  setCurrentFolder: (folder: string) => void;
  onCompose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentFolder, setCurrentFolder, onCompose }) => {
  const menuItems = [
    { icon: Inbox, label: 'Inbox', id: 'inbox' },
    { icon: Star, label: 'Starred', id: 'starred' },
    { icon: Clock, label: 'Snoozed', id: 'snoozed' },
    { icon: Send, label: 'Sent', id: 'sent' },
    { icon: File, label: 'Drafts', id: 'drafts' },
    { icon: Trash2, label: 'Trash', id: 'trash' },
  ];

  return (
    <div className="w-64 flex flex-col h-full bg-gmail-sidebar p-2 space-y-2">
      <button 
        onClick={onCompose}
        className="flex items-center gap-4 bg-orange hover:bg-orange-deep text-white hover:shadow-lg transition-all px-6 py-4 rounded-2xl w-fit mb-4 mt-2 ml-2 group"
      >
        <Plus className="w-6 h-6 transition-transform group-hover:rotate-90" />
        <span className="font-bold">Compose</span>
      </button>

      <div className="flex flex-col border-b border-gray-200 pb-2 mb-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setCurrentFolder(item.id);
            }}
            className={`flex items-center justify-between px-4 py-2 rounded-full transition-colors ${
              currentFolder === item.id 
                ? 'bg-orange-light font-bold text-orange' 
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon className={`w-5 h-5 ${currentFolder === item.id ? 'fill-current' : ''}`} />
              <span className="text-sm">{item.label}</span>
            </div>
          </button>
        ))}
        
        <button className="flex items-center gap-3 px-4 py-2 hover:bg-gray-200 text-gray-700 rounded-full transition-colors mt-2">
          <ChevronDown className="w-5 h-5" />
          <span className="text-sm">More</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

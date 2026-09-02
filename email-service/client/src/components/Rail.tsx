import React from 'react';
import { Mail, CalendarDays, Users, MessageCircle, File, BriefcaseBusiness } from 'lucide-react';

export type ViewType = 'mail' | 'calendar' | 'contacts' | 'chat' | 'files';

interface RailProps {
  current: ViewType;
  onChange: (view: ViewType) => void;
}

const Rail: React.FC<RailProps> = ({ current, onChange }) => {
  const items: { type: ViewType; icon: React.ElementType; label: string }[] = [
    { type: 'mail', icon: Mail, label: 'Mail' },
    { type: 'calendar', icon: CalendarDays, label: 'Calendar' },
    { type: 'contacts', icon: Users, label: 'Contacts' },
    { type: 'chat', icon: MessageCircle, label: 'Chat' },
    { type: 'files', icon: File, label: 'Files' },
  ];

  return (
    <aside className="rail">
      <div className="rail-group">
        {items.map(item => (
          <button
            key={item.type}
            className={`icon-btn ${current === item.type ? 'active' : ''}`}
            title={item.label}
            onClick={() => onChange(item.type)}
          >
            <item.icon />
          </button>
        ))}
      </div>
      <button className="icon-btn" title="Work">
        <BriefcaseBusiness />
      </button>
    </aside>
  );
};

export default Rail;

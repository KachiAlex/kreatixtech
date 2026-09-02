import React, { useState, useEffect } from 'react';
import { Search, Mail } from 'lucide-react';
import { contactApi } from '../api';
import type { Contact } from '../types';

const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => { loadContacts(); }, []);

  const loadContacts = async (q?: string) => {
    try {
      const data = await contactApi.list(q);
      setContacts(data.contacts);
    } catch (e) { console.error(e); }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    loadContacts(e.target.value);
  };

  const avatarColors = ['#F2782E', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#F59E0B'];
  const getColor = (name: string) => { let h = 0; for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h); return avatarColors[Math.abs(h) % avatarColors.length]; };

  return (
    <div style={{ height: '100%' }}>
      <div style={{ marginBottom: 24 }}>
        <span className="eyebrow">CONTACTS</span>
        <h1 style={{ margin: 0, fontSize: 28, letterSpacing: '-.03em' }}>All Contacts</h1>
      </div>

      <div className="search" style={{ maxWidth: 420, marginBottom: 24 }}>
        <Search />
        <input type="text" placeholder="Search contacts" value={search} onChange={handleSearch} />
      </div>

      {contacts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, color: '#999' }}>
          <Mail style={{ width: 48, height: 48, margin: '0 auto 12px' }} />
          <p>No contacts found</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, maxWidth: 900 }}>
          {contacts.map(c => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, border: '1px solid var(--line)', borderRadius: 12, background: '#fbfaf8' }}>
              <div className="sender-avatar" style={{ background: getColor(c.display_name || c.email) }}>
                {(c.display_name || c.email)[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ fontSize: 14, display: 'block' }}>{c.display_name || c.email}</strong>
                <small style={{ color: 'var(--muted)', fontSize: 12 }}>{c.email}</small>
                <small style={{ color: 'var(--muted)', fontSize: 11, display: 'block', marginTop: 2 }}>{c.contact_count} conversations</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Contacts;

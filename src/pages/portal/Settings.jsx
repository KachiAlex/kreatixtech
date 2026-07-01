import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Building2 } from 'lucide-react';
import { usePortal } from '../../contexts/PortalContext';
import Logo from '../../components/Logo';

export default function Settings() {
  const { user, apiCall, logout } = usePortal();
  const navigate = useNavigate();
  const backPath = user?.role === 'ADMIN' ? '/portal/admin' : '/portal/dashboard';

  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);
  const [pwMsg, setPwMsg] = useState(null);

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true); setProfileMsg(null);
    try {
      const payload = {};
      if (profileForm.name !== user.name) payload.name = profileForm.name;
      if (profileForm.email !== user.email) payload.email = profileForm.email;
      if (!Object.keys(payload).length) { setProfileMsg({ ok: false, text: 'No changes to save.' }); setProfileSaving(false); return; }
      const r = await apiCall('/api/auth/profile', { method: 'PATCH', body: JSON.stringify(payload) });
      const data = await r.json();
      if (r.ok) {
        localStorage.setItem('portalToken', data.token);
        setProfileMsg({ ok: true, text: 'Profile updated. Please refresh if your name does not update.' });
      } else {
        setProfileMsg({ ok: false, text: data.error || 'Update failed' });
      }
    } catch { setProfileMsg({ ok: false, text: 'Network error' }); }
    finally { setProfileSaving(false); }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setPwMsg(null);
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwMsg({ ok: false, text: 'Passwords do not match' }); return; }
    setPwSaving(true);
    try {
      const r = await apiCall('/api/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
      });
      const data = await r.json();
      if (r.ok) {
        localStorage.setItem('portalToken', data.token);
        setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPwMsg({ ok: true, text: 'Password changed successfully.' });
      } else {
        setPwMsg({ ok: false, text: data.error || 'Update failed' });
      }
    } catch { setPwMsg({ ok: false, text: 'Network error' }); }
    finally { setPwSaving(false); }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F2]">
      <nav className="bg-[#0E0E0F] text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <button onClick={() => navigate(backPath)} className="p-2 text-white/60 hover:text-white flex-shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <Logo size="sm" linkTo={null} className="text-white" />
          <span className="text-sm font-semibold text-white/60 ml-1">Account Settings</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── Organisation info (read-only) ── */}
        <div className="bg-white rounded-2xl border border-[#E8E5E0] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-5 w-5 text-[#F2782E]" />
            <h2 className="text-base font-bold text-[#0E0E0F]">Organisation</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-[#6B6F76] mb-1">Name</p>
              <p className="text-sm font-medium text-[#0E0E0F]">{user?.organization?.name || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#6B6F76] mb-1">Subdomain</p>
              <p className="text-sm font-medium text-[#0E0E0F]">{user?.organization?.subdomain || '—'}.portal.kreatixtech.com</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#6B6F76] mb-1">Your Role</p>
              <span className="inline-block px-2.5 py-0.5 bg-[#F2782E]/10 text-[#F2782E] text-xs font-bold rounded-full">{user?.role}</span>
            </div>
          </div>
        </div>

        {/* ── Profile info ── */}
        <div className="bg-white rounded-2xl border border-[#E8E5E0] p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-[#F2782E]" />
            <h2 className="text-base font-bold text-[#0E0E0F]">Profile</h2>
          </div>
          {profileMsg && (
            <div className={`mb-4 flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${profileMsg.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {profileMsg.ok ? <CheckCircle className="h-4 w-4 flex-shrink-0" /> : <AlertCircle className="h-4 w-4 flex-shrink-0" />}
              {profileMsg.text}
            </div>
          )}
          <form onSubmit={saveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#0E0E0F] mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6F76]" />
                <input
                  value={profileForm.name}
                  onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                  required minLength={2}
                  className="w-full pl-9 pr-3 py-2.5 border border-[#E8E5E0] rounded-xl text-sm focus:ring-2 focus:ring-[#F2782E] focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0E0E0F] mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6F76]" />
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))}
                  required
                  className="w-full pl-9 pr-3 py-2.5 border border-[#E8E5E0] rounded-xl text-sm focus:ring-2 focus:ring-[#F2782E] focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={profileSaving}
                className="px-5 py-2.5 bg-[#F2782E] text-white text-sm font-bold rounded-xl hover:bg-[#D9601A] disabled:opacity-50 transition-colors">
                {profileSaving ? 'Saving…' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>

        {/* ── Change Password ── */}
        <div className="bg-white rounded-2xl border border-[#E8E5E0] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="h-5 w-5 text-[#F2782E]" />
            <h2 className="text-base font-bold text-[#0E0E0F]">Change Password</h2>
          </div>
          {pwMsg && (
            <div className={`mb-4 flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${pwMsg.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {pwMsg.ok ? <CheckCircle className="h-4 w-4 flex-shrink-0" /> : <AlertCircle className="h-4 w-4 flex-shrink-0" />}
              {pwMsg.text}
            </div>
          )}
          <form onSubmit={savePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#0E0E0F] mb-1.5">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6F76]" />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={pwForm.currentPassword}
                  onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
                  required
                  className="w-full pl-9 pr-10 py-2.5 border border-[#E8E5E0] rounded-xl text-sm focus:ring-2 focus:ring-[#F2782E] focus:border-transparent"
                />
                <button type="button" onClick={() => setShowCurrent(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6F76]">
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0E0E0F] mb-1.5">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6F76]" />
                <input
                  type={showNew ? 'text' : 'password'}
                  value={pwForm.newPassword}
                  onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                  required minLength={6}
                  className="w-full pl-9 pr-10 py-2.5 border border-[#E8E5E0] rounded-xl text-sm focus:ring-2 focus:ring-[#F2782E] focus:border-transparent"
                />
                <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6F76]">
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0E0E0F] mb-1.5">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6F76]" />
                <input
                  type={showNew ? 'text' : 'password'}
                  value={pwForm.confirmPassword}
                  onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
                  required minLength={6}
                  className="w-full pl-9 pr-3 py-2.5 border border-[#E8E5E0] rounded-xl text-sm focus:ring-2 focus:ring-[#F2782E] focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={pwSaving}
                className="px-5 py-2.5 bg-[#0E0E0F] text-white text-sm font-bold rounded-xl hover:bg-[#F2782E] disabled:opacity-50 transition-colors">
                {pwSaving ? 'Updating…' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>

        {/* ── Danger zone ── */}
        <div className="bg-white rounded-2xl border border-red-100 p-6">
          <h2 className="text-base font-bold text-red-600 mb-3">Sign Out</h2>
          <p className="text-sm text-[#6B6F76] mb-4">You will be redirected to the login page.</p>
          <button
            onClick={() => { logout(); navigate('/portal/login'); }}
            className="px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 text-sm font-bold rounded-xl hover:bg-red-100 transition-colors">
            Sign Out
          </button>
        </div>

      </div>
    </div>
  );
}


import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { 
  Link as LinkIcon, 
  FileText, 
  StickyNote, 
  Settings, 
  LogOut,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import Links from './Links';
import Docs from './Docs';
import Memos from './Memos';
import SettingsPanel from './Settings';

type Section = 'links' | 'docs' | 'memo' | 'settings';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [activeSection, setActiveSection] = useState<Section>('links');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const navItems = [
    { id: 'links', label: 'Links', icon: LinkIcon },
    { id: 'docs', label: 'Docs', icon: FileText },
    { id: 'memo', label: 'Memo', icon: StickyNote },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'links': return <Links />;
      case 'docs': return <Docs />;
      case 'memo': return <Memos />;
      case 'settings': return <SettingsPanel userEmail={user.email} />;
      default: return <Links />;
    }
  };

  const userInitial = user.email ? user.email.charAt(0).toUpperCase() : '?';

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="font-bold text-xl tracking-tight">Portal Hub</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as Section)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                activeSection === item.id 
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </div>
              {activeSection === item.id && <ChevronRight className="w-4 h-4" />}
            </button>
          ))}
        </nav>

        <div className="p-4 space-y-2 border-t border-slate-100">
          <button
            onClick={() => setActiveSection('settings')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
              activeSection === 'settings' 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Nav Top */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg">Portal Hub</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg"
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-40 pt-20 px-6">
          <div className="space-y-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id as Section);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-4 p-4 rounded-xl text-lg font-medium ${
                  activeSection === item.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
                }`}
              >
                <item.icon className="w-6 h-6" />
                {item.label}
              </button>
            ))}
            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setActiveSection('settings');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-4 p-4 rounded-xl text-lg font-medium ${
                  activeSection === 'settings' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
                }`}
              >
                <Settings className="w-6 h-6" />
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 p-4 rounded-xl text-lg font-medium text-red-500"
              >
                <LogOut className="w-6 h-6" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col pt-16 md:pt-0 overflow-hidden">
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200">
          <h2 className="text-xl font-bold capitalize text-slate-800">{activeSection}</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-500">{user.email}</span>
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm">
              {userInitial}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

const ShieldCheck: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
);

export default Dashboard;


import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Shield, Key, AlertCircle, CheckCircle2, Lock } from 'lucide-react';

interface SettingsProps {
  userEmail: string | undefined;
}

const Settings: React.FC<SettingsProps> = ({ userEmail }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userEmail) return;
    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      // Verify old password
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: oldPassword,
      });

      if (authError) {
        throw new Error("Old password is incorrect.");
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({ 
        password: newPassword 
      });

      if (updateError) throw updateError;

      setStatus({ type: 'success', message: 'Password updated successfully.' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Update failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-8 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-slate-800">Security Settings</h2>
          </div>
          <p className="text-slate-500">Update your security credentials for {userEmail}.</p>
        </div>

        <form onSubmit={handleUpdatePassword} className="p-8 space-y-6">
          {status && (
            <div className={`flex items-center gap-3 p-4 rounded-2xl border ${
              status.type === 'success' 
                ? 'bg-green-50 border-green-100 text-green-700' 
                : 'bg-red-50 border-red-100 text-red-700'
            }`}>
              {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="text-sm font-medium">{status.message}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Old Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Verify old password"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">New Password</label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Enter new password"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Confirm New Password</label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Repeat new password"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 active:scale-95"
            >
              {loading ? 'Verifying...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;

import React, { useState } from 'react';
import { GraduationCap, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../lib/auth';

export const LoginView: React.FC = () => {
  const { signIn, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const { error } = await signIn(email.trim(), password);
      if (error) {
        setErrorMsg(error.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during sign in');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-xl bg-[#1C1C1C] border border-[#2A2A2A] items-center justify-center text-[#F0F0F0] mb-2 shadow-sm">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F5F5F5]">StudyOS</h1>
          <p className="text-xs sm:text-sm text-[#8C8C8C]">
            Private academic management workspace
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#181818] rounded-xl border border-[#262626] p-6 sm:p-8 space-y-6 shadow-xl">
          {!isConfigured && (
            <div className="p-3.5 rounded-lg bg-[#241719] border border-[#3B1C1F] text-[#E06C75] text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold block">Supabase credentials needed</span>
                <span className="text-[#D88C94] leading-relaxed block">
                  Please add <code className="font-mono bg-[#181012] px-1 py-0.5 rounded">PUBLIC_SUPABASE_URL</code> and <code className="font-mono bg-[#181012] px-1 py-0.5 rounded">PUBLIC_SUPABASE_ANON_KEY</code> to your <code className="font-mono">.env</code> file.
                </span>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-lg bg-[#241719] border border-[#3B1C1F] text-[#E06C75] text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#A3A3A3] mb-1.5 font-mono">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#606060]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="your.email@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-[#141414] border border-[#282828] text-[#F5F5F5] placeholder-[#555555] text-sm focus:outline-none focus:border-[#4A4A4A] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A3A3A3] mb-1.5 font-mono">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#606060]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-[#141414] border border-[#282828] text-[#F5F5F5] placeholder-[#555555] text-sm focus:outline-none focus:border-[#4A4A4A] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !isConfigured}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#EAEAEA] hover:bg-white disabled:bg-[#222222] disabled:text-[#606060] text-[#121212] text-xs font-semibold tracking-wide transition-colors mt-2"
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
              {!isSubmitting && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </form>

          <div className="pt-4 border-t border-[#242424] text-center">
            <p className="text-[11px] font-mono text-[#606060]">
              Personal system. Public registration is closed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

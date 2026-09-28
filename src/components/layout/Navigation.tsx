import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  BookOpen, 
  RotateCw, 
  Clock, 
  Plus, 
  Menu, 
  X, 
  GraduationCap,
  LogOut
} from 'lucide-react';
import { useStudyOS } from '../../lib/storage';
import { useAuth } from '../../lib/auth';

interface NavigationProps {
  currentPath: string;
  onOpenQuickCapture?: () => void;
}

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Subjects', href: '/subjects', icon: BookOpen },
  { name: 'Revision', href: '/revision', icon: RotateCw },
  { name: 'Study Log', href: '/study-log', icon: Clock },
];

export const Navigation: React.FC<NavigationProps> = ({ currentPath, onOpenQuickCapture }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { activeSemester } = useStudyOS();
  const { user, signOut } = useAuth();

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="lg:hidden flex items-center justify-between px-5 py-4 bg-[#161616] border-b border-[#242424] sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#202020] border border-[#2E2E2E] flex items-center justify-center text-[#F0F0F0]">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <div className="font-medium text-[#F0F0F0] text-sm tracking-tight">StudyOS</div>
            {activeSemester && (
              <p className="text-[11px] text-[#8C8C8C] truncate max-w-[180px]" suppressHydrationWarning>
                {activeSemester.name}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenQuickCapture && (
            <button
              onClick={onOpenQuickCapture}
              className="p-2 rounded bg-[#222222] text-[#F0F0F0] hover:bg-[#2A2A2A] border border-[#2E2E2E] transition-colors"
              title="Quick Capture"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded text-[#A3A3A3] hover:text-white hover:bg-[#222222] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Slide-down Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[65px] bg-[#161616] border-b border-[#242424] z-30 p-5 space-y-1.5 shadow-2xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.href || (item.href !== '/' && currentPath.startsWith(item.href));
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded text-sm transition-colors ${
                  isActive
                    ? 'bg-[#222222] text-white font-medium border border-[#2E2E2E]'
                    : 'text-[#A3A3A3] hover:text-white hover:bg-[#1E1E1E]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#707070]'}`} />
                <span>{item.name}</span>
              </a>
            );
          })}
          <div className="pt-4 mt-3 border-t border-[#242424] flex items-center justify-between text-xs text-[#707070]">
            <span className="truncate max-w-[200px] font-mono text-[11px] text-[#A3A3A3]">
              {user?.email || 'StudyOS Private'}
            </span>
            {user && (
              <button
                onClick={() => signOut()}
                className="text-[#707070] hover:text-[#E06C75] flex items-center gap-1.5 font-mono text-xs transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            )}
          </div>
        </div>
      )}

      {/* Desktop Spacious Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-[#161616] border-r border-[#242424] min-h-screen sticky top-0 select-none">
        {/* Brand & Active Semester */}
        <div className="p-6 border-b border-[#242424]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#202020] border border-[#2E2E2E] flex items-center justify-center text-[#F0F0F0]">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold tracking-tight text-white text-base">StudyOS</div>
              <p className="text-xs text-[#808080]">Academic Workspace</p>
            </div>
          </div>

          <div className="mt-5 p-3 rounded bg-[#1B1B1B] border border-[#262626]">
            <div className="text-[11px] uppercase tracking-wider text-[#707070] font-mono flex items-center justify-between">
              <span>Active Semester</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#7EBA8C]"></span>
            </div>
            <div className="text-xs font-medium text-[#E0E0E0] mt-1.5 truncate" suppressHydrationWarning title={activeSemester?.name}>
              {activeSemester ? activeSemester.name : 'No active semester'}
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-5 px-3.5 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-medium text-[#707070] tracking-wider uppercase font-mono">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.href || (item.href !== '/' && currentPath.startsWith(item.href));
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded text-sm transition-all ${
                  isActive
                    ? 'bg-[#222222] text-white font-medium border border-[#2E2E2E]'
                    : 'text-[#9E9E9E] hover:text-white hover:bg-[#1B1B1B]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#707070]'}`} />
                  <span>{item.name}</span>
                </div>
                {isActive && (
                  <span className="text-[#808080] font-mono text-xs font-light">›</span>
                )}
              </a>
            );
          })}
        </div>

        {/* Quick Capture Button */}
        {onOpenQuickCapture && (
          <div className="px-4 pb-4">
            <button
              onClick={onOpenQuickCapture}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded bg-[#EAEAEA] hover:bg-white text-[#121212] text-xs font-semibold tracking-wide transition-all shadow-none"
            >
              <Plus className="w-4 h-4" />
              <span>Quick Capture</span>
            </button>
          </div>
        )}

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-[#242424] bg-[#141414] text-xs text-[#707070] flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <span className="font-mono text-[11px] block truncate text-[#A3A3A3]" title={user?.email || 'Not signed in'}>
              {user?.email || 'StudyOS Private'}
            </span>
          </div>
          {user && (
            <button
              onClick={() => signOut()}
              title="Sign out of StudyOS"
              className="hover:text-[#E06C75] text-[#707070] p-1.5 rounded hover:bg-[#202020] transition-colors shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

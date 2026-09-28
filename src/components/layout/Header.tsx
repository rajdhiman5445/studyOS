import React from 'react';
import { Plus, Calendar, BookOpen } from 'lucide-react';
import { useStudyOS } from '../../lib/storage';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onOpenQuickCapture?: () => void;
  actions?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onOpenQuickCapture,
  actions,
}) => {
  const { activeSemester } = useStudyOS();

  const todayFormatted = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-[#242424] mb-8">
      <div>
        <div className="flex flex-wrap items-center gap-3.5">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#F5F5F5]">{title}</h1>
          {activeSemester && (
            <a
              href="/subjects"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono text-[#A3A3A3] hover:text-[#FFFFFF] bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#383838] transition-colors"
              title="Click to view course structure"
            >
              <BookOpen className="w-3 h-3 text-[#707070]" />
              <span>{activeSemester.name}</span>
            </a>
          )}
        </div>
        {subtitle && <p className="text-sm sm:text-base text-[#9E9E9E] mt-1.5 font-normal leading-relaxed">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded bg-[#1A1A1A] border border-[#2A2A2A] text-xs text-[#9E9E9E] font-mono">
          <Calendar className="w-3.5 h-3.5 text-[#707070]" />
          <span>{todayFormatted}</span>
        </div>

        {actions}

        {onOpenQuickCapture && (
          <button
            onClick={onOpenQuickCapture}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-[#EAEAEA] hover:bg-white text-[#121212] text-xs font-semibold tracking-wide transition-all shadow-none"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Quick Capture</span>
          </button>
        )}
      </div>
    </div>
  );
};

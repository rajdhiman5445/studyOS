import React from 'react';
import type { Subject } from '../../types';

interface SubjectBadgeProps {
  subject?: Subject;
  showName?: boolean;
  className?: string;
  fallbackText?: string;
}

export const SubjectBadge: React.FC<SubjectBadgeProps> = ({
  subject,
  showName = false,
  className = '',
  fallbackText = 'General',
}) => {
  if (!subject) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-mono px-2 py-0.5 rounded font-medium bg-[#141414] text-[#808080] border border-[#242424] ${className}`}
      >
        {fallbackText}
      </span>
    );
  }

  const color = subject.color || '#3B82F6';

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-mono px-2 py-0.5 rounded font-medium bg-[#141414] text-[#D8D8D8] border transition-colors ${className}`}
      style={{
        borderColor: `${color}40`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{
          backgroundColor: color,
          boxShadow: `0 0 5px ${color}60`,
        }}
      />
      <span className="truncate">
        {showName ? `${subject.code} • ${subject.name}` : subject.code}
      </span>
    </span>
  );
};

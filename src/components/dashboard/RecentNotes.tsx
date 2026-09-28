import React from 'react';
import { Plus } from 'lucide-react';
import { useStudyOS } from '../../lib/storage';
import { getSubjectById } from '../../lib/utils';
import { SubjectBadge } from '../common/SubjectBadge';

export const RecentNotes: React.FC<{ onOpenQuickCapture?: () => void }> = ({ onOpenQuickCapture }) => {
  const { data } = useStudyOS();

  return (
    <section className="bg-[#181818] rounded-xl border border-[#262626] p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#242424]">
        <div>
          <h2 className="text-base sm:text-lg font-semibold tracking-tight text-[#F5F5F5]">
            Quick Notes & Inquiries
          </h2>
          <p className="text-xs sm:text-sm text-[#8C8C8C] mt-0.5">Observations and lab questions</p>
        </div>

        {onOpenQuickCapture && (
          <button
            onClick={onOpenQuickCapture}
            className="text-xs text-[#A3A3A3] hover:text-white flex items-center gap-1.5 font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Note</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {data.quickNotes.length === 0 ? (
          <p className="text-sm text-[#707070] py-3 text-center">
            No notes captured yet.
          </p>
        ) : (
          data.quickNotes.slice(0, 4).map((note) => {
            const subject = note.subjectId ? getSubjectById(data.subjects, note.subjectId) : undefined;
            return (
              <div
                key={note.id}
                className="p-4 rounded-lg bg-[#1E1E1E] border border-[#262626] text-sm text-[#E0E0E0] space-y-2.5"
              >
                <p className="leading-relaxed whitespace-pre-wrap">{note.content}</p>
                <div className="flex items-center justify-between pt-2 border-t border-[#262626] text-xs text-[#707070] font-mono">
                  <SubjectBadge subject={subject} fallbackText="General" />
                  <span>{new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

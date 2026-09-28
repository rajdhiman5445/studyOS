import React from 'react';
import { ExternalLink, BookOpen, CheckCircle, ArrowUpRight } from 'lucide-react';
import { useStudyOS } from '../../lib/storage';
import { getSubjectById, getTodayDateString, confidenceConfig } from '../../lib/utils';
import { SubjectBadge } from '../common/SubjectBadge';
import type { Topic } from '../../types';

export const RevisionDue: React.FC = () => {
  const { data, activeSubjects, updateTopic } = useStudyOS();
  const today = getTodayDateString();

  const activeSubjectIds = new Set(activeSubjects.map((s) => s.id));
  const dueTopics = data.topics.filter((topic) => {
    if (!activeSubjectIds.has(topic.subjectId)) return false;
    const isDueByDate = topic.nextReviewDate ? topic.nextReviewDate <= today : false;
    const isNeedsAttention = topic.confidence === 'needs_practice' || topic.confidence === 'learning';
    return isDueByDate || isNeedsAttention;
  });

  const handleMarkReviewed = (topic: Topic) => {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 4);
    const y = nextDate.getFullYear();
    const m = String(nextDate.getMonth() + 1).padStart(2, '0');
    const d = String(nextDate.getDate()).padStart(2, '0');

    updateTopic({
      ...topic,
      lastReviewedDate: today,
      nextReviewDate: `${y}-${m}-${d}`,
      confidence: topic.confidence === 'needs_practice' ? 'learning' : topic.confidence,
    });
  };

  return (
    <section className="bg-[#181818] rounded-xl border border-[#262626] p-4 sm:p-6 space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#242424]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-[#F5F5F5]">
              Revision Due
            </h2>
            {dueTopics.length > 0 && (
              <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-[#241E17] text-[#D19A66] border border-[#3D2C1C]">
                {dueTopics.length} due
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#8C8C8C] mt-0.5">Spaced repetition queue</p>
        </div>

        <a
          href="/revision"
          className="text-xs text-[#A3A3A3] hover:text-white flex items-center gap-1 font-medium transition-colors"
        >
          <span>All Topics</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* List */}
      <div className="space-y-3">
        {dueTopics.length === 0 ? (
          <div className="py-8 text-center text-[#707070]">
            <p className="text-sm">All topics are currently fresh and up to date.</p>
          </div>
        ) : (
          dueTopics.slice(0, 4).map((topic) => {
            const subject = getSubjectById(data.subjects, topic.subjectId);
            const conf = confidenceConfig[topic.confidence];

            return (
              <div
                key={topic.id}
                className="p-4 rounded-lg bg-[#1E1E1E] border border-[#262626] hover:border-[#363636] transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {subject && <SubjectBadge subject={subject} />}

                    <span className={`text-xs font-mono px-2 py-0.5 rounded border ${conf.badgeClass}`}>
                      {conf.label}
                    </span>

                    {topic.handbookUrl && (
                      <a
                        href={topic.handbookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-mono text-[#A3A3A3] hover:text-white bg-[#141414] px-2 py-0.5 rounded border border-[#282828] transition-colors"
                        title="Open notes in academic handbook"
                      >
                        <BookOpen className="w-3 h-3 text-[#707070]" />
                        <span>Handbook</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </a>
                    )}
                  </div>

                  <h3 className="text-[15px] font-medium text-[#F5F5F5] leading-snug">
                    {topic.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => handleMarkReviewed(topic)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-[#A3A3A3] hover:text-white bg-[#161616] hover:bg-[#242424] border border-[#2A2A2A] transition-colors font-mono"
                    title="Mark reviewed today"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-[#7EBA8C]" />
                    <span>Reviewed</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

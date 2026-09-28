import React, { useState } from 'react';
import { 
  CheckCircle, 
  Filter, 
  BookOpen,
  ExternalLink
} from 'lucide-react';
import { Header } from '../layout/Header';
import { useStudyOS } from '../../lib/storage';
import { confidenceConfig, getSubjectById, getTodayDateString, formatDateLabel } from '../../lib/utils';
import { SubjectBadge } from '../common/SubjectBadge';
import type { ConfidenceLevel, Topic } from '../../types';

export const RevisionView: React.FC = () => {
  const { data, activeSubjects, updateTopic } = useStudyOS();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'board' | 'list'>('board');
  const today = getTodayDateString();

  const activeSubjectIds = new Set(activeSubjects.map((s) => s.id));

  // Filter topics for active semester subjects
  const semesterTopics = data.topics.filter((t) => {
    if (!activeSubjectIds.has(t.subjectId)) return false;
    if (selectedSubjectId !== 'all' && t.subjectId !== selectedSubjectId) return false;
    return true;
  });

  const confidentCount = semesterTopics.filter((t) => t.confidence === 'confident').length;
  const needsPracticeCount = semesterTopics.filter((t) => t.confidence === 'needs_practice').length;
  const learningCount = semesterTopics.filter((t) => t.confidence === 'learning').length;
  const notStudiedCount = semesterTopics.filter((t) => t.confidence === 'not_studied').length;

  const handleUpdateConfidence = (topic: Topic, newConfidence: ConfidenceLevel) => {
    updateTopic({
      ...topic,
      confidence: newConfidence,
    });
  };

  const handleReviewToday = (topic: Topic) => {
    const nextDate = new Date();
    const daysToAdd = topic.confidence === 'confident' ? 14 : topic.confidence === 'learning' ? 5 : 2;
    nextDate.setDate(nextDate.getDate() + daysToAdd);
    const y = nextDate.getFullYear();
    const m = String(nextDate.getMonth() + 1).padStart(2, '0');
    const d = String(nextDate.getDate()).padStart(2, '0');

    updateTopic({
      ...topic,
      lastReviewedDate: today,
      nextReviewDate: `${y}-${m}-${d}`,
    });
  };

  const confidenceColumns: { level: ConfidenceLevel; title: string; count: number; desc: string }[] = [
    { level: 'not_studied', title: 'Not Studied', count: notStudiedCount, desc: 'Unread syllabus concepts' },
    { level: 'learning', title: 'Learning', count: learningCount, desc: 'Actively processing equations' },
    { level: 'needs_practice', title: 'Needs Practice', count: needsPracticeCount, desc: 'Derivation weakness' },
    { level: 'confident', title: 'Confident', count: confidentCount, desc: 'Validated conceptual recall' },
  ];

  return (
    <div className="space-y-8">
      <Header
        title="Revision & Mastery"
        subtitle="Track subject comprehension and spaced review intervals"
      />

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {confidenceColumns.map((col) => {
          const cfg = confidenceConfig[col.level];
          return (
            <div key={col.level} className="p-4 rounded-xl bg-[#181818] border border-[#262626]">
              <div className="flex items-center justify-between text-xs text-[#8C8C8C] font-mono">
                <span>{col.title}</span>
                <span className={`px-2 py-0.5 rounded border text-[10px] ${cfg.badgeClass}`}>
                  {col.count}
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-semibold text-[#F5F5F5] mt-2 font-mono">{col.count}</div>
              <p className="text-xs text-[#707070] mt-1 font-normal">{col.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Filter and View Toggle */}
      <div className="bg-[#181818] p-4 rounded-xl border border-[#262626] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-[#8C8C8C] font-mono">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#141414] border border-[#2A2A2A] text-[#F0F0F0] text-xs focus:outline-none focus:border-[#4A4A4A]"
          >
            <option value="all">All Active Subjects ({semesterTopics.length} topics)</option>
            {activeSubjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.code} - {sub.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 bg-[#141414] p-1 rounded-lg border border-[#262626] text-xs">
          <button
            onClick={() => setActiveTab('board')}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              activeTab === 'board' ? 'bg-[#262626] text-white font-medium border border-[#363636]' : 'text-[#808080] hover:text-[#C0C0C0]'
            }`}
          >
            Board
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              activeTab === 'list' ? 'bg-[#262626] text-white font-medium border border-[#363636]' : 'text-[#808080] hover:text-[#C0C0C0]'
            }`}
          >
            List
          </button>
        </div>
      </div>

      {/* View Content */}
      {activeTab === 'board' ? (
        /* Board / Column View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
          {confidenceColumns.map((col) => {
            const topicsInCol = semesterTopics.filter((t) => t.confidence === col.level);
            const cfg = confidenceConfig[col.level];

            return (
              <div
                key={col.level}
                className="bg-[#181818] rounded-xl border border-[#262626] flex flex-col min-h-[380px]"
              >
                {/* Column Header */}
                <div className="p-4 border-b border-[#242424] bg-[#1A1A1A] flex items-center justify-between">
                  <span className="text-sm font-semibold tracking-tight text-[#F5F5F5]">{col.title}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${cfg.badgeClass}`}>
                    {topicsInCol.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="p-3.5 space-y-3 flex-1">
                  {topicsInCol.length === 0 ? (
                    <div className="h-28 flex items-center justify-center text-center text-[#505050] text-xs">
                      No topics
                    </div>
                  ) : (
                    topicsInCol.map((topic) => {
                      const subject = getSubjectById(data.subjects, topic.subjectId);
                      const isDue = topic.nextReviewDate && topic.nextReviewDate <= today;

                      return (
                        <div
                          key={topic.id}
                          className="p-3.5 rounded-lg bg-[#1E1E1E] border border-[#282828] hover:border-[#383838] transition-all space-y-2.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            {subject && <SubjectBadge subject={subject} />}

                            {isDue && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#241E17] text-[#D19A66] border border-[#3D2C1C]">
                                Due Today
                              </span>
                            )}
                          </div>

                          <h4 className="text-sm sm:text-[14.5px] font-medium text-[#F5F5F5] leading-snug">
                            {topic.title}
                          </h4>

                          {/* Handbook link badge if present */}
                          {topic.handbookUrl && (
                            <a
                              href={topic.handbookUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-mono text-[#A3A3A3] hover:text-white bg-[#141414] px-2 py-1 rounded border border-[#282828] transition-colors"
                              title="Open academic handbook note"
                            >
                              <BookOpen className="w-3 h-3 text-[#707070]" />
                              <span>Handbook Notes</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                            </a>
                          )}

                          {/* Dates */}
                          <div className="pt-2 border-t border-[#242424] text-xs font-mono text-[#8C8C8C] space-y-1">
                            {topic.lastReviewedDate && (
                              <div>Last: {formatDateLabel(topic.lastReviewedDate)}</div>
                            )}
                            {topic.nextReviewDate && (
                              <div className={isDue ? 'text-[#D19A66] font-medium' : ''}>
                                Next: {formatDateLabel(topic.nextReviewDate)}
                              </div>
                            )}
                          </div>

                          {/* Actions: Confidence & Quick Review */}
                          <div className="pt-1.5 flex items-center justify-between gap-2">
                            <select
                              value={topic.confidence}
                              onChange={(e) =>
                                handleUpdateConfidence(topic, e.target.value as ConfidenceLevel)
                              }
                              className="bg-[#141414] text-xs font-mono rounded-md px-2 py-1 text-[#A3A3A3] border border-[#2A2A2A] focus:outline-none"
                            >
                              <option value="not_studied">Not studied</option>
                              <option value="learning">Learning</option>
                              <option value="needs_practice">Needs practice</option>
                              <option value="confident">Confident</option>
                            </select>

                            <button
                              onClick={() => handleReviewToday(topic)}
                              className="p-1.5 rounded text-[#707070] hover:text-[#7EBA8C] hover:bg-[#222222] transition-colors"
                              title="Reviewed today"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-[#181818] rounded-xl border border-[#262626] overflow-hidden divide-y divide-[#242424]">
          {semesterTopics.map((topic) => {
            const subject = getSubjectById(data.subjects, topic.subjectId);
            const cfg = confidenceConfig[topic.confidence];
            const isDue = topic.nextReviewDate && topic.nextReviewDate <= today;

            return (
              <div
                key={topic.id}
                className="p-4 hover:bg-[#1E1E1E] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {subject && <SubjectBadge subject={subject} showName={true} />}

                    <span className={`text-xs font-mono px-2 py-0.5 rounded border ${cfg.badgeClass}`}>
                      {cfg.label}
                    </span>

                    {topic.handbookUrl && (
                      <a
                        href={topic.handbookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-mono text-[#A3A3A3] hover:text-white bg-[#141414] px-2 py-0.5 rounded border border-[#282828]"
                      >
                        <BookOpen className="w-3 h-3 text-[#707070]" />
                        <span>Handbook Notes</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </a>
                    )}
                  </div>

                  <div className="text-base font-medium text-[#F5F5F5]">{topic.title}</div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right text-xs font-mono text-[#8C8C8C]">
                    {topic.nextReviewDate && (
                      <div className={isDue ? 'text-[#D19A66] font-medium' : ''}>
                        Next: {formatDateLabel(topic.nextReviewDate)}
                      </div>
                    )}
                  </div>

                  <select
                    value={topic.confidence}
                    onChange={(e) => handleUpdateConfidence(topic, e.target.value as ConfidenceLevel)}
                    className="bg-[#141414] text-xs font-mono rounded-lg px-2.5 py-1.5 text-[#F0F0F0] border border-[#2A2A2A] focus:outline-none"
                  >
                    <option value="not_studied">Not studied</option>
                    <option value="learning">Learning</option>
                    <option value="needs_practice">Needs practice</option>
                    <option value="confident">Confident</option>
                  </select>

                  <button
                    onClick={() => handleReviewToday(topic)}
                    className="px-3 py-1.5 rounded bg-[#222222] hover:bg-[#2A2A2A] text-white text-xs border border-[#2E2E2E] flex items-center gap-1.5 transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-[#7EBA8C]" />
                    <span>Review</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

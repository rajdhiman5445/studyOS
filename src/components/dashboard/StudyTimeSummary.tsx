import React from 'react';
import { TrendingUp, ArrowUpRight } from 'lucide-react';
import { useStudyOS } from '../../lib/storage';
import { formatMinutes, getTodayDateString, getSubjectById } from '../../lib/utils';

export const StudyTimeSummary: React.FC = () => {
  const { data } = useStudyOS();
  const today = getTodayDateString();

  // Sessions today
  const todaysSessions = data.studySessions.filter((s) => s.date === today);
  const todayTotalMinutes = todaysSessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  // Goal
  const goalMinutes = data.dailyStudyGoalMinutes || 240;
  const progressPercent = Math.min(100, Math.round((todayTotalMinutes / goalMinutes) * 100));

  // Weekly total (last 7 days)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weekCutoff = oneWeekAgo.toISOString().split('T')[0];

  const weeklySessions = data.studySessions.filter((s) => s.date >= weekCutoff);
  const weeklyTotalMinutes = weeklySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  // Subject breakdown
  const subjectBreakdown: Record<string, number> = {};
  weeklySessions.forEach((s) => {
    subjectBreakdown[s.subjectId] = (subjectBreakdown[s.subjectId] || 0) + s.durationMinutes;
  });

  return (
    <section className="bg-[#181818] rounded-xl border border-[#262626] p-4 sm:p-6 space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#242424]">
        <div>
          <h2 className="text-base sm:text-lg font-semibold tracking-tight text-[#F5F5F5]">
            Study Time & Progress
          </h2>
          <p className="text-xs sm:text-sm text-[#8C8C8C] mt-0.5">Manual session tracking</p>
        </div>

        <a
          href="/study-log"
          className="text-xs text-[#A3A3A3] hover:text-white flex items-center gap-1 font-medium transition-colors"
        >
          <span>Log Session</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Large, Legible Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Today */}
        <div className="p-4 rounded-lg bg-[#1D1D1D] border border-[#262626]">
          <div className="flex items-center justify-between text-[#8C8C8C] text-xs font-mono">
            <span>Today</span>
            <span className="text-[#A3A3A3] font-medium">{progressPercent}%</span>
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-semibold tracking-tight text-white font-mono">
              {formatMinutes(todayTotalMinutes)}
            </span>
            <span className="text-xs text-[#707070] font-mono ml-1.5">
              / {formatMinutes(goalMinutes)}
            </span>
          </div>

          {/* Clean progress bar */}
          <div className="mt-3 w-full bg-[#141414] rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                progressPercent >= 100 ? 'bg-[#7EBA8C]' : 'bg-[#EAEAEA]'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Weekly Total */}
        <div className="p-4 rounded-lg bg-[#1D1D1D] border border-[#262626]">
          <div className="flex items-center justify-between text-[#8C8C8C] text-xs font-mono">
            <span>Weekly Total</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#8C8C8C]" />
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-semibold tracking-tight text-white font-mono">
              {formatMinutes(weeklyTotalMinutes)}
            </span>
          </div>
          <p className="text-xs text-[#707070] mt-3 font-mono">
            {weeklySessions.length} recorded session{weeklySessions.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Subject Distribution */}
      {Object.keys(subjectBreakdown).length > 0 && (
        <div className="pt-2 border-t border-[#242424]">
          <div className="text-xs font-mono text-[#8C8C8C] uppercase tracking-wider mb-3">
            Weekly Breakdown by Subject
          </div>
          <div className="space-y-2">
            {Object.entries(subjectBreakdown).map(([subId, mins]) => {
              const subject = getSubjectById(data.subjects, subId);
              if (!subject) return null;
              const percent = Math.round((mins / weeklyTotalMinutes) * 100);

              return (
                <div key={subId} className="space-y-1 py-0.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{
                          backgroundColor: subject.color || '#3B82F6',
                          boxShadow: `0 0 5px ${(subject.color || '#3B82F6')}60`,
                        }}
                      />
                      <span className="text-[#C8C8C8] text-xs sm:text-sm font-medium">{subject.name}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-xs text-[#8C8C8C]">
                      <span className="text-[#F0F0F0] font-medium">{formatMinutes(mins)}</span>
                      <span className="text-[#5A5A5A]">({percent}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-[#141414] rounded-full h-1 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: subject.color || '#EAEAEA',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

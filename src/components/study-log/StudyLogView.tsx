import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Plus, 
  Edit3, 
  Trash2, 
  Target, 
  TrendingUp, 
  BarChart3, 
  Settings2,
  BookOpen,
  CheckCircle2,
  ListTodo
} from 'lucide-react';
import { Header } from '../layout/Header';
import { useStudyOS } from '../../lib/storage';
import { 
  formatMinutes, 
  calculateDurationMinutes, 
  getSubjectById, 
  formatDateLabel 
} from '../../lib/utils';
import { SubjectBadge } from '../common/SubjectBadge';
import {
  getTodayDateString,
  getCurrentMonthString,
  getMondayOfWeek,
  getDaysInWeek,
  shiftDate,
  shiftWeek,
  shiftMonth,
  getMonthCalendarGrid,
  formatDayHeader,
  formatWeekHeader,
  formatMonthHeader,
  getWeekdayShortName,
  parseISODate
} from '../../lib/dateUtils';
import type { StudySession } from '../../types';

type PeriodMode = 'day' | 'week' | 'month';

export const StudyLogView: React.FC = () => {
  const { 
    data, 
    activeSubjects, 
    addStudySession, 
    updateStudySession, 
    deleteStudySession, 
    updateDailyGoal 
  } = useStudyOS();

  const today = getTodayDateString();
  const currentMonth = getCurrentMonthString();
  const currentMonday = getMondayOfWeek(today);

  // Period Selection State
  const [periodMode, setPeriodMode] = useState<PeriodMode>('week');
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [selectedMonday, setSelectedMonday] = useState<string>(currentMonday);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);

  // Session Modal State (for both create & edit)
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);

  // Form Fields
  const [formDate, setFormDate] = useState(today);
  const [durationMode, setDurationMode] = useState<'duration' | 'times'>('duration');
  const [formDurationMinutes, setFormDurationMinutes] = useState('90');
  const [formStartTime, setFormStartTime] = useState('14:00');
  const [formEndTime, setFormEndTime] = useState('15:30');
  const [formSubjectId, setFormSubjectId] = useState(activeSubjects[0]?.id || '');
  const [formTopicId, setFormTopicId] = useState('');
  const [formTaskId, setFormTaskId] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Daily goal configuration modal
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalHoursInput, setGoalHoursInput] = useState(String((data.dailyStudyGoalMinutes || 240) / 60));

  // Calculated duration when using start/end times
  const timeDiffMinutes = useMemo(() => {
    return calculateDurationMinutes(formStartTime, formEndTime);
  }, [formStartTime, formEndTime]);

  const activeDurationMinutes = durationMode === 'duration' 
    ? (parseInt(formDurationMinutes, 10) || 0)
    : timeDiffMinutes;

  // Navigation handlers
  const handlePrevPeriod = () => {
    if (periodMode === 'day') {
      const prev = shiftDate(selectedDate, -1);
      setSelectedDate(prev);
      setSelectedMonday(getMondayOfWeek(prev));
      setSelectedMonth(prev.substring(0, 7));
    } else if (periodMode === 'week') {
      const prevMon = shiftWeek(selectedMonday, -1);
      setSelectedMonday(prevMon);
      setSelectedDate(prevMon);
      setSelectedMonth(prevMon.substring(0, 7));
    } else {
      const prevMonth = shiftMonth(selectedMonth, -1);
      setSelectedMonth(prevMonth);
      setSelectedDate(`${prevMonth}-01`);
      setSelectedMonday(getMondayOfWeek(`${prevMonth}-01`));
    }
  };

  const handleNextPeriod = () => {
    if (periodMode === 'day') {
      const next = shiftDate(selectedDate, 1);
      setSelectedDate(next);
      setSelectedMonday(getMondayOfWeek(next));
      setSelectedMonth(next.substring(0, 7));
    } else if (periodMode === 'week') {
      const nextMon = shiftWeek(selectedMonday, 1);
      setSelectedMonday(nextMon);
      setSelectedDate(nextMon);
      setSelectedMonth(nextMon.substring(0, 7));
    } else {
      const nextMonth = shiftMonth(selectedMonth, 1);
      setSelectedMonth(nextMonth);
      setSelectedDate(`${nextMonth}-01`);
      setSelectedMonday(getMondayOfWeek(`${nextMonth}-01`));
    }
  };

  const handleReturnToCurrent = () => {
    setSelectedDate(today);
    setSelectedMonday(currentMonday);
    setSelectedMonth(currentMonth);
  };

  const isAtCurrentPeriod = useMemo(() => {
    if (periodMode === 'day') return selectedDate === today;
    if (periodMode === 'week') return selectedMonday === currentMonday;
    return selectedMonth === currentMonth;
  }, [periodMode, selectedDate, selectedMonday, selectedMonth, today, currentMonday, currentMonth]);

  // Filtered Sessions for the active period
  const periodSessions = useMemo(() => {
    if (periodMode === 'day') {
      return data.studySessions.filter((s) => s.date === selectedDate);
    }
    if (periodMode === 'week') {
      const weekDays = new Set(getDaysInWeek(selectedMonday));
      return data.studySessions.filter((s) => weekDays.has(s.date));
    }
    // month mode
    return data.studySessions.filter((s) => s.date.startsWith(selectedMonth));
  }, [data.studySessions, periodMode, selectedDate, selectedMonday, selectedMonth]);

  // Aggregate stats
  const totalMinutes = useMemo(() => {
    return periodSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  }, [periodSessions]);

  const dailyGoalMinutes = data.dailyStudyGoalMinutes || 240;

  // Distinct study days in selected period
  const studiedDaysSet = useMemo(() => {
    return new Set(periodSessions.map((s) => s.date));
  }, [periodSessions]);

  const studiedDaysCount = studiedDaysSet.size;

  // Subject breakdown for active period
  const subjectBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    periodSessions.forEach((s) => {
      map[s.subjectId] = (map[s.subjectId] || 0) + s.durationMinutes;
    });
    return Object.entries(map)
      .map(([subjectId, minutes]) => ({
        subject: getSubjectById(data.subjects, subjectId),
        minutes,
        percentage: totalMinutes > 0 ? Math.round((minutes / totalMinutes) * 100) : 0,
      }))
      .filter((item) => item.subject !== undefined)
      .sort((a, b) => b.minutes - a.minutes);
  }, [periodSessions, data.subjects, totalMinutes]);

  // Week View Daily Totals
  const weekDailyTotals = useMemo(() => {
    if (periodMode !== 'week') return [];
    const days = getDaysInWeek(selectedMonday);
    return days.map((dateStr) => {
      const sessions = data.studySessions.filter((s) => s.date === dateStr);
      const minutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
      return {
        dateStr,
        weekday: getWeekdayShortName(dateStr),
        dayNumber: parseISODate(dateStr).getDate(),
        minutes,
        isToday: dateStr === today,
        sessionsCount: sessions.length,
      };
    });
  }, [periodMode, selectedMonday, data.studySessions, today]);

  // Month View Calendar Grid
  const monthCalendarGrid = useMemo(() => {
    if (periodMode !== 'month') return [];
    const cells = getMonthCalendarGrid(selectedMonth);
    // map each cell to its study minutes
    const dayMap: Record<string, number> = {};
    data.studySessions.forEach((s) => {
      if (s.date.startsWith(selectedMonth)) {
        dayMap[s.date] = (dayMap[s.date] || 0) + s.durationMinutes;
      }
    });

    return cells.map((cell) => ({
      ...cell,
      minutes: dayMap[cell.dateStr] || 0,
      isToday: cell.dateStr === today,
    }));
  }, [periodMode, selectedMonth, data.studySessions, today]);

  // Modal Open Handlers
  const handleOpenAddModal = (defaultDate?: string) => {
    setEditingSessionId(null);
    setFormDate(defaultDate || (periodMode === 'day' ? selectedDate : today));
    setDurationMode('duration');
    setFormDurationMinutes('90');
    setFormStartTime('14:00');
    setFormEndTime('15:30');
    setFormSubjectId(activeSubjects[0]?.id || data.subjects[0]?.id || '');
    setFormTopicId('');
    setFormTaskId('');
    setFormNotes('');
    setSessionModalOpen(true);
  };

  const handleOpenEditModal = (session: StudySession) => {
    setEditingSessionId(session.id);
    setFormDate(session.date);
    if (session.startTime && session.endTime) {
      setDurationMode('times');
      setFormStartTime(session.startTime);
      setFormEndTime(session.endTime);
    } else {
      setDurationMode('duration');
      setFormDurationMinutes(String(session.durationMinutes));
    }
    setFormSubjectId(session.subjectId);
    setFormTopicId(session.topicId || '');
    setFormTaskId(session.taskId || '');
    setFormNotes(session.notes || '');
    setSessionModalOpen(true);
  };

  const handleSaveSession = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!formSubjectId) {
      alert('Please select a subject.');
      return;
    }
    if (activeDurationMinutes <= 0) {
      alert('Please enter a valid study duration greater than 0.');
      return;
    }

    if (editingSessionId) {
      const existing = data.studySessions.find((s) => s.id === editingSessionId);
      const updated: StudySession = {
        ...existing,
        id: editingSessionId,
        date: formDate,
        startTime: durationMode === 'times' ? formStartTime : existing?.startTime,
        endTime: durationMode === 'times' ? formEndTime : existing?.endTime,
        durationMinutes: activeDurationMinutes,
        subjectId: formSubjectId,
        topicId: formTopicId || undefined,
        taskId: formTaskId || undefined,
        notes: formNotes.trim() || undefined,
        updatedAt: new Date().toISOString(),
      };
      updateStudySession(updated);
    } else {
      const newSession: StudySession = {
        id: `sess-${Date.now()}`,
        date: formDate,
        startTime: durationMode === 'times' ? formStartTime : undefined,
        endTime: durationMode === 'times' ? formEndTime : undefined,
        durationMinutes: activeDurationMinutes,
        subjectId: formSubjectId,
        topicId: formTopicId || undefined,
        taskId: formTaskId || undefined,
        notes: formNotes.trim() || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addStudySession(newSession);
    }

    setSessionModalOpen(false);
  };

  const handleDeleteSession = (session: StudySession) => {
    const subject = getSubjectById(data.subjects, session.subjectId);
    const subjectName = subject ? subject.name : 'Unknown Subject';
    const msg = `Delete this study session?\n\n• Date: ${session.date}\n• Subject: ${subjectName}\n• Duration: ${formatMinutes(session.durationMinutes)}`;
    if (window.confirm(msg)) {
      deleteStudySession(session.id);
    }
  };

  const handleSaveGoal = () => {
    const hours = parseFloat(goalHoursInput);
    if (!isNaN(hours) && hours > 0) {
      updateDailyGoal(Math.round(hours * 60));
      setEditingGoal(false);
    }
  };

  // Jump from week/month visualization to a specific day
  const handleJumpToDay = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedMonday(getMondayOfWeek(dateStr));
    setSelectedMonth(dateStr.substring(0, 7));
    setPeriodMode('day');
  };

  // Available topics/tasks for current selected subject in form
  const availableTopics = data.topics.filter((t) => t.subjectId === formSubjectId);
  const availableTasks = data.tasks.filter((t) => t.subjectId === formSubjectId);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <Header
        title="Study Log"
        subtitle="Historical study analytics, session logs, and accumulated effort tracking"
        onOpenQuickCapture={() => handleOpenAddModal()}
      />

      {/* Historical Navigation & Period Selector Bar */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#181818] border border-[#262626] flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Day / Week / Month Segmented Control */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#141414] border border-[#262626] self-start md:self-auto">
          {(['day', 'week', 'month'] as PeriodMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setPeriodMode(mode)}
              className={`px-3.5 py-1.5 rounded-md text-xs font-mono font-medium transition-all ${
                periodMode === mode
                  ? 'bg-[#242424] text-white border border-[#333333] shadow-xs'
                  : 'text-[#8C8C8C] hover:text-[#E0E0E0] hover:bg-[#1A1A1A]'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>

        {/* Center: Previous / Current Label / Next Navigation */}
        <div className="flex items-center justify-between md:justify-center gap-3">
          <button
            onClick={handlePrevPeriod}
            className="p-1.5 rounded-md text-[#A3A3A3] hover:text-white bg-[#1A1A1A] hover:bg-[#262626] border border-[#2A2A2A] transition-colors"
            title="Previous period"
            aria-label="Previous period"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="text-center min-w-[200px] sm:min-w-[260px]">
            <div className="text-sm sm:text-base font-semibold text-white tracking-tight font-mono">
              {periodMode === 'day' && formatDayHeader(selectedDate)}
              {periodMode === 'week' && formatWeekHeader(selectedMonday)}
              {periodMode === 'month' && formatMonthHeader(selectedMonth)}
            </div>
            <div className="text-[11px] text-[#707070] font-mono mt-0.5">
              {periodMode === 'day' && 'Single Day Focus'}
              {periodMode === 'week' && 'Monday – Sunday Week'}
              {periodMode === 'month' && 'Calendar Month Overview'}
            </div>
          </div>

          <button
            onClick={handleNextPeriod}
            className="p-1.5 rounded-md text-[#A3A3A3] hover:text-white bg-[#1A1A1A] hover:bg-[#262626] border border-[#2A2A2A] transition-colors"
            title="Next period"
            aria-label="Next period"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Quick Return & Add Session */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {!isAtCurrentPeriod && (
            <button
              onClick={handleReturnToCurrent}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium text-[#A3A3A3] hover:text-white bg-[#1A1A1A] hover:bg-[#242424] border border-[#2A2A2A] transition-colors"
              title="Return to current date/week/month"
            >
              <RotateCcw className="w-3 h-3 text-[#707070]" />
              <span>
                {periodMode === 'day' ? 'Today' : periodMode === 'week' ? 'This Week' : 'This Month'}
              </span>
            </button>
          )}

          <button
            onClick={() => handleOpenAddModal()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-[#EAEAEA] hover:bg-white text-[#121212] transition-colors shadow-none"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Session</span>
          </button>
        </div>
      </div>

      {/* Main Focus: Total Effort & Key Metric Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Total Study Time (Primary visual focus) */}
        <div className="p-5 sm:p-6 rounded-xl bg-[#181818] border border-[#262626] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[#8C8C8C] font-mono">
              <span>Total Study Effort</span>
              <div className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#707070]" />
                <span>
                  {periodMode === 'day' && `Daily Goal: ${formatMinutes(dailyGoalMinutes)}`}
                  {periodMode === 'week' && `Weekly Target: ${formatMinutes(dailyGoalMinutes * 7)}`}
                  {periodMode === 'month' && `Daily Goal: ${formatMinutes(dailyGoalMinutes)}`}
                </span>
              </div>
            </div>

            <div className="mt-3">
              <span className="text-3xl sm:text-4xl font-semibold font-mono text-white tracking-tight">
                {formatMinutes(totalMinutes)}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#242424] flex items-center justify-between text-xs text-[#8C8C8C]">
            <span className="font-mono">
              {periodSessions.length} recorded session{periodSessions.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={() => setEditingGoal(true)}
              className="text-[#8C8C8C] hover:text-[#E0E0E0] inline-flex items-center gap-1 font-mono text-[11px]"
            >
              <Settings2 className="w-3 h-3" />
              <span>Config Goal</span>
            </button>
          </div>
        </div>

        {/* Card 2: Consistency & Average Hours */}
        <div className="p-5 sm:p-6 rounded-xl bg-[#181818] border border-[#262626] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[#8C8C8C] font-mono">
              <span>Consistency & Pace</span>
              <TrendingUp className="w-3.5 h-3.5 text-[#8C8C8C]" />
            </div>

            <div className="mt-3 space-y-2">
              {periodMode === 'day' ? (
                <div>
                  <div className="text-2xl font-mono font-semibold text-white">
                    {periodSessions.length > 0
                      ? formatMinutes(Math.round(totalMinutes / periodSessions.length))
                      : '0m'}
                  </div>
                  <p className="text-xs text-[#8C8C8C] font-mono mt-1">Average per logged session</p>
                </div>
              ) : periodMode === 'week' ? (
                <div>
                  <div className="text-2xl font-mono font-semibold text-white">
                    {studiedDaysCount} of 7 days
                  </div>
                  <p className="text-xs text-[#8C8C8C] font-mono mt-1">
                    {studiedDaysCount > 0 
                      ? `${formatMinutes(Math.round(totalMinutes / studiedDaysCount))} / active day`
                      : 'No study recorded yet'}
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-2xl font-mono font-semibold text-white">
                    {studiedDaysCount} active study days
                  </div>
                  <p className="text-xs text-[#8C8C8C] font-mono mt-1">
                    {studiedDaysCount > 0
                      ? `${formatMinutes(Math.round(totalMinutes / studiedDaysCount))} / study day`
                      : 'No recorded study days'}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#242424] text-xs text-[#707070] font-mono flex items-center justify-between">
            <span>
              {periodMode === 'day' ? 'Individual day breakdown' : 'Spaced consistency metric'}
            </span>
            {studiedDaysCount >= 5 && periodMode === 'week' && (
              <span className="text-[#7EBA8C] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Consistent
              </span>
            )}
          </div>
        </div>

        {/* Card 3: Subject Distribution */}
        <div className="p-5 sm:p-6 rounded-xl bg-[#181818] border border-[#262626] flex flex-col justify-between">
          <div>
            <div className="text-xs font-mono text-[#8C8C8C] uppercase tracking-wider mb-2.5">
              Subject Distribution
            </div>

            <div className="space-y-2.5 max-h-[120px] overflow-y-auto">
              {subjectBreakdown.length === 0 ? (
                <p className="text-xs text-[#707070] py-3">No study sessions logged for this period</p>
              ) : (
                subjectBreakdown.map((item) => (
                  <div key={item.subject?.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-[#E0E0E0] truncate max-w-[140px] flex items-center gap-1.5">
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{
                            backgroundColor: item.subject?.color || '#3B82F6',
                            boxShadow: `0 0 4px ${(item.subject?.color || '#3B82F6')}60`,
                          }}
                        />
                        <span className="truncate">{item.subject?.code} - {item.subject?.name}</span>
                      </span>
                      <span className="font-mono text-[#8C8C8C]">
                        <span className="text-[#F0F0F0] font-medium">{formatMinutes(item.minutes)}</span> ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#141414] rounded-full h-1 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: item.subject?.color || '#EAEAEA',
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#242424] text-xs text-[#707070] font-mono">
            {subjectBreakdown.length > 0 
              ? `${subjectBreakdown.length} subject${subjectBreakdown.length !== 1 ? 's' : ''} studied in period`
              : 'Zero active subjects in period'}
          </div>
        </div>
      </div>

      {/* Historical Effort Visualization */}
      <section className="bg-[#181818] rounded-xl border border-[#262626] p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#242424]">
          <div className="flex items-center gap-2.5">
            <BarChart3 className="w-4 h-4 text-[#F0F0F0]" />
            <h3 className="text-sm font-semibold text-[#F5F5F5]">
              {periodMode === 'day' && 'Day Timeline & Focus Sessions'}
              {periodMode === 'week' && 'Weekly Daily Distribution'}
              {periodMode === 'month' && 'Monthly Study Activity Calendar'}
            </h3>
          </div>
          <span className="text-xs font-mono text-[#8C8C8C]">
            {periodMode === 'day' && `${periodSessions.length} session${periodSessions.length !== 1 ? 's' : ''}`}
            {periodMode === 'week' && 'Click a bar to view that day'}
            {periodMode === 'month' && 'Click any day to jump to its log'}
          </span>
        </div>

        {/* 1. Week Bar Chart Visualization */}
        {periodMode === 'week' && (
          <div className="pt-4 pb-2">
            <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end min-h-[180px]">
              {weekDailyTotals.map((day) => {
                const maxWeekMinutes = Math.max(...weekDailyTotals.map((d) => d.minutes), dailyGoalMinutes);
                const heightPercent = maxWeekMinutes > 0 
                  ? Math.min(100, Math.round((day.minutes / maxWeekMinutes) * 100))
                  : 0;
                const isMetGoal = day.minutes >= dailyGoalMinutes && dailyGoalMinutes > 0;

                return (
                  <div 
                    key={day.dateStr}
                    onClick={() => handleJumpToDay(day.dateStr)}
                    className="flex flex-col items-center gap-2 cursor-pointer group select-none"
                    title={`${day.weekday} (${day.dateStr}): ${formatMinutes(day.minutes)} (${day.sessionsCount} sessions)`}
                  >
                    {/* Time Label Above Bar */}
                    <div className="text-[11px] font-mono text-center transition-colors">
                      {day.minutes > 0 ? (
                        <span className="text-white font-medium group-hover:text-[#7EBA8C]">
                          {formatMinutes(day.minutes)}
                        </span>
                      ) : (
                        <span className="text-[#555555]">-</span>
                      )}
                    </div>

                    {/* Bar Pillar */}
                    <div className="w-full max-w-[48px] h-32 bg-[#141414] rounded-md p-1 border border-[#242424] flex items-end group-hover:border-[#383838] transition-colors">
                      <div 
                        className={`w-full rounded transition-all duration-500 ${
                          isMetGoal
                            ? 'bg-[#7EBA8C] group-hover:bg-[#96CEA3]'
                            : day.minutes > 0
                            ? 'bg-[#D4D4D4] group-hover:bg-white'
                            : 'bg-transparent'
                        }`}
                        style={{ height: `${Math.max(day.minutes > 0 ? 8 : 0, heightPercent)}%` }}
                      />
                    </div>

                    {/* Day / Date Label Below */}
                    <div className="text-center font-mono">
                      <span className={`text-xs block font-medium ${day.isToday ? 'text-white' : 'text-[#8C8C8C] group-hover:text-[#D4D4D4]'}`}>
                        {day.weekday}
                      </span>
                      <span className={`text-[10px] block ${day.isToday ? 'text-[#7EBA8C] font-semibold' : 'text-[#555555]'}`}>
                        {day.dayNumber}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-[#242424] flex items-center justify-between text-xs text-[#707070] font-mono">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-[#7EBA8C]" /> Daily Goal Reached
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-[#D4D4D4]" /> Study Recorded
                </span>
              </div>
              <span>Daily target: {formatMinutes(dailyGoalMinutes)}</span>
            </div>
          </div>
        )}

        {/* 2. Month Calendar Grid Visualization */}
        {periodMode === 'month' && (
          <div className="pt-2">
            {/* Weekday column headers (Mon - Sun) */}
            <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-mono text-[#707070] mb-2 pb-1.5 border-b border-[#242424]">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>

            {/* Calendar Cells */}
            <div className="grid grid-cols-7 gap-1.5">
              {monthCalendarGrid.map((cell) => {
                const isMetGoal = cell.minutes >= dailyGoalMinutes && dailyGoalMinutes > 0;
                return (
                  <div
                    key={cell.dateStr}
                    onClick={() => handleJumpToDay(cell.dateStr)}
                    className={`min-h-[64px] sm:min-h-[72px] p-2 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                      !cell.isCurrentMonth
                        ? 'opacity-30 bg-[#131313] border-[#1F1F1F]'
                        : isMetGoal
                        ? 'bg-[#18261C] border-[#2A4731] hover:border-[#3D6946]'
                        : cell.minutes > 0
                        ? 'bg-[#1C1C1C] border-[#2E2E2E] hover:border-[#404040]'
                        : 'bg-[#151515] border-[#222222] hover:border-[#303030]'
                    } ${cell.isToday ? 'ring-1 ring-[#F0F0F0]' : ''}`}
                    title={`${cell.dateStr}: ${cell.minutes > 0 ? formatMinutes(cell.minutes) : 'No study logged'}`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className={cell.isToday ? 'text-white font-bold' : cell.isCurrentMonth ? 'text-[#8C8C8C]' : 'text-[#555555]'}>
                        {cell.dayNumber}
                      </span>
                      {cell.isToday && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7EBA8C]" title="Today" />
                      )}
                    </div>

                    <div className="text-right">
                      {cell.minutes > 0 ? (
                        <span className={`text-xs font-mono font-medium ${isMetGoal ? 'text-[#7EBA8C]' : 'text-[#EAEAEA]'}`}>
                          {formatMinutes(cell.minutes)}
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#404040] font-mono">-</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-[#242424] flex flex-wrap items-center justify-between gap-3 text-xs text-[#707070] font-mono">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-[#18261C] border border-[#2A4731]" /> Target Met ({formatMinutes(dailyGoalMinutes)}+)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-[#1C1C1C] border border-[#2E2E2E]" /> Study Recorded
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded border border-[#F0F0F0]" /> Today
                </span>
              </div>
              <span>Total studied: {studiedDaysCount} days</span>
            </div>
          </div>
        )}

        {/* 3. Day Timeline Visualization */}
        {periodMode === 'day' && (
          <div className="py-2">
            {periodSessions.length === 0 ? (
              <div className="py-8 text-center text-[#707070] space-y-3">
                <p className="text-sm">No study sessions recorded for {selectedDate}.</p>
                <button
                  onClick={() => handleOpenAddModal(selectedDate)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-[#222222] text-[#F0F0F0] hover:bg-[#2A2A2A] border border-[#2E2E2E] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Session for {selectedDate}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative pl-6 border-l border-[#2E2E2E] space-y-4 py-2">
                  {periodSessions.map((session) => {
                    const subject = getSubjectById(data.subjects, session.subjectId);
                    return (
                      <div key={session.id} className="relative group">
                        {/* Timeline Node */}
                        <div
                          className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-[#181818]"
                          style={{
                            backgroundColor: subject?.color || '#7EBA8C',
                            boxShadow: `0 0 6px ${(subject?.color || '#7EBA8C')}60`,
                          }}
                        />

                        <div className="p-3.5 rounded-lg bg-[#141414] border border-[#262626] flex items-center justify-between gap-3">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {subject && <SubjectBadge subject={subject} />}
                              <span className="text-sm font-medium text-white truncate">
                                {subject?.name}
                              </span>
                            </div>
                            {session.notes && (
                              <p className="text-xs text-[#A3A3A3] line-clamp-1">
                                {session.notes}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
                            {session.startTime && session.endTime && (
                              <span className="text-[#707070]">
                                {session.startTime} - {session.endTime}
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded bg-[#202020] text-white font-semibold border border-[#2A2A2A]">
                              {formatMinutes(session.durationMinutes)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Historical Sessions List & Actions */}
      <section className="bg-[#181818] rounded-xl border border-[#262626] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#262626] bg-[#1A1A1A] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm font-semibold text-[#F5F5F5]">
              Recorded Sessions ({periodSessions.length})
            </h3>
            <span className="text-xs font-mono text-[#8C8C8C]">
              {periodMode === 'day' ? selectedDate : periodMode === 'week' ? `Week of ${selectedMonday}` : selectedMonth}
            </span>
          </div>

          <button
            onClick={() => handleOpenAddModal(periodMode === 'day' ? selectedDate : today)}
            className="text-xs text-[#A3A3A3] hover:text-white flex items-center gap-1.5 font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Session</span>
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-3">
          {periodSessions.length === 0 ? (
            <div className="py-12 text-center text-[#707070] text-sm">
              No study sessions logged for this period. Click "Add Session" to record your study hours.
            </div>
          ) : (
            periodSessions.map((session) => {
              const subject = getSubjectById(data.subjects, session.subjectId);
              const topic = data.topics.find((t) => t.id === session.topicId);
              const task = data.tasks.find((t) => t.id === session.taskId);

              return (
                <div
                  key={session.id}
                  className="p-4 rounded-lg bg-[#1E1E1E] border border-[#282828] hover:border-[#383838] space-y-2.5 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    {/* Subject & Timing */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      {subject ? (
                        <SubjectBadge subject={subject} />
                      ) : (
                        <SubjectBadge fallbackText="General" />
                      )}

                      <span className="text-sm font-medium text-[#F5F5F5]">
                        {subject?.name}
                      </span>

                      <span className="text-xs font-mono text-[#8C8C8C]">
                        {formatDateLabel(session.date)}
                        {session.startTime && session.endTime ? ` (${session.startTime} – ${session.endTime})` : ''}
                      </span>
                    </div>

                    {/* Right side: Duration + Edit/Delete Buttons */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-auto">
                      <span className="px-2.5 py-0.5 rounded bg-[#141414] border border-[#2A2A2A] text-[#F0F0F0] font-mono font-semibold text-xs">
                        {formatMinutes(session.durationMinutes)}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(session)}
                          className="p-1.5 rounded text-[#707070] hover:text-white hover:bg-[#262626] transition-colors"
                          title="Edit session"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSession(session)}
                          className="p-1.5 rounded text-[#707070] hover:text-[#E06C75] hover:bg-[#2A1416] transition-colors"
                          title="Delete session"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Topic & Task Links if present */}
                  {(topic || task) && (
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#8C8C8C] font-mono">
                      {topic && (
                        <span className="inline-flex items-center gap-1 bg-[#141414] px-2 py-0.5 rounded border border-[#262626]">
                          <BookOpen className="w-3 h-3 text-[#707070]" />
                          <span>{topic.title}</span>
                        </span>
                      )}
                      {task && (
                        <span className="inline-flex items-center gap-1 bg-[#141414] px-2 py-0.5 rounded border border-[#262626]">
                          <ListTodo className="w-3 h-3 text-[#707070]" />
                          <span>{task.title}</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  {session.notes && (
                    <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed pt-2 border-t border-[#262626] whitespace-pre-wrap">
                      {session.notes}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Add / Edit Session Modal */}
      {sessionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#181818] border border-[#2E2E2E] rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-white" />
                <h3 className="text-base font-semibold text-white">
                  {editingSessionId ? 'Edit Study Session' : 'Record Study Session'}
                </h3>
              </div>
              <span className="text-xs font-mono text-[#7EBA8C] bg-[#17221A] px-2 py-0.5 rounded border border-[#233827]">
                Duration: {formatMinutes(activeDurationMinutes)}
              </span>
            </div>

            <form onSubmit={handleSaveSession} className="space-y-4">
              {/* Date */}
              <div>
                <label className="block text-xs font-medium text-[#A3A3A3] mb-1.5">Study Date</label>
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#141414] border border-[#282828] text-[#F5F5F5] text-xs font-mono focus:outline-none focus:border-[#4A4A4A]"
                />
              </div>

              {/* Duration or Times Mode Switcher */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-[#A3A3A3]">Duration Entry</label>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setDurationMode('duration')}
                      className={`px-2 py-0.5 rounded text-[11px] ${
                        durationMode === 'duration'
                          ? 'bg-[#282828] text-white border border-[#3A3A3A]'
                          : 'text-[#707070] hover:text-white'
                      }`}
                    >
                      Duration
                    </button>
                    <button
                      type="button"
                      onClick={() => setDurationMode('times')}
                      className={`px-2 py-0.5 rounded text-[11px] ${
                        durationMode === 'times'
                          ? 'bg-[#282828] text-white border border-[#3A3A3A]'
                          : 'text-[#707070] hover:text-white'
                      }`}
                    >
                      Start & End Time
                    </button>
                  </div>
                </div>

                {durationMode === 'duration' ? (
                  <div className="space-y-2">
                    <input
                      type="number"
                      min="5"
                      step="5"
                      required
                      value={formDurationMinutes}
                      onChange={(e) => setFormDurationMinutes(e.target.value)}
                      placeholder="Minutes (e.g. 90)"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#141414] border border-[#282828] text-[#F5F5F5] text-xs font-mono focus:outline-none focus:border-[#4A4A4A]"
                    />
                    {/* Quick duration presets */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[30, 45, 60, 90, 120, 180].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => setFormDurationMinutes(String(mins))}
                          className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                            formDurationMinutes === String(mins)
                              ? 'bg-[#EAEAEA] text-[#121212] font-semibold'
                              : 'bg-[#141414] text-[#A3A3A3] hover:text-white border border-[#262626]'
                          }`}
                        >
                          {formatMinutes(mins)}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-[#707070] mb-1 font-mono">Start Time</label>
                      <input
                        type="time"
                        required
                        value={formStartTime}
                        onChange={(e) => setFormStartTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#141414] border border-[#282828] text-[#F5F5F5] text-xs font-mono focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#707070] mb-1 font-mono">End Time</label>
                      <input
                        type="time"
                        required
                        value={formEndTime}
                        onChange={(e) => setFormEndTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#141414] border border-[#282828] text-[#F5F5F5] text-xs font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Subject */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-[#A3A3A3]">Subject *</label>
                  {(() => {
                    const sel = getSubjectById(data.subjects, formSubjectId);
                    return sel ? <SubjectBadge subject={sel} /> : null;
                  })()}
                </div>
                <select
                  value={formSubjectId}
                  onChange={(e) => {
                    setFormSubjectId(e.target.value);
                    setFormTopicId('');
                    setFormTaskId('');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#141414] border border-[#282828] text-[#F5F5F5] text-xs focus:outline-none focus:border-[#4A4A4A]"
                >
                  {data.subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.code} - {sub.name} {sub.isArchived ? '(Archived)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Topic & Task dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#A3A3A3] mb-1.5">Topic (Optional)</label>
                  <select
                    value={formTopicId}
                    onChange={(e) => setFormTopicId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#141414] border border-[#282828] text-[#F5F5F5] text-xs focus:outline-none"
                  >
                    <option value="">-- No specific topic --</option>
                    {availableTopics.map((top) => (
                      <option key={top.id} value={top.id}>
                        {top.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#A3A3A3] mb-1.5">Task (Optional)</label>
                  <select
                    value={formTaskId}
                    onChange={(e) => setFormTaskId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#141414] border border-[#282828] text-[#F5F5F5] text-xs focus:outline-none"
                  >
                    <option value="">-- No specific task --</option>
                    {availableTasks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-[#A3A3A3] mb-1.5">Session Notes (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="What derivation did you solve, paper did you read, or node did you implement?"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#141414] border border-[#282828] text-[#F5F5F5] placeholder-[#606060] text-xs focus:outline-none focus:border-[#4A4A4A]"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#262626]">
                <button
                  type="button"
                  onClick={() => setSessionModalOpen(false)}
                  className="px-4 py-2 rounded text-xs font-medium text-[#8C8C8C] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={activeDurationMinutes <= 0}
                  className="px-5 py-2 rounded bg-[#EAEAEA] hover:bg-white disabled:bg-[#222222] disabled:text-[#606060] text-[#121212] text-xs font-semibold transition-colors"
                >
                  {editingSessionId ? 'Save Changes' : 'Record Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goal Config Modal */}
      {editingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#181818] border border-[#2E2E2E] rounded-xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-semibold text-[#F5F5F5]">
              Set Daily Study Goal
            </h3>
            <p className="text-xs text-[#A3A3A3]">
              Configure your daily study target in hours (default is 4.0 hours).
            </p>

            <div>
              <label className="block text-xs font-medium text-[#A3A3A3] mb-1.5">Target Hours / Day</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="16"
                value={goalHoursInput}
                onChange={(e) => setGoalHoursInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#141414] border border-[#282828] text-[#F5F5F5] text-sm font-mono focus:outline-none focus:border-[#4A4A4A]"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#242424]">
              <button
                type="button"
                onClick={() => setEditingGoal(false)}
                className="px-4 py-2 rounded text-xs font-medium text-[#8C8C8C] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveGoal}
                className="px-5 py-2 rounded bg-[#EAEAEA] hover:bg-white text-[#121212] text-xs font-semibold"
              >
                Save Target
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

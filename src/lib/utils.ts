import type { Subject, Priority, TaskStatus, ConfidenceLevel } from '../types';

export function formatMinutes(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function calculateDurationMinutes(start: string, end: string): number {
  if (!start || !end) return 0;
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) return 0;
  const totalStart = startH * 60 + startM;
  const totalEnd = endH * 60 + endM;
  const diff = totalEnd - totalStart;
  return diff > 0 ? diff : 0;
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateLabel(dateStr: string): string {
  if (!dateStr) return 'No date';
  const today = getTodayDateString();
  if (dateStr === today) return 'Today';

  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function isDateOverdue(dateStr: string): boolean {
  if (!dateStr) return false;
  const today = getTodayDateString();
  return dateStr < today;
}

export function getSubjectById(subjects: Subject[], subjectId: string): Subject | undefined {
  return subjects.find((s) => s.id === subjectId);
}

// Desaturated, restrained badges with comfortable 12px text size
export const priorityConfig: Record<Priority, { label: string; badgeClass: string }> = {
  high: { label: 'High', badgeClass: 'bg-[#241719] text-[#E06C75] border-[#3B1C1F]' },
  medium: { label: 'Medium', badgeClass: 'bg-[#241E17] text-[#D19A66] border-[#3D2C1C]' },
  low: { label: 'Low', badgeClass: 'bg-[#1E1E1E] text-[#A3A3A3] border-[#2A2A2A]' },
};

export const statusConfig: Record<TaskStatus, { label: string; badgeClass: string }> = {
  todo: { label: 'To do', badgeClass: 'bg-[#1E1E1E] text-[#A3A3A3] border-[#2A2A2A]' },
  in_progress: { label: 'In progress', badgeClass: 'bg-[#1A2229] text-[#7FA6C4] border-[#273847]' },
  blocked: { label: 'Blocked', badgeClass: 'bg-[#241719] text-[#E06C75] border-[#3B1C1F]' },
  completed: { label: 'Completed', badgeClass: 'bg-[#17221A] text-[#7EBA8C] border-[#233827]' },
};

export const confidenceConfig: Record<ConfidenceLevel, { label: string; badgeClass: string; barWidth: string }> = {
  not_studied: { label: 'Not studied', badgeClass: 'bg-[#1E1E1E] text-[#808080] border-[#2A2A2A]', barWidth: 'w-1/6 bg-[#333333]' },
  learning: { label: 'Learning', badgeClass: 'bg-[#1A2229] text-[#7FA6C4] border-[#273847]', barWidth: 'w-2/4 bg-[#4E6E85]' },
  needs_practice: { label: 'Needs practice', badgeClass: 'bg-[#241E17] text-[#D19A66] border-[#3D2C1C]', barWidth: 'w-3/4 bg-[#8C693E]' },
  confident: { label: 'Confident', badgeClass: 'bg-[#17221A] text-[#7EBA8C] border-[#233827]', barWidth: 'w-full bg-[#4A7854]' },
};

export const PRESET_SUBJECT_COLORS = [
  { label: 'Blue', hex: '#3B82F6' },
  { label: 'Purple', hex: '#8B5CF6' },
  { label: 'Cyan', hex: '#06B6D4' },
  { label: 'Emerald', hex: '#10B981' },
  { label: 'Amber', hex: '#F59E0B' },
  { label: 'Rose', hex: '#F43F5E' },
  { label: 'Indigo', hex: '#6366F1' },
  { label: 'Teal', hex: '#14B8A6' },
  { label: 'Orange', hex: '#F97316' },
  { label: 'Slate', hex: '#64748B' },
];


import React, { useState, useEffect } from 'react';
import { X, CheckSquare, FileText } from 'lucide-react';
import { useStudyOS } from '../../lib/storage';
import { getTodayDateString, getSubjectById } from '../../lib/utils';
import { SubjectBadge } from '../common/SubjectBadge';
import type { Priority, Task } from '../../types';

interface QuickCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickCaptureModal: React.FC<QuickCaptureModalProps> = ({ isOpen, onClose }) => {
  const { activeSemester, activeSubjects, addTask, addQuickNote } = useStudyOS();
  const [tab, setTab] = useState<'task' | 'note'>('task');

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [dueDate, setDueDate] = useState(getTodayDateString());
  const [priority, setPriority] = useState<Priority>('medium');
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [isToday, setIsToday] = useState(true);
  const [isImportant, setIsImportant] = useState(false);

  // Note form state
  const [noteContent, setNoteContent] = useState('');
  const [noteSubjectId, setNoteSubjectId] = useState('');

  // Set default subject when activeSubjects loads
  useEffect(() => {
    if (activeSubjects.length > 0 && !subjectId) {
      setSubjectId(activeSubjects[0].id);
      setNoteSubjectId(activeSubjects[0].id);
    }
  }, [activeSubjects, subjectId]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCreateTask = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !activeSemester) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      semesterId: activeSemester.id,
      subjectId: subjectId || (activeSubjects[0]?.id ?? ''),
      title: taskTitle.trim(),
      description: taskDescription.trim() || undefined,
      dueDate,
      priority,
      estimatedMinutes: Number(estimatedMinutes) || 30,
      status: 'todo',
      subtasks: [],
      scheduledDate: isToday ? getTodayDateString() : undefined,
      isImportant: isImportant || priority === 'high',
    };

    addTask(newTask);
    setTaskTitle('');
    setTaskDescription('');
    onClose();
  };

  const handleCreateNote = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    addQuickNote({
      id: crypto.randomUUID(),
      content: noteContent.trim(),
      subjectId: noteSubjectId || undefined,
      createdAt: new Date().toISOString(),
    });

    setNoteContent('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-[#181818] border border-[#2E2E2E] rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626] bg-[#1A1A1A]">
          <div className="flex items-center gap-3">
            <span className="text-base font-semibold text-[#F5F5F5]">Quick Capture</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#141414] text-[#808080] border border-[#262626]">
              Esc to close
            </span>
          </div>

          <div className="flex items-center gap-1 bg-[#141414] p-1 rounded-lg border border-[#262626] text-xs">
            <button
              type="button"
              onClick={() => setTab('task')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors ${
                tab === 'task' ? 'bg-[#262626] text-white font-medium border border-[#363636]' : 'text-[#808080] hover:text-[#C0C0C0]'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Task</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('note')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors ${
                tab === 'note' ? 'bg-[#262626] text-white font-medium border border-[#363636]' : 'text-[#808080] hover:text-[#C0C0C0]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Note / Idea</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="text-[#707070] hover:text-white p-1.5 rounded hover:bg-[#222222] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Task Tab */}
        {tab === 'task' ? (
          <form onSubmit={handleCreateTask} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#A3A3A3] mb-1.5">
                Task Title *
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. Derive manipulator Jacobian in symbolic form"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#141414] border border-[#282828] text-[#F5F5F5] placeholder-[#606060] text-sm focus:outline-none focus:border-[#4A4A4A]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-[#A3A3A3]">Subject</label>
                  {(() => {
                    const sel = getSubjectById(activeSubjects, subjectId);
                    return sel ? <SubjectBadge subject={sel} /> : null;
                  })()}
                </div>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#141414] border border-[#282828] text-[#F0F0F0] text-xs focus:outline-none focus:border-[#4A4A4A]"
                >
                  {activeSubjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.code} - {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A3A3A3] mb-1.5">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#141414] border border-[#282828] text-[#F0F0F0] text-xs focus:outline-none focus:border-[#4A4A4A]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#A3A3A3] mb-1.5">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#141414] border border-[#282828] text-[#F0F0F0] text-xs focus:outline-none focus:border-[#4A4A4A]"
                >
                  <option value="high">High (Must Deal With)</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A3A3A3] mb-1.5">Estimated Duration (mins)</label>
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#141414] border border-[#282828] text-[#F0F0F0] text-xs focus:outline-none focus:border-[#4A4A4A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A3A3A3] mb-1.5">
                Notes & Context
              </label>
              <textarea
                rows={3}
                placeholder="Key derivations, reference papers, or equations..."
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-[#141414] border border-[#282828] text-[#F5F5F5] placeholder-[#606060] text-xs focus:outline-none focus:border-[#4A4A4A]"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#242424]">
              <div className="flex items-center gap-5 text-xs text-[#A3A3A3]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isToday}
                    onChange={(e) => setIsToday(e.target.checked)}
                    className="rounded bg-[#141414] border-[#333333] text-white focus:ring-0"
                  />
                  <span>Schedule for Today</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isImportant}
                    onChange={(e) => setIsImportant(e.target.checked)}
                    className="rounded bg-[#141414] border-[#333333] text-white focus:ring-0"
                  />
                  <span>Mark Important</span>
                </label>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded text-xs font-medium text-[#8C8C8C] hover:text-white hover:bg-[#222222] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-[#EAEAEA] hover:bg-white text-[#121212] text-xs font-semibold transition-colors"
                >
                  Add Task
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Note Tab */
          <form onSubmit={handleCreateNote} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#A3A3A3] mb-1.5">
                Quick Note / Question / Observation *
              </label>
              <textarea
                rows={5}
                required
                autoFocus
                placeholder="Capture a derivation doubt, paper idea, or question for the professor..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="w-full px-3.5 py-3 rounded-lg bg-[#141414] border border-[#282828] text-[#F5F5F5] placeholder-[#606060] text-sm focus:outline-none focus:border-[#4A4A4A] leading-relaxed"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-[#A3A3A3]">
                  Associated Subject (Optional)
                </label>
                {noteSubjectId ? (
                  <SubjectBadge subject={getSubjectById(activeSubjects, noteSubjectId)} />
                ) : (
                  <SubjectBadge fallbackText="General" />
                )}
              </div>
              <select
                value={noteSubjectId}
                onChange={(e) => setNoteSubjectId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-[#141414] border border-[#282828] text-[#F0F0F0] text-xs focus:outline-none focus:border-[#4A4A4A]"
              >
                <option value="">-- General / Independent --</option>
                {activeSubjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.code} - {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#242424]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded text-xs font-medium text-[#8C8C8C] hover:text-white hover:bg-[#222222] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded bg-[#EAEAEA] hover:bg-white text-[#121212] text-xs font-semibold transition-colors"
              >
                Save Note
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

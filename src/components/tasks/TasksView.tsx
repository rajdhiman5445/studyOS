import React, { useState } from 'react';
import { 
  Plus, 
  Clock, 
  Calendar, 
  Check, 
  ChevronDown, 
  ChevronRight, 
  Trash2, 
  Filter, 
  Edit3,
  ListTodo
} from 'lucide-react';
import { Header } from '../layout/Header';
import { useStudyOS } from '../../lib/storage';
import { 
  formatMinutes, 
  formatDateLabel, 
  isDateOverdue, 
  getSubjectById, 
  getTodayDateString,
  priorityConfig, 
  statusConfig 
} from '../../lib/utils';
import { SubjectBadge } from '../common/SubjectBadge';
import { AuthGuard } from '../auth/AuthGuard';
import type { Task, TaskStatus, Priority } from '../../types';

export const TasksView: React.FC = () => {
  const { 
    data, 
    activeSemester, 
    activeSubjects, 
    addTask, 
    updateTask, 
    deleteTask, 
    toggleTaskCompleted 
  } = useStudyOS();

  // Filters
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Expanded subtasks state
  const [expandedTaskIds, setExpandedTaskIds] = useState<Record<string, boolean>>({});

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSubjectId, setFormSubjectId] = useState('');
  const [formDueDate, setFormDueDate] = useState(getTodayDateString());
  const [formPriority, setFormPriority] = useState<Priority>('medium');
  const [formStatus, setFormStatus] = useState<TaskStatus>('todo');
  const [formMinutes, setFormMinutes] = useState(60);
  const [formSubtasks, setFormSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');

  const toggleSubtasksExpand = (taskId: string) => {
    setExpandedTaskIds((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setFormTitle('');
    setFormDescription('');
    setFormSubjectId(activeSubjects[0]?.id || '');
    setFormDueDate(getTodayDateString());
    setFormPriority('medium');
    setFormStatus('todo');
    setFormMinutes(60);
    setFormSubtasks([]);
    setNewSubtaskInput('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDescription(task.description || '');
    setFormSubjectId(task.subjectId);
    setFormDueDate(task.dueDate);
    setFormPriority(task.priority);
    setFormStatus(task.status);
    setFormMinutes(task.estimatedMinutes);
    setFormSubtasks([...task.subtasks]);
    setNewSubtaskInput('');
    setModalOpen(true);
  };

  const handleSaveTask = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !activeSemester) return;

    if (editingTask) {
      updateTask({
        ...editingTask,
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
        subjectId: formSubjectId,
        dueDate: formDueDate,
        priority: formPriority,
        status: formStatus,
        estimatedMinutes: Number(formMinutes) || 30,
        subtasks: formSubtasks,
        isImportant: formPriority === 'high',
      });
    } else {
      const newTask: Task = {
        id: crypto.randomUUID(),
        semesterId: activeSemester.id,
        subjectId: formSubjectId || (activeSubjects[0]?.id ?? ''),
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
        dueDate: formDueDate,
        priority: formPriority,
        estimatedMinutes: Number(formMinutes) || 30,
        status: formStatus,
        subtasks: formSubtasks,
        isImportant: formPriority === 'high',
      };
      addTask(newTask);
    }
    setModalOpen(false);
  };

  const handleAddSubtaskToForm = () => {
    if (!newSubtaskInput.trim()) return;
    setFormSubtasks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title: newSubtaskInput.trim(), completed: false },
    ]);
    setNewSubtaskInput('');
  };

  const handleToggleSubtaskInList = (taskId: string, subtaskId: string) => {
    const task = data.tasks.find((t) => t.id === taskId);
    if (!task) return;
    const updatedSubtasks = task.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    updateTask({ ...task, subtasks: updatedSubtasks });
  };

  // Filter tasks
  const filteredTasks = data.tasks.filter((t) => {
    if (activeSemester && t.semesterId !== activeSemester.id) return false;
    if (selectedSubjectId !== 'all' && t.subjectId !== selectedSubjectId) return false;
    if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;
    if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      return matchTitle || matchDesc;
    }
    return true;
  });

  return (
    <AuthGuard>
      <div className="space-y-8">
      <Header
        title="Tasks"
        subtitle="Manage academic coursework, algorithms, and derivation milestones"
        actions={
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#EAEAEA] hover:bg-white text-[#121212] text-xs font-semibold tracking-wide transition-all shadow-none"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-[#181818] p-4 rounded-xl border border-[#262626] flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-[#8C8C8C] font-mono">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#141414] border border-[#2A2A2A] text-[#F0F0F0] text-xs focus:outline-none focus:border-[#4A4A4A]"
          >
            <option value="all">All Subjects</option>
            {activeSubjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.code} - {sub.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#141414] border border-[#2A2A2A] text-[#F0F0F0] text-xs focus:outline-none focus:border-[#4A4A4A]"
          >
            <option value="all">All Statuses</option>
            <option value="todo">To do</option>
            <option value="in_progress">In progress</option>
            <option value="blocked">Blocked</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#141414] border border-[#2A2A2A] text-[#F0F0F0] text-xs focus:outline-none focus:border-[#4A4A4A]"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Search */}
        <div className="w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-60 px-3.5 py-1.5 rounded-lg bg-[#141414] border border-[#2A2A2A] text-[#F0F0F0] placeholder-[#606060] text-xs focus:outline-none focus:border-[#4A4A4A]"
          />
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="bg-[#181818] rounded-xl border border-[#262626] p-12 text-center text-[#707070]">
            <ListTodo className="w-8 h-8 text-[#505050] mx-auto mb-3" />
            <p className="text-sm font-medium text-[#A3A3A3]">No tasks match your filter criteria</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const subject = getSubjectById(data.subjects, task.subjectId);
            const isOverdue = isDateOverdue(task.dueDate) && task.status !== 'completed';
            const isCompleted = task.status === 'completed';
            const priorityBadge = priorityConfig[task.priority];
            const statusBadge = statusConfig[task.status];
            const isExpanded = !!expandedTaskIds[task.id];
            const completedSubtasks = task.subtasks.filter((st) => st.completed).length;

            return (
              <div
                key={task.id}
                className={`bg-[#181818] rounded-xl border p-4 sm:p-5 transition-all ${
                  isCompleted
                    ? 'border-[#223326] bg-[#151C17]'
                    : isOverdue
                    ? 'border-l-4 border-l-[#E06C75] bg-[#1A1415] border-y border-r border-[#2C1A1C]'
                    : 'border-[#262626] hover:border-[#383838]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3.5">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => toggleTaskCompleted(task.id)}
                      className={`mt-0.5 sm:mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                        isCompleted
                          ? 'bg-[#17221A] border-[#2E4A35] text-[#7EBA8C]'
                          : 'border-[#484848] hover:border-[#7EBA8C] text-transparent'
                      }`}
                      title={isCompleted ? 'Mark as todo' : 'Mark as complete'}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>

                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {subject && <SubjectBadge subject={subject} />}

                        <span className={`text-xs font-mono px-2 py-0.5 rounded border ${priorityBadge.badgeClass}`}>
                          {priorityBadge.label}
                        </span>

                        <span className={`text-xs font-mono px-2 py-0.5 rounded border ${statusBadge.badgeClass}`}>
                          {statusBadge.label}
                        </span>

                        <span
                          className={`text-xs font-mono flex items-center gap-1.5 ${
                            isOverdue ? 'text-[#E06C75] font-medium' : 'text-[#8C8C8C]'
                          }`}
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          {isOverdue ? `Overdue (${formatDateLabel(task.dueDate)})` : `Due ${formatDateLabel(task.dueDate)}`}
                        </span>

                        <span className="text-xs font-mono text-[#8C8C8C] flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {formatMinutes(task.estimatedMinutes)}
                        </span>
                      </div>

                      <h3
                        className={`text-[15px] sm:text-[17px] font-medium leading-snug break-words ${
                          isCompleted ? 'text-[#8EA895]' : 'text-[#F5F5F5]'
                        }`}
                      >
                        {task.title}
                      </h3>

                      {task.description && (
                        <p className="text-sm sm:text-[14.5px] text-[#A3A3A3] leading-relaxed break-words">
                          {task.description}
                        </p>
                      )}

                      {/* Subtasks trigger & preview */}
                      {task.subtasks.length > 0 && (
                        <div className="pt-1.5">
                          <button
                            onClick={() => toggleSubtasksExpand(task.id)}
                            className="text-xs font-mono text-[#9E9E9E] hover:text-white flex items-center gap-1.5"
                          >
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                            <span>
                              Milestones ({completedSubtasks}/{task.subtasks.length})
                            </span>
                          </button>

                          {isExpanded && (
                            <div className="mt-2.5 pl-4 border-l border-[#2E2E2E] space-y-2 py-1">
                              {task.subtasks.map((st) => (
                                <label
                                  key={st.id}
                                  className="flex items-center gap-2.5 text-sm text-[#A3A3A3] hover:text-white cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={st.completed}
                                    onChange={() => handleToggleSubtaskInList(task.id, st.id)}
                                    className="rounded bg-[#141414] border-[#333333] text-white focus:ring-0"
                                  />
                                  <span className={st.completed ? 'text-[#707070]' : ''}>
                                    {st.title}
                                  </span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 self-end sm:self-start pl-8 sm:pl-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-[#242424]">
                    <button
                      onClick={() => handleOpenEditModal(task)}
                      className="p-1.5 sm:p-2 rounded text-[#707070] hover:text-white hover:bg-[#222222] transition-colors"
                      title="Edit task"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete task "${task.title}"?`)) {
                          deleteTask(task.id);
                        }
                      }}
                      className="p-1.5 sm:p-2 rounded text-[#707070] hover:text-[#E06C75] hover:bg-[#2A1416] transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Task Creation & Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-[#181818] border border-[#2E2E2E] rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626] bg-[#1A1A1A]">
              <h3 className="text-base font-semibold text-[#F5F5F5]">
                {editingTask ? 'Edit Task' : 'Create Task'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-[#707070] hover:text-white p-1.5 rounded hover:bg-[#222222]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-medium text-[#A3A3A3] mb-1.5">Title *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Implement IK solver with damping"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#141414] border border-[#282828] text-[#F5F5F5] text-sm focus:outline-none focus:border-[#4A4A4A]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A3A3A3] mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Details, derivation steps, references..."
                  className="w-full px-3.5 py-2 rounded-lg bg-[#141414] border border-[#282828] text-[#F5F5F5] text-xs focus:outline-none focus:border-[#4A4A4A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-[#A3A3A3]">Subject</label>
                    {(() => {
                      const sel = getSubjectById(data.subjects, formSubjectId);
                      return sel ? <SubjectBadge subject={sel} /> : null;
                    })()}
                  </div>
                  <select
                    value={formSubjectId}
                    onChange={(e) => setFormSubjectId(e.target.value)}
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
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-[#141414] border border-[#282828] text-[#F0F0F0] text-xs focus:outline-none focus:border-[#4A4A4A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#A3A3A3] mb-1.5">Priority</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as Priority)}
                    className="w-full px-3.5 py-2 rounded-lg bg-[#141414] border border-[#282828] text-[#F0F0F0] text-xs focus:outline-none focus:border-[#4A4A4A]"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#A3A3A3] mb-1.5">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as TaskStatus)}
                    className="w-full px-3.5 py-2 rounded-lg bg-[#141414] border border-[#282828] text-[#F0F0F0] text-xs focus:outline-none focus:border-[#4A4A4A]"
                  >
                    <option value="todo">To do</option>
                    <option value="in_progress">In progress</option>
                    <option value="blocked">Blocked</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#A3A3A3] mb-1.5">Estimated Duration</label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={formMinutes}
                    onChange={(e) => setFormMinutes(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-lg bg-[#141414] border border-[#282828] text-[#F0F0F0] text-xs focus:outline-none focus:border-[#4A4A4A]"
                  />
                </div>
              </div>

              {/* Subtasks Section */}
              <div className="pt-2 border-t border-[#262626]">
                <label className="block text-xs font-medium text-[#A3A3A3] mb-2">
                  Milestones / Subtasks
                </label>
                <div className="space-y-2 mb-3">
                  {formSubtasks.map((st, idx) => (
                    <div key={st.id} className="flex items-center justify-between text-xs bg-[#141414] p-2.5 rounded border border-[#262626]">
                      <span className="text-[#F0F0F0]">{st.title}</span>
                      <button
                        type="button"
                        onClick={() => setFormSubtasks(formSubtasks.filter((_, i) => i !== idx))}
                        className="text-[#707070] hover:text-[#E06C75]"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add a milestone step..."
                    value={newSubtaskInput}
                    onChange={(e) => setNewSubtaskInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubtaskToForm();
                      }
                    }}
                    className="flex-1 px-3.5 py-2 rounded-lg bg-[#141414] border border-[#282828] text-[#F5F5F5] placeholder-[#606060] text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubtaskToForm}
                    className="px-4 py-2 bg-[#222222] hover:bg-[#2A2A2A] text-white rounded-lg text-xs font-medium border border-[#2E2E2E]"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#262626]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded text-xs font-medium text-[#8C8C8C] hover:text-white hover:bg-[#222222]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-[#EAEAEA] hover:bg-white text-[#121212] text-xs font-semibold"
                >
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  </AuthGuard>
);
};

import type { Semester, Subject, Topic, Task, StudySession, QuickNote } from '../types';

export interface DbSemester {
  id: string;
  user_id: string;
  name: string;
  academic_year: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_archived: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DbSubject {
  id: string;
  user_id: string;
  semester_id: string;
  name: string;
  code: string;
  color: string;
  description: string | null;
  is_archived: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DbTopic {
  id: string;
  user_id: string;
  subject_id: string;
  title: string;
  confidence: Topic['confidence'];
  last_reviewed_date: string | null;
  next_review_date: string | null;
  handbook_url: string | null;
  notes_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface DbTask {
  id: string;
  user_id: string;
  semester_id: string;
  subject_id: string;
  title: string;
  description: string | null;
  due_date: string;
  priority: Task['priority'];
  estimated_minutes: number;
  status: Task['status'];
  scheduled_date: string | null;
  is_important: boolean;
  completed_at: string | null;
  subtasks: Task['subtasks'];
  created_at?: string;
  updated_at?: string;
}

export interface DbStudySession {
  id: string;
  user_id: string;
  date: string;
  duration_minutes: number;
  start_time: string | null;
  end_time: string | null;
  subject_id: string | null;
  topic_id: string | null;
  task_id: string | null;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DbQuickNote {
  id: string;
  user_id: string;
  content: string;
  subject_id: string | null;
  created_at: string;
  updated_at?: string;
}

export function fromDbSemester(db: DbSemester): Semester {
  return {
    id: db.id,
    name: db.name,
    academicYear: db.academic_year,
    startDate: db.start_date,
    endDate: db.end_date,
    isActive: db.is_active,
    isArchived: db.is_archived,
  };
}

export function toDbSemester(sem: Semester, userId: string): Omit<DbSemester, 'created_at' | 'updated_at'> {
  return {
    id: sem.id,
    user_id: userId,
    name: sem.name,
    academic_year: sem.academicYear,
    start_date: sem.startDate,
    end_date: sem.endDate,
    is_active: sem.isActive,
    is_archived: sem.isArchived,
  };
}

export function fromDbSubject(db: DbSubject): Subject {
  return {
    id: db.id,
    semesterId: db.semester_id,
    name: db.name,
    code: db.code,
    color: db.color || '#3B82F6',
    description: db.description || undefined,
    isArchived: db.is_archived,
  };
}

export function toDbSubject(sub: Subject, userId: string): Omit<DbSubject, 'created_at' | 'updated_at'> {
  return {
    id: sub.id,
    user_id: userId,
    semester_id: sub.semesterId,
    name: sub.name,
    code: sub.code,
    color: sub.color || '#3B82F6',
    description: sub.description || null,
    is_archived: sub.isArchived,
  };
}

export function fromDbTopic(db: DbTopic): Topic {
  return {
    id: db.id,
    subjectId: db.subject_id,
    title: db.title,
    confidence: db.confidence,
    lastReviewedDate: db.last_reviewed_date || undefined,
    nextReviewDate: db.next_review_date || undefined,
    handbookUrl: db.handbook_url || undefined,
    notesCount: db.notes_count,
  };
}

export function toDbTopic(top: Topic, userId: string): Omit<DbTopic, 'created_at' | 'updated_at'> {
  return {
    id: top.id,
    user_id: userId,
    subject_id: top.subjectId,
    title: top.title,
    confidence: top.confidence,
    last_reviewed_date: top.lastReviewedDate || null,
    next_review_date: top.nextReviewDate || null,
    handbook_url: top.handbookUrl || null,
    notes_count: top.notesCount || 0,
  };
}

export function fromDbTask(db: DbTask): Task {
  return {
    id: db.id,
    semesterId: db.semester_id,
    subjectId: db.subject_id,
    title: db.title,
    description: db.description || undefined,
    dueDate: db.due_date,
    priority: db.priority,
    estimatedMinutes: db.estimated_minutes,
    status: db.status,
    scheduledDate: db.scheduled_date || undefined,
    isImportant: db.is_important,
    completedAt: db.completed_at || undefined,
    subtasks: Array.isArray(db.subtasks) ? db.subtasks : [],
  };
}

export function toDbTask(task: Task, userId: string): Omit<DbTask, 'created_at' | 'updated_at'> {
  return {
    id: task.id,
    user_id: userId,
    semester_id: task.semesterId,
    subject_id: task.subjectId,
    title: task.title,
    description: task.description || null,
    due_date: task.dueDate,
    priority: task.priority,
    estimated_minutes: task.estimatedMinutes,
    status: task.status,
    scheduled_date: task.scheduledDate || null,
    is_important: task.isImportant ?? false,
    completed_at: task.completedAt || null,
    subtasks: task.subtasks || [],
  };
}

export function fromDbSession(db: DbStudySession): StudySession {
  return {
    id: db.id,
    userId: db.user_id,
    date: db.date,
    durationMinutes: db.duration_minutes,
    startTime: db.start_time || undefined,
    endTime: db.end_time || undefined,
    subjectId: db.subject_id || '',
    topicId: db.topic_id || undefined,
    taskId: db.task_id || undefined,
    notes: db.notes || undefined,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

export function toDbSession(session: StudySession, userId: string): Omit<DbStudySession, 'created_at' | 'updated_at'> {
  return {
    id: session.id,
    user_id: userId,
    date: session.date,
    duration_minutes: session.durationMinutes,
    start_time: session.startTime || null,
    end_time: session.endTime || null,
    subject_id: session.subjectId || null,
    topic_id: session.topicId || null,
    task_id: session.taskId || null,
    notes: session.notes || null,
  };
}

export function fromDbQuickNote(db: DbQuickNote): QuickNote {
  return {
    id: db.id,
    content: db.content,
    subjectId: db.subject_id || undefined,
    createdAt: db.created_at,
  };
}

export function toDbQuickNote(note: QuickNote, userId: string): Omit<DbQuickNote, 'updated_at'> {
  return {
    id: note.id,
    user_id: userId,
    content: note.content,
    subject_id: note.subjectId || null,
    created_at: note.createdAt || new Date().toISOString(),
  };
}

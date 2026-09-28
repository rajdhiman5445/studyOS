export type Priority = 'high' | 'medium' | 'low';

export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'completed';

export type ConfidenceLevel = 'not_studied' | 'learning' | 'needs_practice' | 'confident';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Semester {
  id: string;
  name: string; // e.g. "Semester 3 - M2 Robotics"
  academicYear: string; // e.g. "2025-2026"
  startDate: string;
  endDate: string;
  isActive: boolean;
  isArchived: boolean;
}

export interface Subject {
  id: string;
  semesterId: string;
  name: string;
  code: string; // e.g. "ROB-501"
  color: string; // Tailwind color token or hex
  description?: string;
  isArchived: boolean;
}

export interface Topic {
  id: string;
  subjectId: string;
  title: string;
  confidence: ConfidenceLevel;
  lastReviewedDate?: string;
  nextReviewDate?: string;
  handbookUrl?: string; // Optional link to external Astro handbook
  notesCount?: number;
}

export interface Task {
  id: string;
  semesterId: string;
  subjectId: string;
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD
  priority: Priority;
  estimatedMinutes: number;
  status: TaskStatus;
  subtasks: Subtask[];
  scheduledDate?: string; // Date scheduled for (e.g. today's date)
  isImportant?: boolean; // Pin to "Must deal with"
  completedAt?: string;
}

export interface StudySession {
  id: string;
  userId?: string; // Prepared for Supabase auth ownership (auth.uid())
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm (optional, calculated duration is primary)
  endTime?: string; // HH:mm
  durationMinutes: number; // Integer minutes, primary unit of study duration
  subjectId: string; // Foreign key to subjects.id
  topicId?: string; // Foreign key to topics.id (nullable)
  taskId?: string; // Foreign key to tasks.id (nullable)
  notes?: string;
  createdAt?: string; // ISO 8601 timestamp
  updatedAt?: string; // ISO 8601 timestamp
}

export interface QuickNote {
  id: string;
  content: string;
  subjectId?: string;
  createdAt: string;
}

export interface StudyOSData {
  semesters: Semester[];
  subjects: Subject[];
  topics: Topic[];
  tasks: Task[];
  studySessions: StudySession[];
  quickNotes: QuickNote[];
  dailyStudyGoalMinutes: number; // default 240 mins (4 hours)
}

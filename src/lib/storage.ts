import { useState, useEffect, useCallback } from 'react';
import type { StudyOSData, Task, Subject, Semester, Topic, StudySession, QuickNote } from '../types';
import { initialMockData } from '../data/mockData';

const STORAGE_KEY = 'studyos_data_v1';
const UPDATE_EVENT = 'studyos_data_updated';

export function getStoredData(): StudyOSData {
  if (typeof window === 'undefined') {
    return initialMockData;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMockData));
      return initialMockData;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse StudyOS local storage data, using defaults', err);
    return initialMockData;
  }
}

export function saveStoredData(data: StudyOSData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: data }));
  } catch (err) {
    console.error('Failed to save StudyOS data to localStorage', err);
  }
}

export function resetToDefaults(): StudyOSData {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMockData));
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: initialMockData }));
  }
  return initialMockData;
}

export function useStudyOS() {
  const [data, setData] = useState<StudyOSData>(() => getStoredData());
  const isReady = true;

  useEffect(() => {
    // If SSR rendered fallback, synchronize with client localStorage
    if (typeof window !== 'undefined') {
      const stored = getStoredData();
      setData(stored);
    }

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<StudyOSData>;
      if (customEvent.detail) {
        setData(customEvent.detail);
      } else {
        setData(getStoredData());
      }
    };

    window.addEventListener(UPDATE_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(UPDATE_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const updateData = useCallback((updater: (prev: StudyOSData) => StudyOSData) => {
    setData((prev) => {
      const next = updater(prev);
      if (typeof window !== 'undefined') {
        queueMicrotask(() => {
          saveStoredData(next);
        });
      }
      return next;
    });
  }, []);

  // Helpers
  const activeSemester = data.semesters.find((s) => s.isActive && !s.isArchived) || data.semesters[0];

  const activeSubjects = data.subjects.filter(
    (s) => s.semesterId === activeSemester?.id && !s.isArchived
  );

  const setActiveSemesterId = useCallback((semesterId: string) => {
    updateData((prev) => ({
      ...prev,
      semesters: prev.semesters.map((sem) => ({
        ...sem,
        isActive: sem.id === semesterId,
      })),
    }));
  }, [updateData]);

  const addTask = useCallback((task: Task) => {
    updateData((prev) => ({
      ...prev,
      tasks: [task, ...prev.tasks],
    }));
  }, [updateData]);

  const updateTask = useCallback((updatedTask: Task) => {
    updateData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
    }));
  }, [updateData]);

  const deleteTask = useCallback((taskId: string) => {
    updateData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
    }));
  }, [updateData]);

  const toggleTaskCompleted = useCallback((taskId: string) => {
    updateData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => {
        if (t.id !== taskId) return t;
        const newStatus = t.status === 'completed' ? 'todo' : 'completed';
        return {
          ...t,
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
        };
      }),
    }));
  }, [updateData]);

  const rescheduleTask = useCallback((taskId: string, newDate: string) => {
    updateData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, scheduledDate: newDate, dueDate: newDate } : t)),
    }));
  }, [updateData]);

  const addSubject = useCallback((subject: Subject) => {
    updateData((prev) => ({
      ...prev,
      subjects: [...prev.subjects, subject],
    }));
  }, [updateData]);

  const updateSubject = useCallback((updatedSubject: Subject) => {
    updateData((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) => (s.id === updatedSubject.id ? updatedSubject : s)),
    }));
  }, [updateData]);

  const addSemester = useCallback((semester: Semester) => {
    updateData((prev) => ({
      ...prev,
      semesters: [...prev.semesters, semester],
    }));
  }, [updateData]);

  const updateSemester = useCallback((updatedSemester: Semester) => {
    updateData((prev) => ({
      ...prev,
      semesters: prev.semesters.map((s) => (s.id === updatedSemester.id ? updatedSemester : s)),
    }));
  }, [updateData]);

  const addTopic = useCallback((topic: Topic) => {
    updateData((prev) => ({
      ...prev,
      topics: [...prev.topics, topic],
    }));
  }, [updateData]);

  const updateTopic = useCallback((updatedTopic: Topic) => {
    updateData((prev) => ({
      ...prev,
      topics: prev.topics.map((top) => (top.id === updatedTopic.id ? updatedTopic : top)),
    }));
  }, [updateData]);

  const addStudySession = useCallback((session: StudySession) => {
    updateData((prev) => ({
      ...prev,
      studySessions: [session, ...prev.studySessions],
    }));
  }, [updateData]);

  const updateStudySession = useCallback((updatedSession: StudySession) => {
    updateData((prev) => ({
      ...prev,
      studySessions: prev.studySessions.map((s) => (s.id === updatedSession.id ? updatedSession : s)),
    }));
  }, [updateData]);

  const deleteStudySession = useCallback((sessionId: string) => {
    updateData((prev) => ({
      ...prev,
      studySessions: prev.studySessions.filter((s) => s.id !== sessionId),
    }));
  }, [updateData]);

  const updateDailyGoal = useCallback((minutes: number) => {
    updateData((prev) => ({
      ...prev,
      dailyStudyGoalMinutes: minutes,
    }));
  }, [updateData]);

  const addQuickNote = useCallback((note: QuickNote) => {
    updateData((prev) => ({
      ...prev,
      quickNotes: [note, ...prev.quickNotes],
    }));
  }, [updateData]);

  return {
    data,
    isReady,
    activeSemester,
    activeSubjects,
    setActiveSemesterId,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompleted,
    rescheduleTask,
    addSubject,
    updateSubject,
    addSemester,
    updateSemester,
    addTopic,
    updateTopic,
    addStudySession,
    updateStudySession,
    deleteStudySession,
    updateDailyGoal,
    addQuickNote,
    resetToDefaults,
  };
}

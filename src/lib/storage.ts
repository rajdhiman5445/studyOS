import { useState, useEffect, useCallback } from 'react';
import type { StudyOSData, Task, Subject, Semester, Topic, StudySession, QuickNote } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';
import {
  fromDbSemester,
  toDbSemester,
  fromDbSubject,
  toDbSubject,
  fromDbTopic,
  toDbTopic,
  fromDbTask,
  toDbTask,
  fromDbSession,
  toDbSession,
  fromDbQuickNote,
  toDbQuickNote,
  type DbSemester,
  type DbSubject,
  type DbTopic,
  type DbTask,
  type DbStudySession,
  type DbQuickNote,
} from './supabaseMappers';

export function ensureUuid(id?: string): string {
  if (id && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return id;
  }
  return crypto.randomUUID();
}

const UPDATE_EVENT = 'studyos_data_updated';

const emptyData: StudyOSData = {
  semesters: [],
  subjects: [],
  topics: [],
  tasks: [],
  studySessions: [],
  quickNotes: [],
  dailyStudyGoalMinutes: 240,
};

// Global in-memory cache for cross-island sync
let cachedData: StudyOSData = emptyData;
let hasLoadedFromRemote = false;

export function useStudyOS() {
  const [data, setData] = useState<StudyOSData>(cachedData);
  const [isReady, setIsReady] = useState(hasLoadedFromRemote);
  const [isLoading, setIsLoading] = useState(!hasLoadedFromRemote);
  const [error, setError] = useState<string | null>(null);

  // Broadcast state changes across all Astro React islands
  const broadcastData = (newData: StudyOSData) => {
    cachedData = newData;
    setData(newData);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: newData }));
    }
  };

  // Fetch all user data from Supabase
  const loadRemoteData = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setIsReady(true);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setIsReady(true);
        setIsLoading(false);
        return;
      }

      // Fetch all tables in parallel
      const [
        profileRes,
        semestersRes,
        subjectsRes,
        topicsRes,
        tasksRes,
        sessionsRes,
        notesRes,
      ] = await Promise.all([
        supabase.from('user_profiles').select('daily_study_goal_minutes').eq('id', user.id).maybeSingle(),
        supabase.from('semesters').select('*').order('start_date', { ascending: false }),
        supabase.from('subjects').select('*').order('name', { ascending: true }),
        supabase.from('topics').select('*').order('title', { ascending: true }),
        supabase.from('tasks').select('*').order('due_date', { ascending: true }),
        supabase.from('study_sessions').select('*').order('date', { ascending: false }),
        supabase.from('quick_notes').select('*').order('created_at', { ascending: false }),
      ]);

      if (profileRes.error) console.error('Error fetching profile:', profileRes.error);
      if (semestersRes.error) console.error('Error fetching semesters:', semestersRes.error);
      if (subjectsRes.error) console.error('Error fetching subjects:', subjectsRes.error);
      if (topicsRes.error) console.error('Error fetching topics:', topicsRes.error);
      if (tasksRes.error) console.error('Error fetching tasks:', tasksRes.error);
      if (sessionsRes.error) console.error('Error fetching study sessions:', sessionsRes.error);
      if (notesRes.error) console.error('Error fetching quick notes:', notesRes.error);

      // Auto-provision profile if missing
      let dailyGoal = profileRes.data?.daily_study_goal_minutes || 240;
      if (!profileRes.data) {
        await supabase.from('user_profiles').upsert({ id: user.id, daily_study_goal_minutes: 240 });
      }

      const freshData: StudyOSData = {
        semesters: ((semestersRes.data as DbSemester[]) || []).map(fromDbSemester),
        subjects: ((subjectsRes.data as DbSubject[]) || []).map(fromDbSubject),
        topics: ((topicsRes.data as DbTopic[]) || []).map(fromDbTopic),
        tasks: ((tasksRes.data as DbTask[]) || []).map(fromDbTask),
        studySessions: ((sessionsRes.data as DbStudySession[]) || []).map(fromDbSession),
        quickNotes: ((notesRes.data as DbQuickNote[]) || []).map(fromDbQuickNote),
        dailyStudyGoalMinutes: dailyGoal,
      };

      hasLoadedFromRemote = true;
      broadcastData(freshData);
      setIsReady(true);
    } catch (err: any) {
      console.error('Failed to load StudyOS data from Supabase:', err);
      setError(err.message || 'Failed to connect to Supabase');
      setIsReady(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial load
    if (!hasLoadedFromRemote) {
      loadRemoteData();
    }

    // Listen for auth state changes to reload or clear data
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        loadRemoteData();
      } else if (event === 'SIGNED_OUT') {
        hasLoadedFromRemote = false;
        broadcastData(emptyData);
        setIsReady(true);
      }
    });

    // Cross-island communication
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<StudyOSData>;
      if (customEvent.detail) {
        setData(customEvent.detail);
      }
    };

    window.addEventListener(UPDATE_EVENT, handleUpdate);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener(UPDATE_EVENT, handleUpdate);
    };
  }, [loadRemoteData]);

  // Derived state
  const activeSemester = data.semesters.find((s) => s.isActive && !s.isArchived) || data.semesters[0];

  const activeSubjects = data.subjects.filter(
    (s) => s.semesterId === activeSemester?.id && !s.isArchived
  );

  // Helper for optimistic mutations + Supabase persistence
  const getUserId = async (): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    return user ? user.id : null;
  };

  // --- Mutators ---

  const setActiveSemesterId = useCallback(async (semesterId: string) => {
    const nextSemesters = data.semesters.map((s) => ({
      ...s,
      isActive: s.id === semesterId,
    }));
    broadcastData({ ...data, semesters: nextSemesters });

    try {
      const userId = await getUserId();
      if (!userId) return;

      // Update in Supabase
      await Promise.all([
        supabase.from('semesters').update({ is_active: false }).eq('user_id', userId),
        supabase.from('semesters').update({ is_active: true }).eq('id', semesterId).eq('user_id', userId),
      ]);
    } catch (err: any) {
      console.error('Failed to set active semester:', err);
      setError(err.message);
    }
  }, [data]);

  const addSemester = useCallback(async (semester: Semester) => {
    const semWithUuid = { ...semester, id: ensureUuid(semester.id) };
    broadcastData({
      ...data,
      semesters: [semWithUuid, ...data.semesters],
    });

    try {
      const userId = await getUserId();
      if (!userId) return;
      const { error: err } = await supabase.from('semesters').insert(toDbSemester(semWithUuid, userId));
      if (err) throw err;
    } catch (err: any) {
      console.error('Failed to add semester:', err);
      setError(err.message);
      loadRemoteData();
    }
  }, [data, loadRemoteData]);

  const updateSemester = useCallback(async (updated: Semester) => {
    broadcastData({
      ...data,
      semesters: data.semesters.map((s) => (s.id === updated.id ? updated : s)),
    });

    try {
      const userId = await getUserId();
      if (!userId) return;
      const { error: err } = await supabase.from('semesters').update(toDbSemester(updated, userId)).eq('id', updated.id);
      if (err) throw err;
    } catch (err: any) {
      console.error('Failed to update semester:', err);
      setError(err.message);
      loadRemoteData();
    }
  }, [data, loadRemoteData]);

  const addSubject = useCallback(async (subject: Subject) => {
    const subWithUuid = { ...subject, id: ensureUuid(subject.id) };
    broadcastData({
      ...data,
      subjects: [...data.subjects, subWithUuid],
    });

    try {
      const userId = await getUserId();
      if (!userId) return;
      const { error: err } = await supabase.from('subjects').insert(toDbSubject(subWithUuid, userId));
      if (err) throw err;
    } catch (err: any) {
      console.error('Failed to add subject:', err);
      setError(err.message);
      loadRemoteData();
    }
  }, [data, loadRemoteData]);

  const updateSubject = useCallback(async (updated: Subject) => {
    broadcastData({
      ...data,
      subjects: data.subjects.map((s) => (s.id === updated.id ? updated : s)),
    });

    try {
      const userId = await getUserId();
      if (!userId) return;
      const { error: err } = await supabase.from('subjects').update(toDbSubject(updated, userId)).eq('id', updated.id);
      if (err) throw err;
    } catch (err: any) {
      console.error('Failed to update subject:', err);
      setError(err.message);
      loadRemoteData();
    }
  }, [data, loadRemoteData]);

  const addTopic = useCallback(async (topic: Topic) => {
    const topicWithUuid = { ...topic, id: ensureUuid(topic.id) };
    broadcastData({
      ...data,
      topics: [...data.topics, topicWithUuid],
    });

    try {
      const userId = await getUserId();
      if (!userId) return;
      const { error: err } = await supabase.from('topics').insert(toDbTopic(topicWithUuid, userId));
      if (err) throw err;
    } catch (err: any) {
      console.error('Failed to add topic:', err);
      setError(err.message);
      loadRemoteData();
    }
  }, [data, loadRemoteData]);

  const updateTopic = useCallback(async (updated: Topic) => {
    broadcastData({
      ...data,
      topics: data.topics.map((t) => (t.id === updated.id ? updated : t)),
    });

    try {
      const userId = await getUserId();
      if (!userId) return;
      const { error: err } = await supabase.from('topics').update(toDbTopic(updated, userId)).eq('id', updated.id);
      if (err) throw err;
    } catch (err: any) {
      console.error('Failed to update topic:', err);
      setError(err.message);
      loadRemoteData();
    }
  }, [data, loadRemoteData]);

  const addTask = useCallback(async (task: Task) => {
    const taskWithUuid = { ...task, id: ensureUuid(task.id) };
    broadcastData({
      ...data,
      tasks: [taskWithUuid, ...data.tasks],
    });

    try {
      const userId = await getUserId();
      if (!userId) return;
      const { error: err } = await supabase.from('tasks').insert(toDbTask(taskWithUuid, userId));
      if (err) throw err;
    } catch (err: any) {
      console.error('Failed to add task:', err);
      setError(err.message);
      loadRemoteData();
    }
  }, [data, loadRemoteData]);

  const updateTask = useCallback(async (updated: Task) => {
    broadcastData({
      ...data,
      tasks: data.tasks.map((t) => (t.id === updated.id ? updated : t)),
    });

    try {
      const userId = await getUserId();
      if (!userId) return;
      const { error: err } = await supabase.from('tasks').update(toDbTask(updated, userId)).eq('id', updated.id);
      if (err) throw err;
    } catch (err: any) {
      console.error('Failed to update task:', err);
      setError(err.message);
      loadRemoteData();
    }
  }, [data, loadRemoteData]);

  const deleteTask = useCallback(async (taskId: string) => {
    broadcastData({
      ...data,
      tasks: data.tasks.filter((t) => t.id !== taskId),
    });

    try {
      const { error: err } = await supabase.from('tasks').delete().eq('id', taskId);
      if (err) throw err;
    } catch (err: any) {
      console.error('Failed to delete task:', err);
      setError(err.message);
      loadRemoteData();
    }
  }, [data, loadRemoteData]);

  const toggleTaskCompleted = useCallback(async (taskId: string) => {
    const target = data.tasks.find((t) => t.id === taskId);
    if (!target) return;

    const newStatus = target.status === 'completed' ? 'todo' : 'completed';
    const completedAt = newStatus === 'completed' ? new Date().toISOString() : undefined;

    const updatedTask: Task = {
      ...target,
      status: newStatus,
      completedAt,
    };

    updateTask(updatedTask);
  }, [data.tasks, updateTask]);

  const rescheduleTask = useCallback(async (taskId: string, newDate: string) => {
    const target = data.tasks.find((t) => t.id === taskId);
    if (!target) return;

    const updatedTask: Task = {
      ...target,
      scheduledDate: newDate,
      dueDate: newDate,
    };

    updateTask(updatedTask);
  }, [data.tasks, updateTask]);

  const addStudySession = useCallback(async (session: StudySession) => {
    const sessionWithUuid = { ...session, id: ensureUuid(session.id) };
    broadcastData({
      ...data,
      studySessions: [sessionWithUuid, ...data.studySessions],
    });

    try {
      const userId = await getUserId();
      if (!userId) return;
      const { error: err } = await supabase.from('study_sessions').insert(toDbSession(sessionWithUuid, userId));
      if (err) throw err;
    } catch (err: any) {
      console.error('Failed to add study session:', err);
      setError(err.message);
      loadRemoteData();
    }
  }, [data, loadRemoteData]);

  const updateStudySession = useCallback(async (updated: StudySession) => {
    broadcastData({
      ...data,
      studySessions: data.studySessions.map((s) => (s.id === updated.id ? updated : s)),
    });

    try {
      const userId = await getUserId();
      if (!userId) return;
      const { error: err } = await supabase.from('study_sessions').update(toDbSession(updated, userId)).eq('id', updated.id);
      if (err) throw err;
    } catch (err: any) {
      console.error('Failed to update study session:', err);
      setError(err.message);
      loadRemoteData();
    }
  }, [data, loadRemoteData]);

  const deleteStudySession = useCallback(async (sessionId: string) => {
    broadcastData({
      ...data,
      studySessions: data.studySessions.filter((s) => s.id !== sessionId),
    });

    try {
      const { error: err } = await supabase.from('study_sessions').delete().eq('id', sessionId);
      if (err) throw err;
    } catch (err: any) {
      console.error('Failed to delete study session:', err);
      setError(err.message);
      loadRemoteData();
    }
  }, [data, loadRemoteData]);

  const updateDailyGoal = useCallback(async (minutes: number) => {
    broadcastData({
      ...data,
      dailyStudyGoalMinutes: minutes,
    });

    try {
      const userId = await getUserId();
      if (!userId) return;
      const { error: err } = await supabase.from('user_profiles').upsert({ id: userId, daily_study_goal_minutes: minutes });
      if (err) throw err;
    } catch (err: any) {
      console.error('Failed to update daily goal:', err);
      setError(err.message);
    }
  }, [data]);

  const addQuickNote = useCallback(async (note: QuickNote) => {
    const noteWithUuid = { ...note, id: ensureUuid(note.id) };
    broadcastData({
      ...data,
      quickNotes: [noteWithUuid, ...data.quickNotes],
    });

    try {
      const userId = await getUserId();
      if (!userId) return;
      const { error: err } = await supabase.from('quick_notes').insert(toDbQuickNote(noteWithUuid, userId));
      if (err) throw err;
    } catch (err: any) {
      console.error('Failed to add quick note:', err);
      setError(err.message);
      loadRemoteData();
    }
  }, [data, loadRemoteData]);

  return {
    data,
    isReady,
    isLoading,
    error,
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
    refreshData: loadRemoteData,
  };
}

import { supabase } from './supabaseClient';

export interface DeletedRecordsRegistry {
  examIds: string[];
  questionIds: string[];
  submissionIds: string[];
  updatedAt?: string;
}

const TOMBSTONE_STORAGE_KEY = 'cbt_deleted_records_v2';

let inMemoryTombstones: DeletedRecordsRegistry | null = null;

export const getLocalTombstones = (): DeletedRecordsRegistry => {
  if (inMemoryTombstones) return inMemoryTombstones;
  try {
    const raw = localStorage.getItem(TOMBSTONE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      inMemoryTombstones = {
        examIds: Array.isArray(parsed.examIds) ? parsed.examIds : [],
        questionIds: Array.isArray(parsed.questionIds) ? parsed.questionIds : [],
        submissionIds: Array.isArray(parsed.submissionIds) ? parsed.submissionIds : [],
        updatedAt: parsed.updatedAt || new Date().toISOString()
      };
      return inMemoryTombstones;
    }
  } catch (err) {
    console.warn('Failed to parse local tombstones:', err);
  }

  inMemoryTombstones = {
    examIds: ['exam_1789888620615_eny1'], // Pre-seeded with the known obsolete/deleted exam
    questionIds: [],
    submissionIds: [],
    updatedAt: new Date().toISOString()
  };
  return inMemoryTombstones;
};

export const saveLocalTombstones = (registry: DeletedRecordsRegistry): void => {
  inMemoryTombstones = {
    examIds: Array.from(new Set(registry.examIds || [])),
    questionIds: Array.from(new Set(registry.questionIds || [])),
    submissionIds: Array.from(new Set(registry.submissionIds || [])),
    updatedAt: new Date().toISOString()
  };
  try {
    localStorage.setItem(TOMBSTONE_STORAGE_KEY, JSON.stringify(inMemoryTombstones));
  } catch (err) {
    console.warn('Failed to save local tombstones:', err);
  }
};

export const isExamDeleted = (examId: string): boolean => {
  if (!examId) return false;
  const tombstones = getLocalTombstones();
  return tombstones.examIds.includes(examId);
};

export const isQuestionDeleted = (questionId: string, examId?: string): boolean => {
  if (!questionId) return false;
  const tombstones = getLocalTombstones();
  if (tombstones.questionIds.includes(questionId)) return true;
  if (examId && tombstones.examIds.includes(examId)) return true;
  return false;
};

export const isSubmissionDeleted = (submissionId: string, examId?: string): boolean => {
  if (!submissionId) return false;
  const tombstones = getLocalTombstones();
  if (tombstones.submissionIds.includes(submissionId)) return true;
  if (examId && tombstones.examIds.includes(examId)) return true;
  return false;
};

export const markExamDeleted = async (
  examId: string,
  questionIds?: string[],
  submissionIds?: string[]
): Promise<void> => {
  const current = getLocalTombstones();
  const newExamIds = Array.from(new Set([...current.examIds, examId]));
  const newQuestionIds = Array.from(new Set([...current.questionIds, ...(questionIds || [])]));
  const newSubmissionIds = Array.from(new Set([...current.submissionIds, ...(submissionIds || [])]));

  const updated: DeletedRecordsRegistry = {
    examIds: newExamIds,
    questionIds: newQuestionIds,
    submissionIds: newSubmissionIds,
    updatedAt: new Date().toISOString()
  };

  saveLocalTombstones(updated);

  // Sync to Supabase cbt_sync_store
  try {
    await supabase.from('cbt_sync_store').upsert({
      key: 'deleted_records',
      value: updated,
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Failed to push exam tombstone to Supabase:', err);
  }
};

export const markQuestionDeleted = async (questionId: string): Promise<void> => {
  const current = getLocalTombstones();
  const updated: DeletedRecordsRegistry = {
    examIds: current.examIds,
    questionIds: Array.from(new Set([...current.questionIds, questionId])),
    submissionIds: current.submissionIds,
    updatedAt: new Date().toISOString()
  };

  saveLocalTombstones(updated);

  try {
    await supabase.from('cbt_sync_store').upsert({
      key: 'deleted_records',
      value: updated,
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Failed to push question tombstone to Supabase:', err);
  }
};

export const markSubmissionDeleted = async (submissionId: string): Promise<void> => {
  const current = getLocalTombstones();
  const updated: DeletedRecordsRegistry = {
    examIds: current.examIds,
    questionIds: current.questionIds,
    submissionIds: Array.from(new Set([...current.submissionIds, submissionId])),
    updatedAt: new Date().toISOString()
  };

  saveLocalTombstones(updated);

  try {
    await supabase.from('cbt_sync_store').upsert({
      key: 'deleted_records',
      value: updated,
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Failed to push submission tombstone to Supabase:', err);
  }
};

export const syncTombstonesWithSupabase = async (): Promise<DeletedRecordsRegistry> => {
  const local = getLocalTombstones();
  try {
    const { data, error } = await supabase
      .from('cbt_sync_store')
      .select('value')
      .eq('key', 'deleted_records')
      .maybeSingle();

    if (!error && data && data.value) {
      const remote = data.value as DeletedRecordsRegistry;
      const merged: DeletedRecordsRegistry = {
        examIds: Array.from(new Set([...local.examIds, ...(remote.examIds || [])])),
        questionIds: Array.from(new Set([...local.questionIds, ...(remote.questionIds || [])])),
        submissionIds: Array.from(new Set([...local.submissionIds, ...(remote.submissionIds || [])])),
        updatedAt: new Date().toISOString()
      };
      saveLocalTombstones(merged);

      // If local had items not in remote, update remote
      if (
        merged.examIds.length !== (remote.examIds || []).length ||
        merged.questionIds.length !== (remote.questionIds || []).length ||
        merged.submissionIds.length !== (remote.submissionIds || []).length
      ) {
        await supabase.from('cbt_sync_store').upsert({
          key: 'deleted_records',
          value: merged,
          updated_at: new Date().toISOString()
        });
      }
      return merged;
    }
  } catch (err) {
    console.warn('Failed to sync tombstones with Supabase:', err);
  }
  return local;
};

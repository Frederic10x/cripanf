export const CATEGORIES = {
  TODO: 'todo',
  DONE: 'done',
  RECURRING: 'recurring',
  WAITING_FOLLOWUP: 'waiting_followup'
} as const;

export type Category = typeof CATEGORIES[keyof typeof CATEGORIES];

export const CATEGORY_LABELS: Record<Category, string> = {
  todo: 'À faire',
  done: 'Fait',
  recurring: 'Tâches cycliques',
  waiting_followup: 'Attente de retour'
};

export const CATEGORY_COLORS: Record<Category, string> = {
  todo: 'var(--category-todo)',
  done: 'var(--category-done)',
  recurring: 'var(--category-recurring)',
  waiting_followup: 'var(--category-waiting)'
};

export const CATEGORY_ICONS: Record<Category, string> = {
  todo: '📝',
  done: '✓',
  recurring: '🔄',
  waiting_followup: '⏳'
};

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: Category;
  created_at: string;
  updated_at: string;
  is_voice_note: boolean;
}

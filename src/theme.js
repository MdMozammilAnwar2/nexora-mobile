// Apple-inspired design tokens with a vibrant brand gradient
export const colors = {
  bg: '#F2F2F7',
  card: '#FFFFFF',
  text: '#0B0B0F',
  sub: '#6B7280',
  faint: '#9CA3AF',
  line: 'rgba(60,60,67,0.12)',
  brand: '#5B5BF6',
  violet: '#8B5CF6',
  pink: '#EC4899',
  green: '#22C55E',
  orange: '#F97316',
  red: '#EF4444',
  blue: '#3B82F6',
  amber: '#F59E0B',
  fill: 'rgba(120,120,128,0.12)',
};

export const gradient = ['#6366F1', '#8B5CF6', '#EC4899'];
export const gradientSoft = ['#EEF2FF', '#F5F3FF', '#FDF2F8'];

export const radius = { sm: 10, md: 14, lg: 20, xl: 28 };

export const shadow = {
  shadowColor: '#1E1B4B',
  shadowOpacity: 0.08,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 8 },
  elevation: 3,
};

export const type = {
  largeTitle: { fontSize: 34, fontWeight: '800', letterSpacing: -0.8, color: colors.text },
  title: { fontSize: 22, fontWeight: '700', letterSpacing: -0.4, color: colors.text },
  headline: { fontSize: 17, fontWeight: '600', letterSpacing: -0.2, color: colors.text },
  body: { fontSize: 16, color: colors.text },
  callout: { fontSize: 15, color: colors.text },
  sub: { fontSize: 13, color: colors.sub },
  caption: { fontSize: 11, fontWeight: '600', letterSpacing: 0.4, color: colors.faint, textTransform: 'uppercase' },
};

export const STATUSES = [
  { id: 'todo', label: 'To Do', color: '#8E8E93' },
  { id: 'in_progress', label: 'In Progress', color: '#3B82F6' },
  { id: 'in_review', label: 'In Review', color: '#F59E0B' },
  { id: 'done', label: 'Done', color: '#22C55E' },
];
export const statusOf = (id) => STATUSES.find((s) => s.id === id) || STATUSES[0];

export const TYPES = {
  epic: { label: 'Epic', icon: 'flash', color: '#8B5CF6' },
  story: { label: 'Story', icon: 'bookmark', color: '#22C55E' },
  task: { label: 'Task', icon: 'checkmark', color: '#0EA5E9' },
  bug: { label: 'Bug', icon: 'bug', color: '#EF4444' },
  subtask: { label: 'Sub-task', icon: 'git-branch', color: '#64748B' },
};

export const PRIORITIES = {
  highest: { label: 'Highest', icon: 'chevron-up-circle', color: '#E11D48' },
  high: { label: 'High', icon: 'arrow-up', color: '#F97316' },
  medium: { label: 'Medium', icon: 'reorder-two', color: '#F59E0B' },
  low: { label: 'Low', icon: 'arrow-down', color: '#0EA5E9' },
  lowest: { label: 'Lowest', icon: 'chevron-down-circle', color: '#94A3B8' },
};

export const ROLES = {
  admin: { label: 'Admin', color: '#7C3AED' },
  manager: { label: 'Manager', color: '#4F46E5' },
  member: { label: 'Member', color: '#059669' },
  viewer: { label: 'Viewer', color: '#64748B' },
};

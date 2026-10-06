import { statusOf } from '../theme';

export function describeActivity(a) {
  const m = a.meta || {};
  switch (a.action) {
    case 'issue.created': return `created ${m.key}`;
    case 'issue.status': return `moved ${m.key} to ${statusOf(m.changes?.status?.to).label}`;
    case 'issue.updated': return `updated ${m.key}`;
    case 'issue.deleted': return `deleted ${m.key}`;
    case 'comment.added': return `commented on ${m.key}`;
    case 'sprint.created': return `created ${m.name}`;
    case 'sprint.started': return `started ${m.name}`;
    case 'sprint.completed': return `completed ${m.name}`;
    case 'member.added': return `added ${m.name}`;
    case 'project.created': return 'created the project';
    default: return 'made changes';
  }
}

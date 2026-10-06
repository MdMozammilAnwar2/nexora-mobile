import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Bounce, TypeIcon, PriorityIcon, Avatar, StatusPill } from './ui';
import { colors, shadow } from '../theme';

export default function IssueRow({ issue, onPress, showStatus = true, showProject }) {
  const overdue = issue.dueDate && issue.status !== 'done' && new Date(issue.dueDate) < new Date(new Date().toDateString());
  return (
    <Bounce onPress={onPress} style={s.card}>
      <Text style={[s.title, issue.status === 'done' && { color: colors.sub }]} numberOfLines={2}>{issue.title}</Text>
      <View style={s.meta}>
        <TypeIcon type={issue.type} size={16} />
        <Text style={[s.key, showProject && issue.project && { color: issue.project.color }]}>{issue.key}</Text>
        {issue.dueDate && (
          <View style={s.due}>
            <Ionicons name="calendar-outline" size={11} color={overdue ? colors.red : colors.faint} />
            <Text style={[s.dueText, overdue && { color: colors.red, fontWeight: '700' }]}>{issue.dueDate.slice(5)}</Text>
          </View>
        )}
        <View style={{ flex: 1 }} />
        {showStatus && <StatusPill status={issue.status} />}
        {issue.storyPoints != null && <View style={s.pts}><Text style={s.ptsText}>{issue.storyPoints}</Text></View>}
        <PriorityIcon priority={issue.priority} size={15} />
        <Avatar user={issue.assignee} size={24} />
      </View>
    </Bounce>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 14, marginBottom: 10, ...shadow, shadowOpacity: 0.05 },
  title: { fontSize: 15, fontWeight: '600', color: colors.text, lineHeight: 20, letterSpacing: -0.2 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 10 },
  key: { fontSize: 12, fontWeight: '700', color: colors.sub },
  due: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  dueText: { fontSize: 11, color: colors.faint },
  pts: { minWidth: 20, height: 20, borderRadius: 10, backgroundColor: colors.fill, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  ptsText: { fontSize: 10, fontWeight: '800', color: colors.sub },
});

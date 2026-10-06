import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatDistanceToNow, format } from 'date-fns';
import api from '../api';
import { useAuth } from '../auth';
import { Loader, Avatar, TypeIcon, PriorityIcon, StatusPill, ListRow, OptionSheet, Bounce, tap } from '../components/ui';
import { colors, type, STATUSES, TYPES, PRIORITIES, statusOf, shadow } from '../theme';

export default function IssueScreen({ route, navigation }) {
  const { id } = route.params;
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [issue, setIssue] = useState(null);
  const [role, setRole] = useState(null);
  const [project, setProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [sheet, setSheet] = useState(null);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    try {
      const [{ issue, myRole }, { comments }] = await Promise.all([api.get(`/issues/${id}`), api.get(`/issues/${id}/comments`)]);
      setIssue(issue);
      setRole(myRole);
      setTitle(issue.title);
      setDesc(issue.description || '');
      setComments(comments);
      const p = await api.get(`/projects/${issue.projectId}`);
      setProject(p.project);
    } catch (e) {
      Alert.alert('Error', e.message);
      navigation.goBack();
    }
  }, [id, navigation]);
  useEffect(() => { load(); }, [load]);

  const canEdit = ['admin', 'manager', 'member'].includes(role);

  const remove = useCallback(() => {
    Alert.alert(`Delete ${issue?.key}?`, 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await api.del(`/issues/${id}`); navigation.goBack(); } catch (e) { Alert.alert('Error', e.message); }
      } },
    ]);
  }, [issue, id, navigation]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: issue?.key || '',
      headerRight: () => canEdit ? <Pressable hitSlop={10} onPress={remove}><Ionicons name="trash-outline" size={22} color={colors.red} /></Pressable> : null,
    });
  }, [navigation, issue, canEdit, remove]);

  const update = async (patch) => {
    const prev = issue;
    setIssue({ ...issue, ...patch });
    try {
      const { issue: u } = await api.patch(`/issues/${id}`, patch);
      setIssue(u);
    } catch (e) {
      setIssue(prev);
      Alert.alert('Could not update', e.message);
    }
  };

  const send = async () => {
    if (!comment.trim()) return;
    setSending(true);
    try {
      const { comment: c } = await api.post(`/issues/${id}/comments`, { body: comment.trim() });
      setComments([...comments, c]);
      setComment('');
      tap();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSending(false);
    }
  };

  if (!issue) return <Loader />;
  const members = (project?.members || []).filter((m) => m.role !== 'viewer');
  const sprints = project?.sprints || [];
  const st = statusOf(issue.status);

  const sheets = {
    status: { title: 'Status', value: issue.status, options: STATUSES.map((s) => ({ value: s.id, label: s.label, left: <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: s.color }} /> })), apply: (v) => update({ status: v }) },
    type: { title: 'Type', value: issue.type, options: Object.entries(TYPES).map(([k, t]) => ({ value: k, label: t.label, left: <TypeIcon type={k} size={22} /> })), apply: (v) => update({ type: v }) },
    priority: { title: 'Priority', value: issue.priority, options: Object.entries(PRIORITIES).map(([k, p]) => ({ value: k, label: p.label, left: <PriorityIcon priority={k} size={20} /> })), apply: (v) => update({ priority: v }) },
    assignee: { title: 'Assignee', value: issue.assigneeId || null, options: [{ value: null, label: 'Unassigned', left: <Avatar user={null} size={28} /> }, ...members.map((m) => ({ value: m.user.id, label: m.user.name, left: <Avatar user={m.user} size={28} /> }))], apply: (v) => update({ assigneeId: v }) },
    sprint: { title: 'Sprint', value: issue.sprintId || null, options: [{ value: null, label: 'Backlog' }, ...sprints.map((s) => ({ value: s.id, label: s.name + (s.status === 'active' ? ' · active' : '') }))], apply: (v) => update({ sprintId: v }) },
    points: { title: 'Story points', value: issue.storyPoints ?? null, options: [null, 1, 2, 3, 5, 8, 13, 21].map((n) => ({ value: n, label: n == null ? 'None' : String(n) })), apply: (v) => update({ storyPoints: v }) },
  };
  const open = (k) => canEdit && setSheet(k);
  const cur = sheet && sheets[sheet];

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 30 }} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TypeIcon type={issue.type} size={20} />
          <Text style={[type.sub, { fontWeight: '700' }]}>{issue.key} · {project?.name}</Text>
        </View>
        <TextInput editable={canEdit} multiline value={title} onChangeText={setTitle} style={s.title}
          onEndEditing={() => title.trim() && title !== issue.title && update({ title: title.trim() })} />

        <Bounce onPress={() => open('status')} style={[s.statusBtn, { backgroundColor: st.color }]}>
          <Text style={s.statusText}>{st.label}</Text>
          {canEdit && <Ionicons name="chevron-down" size={16} color="#fff" />}
        </Bounce>

        <View style={s.group}>
          <ListRow icon="person" iconBg="#6366F1" label="Assignee" onPress={canEdit ? () => open('assignee') : undefined}
            value={<View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><Avatar user={issue.assignee} size={22} /><Text style={[type.callout, { color: colors.sub }]}>{issue.assignee?.name || 'Unassigned'}</Text></View>} />
          <ListRow icon="layers" iconBg="#0EA5E9" label="Type" value={TYPES[issue.type]?.label} onPress={canEdit ? () => open('type') : undefined} />
          <ListRow icon="flag" iconBg="#F97316" label="Priority" onPress={canEdit ? () => open('priority') : undefined}
            value={<View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><PriorityIcon priority={issue.priority} /><Text style={[type.callout, { color: colors.sub }]}>{PRIORITIES[issue.priority]?.label}</Text></View>} />
          <ListRow icon="rocket" iconBg="#8B5CF6" label="Sprint" value={issue.sprint?.name || 'Backlog'} onPress={canEdit ? () => open('sprint') : undefined} />
          <ListRow icon="speedometer" iconBg="#14B8A6" label="Story points" value={issue.storyPoints != null ? String(issue.storyPoints) : 'None'} onPress={canEdit ? () => open('points') : undefined} />
          <ListRow icon="calendar" iconBg="#EF4444" label="Due date" last
            value={<TextInput editable={canEdit} placeholder="YYYY-MM-DD" placeholderTextColor={colors.faint} defaultValue={issue.dueDate || ''} style={s.dateInput}
              onEndEditing={(e) => { const v = e.nativeEvent.text.trim(); if (v === (issue.dueDate || '')) return; if (v && !/^\d{4}-\d{2}-\d{2}$/.test(v)) return Alert.alert('Use format YYYY-MM-DD'); update({ dueDate: v || null }); }} />} />
        </View>

        <Text style={s.caption}>DESCRIPTION</Text>
        <View style={[s.group, { padding: 14 }]}>
          <TextInput editable={canEdit} multiline placeholder={canEdit ? 'Add a description…' : 'No description'} placeholderTextColor={colors.faint}
            value={desc} onChangeText={setDesc} style={s.desc} onEndEditing={() => desc !== (issue.description || '') && update({ description: desc })} />
        </View>

        <Text style={s.caption}>REPORTED BY</Text>
        <View style={[s.group, { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 }]}>
          <Avatar user={issue.reporter} size={30} />
          <View>
            <Text style={type.callout}>{issue.reporter?.name || '—'}</Text>
            <Text style={[type.sub, { fontSize: 12 }]}>Created {format(new Date(issue.createdAt), 'MMM d, yyyy')} · updated {formatDistanceToNow(new Date(issue.updatedAt), { addSuffix: true })}</Text>
          </View>
        </View>

        <Text style={s.caption}>COMMENTS · {comments.length}</Text>
        {comments.map((c) => {
          const mine = c.author?.id === user.id;
          return (
            <View key={c.id} style={[s.cRow, mine && { flexDirection: 'row-reverse' }]}>
              <Avatar user={c.author} size={30} />
              <View style={{ maxWidth: '78%' }}>
                <View style={[s.bubble, mine && s.bubbleMine]}>
                  <Text style={[type.callout, mine && { color: '#fff' }]}>{c.body}</Text>
                </View>
                <Text style={[s.cMeta, mine && { textAlign: 'right' }]}>{c.author?.name} · {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</Text>
              </View>
            </View>
          );
        })}
        {comments.length === 0 && <Text style={[type.sub, { marginLeft: 4 }]}>No comments yet. Start the conversation.</Text>}
      </ScrollView>

      {!(role === 'viewer' && user.role === 'viewer') && (
        <View style={[s.composer, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          <TextInput placeholder="Write a comment…" placeholderTextColor={colors.faint} value={comment} onChangeText={setComment} style={s.cInput} multiline />
          <Bounce onPress={send} disabled={!comment.trim() || sending} style={s.send}>
            <Ionicons name="arrow-up" size={20} color="#fff" />
          </Bounce>
        </View>
      )}

      <OptionSheet visible={!!cur} title={cur?.title} options={cur?.options || []} value={cur?.value} onSelect={(v) => cur.apply(v)} onClose={() => setSheet(null)} />
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '800', letterSpacing: -0.6, color: colors.text, marginTop: 8, padding: 0 },
  statusBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 16, height: 36, borderRadius: 18, marginTop: 14 },
  statusText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  group: { backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', marginTop: 18, ...shadow, shadowOpacity: 0.04 },
  caption: { ...type.caption, marginTop: 24, marginLeft: 6, marginBottom: -8 },
  desc: { fontSize: 15, lineHeight: 22, color: colors.text, minHeight: 60, textAlignVertical: 'top', padding: 0 },
  dateInput: { fontSize: 15, color: colors.sub, minWidth: 110, textAlign: 'right', padding: 0 },
  cRow: { flexDirection: 'row', gap: 8, marginTop: 16, alignItems: 'flex-end' },
  bubble: { backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, borderBottomLeftRadius: 6 },
  bubbleMine: { backgroundColor: colors.brand, borderBottomLeftRadius: 20, borderBottomRightRadius: 6 },
  cMeta: { fontSize: 11, color: colors.faint, marginTop: 4, marginHorizontal: 6 },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 12, paddingTop: 10, backgroundColor: 'rgba(255,255,255,0.96)', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  cInput: { flex: 1, minHeight: 40, maxHeight: 120, backgroundColor: colors.bg, borderRadius: 20, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10, fontSize: 15, color: colors.text },
  send: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center' },
});

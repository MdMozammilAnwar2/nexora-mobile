import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TextInput } from 'react-native';
import api from '../api';
import { Input, GradientButton, ListRow, OptionSheet, TypeIcon, PriorityIcon, Avatar, Segmented } from '../components/ui';
import { colors, type, TYPES, PRIORITIES, shadow } from '../theme';

export default function CreateIssueScreen({ route, navigation }) {
  const { projectId, sprintId } = route.params;
  const [project, setProject] = useState(null);
  const [f, setF] = useState({ title: '', description: '', type: 'task', priority: 'medium', assigneeId: null, sprintId: sprintId || null, storyPoints: null });
  const [sheet, setSheet] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { api.get(`/projects/${projectId}`).then((d) => setProject(d.project)).catch(() => {}); }, [projectId]);
  const members = (project?.members || []).filter((m) => m.role !== 'viewer');
  const sprints = project?.sprints || [];
  const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!f.title.trim()) return Alert.alert('Add a summary', 'Give the issue a short title.');
    setBusy(true);
    try {
      await api.post(`/projects/${projectId}/issues`, { ...f, title: f.title.trim(), description: f.description || undefined });
      navigation.goBack();
    } catch (e) {
      Alert.alert('Could not create issue', e.message);
    } finally {
      setBusy(false);
    }
  };

  const sheets = {
    priority: { title: 'Priority', value: f.priority, options: Object.entries(PRIORITIES).map(([k, p]) => ({ value: k, label: p.label, left: <PriorityIcon priority={k} size={20} /> })), apply: set('priority') },
    assignee: { title: 'Assignee', value: f.assigneeId, options: [{ value: null, label: 'Unassigned', left: <Avatar user={null} size={28} /> }, ...members.map((m) => ({ value: m.user.id, label: m.user.name, left: <Avatar user={m.user} size={28} /> }))], apply: set('assigneeId') },
    sprint: { title: 'Sprint', value: f.sprintId, options: [{ value: null, label: 'Backlog' }, ...sprints.map((s) => ({ value: s.id, label: s.name }))], apply: set('sprintId') },
    points: { title: 'Story points', value: f.storyPoints, options: [null, 1, 2, 3, 5, 8, 13, 21].map((n) => ({ value: n, label: n == null ? 'None' : String(n) })), apply: set('storyPoints') },
  };
  const cur = sheet && sheets[sheet];
  const assignee = members.find((m) => m.user.id === f.assigneeId)?.user;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 18, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
      <Text style={[type.caption, { marginBottom: 8, marginLeft: 4 }]}>Type</Text>
      <Segmented value={f.type} onChange={set('type')} options={['task', 'story', 'bug', 'epic'].map((k) => ({ value: k, label: TYPES[k].label }))} />
      <Input label="Summary" placeholder="What needs to be done?" value={f.title} onChangeText={set('title')} style={{ marginTop: 18 }} autoFocus />
      <Text style={[type.caption, { marginTop: 18, marginBottom: 6, marginLeft: 4 }]}>Description</Text>
      <TextInput multiline placeholder="Add details…" placeholderTextColor={colors.faint} value={f.description} onChangeText={set('description')} style={s.desc} />

      <View style={s.group}>
        <ListRow icon="person" iconBg="#6366F1" label="Assignee" onPress={() => setSheet('assignee')}
          value={<View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><Avatar user={assignee} size={22} /><Text style={[type.callout, { color: colors.sub }]}>{assignee?.name || 'Unassigned'}</Text></View>} />
        <ListRow icon="flag" iconBg="#F97316" label="Priority" value={PRIORITIES[f.priority].label} onPress={() => setSheet('priority')} />
        <ListRow icon="rocket" iconBg="#8B5CF6" label="Sprint" value={sprints.find((s) => s.id === f.sprintId)?.name || 'Backlog'} onPress={() => setSheet('sprint')} />
        <ListRow icon="speedometer" iconBg="#14B8A6" label="Story points" value={f.storyPoints != null ? String(f.storyPoints) : 'None'} onPress={() => setSheet('points')} last />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 18, marginLeft: 4 }}>
        <TypeIcon type={f.type} size={18} /><Text style={type.sub}>New {TYPES[f.type].label.toLowerCase()} in {project?.name || '…'}</Text>
      </View>
      <GradientButton title="Create Issue" icon="add-circle" onPress={submit} loading={busy} style={{ marginTop: 18 }} />
      <OptionSheet visible={!!cur} title={cur?.title} options={cur?.options || []} value={cur?.value} onSelect={(v) => cur.apply(v)} onClose={() => setSheet(null)} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  desc: { backgroundColor: '#fff', borderRadius: 14, padding: 14, minHeight: 110, fontSize: 15, color: colors.text, textAlignVertical: 'top', borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  group: { backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', marginTop: 22, ...shadow, shadowOpacity: 0.04 },
});

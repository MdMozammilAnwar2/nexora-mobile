import { useCallback, useLayoutEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import api from '../api';
import { useAuth } from '../auth';
import IssueRow from '../components/IssueRow';
import { Loader, Segmented, OptionSheet, Avatar, RoleBadge, Card, Empty, Bounce, PlainButton } from '../components/ui';
import { colors, type, STATUSES, gradient, shadow } from '../theme';

export default function ProjectScreen({ route, navigation }) {
  const { id } = route.params;
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [role, setRole] = useState(null);
  const [issues, setIssues] = useState([]);
  const [tab, setTab] = useState('board');
  const [status, setStatus] = useState('todo');
  const [moving, setMoving] = useState(null);
  const [mine, setMine] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [p, i] = await Promise.all([api.get(`/projects/${id}`), api.get(`/projects/${id}/issues`)]);
      setProject(p.project);
      setRole(p.myRole);
      setIssues(i.issues);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setRefreshing(false);
    }
  }, [id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const canEdit = ['admin', 'manager', 'member'].includes(role);
  const canManage = ['admin', 'manager'].includes(role);
  const sprints = project?.sprints || [];
  const active = sprints.find((s) => s.status === 'active');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => canEdit ? (
        <Pressable hitSlop={10} onPress={() => navigation.navigate('CreateIssue', { projectId: id, sprintId: tab === 'board' ? active?.id : null })}>
          <Ionicons name="add-circle" size={30} color={colors.brand} />
        </Pressable>
      ) : null,
    });
  }, [navigation, canEdit, id, tab, active]);

  if (!project) return <Loader />;

  const scoped = (active ? issues.filter((i) => i.sprintId === active.id) : issues).filter((i) => !mine || i.assigneeId === user.id);
  const byStatus = (st) => scoped.filter((i) => i.status === st).sort((a, b) => a.position - b.position);
  const pts = scoped.reduce((a, i) => a + (i.storyPoints || 0), 0);
  const donePts = scoped.filter((i) => i.status === 'done').reduce((a, i) => a + (i.storyPoints || 0), 0);

  const move = async (issue, to) => {
    if (to === issue.status) return;
    const prev = issues;
    setIssues(issues.map((i) => (i.id === issue.id ? { ...i, status: to } : i)));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    try {
      const target = issues.filter((i) => i.status === to);
      const max = target.length ? Math.max(...target.map((i) => i.position)) : 0;
      await api.post(`/issues/${issue.id}/move`, { status: to, position: max + 1000 });
    } catch (e) {
      setIssues(prev);
      Alert.alert('Could not move issue', e.message);
    }
  };

  const sprintAction = (sprint, action) => {
    const run = async (body) => {
      try { await api.post(`/sprints/${sprint.id}/${action}`, body); load(); } catch (e) { Alert.alert('Error', e.message); }
    };
    if (action === 'complete') Alert.alert('Complete sprint?', 'Unfinished issues will return to the backlog.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Complete', onPress: () => run({}) }]);
    else run();
  };

  const createSprint = async () => {
    try { await api.post(`/projects/${id}/sprints`, {}); load(); } catch (e) { Alert.alert('Error', e.message); }
  };

  const refresh = () => { setRefreshing(true); load(); };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 18, paddingBottom: 120 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brand} />} contentInsetAdjustmentBehavior="automatic">
      <Segmented value={tab} onChange={setTab} options={[{ value: 'board', label: 'Board' }, { value: 'backlog', label: 'Backlog' }, { value: 'team', label: 'Team' }]} />

      {tab === 'board' && (
        <>
          <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.sprint}>
            <Text style={s.sprintLabel}>{active ? 'ACTIVE SPRINT' : 'NO ACTIVE SPRINT'}</Text>
            <Text style={s.sprintName}>{active ? active.name : 'All issues'}</Text>
            {active?.goal ? <Text style={s.sprintGoal}>{active.goal}</Text> : null}
            <View style={s.track}><View style={[s.fill, { width: `${pts ? (donePts / pts) * 100 : 0}%` }]} /></View>
            <Text style={s.sprintMeta}>{donePts}/{pts} points · {active ? `ends ${active.endDate}` : 'start a sprint in Backlog'}</Text>
          </LinearGradient>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -18, marginTop: 16 }} contentContainerStyle={{ paddingHorizontal: 18, gap: 8 }}>
            {STATUSES.map((st) => {
              const on = st.id === status;
              return (
                <Bounce key={st.id} onPress={() => setStatus(st.id)} style={[s.chip, on && { backgroundColor: colors.text }]}>
                  <View style={[s.dot, { backgroundColor: st.color }]} />
                  <Text style={[s.chipText, on && { color: '#fff' }]}>{st.label}</Text>
                  <View style={[s.count, on && { backgroundColor: 'rgba(255,255,255,0.2)' }]}><Text style={[s.countText, on && { color: '#fff' }]}>{byStatus(st.id).length}</Text></View>
                </Bounce>
              );
            })}
          </ScrollView>

          <Pressable onPress={() => setMine(!mine)} style={s.mine}>
            <Ionicons name={mine ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={mine ? colors.brand : colors.faint} />
            <Text style={[type.callout, { color: mine ? colors.brand : colors.sub, fontWeight: '600' }]}>Only my issues</Text>
          </Pressable>
          <View style={{ marginTop: 6 }}>
            {byStatus(status).length === 0 ? <Card><Empty icon="albums-outline" title="Nothing here" text={canEdit ? 'Tap + to add an issue, or long-press an issue to move it.' : undefined} /></Card>
              : byStatus(status).map((i) => (
                <Pressable key={i.id} onLongPress={() => { if (canEdit) { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {}); setMoving(i); } }} delayLongPress={300}>
                  <IssueRow issue={i} showStatus={false} onPress={() => navigation.navigate('Issue', { id: i.id })} />
                </Pressable>
              ))}
            {canEdit && byStatus(status).length > 0 && <Text style={[type.sub, { textAlign: 'center', marginTop: 4, fontSize: 12 }]}>Long-press an issue to move it</Text>}
          </View>
        </>
      )}

      {tab === 'backlog' && (
        <View style={{ marginTop: 16 }}>
          {[...sprints.map((sp) => ({ sp, items: issues.filter((i) => i.sprintId === sp.id) })), { sp: null, items: issues.filter((i) => !i.sprintId) }].map(({ sp, items }) => (
            <View key={sp?.id || 'backlog'} style={{ marginBottom: 22 }}>
              <View style={s.groupHead}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={type.headline}>{sp ? sp.name : 'Backlog'}</Text>
                    {sp?.status === 'active' && <View style={s.activeTag}><Text style={s.activeTagText}>ACTIVE</Text></View>}
                  </View>
                  <Text style={type.sub}>{items.length} issues · {items.reduce((a, i) => a + (i.storyPoints || 0), 0)} pts</Text>
                </View>
                {canManage && sp?.status === 'planned' && <Bounce onPress={() => sprintAction(sp, 'start')} style={s.smallBtn}><Ionicons name="play" size={13} color={colors.brand} /><Text style={s.smallBtnText}>Start</Text></Bounce>}
                {canManage && sp?.status === 'active' && <Bounce onPress={() => sprintAction(sp, 'complete')} style={s.smallBtn}><Ionicons name="checkmark-done" size={14} color={colors.brand} /><Text style={s.smallBtnText}>Complete</Text></Bounce>}
              </View>
              {items.length === 0 ? <Text style={[type.sub, { paddingLeft: 4 }]}>No issues</Text> : items.sort((a, b) => a.position - b.position).map((i) => (
                <IssueRow key={i.id} issue={i} onPress={() => navigation.navigate('Issue', { id: i.id })} />
              ))}
            </View>
          ))}
          {canManage && <PlainButton title="Create sprint" icon="add" onPress={createSprint} />}
        </View>
      )}

      {tab === 'team' && (
        <View style={{ marginTop: 16 }}>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {project.members.map((m, idx) => (
              <View key={m.id} style={[s.member, idx === project.members.length - 1 && { borderBottomWidth: 0 }]}>
                <Avatar user={m.user} size={42} />
                <View style={{ flex: 1 }}>
                  <Text style={type.headline}>{m.user.name}</Text>
                  <Text style={type.sub}>{m.user.title || m.user.email}</Text>
                </View>
                <RoleBadge role={m.role} />
              </View>
            ))}
          </Card>
          <Text style={[type.sub, { textAlign: 'center', marginTop: 12 }]}>Your role: {role}</Text>
        </View>
      )}

      <OptionSheet visible={!!moving} title={moving ? `Move ${moving.key}` : ''} value={moving?.status} onClose={() => setMoving(null)}
        onSelect={(to) => moving && move(moving, to)}
        options={STATUSES.map((st) => ({ value: st.id, label: st.label, left: <View style={[s.dot, { width: 12, height: 12, borderRadius: 6, backgroundColor: st.color }]} /> }))} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  sprint: { borderRadius: 24, padding: 18, marginTop: 16, ...shadow, shadowColor: '#7C3AED', shadowOpacity: 0.3 },
  sprintLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  sprintName: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 2, letterSpacing: -0.4 },
  sprintGoal: { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginTop: 2 },
  track: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.25)', marginTop: 14, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#fff', borderRadius: 3 },
  sprintMeta: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 6, fontWeight: '600' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#fff', paddingLeft: 12, paddingRight: 6, height: 38, borderRadius: 19, ...shadow, shadowOpacity: 0.05 },
  chipText: { fontSize: 14, fontWeight: '700', color: colors.text },
  dot: { width: 8, height: 8, borderRadius: 4 },
  count: { minWidth: 24, height: 24, borderRadius: 12, backgroundColor: colors.fill, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  countText: { fontSize: 12, fontWeight: '800', color: colors.sub },
  groupHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, paddingHorizontal: 4 },
  activeTag: { backgroundColor: '#DCFCE7', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  activeTagText: { color: '#15803D', fontSize: 10, fontWeight: '800' },
  smallBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EEF2FF', paddingHorizontal: 12, height: 32, borderRadius: 16 },
  smallBtnText: { color: colors.brand, fontWeight: '700', fontSize: 13 },
  mine: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14, alignSelf: 'flex-start', paddingVertical: 4 },
  member: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
});

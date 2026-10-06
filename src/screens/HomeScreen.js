import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import useApi from '../useApi';
import { useAuth } from '../auth';
import Screen from '../components/Screen';
import IssueRow from '../components/IssueRow';
import { Avatar, Card, Loader, Empty, SectionTitle, Bounce } from '../components/ui';
import { colors, type, STATUSES, shadow } from '../theme';
import { describeActivity } from './activity';

function Stat({ icon, label, value, tint }) {
  return (
    <View style={s.stat}>
      <View style={[s.statIcon, { backgroundColor: tint + '22' }]}><Ionicons name={icon} size={18} color={tint} /></View>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { data, loading, refreshing, refresh } = useApi('/dashboard');
  const projects = useApi('/projects');
  if (loading && !data) return <Loader />;
  const st = data?.stats || { byStatus: {} };
  const total = Object.values(st.byStatus).reduce((a, b) => a + b, 0) || 1;
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <Screen title={user.name.split(' ')[0]} subtitle={greet} refreshing={refreshing} onRefresh={() => { refresh(); projects.refresh(); }}
      right={<Bounce onPress={() => navigation.navigate('Profile')}><Avatar user={user} size={44} /></Bounce>}>
      <LinearGradient colors={['#4F46E5', '#7C3AED', '#DB2777']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
        <View style={s.heroBlob} />
        <Text style={s.heroLabel}>Assigned to you</Text>
        <Text style={s.heroValue}>{st.myOpen ?? 0}<Text style={s.heroUnit}> open issues</Text></Text>
        <View style={s.bar}>
          {STATUSES.map((x) => <View key={x.id} style={{ flex: (st.byStatus[x.id] || 0) / total, backgroundColor: x.id === 'done' ? '#fff' : `rgba(255,255,255,${0.25 + STATUSES.indexOf(x) * 0.15})` }} />)}
        </View>
        <View style={s.legend}>
          {STATUSES.map((x) => <Text key={x.id} style={s.legendText}>{x.label} <Text style={{ fontWeight: '800' }}>{st.byStatus[x.id] || 0}</Text></Text>)}
        </View>
      </LinearGradient>

      <View style={s.stats}>
        <Stat icon="folder-open" label="Projects" value={st.projects ?? 0} tint={colors.brand} />
        <Stat icon="alert-circle" label="Overdue" value={st.overdue ?? 0} tint={colors.red} />
        <Stat icon="checkmark-done-circle" label="Done (7d)" value={st.doneThisWeek ?? 0} tint={colors.green} />
      </View>

      {projects.data?.projects?.length > 0 && (
        <>
          <SectionTitle right={<Text onPress={() => navigation.navigate('ProjectsTab')} style={s.link}>See all</Text>}>Projects</SectionTitle>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -18 }} contentContainerStyle={{ paddingHorizontal: 18, gap: 12, paddingBottom: 12 }}>
            {projects.data.projects.map((p) => {
              const pct = p.issueCount ? p.doneCount / p.issueCount : 0;
              return (
                <Bounce key={p.id} onPress={() => navigation.navigate('Project', { id: p.id, name: p.name })} style={s.pcard}>
                  <LinearGradient colors={[p.color, p.color + 'AA']} style={s.pkey}><Text style={s.pkeyText}>{p.key.slice(0, 3)}</Text></LinearGradient>
                  <Text style={type.headline} numberOfLines={1}>{p.name}</Text>
                  <Text style={[type.sub, { marginTop: 2 }]}>{p.doneCount}/{p.issueCount} done</Text>
                  <View style={s.ptrack}><View style={[s.pfill, { width: `${pct * 100}%`, backgroundColor: p.color }]} /></View>
                </Bounce>
              );
            })}
          </ScrollView>
        </>
      )}

      <SectionTitle>My Work</SectionTitle>
      {data?.myIssues?.length ? data.myIssues.map((i) => (
        <IssueRow key={i.id} issue={i} showProject onPress={() => navigation.navigate('Issue', { id: i.id })} />
      )) : <Card><Empty icon="checkmark-done" title="All clear" text="Nothing is assigned to you right now." /></Card>}

      <SectionTitle>Activity</SectionTitle>
      <Card style={{ paddingVertical: 6 }}>
        {(data?.activity || []).slice(0, 10).map((a, idx, arr) => (
          <View key={a.id} style={[s.act, idx === arr.length - 1 && { borderBottomWidth: 0 }]}>
            <Avatar user={a.user} size={34} />
            <View style={{ flex: 1 }}>
              <Text style={type.callout}><Text style={{ fontWeight: '700' }}>{a.user?.name}</Text> {describeActivity(a)}</Text>
              <Text style={[type.sub, { fontSize: 12, marginTop: 2 }]}>
                <Text style={{ color: a.project?.color, fontWeight: '700' }}>{a.project?.key}</Text> · {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
              </Text>
            </View>
          </View>
        ))}
        {!data?.activity?.length && <Empty icon="pulse" title="No activity yet" />}
      </Card>
    </Screen>
  );
}

const s = StyleSheet.create({
  hero: { borderRadius: 28, padding: 22, overflow: 'hidden', ...shadow, shadowColor: '#7C3AED', shadowOpacity: 0.35 },
  heroBlob: { position: 'absolute', right: -50, top: -50, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.15)' },
  heroLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' },
  heroValue: { color: '#fff', fontSize: 52, fontWeight: '900', letterSpacing: -2, marginTop: 2 },
  heroUnit: { fontSize: 17, fontWeight: '600', letterSpacing: 0 },
  bar: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.15)', marginTop: 14 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 10 },
  legendText: { color: 'rgba(255,255,255,0.9)', fontSize: 12 },
  stats: { flexDirection: 'row', gap: 10, marginTop: 14 },
  stat: { flex: 1, backgroundColor: '#fff', borderRadius: 20, padding: 14, ...shadow, shadowOpacity: 0.05 },
  statIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 26, fontWeight: '800', color: colors.text, marginTop: 10, letterSpacing: -0.5 },
  statLabel: { fontSize: 12, color: colors.sub, fontWeight: '600' },
  link: { color: colors.brand, fontWeight: '600', fontSize: 15 },
  pcard: { width: 200, backgroundColor: '#fff', borderRadius: 22, padding: 16, ...shadow, shadowOpacity: 0.06 },
  pkey: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  pkeyText: { color: '#fff', fontWeight: '900', fontSize: 14 },
  ptrack: { height: 6, borderRadius: 3, backgroundColor: colors.fill, marginTop: 12, overflow: 'hidden' },
  pfill: { height: '100%', borderRadius: 3 },
  act: { flexDirection: 'row', gap: 12, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
});

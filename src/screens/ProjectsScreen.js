import { View, Text, StyleSheet, TextInput } from 'react-native';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import useApi from '../useApi';
import { useAuth } from '../auth';
import Screen from '../components/Screen';
import { Avatar, Loader, Empty, Bounce, Card } from '../components/ui';
import { colors, type, shadow, gradient } from '../theme';

export default function ProjectsScreen({ navigation }) {
  const { user } = useAuth();
  const { data, loading, refreshing, refresh } = useApi('/projects');
  const [q, setQ] = useState('');
  if (loading && !data) return <Loader />;
  const canCreate = ['admin', 'manager'].includes(user.role);
  const list = (data?.projects || []).filter((p) => (p.name + p.key).toLowerCase().includes(q.toLowerCase()));

  return (
    <Screen title="Projects" refreshing={refreshing} onRefresh={refresh}
      right={canCreate && (
        <Bounce onPress={() => navigation.navigate('CreateProject')}>
          <LinearGradient colors={gradient} style={s.add}><Ionicons name="add" size={24} color="#fff" /></LinearGradient>
        </Bounce>
      )}>
      <View style={s.search}>
        <Ionicons name="search" size={17} color={colors.faint} />
        <TextInput placeholder="Search" placeholderTextColor={colors.faint} value={q} onChangeText={setQ} style={s.searchInput} />
      </View>
      {list.length === 0 ? (
        <Card><Empty icon="folder-open" title="No projects" text={canCreate ? 'Tap + to create your first project.' : 'Ask a manager to add you to a project.'} /></Card>
      ) : list.map((p) => {
        const pct = p.issueCount ? Math.round((p.doneCount / p.issueCount) * 100) : 0;
        return (
          <Bounce key={p.id} onPress={() => navigation.navigate('Project', { id: p.id, name: p.name })} style={s.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <LinearGradient colors={[p.color, p.color + '99']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.key}>
                <Text style={s.keyText}>{p.key.slice(0, 3)}</Text>
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={type.headline} numberOfLines={1}>{p.name}</Text>
                <Text style={type.sub}>{p.key} · {p.issueCount} issues</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </View>
            {p.description ? <Text style={[type.sub, { marginTop: 12, lineHeight: 18 }]} numberOfLines={2}>{p.description}</Text> : null}
            <View style={s.foot}>
              <View style={{ flexDirection: 'row' }}>
                {p.members.slice(0, 5).map((m, i) => <View key={m.id} style={{ marginLeft: i ? -8 : 0 }}><Avatar user={m.user} size={26} ring /></View>)}
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <View style={s.track}><View style={[s.fill, { width: `${pct}%`, backgroundColor: p.color }]} /></View>
              </View>
              <Text style={[s.pct, { color: p.color }]}>{pct}%</Text>
            </View>
          </Bounce>
        );
      })}
    </Screen>
  );
}

const s = StyleSheet.create({
  add: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(118,118,128,0.12)', borderRadius: 12, paddingHorizontal: 10, height: 40, marginBottom: 16 },
  searchInput: { flex: 1, fontSize: 16, color: colors.text },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 16, marginBottom: 12, ...shadow, shadowOpacity: 0.06 },
  key: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  keyText: { color: '#fff', fontWeight: '900', fontSize: 15 },
  foot: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.fill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
  pct: { fontSize: 13, fontWeight: '800', marginLeft: 10, width: 38, textAlign: 'right' },
});

import { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, RefreshControl, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useApi from '../useApi';
import api from '../api';
import { useAuth } from '../auth';
import { Avatar, RoleBadge, Loader, OptionSheet, Input, GradientButton, Segmented } from '../components/ui';
import { colors, type, ROLES } from '../theme';

export default function TeamScreen() {
  const { user: me } = useAuth();
  const { data, loading, refreshing, refresh, reload } = useApi('/users');
  const [picked, setPicked] = useState(null);
  const [adding, setAdding] = useState(false);
  const [f, setF] = useState({ name: '', email: '', password: '', role: 'member' });
  const [busy, setBusy] = useState(false);
  if (loading && !data) return <Loader />;

  const setRole = async (u, role) => {
    try { await api.patch(`/users/${u.id}`, { role }); reload(); } catch (e) { Alert.alert('Error', e.message); }
  };
  const toggleActive = async (u) => {
    try { await api.patch(`/users/${u.id}`, { isActive: !u.isActive }); reload(); } catch (e) { Alert.alert('Error', e.message); }
  };
  const create = async () => {
    setBusy(true);
    try { await api.post('/users', f); setAdding(false); setF({ name: '', email: '', password: '', role: 'member' }); reload(); } catch (e) { Alert.alert('Error', e.message); } finally { setBusy(false); }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 18, paddingBottom: 80 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
      <Pressable onPress={() => setAdding(!adding)} style={s.addRow}>
        <Ionicons name={adding ? 'close-circle' : 'person-add'} size={20} color={colors.brand} />
        <Text style={{ color: colors.brand, fontWeight: '700', fontSize: 16 }}>{adding ? 'Cancel' : 'Add a user'}</Text>
      </Pressable>
      {adding && (
        <View style={[s.group, { padding: 14, gap: 12, marginBottom: 18 }]}>
          <Input label="Name" value={f.name} onChangeText={(v) => setF({ ...f, name: v })} />
          <Input label="Email" autoCapitalize="none" keyboardType="email-address" value={f.email} onChangeText={(v) => setF({ ...f, email: v })} />
          <Input label="Temporary password" value={f.password} onChangeText={(v) => setF({ ...f, password: v })} />
          <Segmented value={f.role} onChange={(role) => setF({ ...f, role })} options={Object.entries(ROLES).map(([k, r]) => ({ value: k, label: r.label }))} />
          <GradientButton title="Create user" onPress={create} loading={busy} />
        </View>
      )}
      <View style={s.group}>
        {data.users.map((u, i) => (
          <Pressable key={u.id} disabled={u.id === me.id} onPress={() => setPicked(u)} style={[s.row, !u.isActive && { opacity: 0.45 }]}>
            <Avatar user={u} size={42} />
            <View style={[s.body, i === data.users.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={{ flex: 1 }}>
                <Text style={type.headline}>{u.name}{u.id === me.id ? ' (you)' : ''}</Text>
                <Text style={type.sub} numberOfLines={1}>{u.email}</Text>
              </View>
              <RoleBadge role={u.role} />
            </View>
          </Pressable>
        ))}
      </View>
      <OptionSheet visible={!!picked} title={picked?.name} value={picked?.role} onClose={() => setPicked(null)}
        onSelect={(v) => (v === '__toggle' ? toggleActive(picked) : setRole(picked, v))}
        options={[...Object.entries(ROLES).map(([k, r]) => ({ value: k, label: `Make ${r.label}` })), { value: '__toggle', label: picked?.isActive ? 'Deactivate account' : 'Activate account' }]} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14, paddingHorizontal: 4 },
  group: { backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingLeft: 14 },
  body: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 12, paddingVertical: 12, paddingRight: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
});

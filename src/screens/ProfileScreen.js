import { useState } from 'react';
import { View, Text, StyleSheet, Alert, TextInput, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import { useAuth } from '../auth';
import api, { API_URL } from '../api';
import Screen from '../components/Screen';
import { Avatar, RoleBadge, ListRow, tap } from '../components/ui';
import { colors, type, shadow } from '../theme';

const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#F97316', '#EAB308', '#22C55E', '#14B8A6', '#06B6D4', '#3B82F6'];

export default function ProfileScreen({ navigation }) {
  const { user, setUser, logout } = useAuth();
  const [name, setName] = useState(user.name);
  const [title, setTitle] = useState(user.title || '');

  const save = async (patch) => {
    try { const d = await api.patch('/auth/me', patch); setUser(d.user); } catch (e) { Alert.alert('Error', e.message); }
  };

  return (
    <Screen title="Profile">
      <View style={s.card}>
        <LinearGradient colors={[user.avatarColor + '33', '#ffffff']} style={StyleSheet.absoluteFill} />
        <Avatar user={user} size={84} />
        <TextInput value={name} onChangeText={setName} onEndEditing={() => name.trim() && name !== user.name && save({ name: name.trim() })} style={s.name} />
        <TextInput value={title} onChangeText={setTitle} placeholder="Add a job title" placeholderTextColor={colors.faint} onEndEditing={() => title !== (user.title || '') && save({ title })} style={s.title} />
        <Text style={type.sub}>{user.email}</Text>
        <View style={{ marginTop: 10 }}><RoleBadge role={user.role} /></View>
        <View style={s.swatches}>
          {COLORS.map((c) => <Pressable key={c} onPress={() => { tap(); save({ avatarColor: c }); }} style={[s.sw, { backgroundColor: c }, user.avatarColor === c && s.swOn]} />)}
        </View>
      </View>

      <View style={s.group}>
        {user.role === 'admin' && <ListRow icon="people" iconBg="#7C3AED" label="Team & Roles" onPress={() => navigation.navigate('Team')} />}
        <ListRow icon="key" iconBg="#0EA5E9" label="Change password" onPress={() => navigation.navigate('ChangePassword')} />
        <ListRow icon="server" iconBg="#64748B" label="Server" value={API_URL.replace(/^https?:\/\//, '')} chevron={false} />
        <ListRow icon="information-circle" iconBg="#22C55E" label="Version" value={Constants.expoConfig?.version || '1.0.0'} last chevron={false} />
      </View>

      <View style={s.group}>
        <ListRow icon="log-out" iconBg="#EF4444" label="Sign out" danger chevron={false} last
          onPress={() => Alert.alert('Sign out?', '', [{ text: 'Cancel', style: 'cancel' }, { text: 'Sign out', style: 'destructive', onPress: logout }])} />
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 28, padding: 24, alignItems: 'center', overflow: 'hidden', ...shadow, shadowOpacity: 0.06 },
  name: { fontSize: 24, fontWeight: '800', color: colors.text, marginTop: 12, textAlign: 'center', letterSpacing: -0.5, padding: 0 },
  title: { fontSize: 15, color: colors.sub, textAlign: 'center', marginTop: 2, marginBottom: 2, padding: 0 },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 18 },
  sw: { width: 24, height: 24, borderRadius: 12 },
  swOn: { borderWidth: 3, borderColor: '#fff', transform: [{ scale: 1.2 }], shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  group: { backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', marginTop: 22 },
});

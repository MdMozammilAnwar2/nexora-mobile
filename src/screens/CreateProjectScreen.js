import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, TextInput, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api';
import { Input, GradientButton, tap } from '../components/ui';
import { colors, type } from '../theme';

const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#F97316', '#EAB308', '#22C55E', '#14B8A6', '#06B6D4', '#3B82F6'];
const autoKey = (n) => n.replace(/[^a-zA-Z0-9 ]/g, '').split(' ').filter(Boolean).map((w) => w[0]).join('').toUpperCase().slice(0, 4);

export default function CreateProjectScreen({ navigation }) {
  const [f, setF] = useState({ name: '', key: '', description: '', color: COLORS[0] });
  const [keyTouched, setKeyTouched] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      const { project } = await api.post('/projects', f);
      navigation.replace('Project', { id: project.id, name: project.name });
    } catch (e) {
      Alert.alert('Could not create project', e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 18, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
      <View style={{ alignItems: 'center', marginVertical: 12 }}>
        <LinearGradient colors={[f.color, f.color + '99']} style={s.preview}><Text style={s.previewText}>{(f.key || 'KEY').slice(0, 3)}</Text></LinearGradient>
      </View>
      <Input label="Project name" value={f.name} autoFocus onChangeText={(name) => setF({ ...f, name, key: keyTouched ? f.key : autoKey(name).padEnd(2, 'X') })} />
      <Input label="Key" value={f.key} autoCapitalize="characters" maxLength={10} style={{ marginTop: 14 }} onChangeText={(key) => { setKeyTouched(true); setF({ ...f, key: key.toUpperCase() }); }} />
      <Text style={[type.caption, { marginTop: 14, marginBottom: 6, marginLeft: 4 }]}>Description</Text>
      <TextInput multiline value={f.description} onChangeText={(description) => setF({ ...f, description })} style={s.desc} placeholder="What is this project about?" placeholderTextColor={colors.faint} />
      <Text style={[type.caption, { marginTop: 18, marginBottom: 10, marginLeft: 4 }]}>Color</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {COLORS.map((c) => (
          <Pressable key={c} onPress={() => { tap(); setF({ ...f, color: c }); }} style={[s.swatch, { backgroundColor: c }, f.color === c && s.swatchOn]} />
        ))}
      </View>
      <GradientButton title="Create Project" onPress={submit} loading={busy} disabled={!f.name || f.key.length < 2} style={{ marginTop: 28 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  preview: { width: 84, height: 84, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  previewText: { color: '#fff', fontSize: 24, fontWeight: '900' },
  desc: { backgroundColor: '#fff', borderRadius: 14, padding: 14, minHeight: 90, fontSize: 15, color: colors.text, textAlignVertical: 'top', borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  swatch: { width: 38, height: 38, borderRadius: 19 },
  swatchOn: { borderWidth: 4, borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 6, elevation: 4, transform: [{ scale: 1.1 }] },
});

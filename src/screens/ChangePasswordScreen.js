import { useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import api from '../api';
import { Input, GradientButton } from '../components/ui';
import { colors } from '../theme';

export default function ChangePasswordScreen({ navigation }) {
  const [f, setF] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (f.newPassword.length < 8) return Alert.alert('Password too short', 'Use at least 8 characters.');
    if (f.newPassword !== f.confirm) return Alert.alert('Passwords do not match');
    setBusy(true);
    try {
      await api.post('/auth/change-password', { currentPassword: f.currentPassword, newPassword: f.newPassword });
      Alert.alert('Password changed');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 18, gap: 14 }} keyboardShouldPersistTaps="handled">
      <Input label="Current password" secureTextEntry value={f.currentPassword} onChangeText={(v) => setF({ ...f, currentPassword: v })} />
      <Input label="New password" secureTextEntry value={f.newPassword} onChangeText={(v) => setF({ ...f, newPassword: v })} />
      <Input label="Confirm new password" secureTextEntry value={f.confirm} onChangeText={(v) => setF({ ...f, confirm: v })} />
      <GradientButton title="Update Password" onPress={submit} loading={busy} style={{ marginTop: 10 }} />
    </ScrollView>
  );
}

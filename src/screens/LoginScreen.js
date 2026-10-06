import { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Pressable, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../auth';
import { Input, GradientButton } from '../components/ui';
import { colors, type } from '../theme';

export default function LoginScreen() {
  const { login, register } = useAuth();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState('login');
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const isLogin = mode === 'login';

  const submit = async () => {
    if (!f.email || !f.password || (!isLogin && !f.name)) return Alert.alert('Missing details', 'Please fill in all fields.');
    setBusy(true);
    try {
      if (isLogin) await login(f.email.trim(), f.password);
      else await register(f.name.trim(), f.email.trim(), f.password);
    } catch (e) {
      Alert.alert(isLogin ? 'Sign in failed' : 'Sign up failed', e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style="light" />
      <LinearGradient colors={['#4F46E5', '#7C3AED', '#DB2777']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.hero, { paddingTop: insets.top + 40 }]}>
        <View style={[s.blob, { top: -60, right: -40, backgroundColor: 'rgba(255,255,255,0.18)' }]} />
        <View style={[s.blob, { bottom: -80, left: -60, backgroundColor: 'rgba(236,72,153,0.45)' }]} />
        <BlurView intensity={30} tint="light" style={s.logo}>
          <Text style={s.logoN}>N</Text>
        </BlurView>
        <Text style={s.brand}>Nexora</Text>
        <Text style={s.tag}>Plan, track and ship work{'\n'}your team loves.</Text>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[s.form, { paddingBottom: insets.bottom + 24 }]} keyboardShouldPersistTaps="handled">
          <Text style={type.title}>{isLogin ? 'Welcome back' : 'Create account'}</Text>
          <Text style={[type.sub, { marginBottom: 20, marginTop: 4 }]}>{isLogin ? 'Sign in to your workspace' : 'The first account becomes the admin'}</Text>
          {!isLogin && <Input label="Full name" value={f.name} onChangeText={(name) => setF({ ...f, name })} autoCapitalize="words" style={{ marginBottom: 14 }} />}
          <Input label="Email" value={f.email} onChangeText={(email) => setF({ ...f, email })} autoCapitalize="none" keyboardType="email-address" autoComplete="email" style={{ marginBottom: 14 }} />
          <Input label="Password" value={f.password} onChangeText={(password) => setF({ ...f, password })} secureTextEntry autoComplete="password" style={{ marginBottom: 24 }} onSubmitEditing={submit} returnKeyType="go" />
          <GradientButton title={isLogin ? 'Sign In' : 'Create Account'} onPress={submit} loading={busy} />
          <Pressable onPress={() => setMode(isLogin ? 'register' : 'login')} style={{ marginTop: 20, alignItems: 'center' }}>
            <Text style={type.sub}>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <Text style={{ color: colors.brand, fontWeight: '700' }}>{isLogin ? 'Sign up' : 'Sign in'}</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  hero: { paddingHorizontal: 28, paddingBottom: 48, borderBottomLeftRadius: 36, borderBottomRightRadius: 36, overflow: 'hidden' },
  blob: { position: 'absolute', width: 240, height: 240, borderRadius: 120 },
  logo: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' },
  logoN: { color: '#fff', fontSize: 30, fontWeight: '900' },
  brand: { color: '#fff', fontSize: 40, fontWeight: '900', letterSpacing: -1.2, marginTop: 18 },
  tag: { color: 'rgba(255,255,255,0.85)', fontSize: 18, marginTop: 6, lineHeight: 24, fontWeight: '500' },
  form: { padding: 24, paddingTop: 28 },
});

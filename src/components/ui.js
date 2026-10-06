import { useRef } from 'react';
import {
  View, Text, Pressable, StyleSheet, TextInput, ActivityIndicator, Modal, ScrollView, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, gradient, radius, shadow, type, TYPES, PRIORITIES, statusOf, ROLES } from '../theme';

export const tap = () => Haptics.selectionAsync().catch(() => {});

/* Springy press feedback, like iOS */
export function Bounce({ children, onPress, style, disabled, haptic = true, ...rest }) {
  const scale = useRef(new Animated.Value(1)).current;
  const to = (v) => Animated.spring(scale, { toValue: v, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  return (
    <Pressable
      disabled={disabled}
      onPressIn={() => to(0.97)}
      onPressOut={() => to(1)}
      onPress={(e) => { if (haptic) tap(); onPress?.(e); }}
      {...rest}
    >
      <Animated.View style={[style, { transform: [{ scale }] }, disabled && { opacity: 0.5 }]}>{children}</Animated.View>
    </Pressable>
  );
}

export function Avatar({ user, size = 32, ring }) {
  if (!user) {
    return (
      <View style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.fill, alignItems: 'center', justifyContent: 'center' }, ring && styles.ring]}>
        <Ionicons name="person" size={size * 0.5} color={colors.faint} />
      </View>
    );
  }
  const initials = user.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  const c = user.avatarColor || colors.brand;
  return (
    <LinearGradient colors={[c, c + 'AA']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={[{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }, ring && styles.ring]}>
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: size * 0.38 }}>{initials}</Text>
    </LinearGradient>
  );
}

export function Card({ children, style, onPress }) {
  if (onPress) return <Bounce onPress={onPress} style={[styles.card, style]}>{children}</Bounce>;
  return <View style={[styles.card, style]}>{children}</View>;
}

export function GradientButton({ title, onPress, loading, icon, style, disabled }) {
  return (
    <Bounce onPress={onPress} disabled={disabled || loading} style={style}>
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gbtn}>
        {loading ? <ActivityIndicator color="#fff" /> : (
          <>
            {icon && <Ionicons name={icon} size={18} color="#fff" />}
            <Text style={styles.gbtnText}>{title}</Text>
          </>
        )}
      </LinearGradient>
    </Bounce>
  );
}

export function PlainButton({ title, onPress, color = colors.brand, icon, style }) {
  return (
    <Bounce onPress={onPress} style={[styles.pbtn, style]}>
      {icon && <Ionicons name={icon} size={18} color={color} />}
      <Text style={[styles.pbtnText, { color }]}>{title}</Text>
    </Bounce>
  );
}

export function Input({ label, style, ...props }) {
  return (
    <View style={style}>
      {label && <Text style={[type.caption, { marginBottom: 6, marginLeft: 4 }]}>{label}</Text>}
      <TextInput placeholderTextColor={colors.faint} style={styles.input} {...props} />
    </View>
  );
}

export function TypeIcon({ type: t, size = 18 }) {
  const d = TYPES[t] || TYPES.task;
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.28, backgroundColor: d.color, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={d.icon} size={size * 0.65} color="#fff" />
    </View>
  );
}

export function PriorityIcon({ priority, size = 16 }) {
  const p = PRIORITIES[priority] || PRIORITIES.medium;
  return <Ionicons name={p.icon} size={size} color={p.color} />;
}

export function StatusPill({ status, large }) {
  const s = statusOf(status);
  return (
    <View style={[styles.pill, { backgroundColor: s.color + '1F' }, large && { paddingHorizontal: 12, paddingVertical: 6 }]}>
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: s.color }} />
      <Text style={[styles.pillText, { color: s.color }, large && { fontSize: 13 }]}>{s.label}</Text>
    </View>
  );
}

export function RoleBadge({ role }) {
  const r = ROLES[role] || ROLES.member;
  return (
    <View style={[styles.pill, { backgroundColor: r.color + '1A' }]}>
      <Text style={[styles.pillText, { color: r.color }]}>{r.label}</Text>
    </View>
  );
}

export function Loader() {
  return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}><ActivityIndicator size="large" color={colors.brand} /></View>;
}

export function Empty({ icon = 'sparkles', title, text }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 }}>
      <LinearGradient colors={['#EEF2FF', '#FCE7F3']} style={{ width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
        <Ionicons name={icon} size={28} color={colors.brand} />
      </LinearGradient>
      <Text style={type.headline}>{title}</Text>
      {text && <Text style={[type.sub, { textAlign: 'center', marginTop: 4 }]}>{text}</Text>}
    </View>
  );
}

export function SectionTitle({ children, right }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 26, marginBottom: 10, paddingHorizontal: 4 }}>
      <Text style={type.title}>{children}</Text>
      {right}
    </View>
  );
}

/* iOS-style segmented control */
export function Segmented({ options, value, onChange }) {
  return (
    <View style={styles.seg}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable key={o.value} onPress={() => { tap(); onChange(o.value); }} style={[styles.segItem, active && styles.segActive]}>
            <Text style={[styles.segText, active && { color: colors.text }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* Bottom sheet picker */
export function OptionSheet({ visible, title, options, value, onSelect, onClose }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.grabber} />
        {title && <Text style={[type.headline, { textAlign: 'center', marginBottom: 8 }]}>{title}</Text>}
        <ScrollView style={{ maxHeight: 420 }}>
          {options.map((o) => (
            <Pressable key={String(o.value)} onPress={() => { tap(); onSelect(o.value); onClose(); }} style={({ pressed }) => [styles.option, pressed && { backgroundColor: colors.fill }]}>
              {o.left}
              <Text style={[type.body, { flex: 1 }]}>{o.label}</Text>
              {o.value === value && <Ionicons name="checkmark-circle" size={22} color={colors.brand} />}
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

/* Grouped list row (Settings style) */
export function ListRow({ icon, iconBg = colors.brand, label, value, onPress, last, danger, chevron = true }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => [styles.row, pressed && onPress && { backgroundColor: '#F7F7FA' }]}>
      {icon && (
        <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={16} color="#fff" />
        </View>
      )}
      <View style={[styles.rowBody, last && { borderBottomWidth: 0 }]}>
        <Text numberOfLines={1} style={[type.body, { flexShrink: 0 }, danger && { color: colors.red }]}>{label}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 }}>
          {typeof value === 'string' ? <Text numberOfLines={1} style={[type.callout, { color: colors.sub }]}>{value}</Text> : value}
          {onPress && chevron && <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ring: { borderWidth: 2, borderColor: '#fff' },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 16, ...shadow },
  gbtn: { height: 54, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  gbtnText: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: -0.2 },
  pbtn: { height: 50, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.fill },
  pbtnText: { fontSize: 16, fontWeight: '600' },
  input: { backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 16, height: 52, fontSize: 16, color: colors.text, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 99, alignSelf: 'flex-start' },
  pillText: { fontSize: 11, fontWeight: '700' },
  seg: { flexDirection: 'row', backgroundColor: 'rgba(118,118,128,0.12)', borderRadius: 10, padding: 2 },
  segItem: { flex: 1, paddingVertical: 7, alignItems: 'center', borderRadius: 8 },
  segActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  segText: { fontSize: 13, fontWeight: '600', color: colors.sub },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 12, paddingTop: 8 },
  grabber: { width: 40, height: 5, borderRadius: 3, backgroundColor: '#D1D1D6', alignSelf: 'center', marginBottom: 12 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 12, borderRadius: 14 },
  row: { flexDirection: 'row', alignItems: 'center', paddingLeft: 16, backgroundColor: '#fff' },
  rowIcon: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rowBody: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingRight: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line, gap: 12 },
});

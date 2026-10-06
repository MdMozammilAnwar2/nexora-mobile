import { ScrollView, View, Text, RefreshControl, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, type } from '../theme';

/* iOS "large title" scroll screen */
export default function Screen({ title, subtitle, right, children, refreshing, onRefresh, contentStyle, noTitle }) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[{ paddingTop: noTitle ? 12 : insets.top + 12, paddingBottom: 120, paddingHorizontal: 18 }, contentStyle]}
      refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.brand} /> : undefined}
      keyboardShouldPersistTaps="handled"
    >
      {!noTitle && (
        <View style={s.header}>
          <View style={{ flex: 1 }}>
            {subtitle && <Text style={s.sub}>{subtitle}</Text>}
            <Text style={type.largeTitle}>{title}</Text>
          </View>
          {right}
        </View>
      )}
      {children}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 18, marginTop: 8 },
  sub: { fontSize: 13, fontWeight: '600', color: colors.sub, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 2 },
});

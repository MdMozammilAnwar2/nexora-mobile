import { View, Text, StyleSheet, Pressable } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import useApi from '../useApi';
import api from '../api';
import Screen from '../components/Screen';
import { Avatar, Loader, Empty, Card } from '../components/ui';
import { colors, type } from '../theme';

export default function InboxScreen({ navigation }) {
  const { data, setData, loading, refreshing, refresh } = useApi('/notifications');
  if (loading && !data) return <Loader />;
  const list = data?.notifications || [];

  const readAll = async () => {
    await api.post('/notifications/read-all').catch(() => {});
    setData({ ...data, unread: 0, notifications: list.map((n) => ({ ...n, read: true })) });
  };
  const open = (n) => {
    if (!n.read) {
      api.patch(`/notifications/${n.id}/read`).catch(() => {});
      setData({ ...data, unread: Math.max(0, data.unread - 1), notifications: list.map((x) => (x.id === n.id ? { ...x, read: true } : x)) });
    }
    if (n.issueId) navigation.navigate('Issue', { id: n.issueId });
    else if (n.projectId) navigation.navigate('Project', { id: n.projectId });
  };

  return (
    <Screen title="Inbox" refreshing={refreshing} onRefresh={refresh}
      right={data?.unread > 0 && <Text onPress={readAll} style={{ color: colors.brand, fontWeight: '600', fontSize: 15, marginBottom: 8 }}>Read all</Text>}>
      {list.length === 0 ? <Card><Empty icon="notifications-outline" title="You're all caught up" text="Assignments, comments and status changes appear here." /></Card> : (
        <View style={s.group}>
          {list.map((n, i) => (
            <Pressable key={n.id} onPress={() => open(n)} style={({ pressed }) => [s.row, pressed && { backgroundColor: '#F7F7FA' }]}>
              <View style={s.dotWrap}>{!n.read && <View style={s.dot} />}</View>
              <Avatar user={n.actor} size={40} />
              <View style={[s.body, i === list.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                  <Text style={[type.callout, { flex: 1, fontWeight: n.read ? '500' : '700' }]} numberOfLines={2}>{n.title}</Text>
                  <Text style={[type.sub, { fontSize: 12 }]}>{formatDistanceToNow(new Date(n.createdAt))}</Text>
                </View>
                {n.body ? <Text style={[type.sub, { marginTop: 2 }]} numberOfLines={2}>{n.body}</Text> : null}
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </Screen>
  );
}

const s = StyleSheet.create({
  group: { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'flex-start', paddingTop: 12 },
  dotWrap: { width: 22, alignItems: 'center', paddingTop: 16 },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.brand },
  body: { flex: 1, marginLeft: 12, paddingBottom: 12, paddingRight: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
});

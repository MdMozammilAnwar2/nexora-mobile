import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import api from './api';

// Fetches on mount and every time the screen regains focus
export default function useApi(path) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (!path) return;
    if (isRefresh) setRefreshing(true);
    try {
      setData(await api.get(path));
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [path]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return { data, setData, error, loading, refreshing, refresh: () => load(true), reload: load };
}

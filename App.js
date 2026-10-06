import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';

import { AuthProvider, useAuth } from './src/auth';
import api from './src/api';
import { colors } from './src/theme';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProjectsScreen from './src/screens/ProjectsScreen';
import ProjectScreen from './src/screens/ProjectScreen';
import IssueScreen from './src/screens/IssueScreen';
import CreateIssueScreen from './src/screens/CreateIssueScreen';
import CreateProjectScreen from './src/screens/CreateProjectScreen';
import InboxScreen from './src/screens/InboxScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import TeamScreen from './src/screens/TeamScreen';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';

SplashScreen.preventAutoHideAsync().catch(() => {});

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const navTheme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: colors.bg, primary: colors.brand, card: colors.bg, text: colors.text } };

const TAB_ICONS = { Home: 'home', ProjectsTab: 'grid', Inbox: 'notifications', Profile: 'person-circle' };

function Tabs() {
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    const poll = () => api.get('/notifications').then((d) => setUnread(d.unread)).catch(() => {});
    poll();
    const t = setInterval(poll, 30000);
    return () => clearInterval(t);
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: '#8E8E93',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: { position: 'absolute', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line, backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(255,255,255,0.97)', elevation: 0 },
        tabBarBackground: () => Platform.OS === 'ios' ? <BlurView tint="systemChromeMaterialLight" intensity={100} style={StyleSheet.absoluteFill} /> : null,
        tabBarIcon: ({ color, focused, size }) => <Ionicons name={focused ? TAB_ICONS[route.name] : `${TAB_ICONS[route.name]}-outline`} size={size} color={color} />,
      })}
      screenListeners={({ route }) => ({ focus: () => route.name === 'Inbox' && setTimeout(() => setUnread(0), 1500) })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="ProjectsTab" component={ProjectsScreen} options={{ title: 'Projects' }} />
      <Tab.Screen name="Inbox" component={InboxScreen} options={{ tabBarBadge: unread > 0 ? unread : undefined, tabBarBadgeStyle: { backgroundColor: colors.pink, fontSize: 10 } }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function Root() {
  const { user, ready } = useAuth();
  useEffect(() => { if (ready) SplashScreen.hideAsync().catch(() => {}); }, [ready]);
  if (!ready) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  const stackHeader = {
    headerShadowVisible: false,
    headerStyle: { backgroundColor: colors.bg },
    headerTintColor: colors.brand,
    headerTitleStyle: { color: colors.text, fontWeight: '700' },
    headerBackButtonDisplayMode: 'minimal',
    contentStyle: { backgroundColor: colors.bg },
  };

  return (
    <Stack.Navigator screenOptions={stackHeader}>
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
          <Stack.Screen name="Project" component={ProjectScreen} options={({ route }) => ({ title: route.params?.name || 'Project', headerLargeTitle: Platform.OS === 'ios', headerLargeTitleShadowVisible: false })} />
          <Stack.Screen name="Issue" component={IssueScreen} options={{ title: '' }} />
          <Stack.Screen name="Team" component={TeamScreen} options={{ title: 'Team & Roles', headerLargeTitle: Platform.OS === 'ios' }} />
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Change Password' }} />
          <Stack.Group screenOptions={{ presentation: 'modal' }}>
            <Stack.Screen name="CreateIssue" component={CreateIssueScreen} options={{ title: 'New Issue' }} />
            <Stack.Screen name="CreateProject" component={CreateProjectScreen} options={{ title: 'New Project' }} />
          </Stack.Group>
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer theme={navTheme}>
          <StatusBar style="dark" />
          <Root />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

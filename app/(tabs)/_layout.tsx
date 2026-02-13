import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const tabBarStyle = {
  backgroundColor: '#0b1224',
  borderTopWidth: 0,
  paddingTop: 6,
  paddingBottom: 10,
  height: 64
};

export default function TabsLayout() {
  const activeColor = '#8b5cf6';
  const inactiveColor = '#94a3b8';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' }
      }}
    >
      <Tabs.Screen
        name="wordlists/index"
        options={{
          title: 'Wordlists',
          tabBarIcon: ({ color, size }) => <Feather name="layers" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="search/index"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => <Feather name="search" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="flashcards/index"
        options={{
          title: 'Flashcards',
          tabBarIcon: ({ color, size }) => <Feather name="book-open" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="folders/index"
        options={{
          title: 'Folders',
          tabBarIcon: ({ color, size }) => <Feather name="folder" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="ai-lab/index"
        options={{
          title: 'AI Lab',
          href: null,
          tabBarIcon: ({ color, size }) => <Feather name="zap" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Feather name="user" size={size} color={color} />
        }}
      />
    </Tabs>
  );
}

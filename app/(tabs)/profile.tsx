import { ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLibraryStore } from '@/store/useLibrary';
import { ScreenHeader } from '@/components/ScreenHeader';

export default function ProfileScreen() {
  const { userId, stats } = useLibraryStore();
  return (
    <LinearGradient colors={["#0f172a", "#0b1224"]} style={{ flex: 1 }}>
      <ScreenHeader title="Profile" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 18, gap: 12 }}>
        <Text style={{ color: '#cbd5e1' }}>Signed in as {userId}</Text>
        <View style={{ backgroundColor: '#111827', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#1f2937', gap: 8 }}>
          <Text style={{ color: '#e2e8f0', fontWeight: '700' }}>Stats</Text>
          <Text style={{ color: '#cbd5e1' }}>Flashcards: {stats.flashcards}</Text>
          <Text style={{ color: '#cbd5e1' }}>Wordlists: {stats.wordlists}</Text>
          <Text style={{ color: '#cbd5e1' }}>Folders: {stats.folders}</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

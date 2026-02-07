import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, Text, View, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLibraryStore } from '@/store/useLibrary';

export default function WordlistsIndex() {
  const { wordlists, addWordlist } = useLibraryStore();
  const items = Object.values(wordlists);

  const createWordlist = () => {
    const count = items.length + 1;
    addWordlist({ name: `Wordlist ${count}`, comment: 'New list', order: 'recent' });
  };

  return (
    <LinearGradient colors={["#0f172a", "#111827", "#0b1224"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 48, gap: 16 }}>
        <Text style={{ color: 'white', fontSize: 24, fontWeight: '800' }}>Wordlists</Text>
        <Text style={{ color: '#cbd5e1' }}>Create a list, then tap it to add flashcards.</Text>

        <Pressable onPress={createWordlist} style={{ backgroundColor: '#22d3ee', padding: 14, borderRadius: 14, alignItems: 'center' }}>
          <Text style={{ color: '#0f172a', fontWeight: '800' }}>Create wordlist</Text>
        </Pressable>

        <View style={{ gap: 12 }}>
          {items.length === 0 ? (
            <Text style={{ color: '#94a3b8' }}>No wordlists yet.</Text>
          ) : (
            items.map((wl) => (
              <Link key={wl.id} href={`/wordlists/${wl.id}`} asChild>
                <Pressable style={{ backgroundColor: '#111827', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1f2937', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Feather name="layers" size={18} color="#a855f7" />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: 'white', fontWeight: '700' }}>{wl.name}</Text>
                    <Text style={{ color: '#94a3b8', fontSize: 12 }}>{wl.comment || 'No description'}</Text>
                  </View>
                  <Feather name="chevron-right" size={18} color="#94a3b8" />
                </Pressable>
              </Link>
            ))
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

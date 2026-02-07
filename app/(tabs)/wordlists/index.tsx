import { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { MotiView } from 'moti';
import { useLibraryStore } from '@/store/useLibrary';
import { OrderStrategy } from '@/types';

export default function WordlistsScreen() {
  const {
    wordlists,
    wordlistFlashcards,
    flashcards,
    addWordlist,
    deleteWordlist,
    reorderWordlist
  } = useLibraryStore();
  const [name, setName] = useState('New List');
  const wordlistArray = useMemo(() => Object.values(wordlists), [wordlists]);

  const countFor = (wordlistId: string) => wordlistFlashcards.filter((w) => w.wordlistId === wordlistId).length;

  return (
    <LinearGradient colors={["#0f172a", "#0b1224"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 18, paddingTop: 48, gap: 14 }}>
        <Text style={{ color: 'white', fontSize: 24, fontWeight: '800' }}>Wordlists</Text>
        <Text style={{ color: '#cbd5e1' }}>Create decks, reorder, and jump into Learn/Test.</Text>

        <View style={{ backgroundColor: '#111827', padding: 14, borderRadius: 16, gap: 12, borderWidth: 1, borderColor: '#1f2937' }}>
          <Text style={{ color: '#e2e8f0', fontWeight: '700' }}>Create a wordlist</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Name"
            placeholderTextColor="#475569"
            style={{ backgroundColor: '#0f172a', color: 'white', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#1f2937' }}
          />
          <Pressable
            onPress={() => {
              try {
                addWordlist({ name: name.trim() || 'Untitled', comment: '', order: 'created_at' });
                setName('New List');
              } catch (e: any) {
                Alert.alert('Limit', e.message);
              }
            }}
            style={{ backgroundColor: '#a855f7', padding: 12, borderRadius: 12, alignItems: 'center' }}
          >
            <Text style={{ color: 'white', fontWeight: '700' }}>Add</Text>
          </Pressable>
        </View>

        <FlatList
          data={wordlistArray}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item, index }) => (
            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: index * 40 }}
              style={{ backgroundColor: '#111827', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#1f2937', gap: 12 }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>{item.name}</Text>
                  <Text style={{ color: '#94a3b8', fontSize: 12 }}>{countFor(item.id)} cards • Order: {item.order}</Text>
                </View>
                <Pressable
                  onPress={() => confirmDelete(() => deleteWordlist(item.id))}
                  style={{ padding: 8 }}
                >
                  <Feather name="trash-2" size={18} color="#f87171" />
                </Pressable>
              </View>

              <OrderRow current={item.order} onSelect={(order) => reorderWordlist(item.id, order)} />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Link href={`/wordlists/${item.id}`} asChild>
                  <Pressable style={pill('#22d3ee')}>
                    <Feather name="edit-3" size={16} color="#0f172a" />
                    <Text style={pillText('#0f172a')}>Manage</Text>
                  </Pressable>
                </Link>
                <Link href={{ pathname: '/wordlists/learn', params: { id: item.id } }} asChild>
                  <Pressable style={pill('#a855f7')}>
                    <Feather name="play" size={16} color="white" />
                    <Text style={pillText('white')}>Learn</Text>
                  </Pressable>
                </Link>
                <Link href={{ pathname: '/wordlists/test', params: { id: item.id } }} asChild>
                  <Pressable style={pill('#f59e0b')}>
                    <Feather name="zap" size={16} color="#0f172a" />
                    <Text style={pillText('#0f172a')}>Test</Text>
                  </Pressable>
                </Link>
              </View>
            </MotiView>
          )}
        />
      </ScrollView>
    </LinearGradient>
  );
}

function OrderRow({ current, onSelect }: { current: OrderStrategy; onSelect: (order: OrderStrategy) => void }) {
  const options: OrderStrategy[] = ['created_at', 'alpha', 'shuffle'];
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {options.map((opt) => (
        <Pressable key={opt} onPress={() => onSelect(opt)} style={{
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 10,
          backgroundColor: current === opt ? '#1d4ed8' : '#0f172a',
          borderWidth: 1,
          borderColor: '#1f2937'
        }}>
          <Text style={{ color: 'white', fontWeight: '700', fontSize: 12 }}>{opt}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function confirmDelete(onConfirm: () => void) {
  Alert.alert('Delete wordlist', 'Are you sure? This removes it from folders too.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: onConfirm }
  ]);
}

const pill = (bg: string) => ({
  backgroundColor: bg,
  paddingVertical: 10,
  paddingHorizontal: 12,
  borderRadius: 12,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6
});

const pillText = (color: string) => ({ color, fontWeight: '800', fontSize: 13 });

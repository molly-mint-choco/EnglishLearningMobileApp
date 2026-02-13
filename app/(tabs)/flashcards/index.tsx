import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, Pressable, Text, TextInput, View, type TextStyle, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useLibraryStore } from '@/store/useLibrary';
import { Flashcard } from '@/types';

export default function FlashcardsScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const {
    flashcards,
    wordlists,
    wordlistFlashcards,
    stats,
    addFlashcard,
    addFlashcardToWordlist,
    updateFlashcard,
    deleteFlashcard
  } = useLibraryStore();

  const wordlistArray = useMemo(() => Object.values(wordlists), [wordlists]);
  const [selectedWordlistId, setSelectedWordlistId] = useState<string | undefined>(wordlistArray[0]?.id);

  useEffect(() => {
    if (selectedWordlistId && wordlists[selectedWordlistId]) return;
    setSelectedWordlistId(wordlistArray[0]?.id);
  }, [selectedWordlistId, wordlistArray, wordlists]);

  const wordlistsByFlashcardId = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const join of wordlistFlashcards) {
      const wl = wordlists[join.wordlistId];
      if (!wl) continue;
      (map[join.flashcardId] ??= []).push(wl.name);
    }
    return map;
  }, [wordlistFlashcards, wordlists]);

  const allCards = useMemo(() => {
    return Object.values(flashcards).sort((a, b) => a.word.localeCompare(b.word));
  }, [flashcards]);

  const [filter, setFilter] = useState('');
  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return allCards;
    return allCards.filter((c) => {
      const hay = `${c.word} ${c.meaning} ${c.comment ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [allCards, filter]);

  const [newWord, setNewWord] = useState('');
  const [newMeaning, setNewMeaning] = useState('');
  const [newComment, setNewComment] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editWord, setEditWord] = useState('');
  const [editMeaning, setEditMeaning] = useState('');
  const [editComment, setEditComment] = useState('');

  const autoOpenedId = useRef<string | null>(null);

  useEffect(() => {
    const targetId = typeof params?.id === 'string' ? params.id : undefined;
    if (!targetId) return;
    if (autoOpenedId.current === targetId) return;
    const card = flashcards[targetId];
    if (!card) return;
    autoOpenedId.current = targetId;
    startEdit(card);
  }, [params?.id, flashcards]);

  const create = () => {
    const w = newWord.trim();
    const m = newMeaning.trim();
    if (!w || !m) return Alert.alert('Missing fields', 'Word and meaning are required.');

    try {
      const card = addFlashcard({
        word: w,
        meaning: m,
        comment: newComment.trim(),
        frequency: 0
      });
      if (selectedWordlistId) addFlashcardToWordlist(selectedWordlistId, card.id);

      setNewWord('');
      setNewMeaning('');
      setNewComment('');
      Alert.alert('Added', `Saved "${card.word}".`);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to add flashcard.');
    }
  };

  const startEdit = (card: Flashcard) => {
    setEditingId(card.id);
    setEditWord(card.word);
    setEditMeaning(card.meaning);
    setEditComment(card.comment ?? '');
  };

  const saveEdit = () => {
    if (!editingId) return;
    try {
      updateFlashcard(editingId, { word: editWord, meaning: editMeaning, comment: editComment });
      setEditingId(null);
      Alert.alert('Saved', 'Flashcard updated.');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to update flashcard.');
    }
  };

  const confirmDelete = (id: string) => {
    Alert.alert('Delete flashcard', 'This deletes the flashcard from all wordlists.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteFlashcard(id)
      }
    ]);
  };

  return (
    <LinearGradient colors={["#0f172a", "#0b1224"]} style={{ flex: 1 }}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 18, paddingTop: 48, gap: 12 }}
        ListHeaderComponent={
          <View style={{ gap: 14 }}>
            <Text style={{ color: 'white', fontSize: 24, fontWeight: '800' }}>Flashcards</Text>
            <Text style={{ color: '#cbd5e1' }}>All cards: {stats.flashcards}</Text>

            <View style={{ backgroundColor: '#111827', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#1f2937', gap: 10 }}>
              <Text style={{ color: '#e2e8f0', fontWeight: '700' }}>Add flashcard</Text>
              <TextInput
                value={newWord}
                onChangeText={setNewWord}
                placeholder="Word"
                placeholderTextColor="#475569"
                style={inputStyle}
              />
              <TextInput
                value={newMeaning}
                onChangeText={setNewMeaning}
                placeholder="Meaning"
                placeholderTextColor="#475569"
                style={[inputStyle, { height: 70 }]}
                multiline
              />
              <TextInput
                value={newComment}
                onChangeText={(t) => setNewComment(t.slice(0, 500))}
                placeholder="Comment (optional, <= 500 chars)"
                placeholderTextColor="#475569"
                style={[inputStyle, { height: 60 }]}
                multiline
              />

              {wordlistArray.length ? (
                <View style={{ gap: 8 }}>
                  <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '700' }}>Add to wordlist (optional)</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {wordlistArray.map((wl) => (
                      <Pressable
                        key={wl.id}
                        onPress={() => setSelectedWordlistId(wl.id)}
                        style={{
                          paddingVertical: 8,
                          paddingHorizontal: 12,
                          borderRadius: 10,
                          backgroundColor: selectedWordlistId === wl.id ? '#a855f7' : '#0f172a',
                          borderWidth: 1,
                          borderColor: '#1f2937'
                        }}
                      >
                        <Text style={{ color: 'white', fontWeight: '700' }}>{wl.name}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : null}

              <Pressable onPress={create} style={{ backgroundColor: '#22d3ee', padding: 12, borderRadius: 12, alignItems: 'center' }}>
                <Text style={{ color: '#0f172a', fontWeight: '900' }}>Add</Text>
              </Pressable>
            </View>

            <View style={{ backgroundColor: '#111827', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#1f2937', gap: 10 }}>
              <Text style={{ color: '#e2e8f0', fontWeight: '700' }}>Filter</Text>
              <TextInput
                value={filter}
                onChangeText={setFilter}
                placeholder="Search your flashcards"
                placeholderTextColor="#475569"
                autoCapitalize="none"
                style={inputStyle}
              />
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const inWordlists = wordlistsByFlashcardId[item.id] ?? [];
          const isEditing = editingId === item.id;

          return (
            <View style={{ backgroundColor: '#111827', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#1f2937', gap: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: 'white', fontSize: 18, fontWeight: '800' }}>{item.word}</Text>
                  <Text style={{ color: '#cbd5e1' }}>{item.meaning}</Text>
                  <Text style={{ color: '#94a3b8', fontSize: 12 }}>Seen: {item.frequency}</Text>
                  <Text style={{ color: '#475569', fontSize: 12 }}>
                    {inWordlists.length ? `In: ${inWordlists.join(', ')}` : 'Not in any wordlist'}
                  </Text>
                  {item.comment ? <Text style={{ color: '#94a3b8', marginTop: 6 }}>{item.comment}</Text> : null}
                </View>

                <View style={{ gap: 10 }}>
                  <Pressable onPress={() => startEdit(item)} style={iconButton('#22d3ee')}>
                    <Feather name="edit-3" size={16} color="#0f172a" />
                  </Pressable>
                  <Pressable onPress={() => confirmDelete(item.id)} style={iconButton('#f87171')}>
                    <Feather name="trash-2" size={16} color="#0f172a" />
                  </Pressable>
                </View>
              </View>

              {isEditing ? (
                <View style={{ gap: 10 }}>
                  <Text style={{ color: '#e2e8f0', fontWeight: '800' }}>Edit</Text>
                  <TextInput value={editWord} onChangeText={setEditWord} placeholder="Word" placeholderTextColor="#475569" style={inputStyle} />
                  <TextInput
                    value={editMeaning}
                    onChangeText={setEditMeaning}
                    placeholder="Meaning"
                    placeholderTextColor="#475569"
                    style={[inputStyle, { height: 70 }]}
                    multiline
                  />
                  <TextInput
                    value={editComment}
                    onChangeText={(t) => setEditComment(t.slice(0, 500))}
                    placeholder="Comment (<= 500 chars)"
                    placeholderTextColor="#475569"
                    style={[inputStyle, { height: 60 }]}
                    multiline
                  />

                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Pressable onPress={saveEdit} style={pill('#a855f7')}>
                      <Text style={pillText('white')}>Save</Text>
                    </Pressable>
                    <Pressable onPress={() => setEditingId(null)} style={pill('#1f2937')}>
                      <Text style={pillText('white')}>Cancel</Text>
                    </Pressable>
                  </View>
                </View>
              ) : null}
            </View>
          );
        }}
      />
    </LinearGradient>
  );
}

const inputStyle: TextStyle = {
  backgroundColor: '#0f172a',
  color: 'white',
  padding: 12,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#1f2937'
};

const iconButton = (bg: string): ViewStyle => ({
  backgroundColor: bg,
  padding: 10,
  borderRadius: 12,
  alignItems: 'center',
  justifyContent: 'center'
});

const pill = (bg: string): ViewStyle => ({
  backgroundColor: bg,
  paddingVertical: 12,
  paddingHorizontal: 14,
  borderRadius: 12,
  alignItems: 'center',
  flex: 1
});

const pillText = (color: string): TextStyle => ({ color, fontWeight: '900' });

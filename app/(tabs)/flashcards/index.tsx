import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, Pressable, Text, TextInput, View, type TextStyle, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useLibraryStore } from '@/store/useLibrary';
import { Flashcard } from '@/types';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAppTheme, type AppColors } from '@/theme/useAppTheme';

export default function FlashcardsScreen() {
  const { colors, gradient } = useAppTheme();
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
    <LinearGradient colors={gradient} style={{ flex: 1 }}>
      <ScreenHeader title="Flashcards" subtitle={`All cards: ${stats.flashcards}`} />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 18, gap: 12 }}
        ListHeaderComponent={
          <View style={{ gap: 14 }}>
            <View style={{ backgroundColor: colors.surface, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: colors.border, gap: 10 }}>
              <Text style={{ color: colors.text, fontWeight: '700' }}>Add flashcard</Text>
              <TextInput
                value={newWord}
                onChangeText={setNewWord}
                placeholder="Word"
                placeholderTextColor={colors.placeholder}
                style={inputStyle(colors)}
              />
              <TextInput
                value={newMeaning}
                onChangeText={setNewMeaning}
                placeholder="Meaning"
                placeholderTextColor={colors.placeholder}
                style={[inputStyle(colors), { height: 70 }]}
                multiline
              />
              <TextInput
                value={newComment}
                onChangeText={(t) => setNewComment(t.slice(0, 500))}
                placeholder="Comment (optional, <= 500 chars)"
                placeholderTextColor={colors.placeholder}
                style={[inputStyle(colors), { height: 60 }]}
                multiline
              />

              {wordlistArray.length ? (
                <View style={{ gap: 8 }}>
                  <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '700' }}>Add to wordlist (optional)</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {wordlistArray.map((wl) => (
                      <Pressable
                        key={wl.id}
                        onPress={() => setSelectedWordlistId(wl.id)}
                        style={{
                          paddingVertical: 8,
                          paddingHorizontal: 12,
                          borderRadius: 10,
                          backgroundColor: selectedWordlistId === wl.id ? colors.accent : colors.surface2,
                          borderWidth: 1,
                          borderColor: colors.border
                        }}
                      >
                        <Text style={{ color: selectedWordlistId === wl.id ? 'white' : colors.text, fontWeight: '700' }}>{wl.name}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : null}

              <Pressable onPress={create} style={{ backgroundColor: colors.accent2, padding: 12, borderRadius: 12, alignItems: 'center' }}>
                <Text style={{ color: colors.onAccent, fontWeight: '900' }}>Add</Text>
              </Pressable>
            </View>

            <View style={{ backgroundColor: colors.surface, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: colors.border, gap: 10 }}>
              <Text style={{ color: colors.text, fontWeight: '700' }}>Filter</Text>
              <TextInput
                value={filter}
                onChangeText={setFilter}
                placeholder="Search your flashcards"
                placeholderTextColor={colors.placeholder}
                autoCapitalize="none"
                style={inputStyle(colors)}
              />
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const inWordlists = wordlistsByFlashcardId[item.id] ?? [];
          const isEditing = editingId === item.id;

          return (
            <View style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border, gap: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }}>{item.word}</Text>
                  <Text style={{ color: colors.textSecondary }}>{item.meaning}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>Seen: {item.frequency}</Text>
                  <Text style={{ color: colors.textFaint, fontSize: 12 }}>
                    {inWordlists.length ? `In: ${inWordlists.join(', ')}` : 'Not in any wordlist'}
                  </Text>
                  {item.comment ? <Text style={{ color: colors.textMuted, marginTop: 6 }}>{item.comment}</Text> : null}
                </View>

                <View style={{ gap: 10 }}>
                  <Pressable onPress={() => startEdit(item)} style={iconButton(colors.accent2)}>
                    <Feather name="edit-3" size={16} color={colors.onAccent} />
                  </Pressable>
                  <Pressable onPress={() => confirmDelete(item.id)} style={iconButton(colors.danger)}>
                    <Feather name="trash-2" size={16} color="white" />
                  </Pressable>
                </View>
              </View>

              {isEditing ? (
                <View style={{ gap: 10 }}>
                  <Text style={{ color: colors.text, fontWeight: '800' }}>Edit</Text>
                  <TextInput value={editWord} onChangeText={setEditWord} placeholder="Word" placeholderTextColor={colors.placeholder} style={inputStyle(colors)} />
                  <TextInput
                    value={editMeaning}
                    onChangeText={setEditMeaning}
                    placeholder="Meaning"
                    placeholderTextColor={colors.placeholder}
                    style={[inputStyle(colors), { height: 70 }]}
                    multiline
                  />
                  <TextInput
                    value={editComment}
                    onChangeText={(t) => setEditComment(t.slice(0, 500))}
                    placeholder="Comment (<= 500 chars)"
                    placeholderTextColor={colors.placeholder}
                    style={[inputStyle(colors), { height: 60 }]}
                    multiline
                  />

                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Pressable onPress={saveEdit} style={pill(colors.accent)}>
                      <Text style={pillText('white')}>Save</Text>
                    </Pressable>
                    <Pressable onPress={() => setEditingId(null)} style={pill(colors.surface2)}>
                      <Text style={pillText(colors.text)}>Cancel</Text>
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

const inputStyle = (colors: AppColors): TextStyle => ({
  backgroundColor: colors.surface2,
  color: colors.text,
  padding: 12,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.border
});

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

import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, ScrollView, Text, TextInput, View, type TextStyle, type ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLibraryStore } from '@/store/useLibrary';

export default function WordlistDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    wordlists,
    flashcards,
    wordlistFlashcards,
    addFlashcard,
    addFlashcardToWordlist,
    removeFlashcardFromWordlist,
    bumpFrequency
  } = useLibraryStore();

  const wordlist = wordlists[id!];
  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [comment, setComment] = useState('');

  const cards = useMemo(() => {
    const ids = wordlistFlashcards.filter((wfc) => wfc.wordlistId === id).map((wfc) => wfc.flashcardId);
    return ids.map((cid) => flashcards[cid]).filter(Boolean);
  }, [flashcards, wordlistFlashcards, id]);

  if (!wordlist) return null;

  const addCard = () => {
    if (!word.trim() || !meaning.trim()) return Alert.alert('Word & meaning required');
    try {
      const card = addFlashcard({ word: word.trim(), meaning: meaning.trim(), comment: comment.trim(), frequency: 0 });
      addFlashcardToWordlist(wordlist.id, card.id);
      setWord('');
      setMeaning('');
      setComment('');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const removeCard = (cardId: string) => {
    Alert.alert('Remove card', 'This removes the card only from this wordlist.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeFlashcardFromWordlist(wordlist.id, cardId) }
    ]);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 18, paddingTop: 48, gap: 16, backgroundColor: '#0f172a', flexGrow: 1 }}>
      <Stack.Screen options={{ headerShown: true, headerTitle: wordlist.name, headerTintColor: 'white', headerStyle: { backgroundColor: '#0f172a' } }} />

      <Text style={{ color: 'white', fontSize: 20, fontWeight: '800' }}>{wordlist.name}</Text>
      {wordlist.comment ? <Text style={{ color: '#94a3b8' }}>{wordlist.comment}</Text> : null}

      <View style={{ backgroundColor: '#111827', padding: 14, borderRadius: 16, gap: 8, borderWidth: 1, borderColor: '#1f2937' }}>
        <Text style={{ color: '#e2e8f0', fontWeight: '700' }}>Add flashcard</Text>
        <TextInput placeholder="Word" placeholderTextColor="#475569" value={word} onChangeText={setWord} style={inputStyle} />
        <TextInput
          placeholder="Meaning"
          placeholderTextColor="#475569"
          value={meaning}
          onChangeText={setMeaning}
          style={[inputStyle, { height: 70 }]}
          multiline
        />
        <TextInput
          placeholder="Comment (<=500 chars)"
          placeholderTextColor="#475569"
          value={comment}
          onChangeText={(t) => setComment(t.slice(0, 500))}
          style={[inputStyle, { height: 60 }]}
          multiline
        />
        <Pressable onPress={addCard} style={{ backgroundColor: '#22d3ee', padding: 12, borderRadius: 12, alignItems: 'center' }}>
          <Text style={{ color: '#0f172a', fontWeight: '800' }}>Add</Text>
        </Pressable>
      </View>

      <FlatList
        data={cards}
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 12 }}
        renderItem={({ item }) => (
          <View style={{ backgroundColor: '#111827', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#1f2937', gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>{item.word}</Text>
              <Pressable onPress={() => removeCard(item.id)} style={{ padding: 6 }}>
                <Feather name="minus-circle" size={18} color="#f87171" />
              </Pressable>
            </View>
            <Text style={{ color: '#cbd5e1' }}>{item.meaning}</Text>
            {item.comment ? <Text style={{ color: '#94a3b8', fontSize: 12 }}>{item.comment}</Text> : null}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
              <Pressable onPress={() => bumpFrequency(item.id)} style={pill('#a855f7')}>
                <Feather name="bar-chart-2" size={14} color="white" />
                <Text style={pillText('white')}>Seen {item.frequency}</Text>
              </Pressable>
              <Pressable onPress={() => router.push({ pathname: '/flashcards', params: { id: item.id } })} style={pill('#22d3ee')}>
                <Feather name="edit-3" size={14} color="#0f172a" />
                <Text style={pillText('#0f172a')}>Edit comment</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </ScrollView>
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

const pill = (bg: string): ViewStyle => ({
  backgroundColor: bg,
  paddingVertical: 8,
  paddingHorizontal: 10,
  borderRadius: 10,
  flexDirection: 'row',
  gap: 6,
  alignItems: 'center'
});

const pillText = (color: string): TextStyle => ({ color, fontWeight: '700', fontSize: 12 });

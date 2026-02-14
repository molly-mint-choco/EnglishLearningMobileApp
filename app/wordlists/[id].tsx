import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, ScrollView, Text, TextInput, View, type TextStyle, type ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLibraryStore } from '@/store/useLibrary';
import { useAppTheme, type AppColors } from '@/theme/useAppTheme';

export default function WordlistDetail() {
  const { colors, gradient, isDark } = useAppTheme();
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
    <LinearGradient colors={gradient} style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: wordlist.name,
          headerTintColor: colors.text,
          headerStyle: { backgroundColor: colors.header },
          statusBarStyle: isDark ? 'light' : 'dark',
          statusBarColor: colors.header
        }}
      />
      <ScrollView contentContainerStyle={{ padding: 18, gap: 16, flexGrow: 1 }}>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>{wordlist.name}</Text>
        {wordlist.comment ? <Text style={{ color: colors.textMuted }}>{wordlist.comment}</Text> : null}

        <View style={{ backgroundColor: colors.surface, padding: 14, borderRadius: 16, gap: 8, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.text, fontWeight: '700' }}>Add flashcard</Text>
          <TextInput
            placeholder="Word"
            placeholderTextColor={colors.placeholder}
            value={word}
            onChangeText={setWord}
            style={inputStyle(colors)}
          />
          <TextInput
            placeholder="Meaning"
            placeholderTextColor={colors.placeholder}
            value={meaning}
            onChangeText={setMeaning}
            style={[inputStyle(colors), { height: 70 }]}
            multiline
          />
          <TextInput
            placeholder="Comment (<=500 chars)"
            placeholderTextColor={colors.placeholder}
            value={comment}
            onChangeText={(t) => setComment(t.slice(0, 500))}
            style={[inputStyle(colors), { height: 60 }]}
            multiline
          />
          <Pressable onPress={addCard} style={{ backgroundColor: colors.accent2, padding: 12, borderRadius: 12, alignItems: 'center' }}>
            <Text style={{ color: colors.onAccent, fontWeight: '800' }}>Add</Text>
          </Pressable>
        </View>

        <FlatList
          data={cards}
          scrollEnabled={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 12 }}
          renderItem={({ item }) => (
            <View style={{ backgroundColor: colors.surface, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border, gap: 6 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>{item.word}</Text>
                <Pressable onPress={() => removeCard(item.id)} style={{ padding: 6 }}>
                  <Feather name="minus-circle" size={18} color={colors.danger} />
                </Pressable>
              </View>
              <Text style={{ color: colors.textSecondary }}>{item.meaning}</Text>
              {item.comment ? <Text style={{ color: colors.textMuted, fontSize: 12 }}>{item.comment}</Text> : null}
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
                <Pressable onPress={() => bumpFrequency(item.id)} style={pill(colors.accent)}>
                  <Feather name="bar-chart-2" size={14} color="white" />
                  <Text style={pillText('white')}>Seen {item.frequency}</Text>
                </Pressable>
                <Pressable onPress={() => router.push({ pathname: '/flashcards', params: { id: item.id } })} style={pill(colors.accent2)}>
                  <Feather name="edit-3" size={14} color={colors.onAccent} />
                  <Text style={pillText(colors.onAccent)}>Edit comment</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      </ScrollView>
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

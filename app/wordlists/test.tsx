import { useLocalSearchParams, Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View } from 'react-native';
import { MotiView } from 'moti';
import { useLibraryStore } from '@/store/useLibrary';
import { Flashcard } from '@/types';

export default function TestScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { wordlists, wordlistFlashcards, flashcards, bumpFrequency } = useLibraryStore();
  const wordlist = wordlists[id!];
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const cards = useMemo(() => orderedCards(wordlist?.id, wordlistFlashcards, flashcards, wordlist?.order, wordlist?.shuffleSeed), [wordlistFlashcards, flashcards, wordlist]);
  const card = cards[idx];

  const next = () => {
    setIdx((n) => (n + 1) % Math.max(cards.length, 1));
    setRevealed(false);
  };

  if (!wordlist || cards.length === 0) return null;

  return (
    <LinearGradient colors={["#0f172a", "#0b1224"]} style={{ flex: 1, paddingTop: 48 }}>
      <Stack.Screen options={{ headerShown: true, headerTitle: `Test • ${wordlist.name}`, headerTintColor: 'white', headerStyle: { backgroundColor: '#0f172a' } }} />
      <View style={{ flex: 1, padding: 20, gap: 20 }}>
        <MotiView
          from={{ rotateY: revealed ? '-90deg' : '90deg', opacity: 0 }}
          animate={{ rotateY: '0deg', opacity: 1 }}
          transition={{ type: 'timing', duration: 300 }}
          key={`${card.id}-${revealed}`}
          style={{ backgroundColor: '#111827', borderRadius: 18, padding: 20, borderWidth: 1, borderColor: '#1f2937', gap: 10 }}
        >
          <Text style={{ color: '#a855f7', fontWeight: '700', fontSize: 12 }}>Card {idx + 1} / {cards.length}</Text>
          <Text style={{ color: 'white', fontSize: 28, fontWeight: '800' }}>{card.word}</Text>
          {revealed ? (
            <View style={{ gap: 8 }}>
              <Text style={{ color: '#e2e8f0', fontSize: 16 }}>{card.meaning}</Text>
              {card.comment ? <Text style={{ color: '#94a3b8', fontSize: 13 }}>Note: {card.comment}</Text> : null}
              <Text style={{ color: '#cbd5e1', fontSize: 12 }}>Frequency: {card.frequency}</Text>
            </View>
          ) : (
            <Text style={{ color: '#475569', fontSize: 14 }}>Tap reveal to see the meaning.</Text>
          )}
        </MotiView>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable onPress={() => { setRevealed(true); bumpFrequency(card.id); }} style={pill('#22d3ee')}>
            <Text style={pillText('#0f172a')}>Reveal</Text>
          </Pressable>
          <Pressable onPress={next} style={pill('#1f2937')}>
            <Text style={pillText('white')}>Skip</Text>
          </Pressable>
        </View>
      </View>
    </LinearGradient>
  );
}

type WordlistJoin = ReturnType<typeof useLibraryStore.getState>['wordlistFlashcards'];

function orderedCards(
  wordlistId: string | undefined,
  joins: WordlistJoin,
  cards: Record<string, Flashcard>,
  order?: string,
  seed?: number
): Flashcard[] {
  if (!wordlistId) return [];
  const ids = joins.filter((j) => j.wordlistId === wordlistId).map((j) => j.flashcardId);
  const arr = ids.map((id) => cards[id]).filter(Boolean);
  if (order === 'alpha') return arr.sort((a, b) => a.word.localeCompare(b.word));
  if (order === 'shuffle') {
    const rng = seed || Math.random();
    return [...arr].sort(() => Math.sin(rng) - 0.5);
  }
  return arr;
}

const pill = (bg: string) => ({
  backgroundColor: bg,
  paddingVertical: 14,
  paddingHorizontal: 16,
  borderRadius: 12,
  alignItems: 'center',
  flex: 1
});

const pillText = (color: string) => ({ color, fontWeight: '800', fontSize: 15 });

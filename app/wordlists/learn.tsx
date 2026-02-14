import { useLocalSearchParams, Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View, type TextStyle, type ViewStyle } from 'react-native';
import { MotiView } from 'moti';
import { useLibraryStore } from '@/store/useLibrary';
import { Flashcard } from '@/types';
import { useAppTheme } from '@/theme/useAppTheme';

export default function LearnScreen() {
  const { colors, gradient, isDark } = useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { wordlists, wordlistFlashcards, flashcards, reorderWordlist, bumpFrequency } = useLibraryStore();
  const wordlist = wordlists[id!];
  const [idx, setIdx] = useState(0);

  const cards = useMemo(() => orderedCards(wordlist?.id, wordlistFlashcards, flashcards, wordlist?.order, wordlist?.shuffleSeed), [wordlistFlashcards, flashcards, wordlist]);
  const card = cards[idx];

  const next = () => setIdx((n) => (n + 1) % Math.max(cards.length, 1));

  if (!wordlist || cards.length === 0) return null;

  return (
    <LinearGradient colors={gradient} style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: `Learn - ${wordlist.name}`,
          headerTintColor: colors.text,
          headerStyle: { backgroundColor: colors.header },
          statusBarStyle: isDark ? 'light' : 'dark',
          statusBarColor: colors.header
        }}
      />
      <View style={{ flex: 1, padding: 20, gap: 20 }}>
        <MotiView
          from={{ opacity: 0, translateY: 14 }}
          animate={{ opacity: 1, translateY: 0 }}
          key={card.id}
          style={{ backgroundColor: colors.surface, borderRadius: 18, padding: 20, borderWidth: 1, borderColor: colors.border, gap: 10 }}
        >
          <Text style={{ color: colors.accent, fontWeight: '700', fontSize: 12 }}>
            Card {idx + 1} / {cards.length}
          </Text>
          <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800' }}>{card.word}</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 16 }}>{card.meaning}</Text>
          {card.comment ? <Text style={{ color: colors.textMuted, fontSize: 13 }}>Note: {card.comment}</Text> : null}
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>Frequency: {card.frequency}</Text>
        </MotiView>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable
            onPress={() => {
              bumpFrequency(card.id);
              next();
            }}
            style={pill(colors.accent2)}
          >
            <Text style={pillText(colors.onAccent)}>Confirm</Text>
          </Pressable>
          <Pressable onPress={next} style={pill(colors.surface2)}>
            <Text style={pillText(colors.text)}>Skip</Text>
          </Pressable>
          <Pressable onPress={() => reorderWordlist(wordlist.id, 'shuffle')} style={pill(colors.accent)}>
            <Text style={pillText('white')}>Shuffle</Text>
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

const pill = (bg: string): ViewStyle => ({
  backgroundColor: bg,
  paddingVertical: 14,
  paddingHorizontal: 16,
  borderRadius: 12,
  alignItems: 'center',
  flex: 1
});

const pillText = (color: string): TextStyle => ({ color, fontWeight: '800', fontSize: 15 });

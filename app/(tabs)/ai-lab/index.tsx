import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { useLibraryStore } from '@/store/useLibrary';
import { generateExamples, generateQuiz, ExampleSentence, QuizQuestion } from '@/lib/ai';

export default function AILabScreen() {
  const { wordlists, wordlistFlashcards, flashcards } = useLibraryStore();
  const wordlistArray = Object.values(wordlists);
  const [selectedId, setSelectedId] = useState<string | undefined>(wordlistArray[0]?.id);
  const [examples, setExamples] = useState<ExampleSentence[] | null>(null);
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [loading, setLoading] = useState(false);

  const cardsForSelected = () => {
    const ids = wordlistFlashcards.filter((w) => w.wordlistId === selectedId).map((w) => w.flashcardId);
    return ids.map((id) => flashcards[id]).filter(Boolean);
  };

  const runExamples = async () => {
    setLoading(true);
    setQuiz(null);
    setExamples(await generateExamples(wordlistArray.find((w) => w.id === selectedId)?.name || 'Wordlist', cardsForSelected()));
    setLoading(false);
  };

  const runQuiz = async () => {
    setLoading(true);
    setExamples(null);
    setQuiz(await generateQuiz(wordlistArray.find((w) => w.id === selectedId)?.name || 'Wordlist', cardsForSelected()));
    setLoading(false);
  };

  return (
    <LinearGradient colors={["#0f172a", "#0b1224"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 18, paddingTop: 48, gap: 14 }}>
        <Text style={{ color: 'white', fontSize: 24, fontWeight: '800' }}>AI Lab</Text>
        <Text style={{ color: '#cbd5e1' }}>Generate examples or quizzes from your wordlists.</Text>

        <View style={{ backgroundColor: '#111827', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#1f2937', gap: 10 }}>
          <Text style={{ color: '#e2e8f0', fontWeight: '700' }}>Select wordlist</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {wordlistArray.map((wl) => (
              <Pressable key={wl.id} onPress={() => setSelectedId(wl.id)} style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 10,
                backgroundColor: selectedId === wl.id ? '#22d3ee' : '#0f172a',
                borderWidth: 1,
                borderColor: '#1f2937'
              }}>
                <Text style={{ color: selectedId === wl.id ? '#0f172a' : 'white', fontWeight: '700' }}>{wl.name}</Text>
              </Pressable>
            ))}
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable onPress={runExamples} disabled={loading} style={pill('#a855f7', loading)}>
              <Feather name="book-open" size={16} color="white" />
              <Text style={pillText('white')}>{loading ? 'Loading…' : 'Review by example'}</Text>
            </Pressable>
            <Pressable onPress={runQuiz} disabled={loading} style={pill('#f59e0b', loading)}>
              <Feather name="help-circle" size={16} color="#0f172a" />
              <Text style={pillText('#0f172a')}>{loading ? 'Loading…' : 'Quiz'}</Text>
            </Pressable>
          </View>
        </View>

        {examples && (
          <View style={{ gap: 12 }}>
            {examples.map((ex, idx) => (
              <MotiView key={ex.word} from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: idx * 40 }}
                style={{ backgroundColor: '#111827', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#1f2937', gap: 6 }}>
                <Text style={{ color: '#a855f7', fontWeight: '800' }}>{ex.word}</Text>
                {ex.sentences.map((s, i) => (
                  <Text key={i} style={{ color: '#e2e8f0' }}>• {s}</Text>
                ))}
              </MotiView>
            ))}
          </View>
        )}

        {quiz && (
          <View style={{ gap: 12 }}>
            {quiz.map((q, idx) => (
              <MotiView key={q.id} from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: idx * 40 }}
                style={{ backgroundColor: '#111827', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#1f2937', gap: 8 }}>
                <Text style={{ color: '#e2e8f0', fontWeight: '700' }}>{q.prompt}</Text>
                {q.type === 'mcq' && q.choices?.map((c, i) => (
                  <Text key={i} style={{ color: '#94a3b8' }}>- {c}</Text>
                ))}
                {q.type === 'fill' && <Text style={{ color: '#94a3b8' }}>Tap reveal to check your answer.</Text>}
                <Text style={{ color: '#22d3ee', fontWeight: '700' }}>Answer: {q.answer}</Text>
              </MotiView>
            ))}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const pill = (bg: string, disabled: boolean) => ({
  backgroundColor: disabled ? '#334155' : bg,
  paddingVertical: 12,
  paddingHorizontal: 12,
  borderRadius: 12,
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  justifyContent: 'center'
});

const pillText = (color: string) => ({ color, fontWeight: '800', fontSize: 14 });

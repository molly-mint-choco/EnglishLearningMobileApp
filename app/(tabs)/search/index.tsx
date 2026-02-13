import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useLibraryStore } from '@/store/useLibrary';

type DictionaryApiDefinition = {
  definition: string;
  example?: string;
};

type DictionaryApiMeaning = {
  partOfSpeech: string;
  definitions: DictionaryApiDefinition[];
};

type DictionaryApiPhonetic = {
  text?: string;
  audio?: string;
};

type DictionaryApiEntry = {
  word: string;
  phonetic?: string;
  phonetics?: DictionaryApiPhonetic[];
  meanings?: DictionaryApiMeaning[];
  sourceUrls?: string[];
};

export default function DictionarySearchScreen() {
  const { wordlists, addFlashcard, addFlashcardToWordlist } = useLibraryStore();
  const wordlistArray = useMemo(() => Object.values(wordlists), [wordlists]);

  const [query, setQuery] = useState('');
  const [selectedWordlistId, setSelectedWordlistId] = useState<string | undefined>(wordlistArray[0]?.id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entry, setEntry] = useState<DictionaryApiEntry | null>(null);

  useEffect(() => {
    if (selectedWordlistId && wordlists[selectedWordlistId]) return;
    setSelectedWordlistId(wordlistArray[0]?.id);
  }, [selectedWordlistId, wordlistArray, wordlists]);

  const runSearch = async () => {
    const q = query.trim().toLowerCase();
    if (!q) return;

    setLoading(true);
    setError(null);
    setEntry(null);

    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(q)}`);
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Dictionary lookup failed (${res.status})`);
      }

      const data = (await res.json()) as DictionaryApiEntry[];
      setEntry(data?.[0] ?? null);
    } catch (e: any) {
      const msg = typeof e?.message === 'string' ? e.message : 'Unknown error';
      setError(msg.includes('No Definitions Found') ? 'No definitions found.' : msg);
    } finally {
      setLoading(false);
    }
  };

  const addAsFlashcard = () => {
    if (!entry) return;
    const definition = pickDefinition(entry);
    if (!definition) return Alert.alert('No definition', 'This dictionary result did not include any definitions to save.');

    try {
      const card = addFlashcard({
        word: entry.word,
        meaning: definition,
        comment: '',
        frequency: 0,
        dictionaryId: 'dictionaryapi.dev',
        audioUrl: pickAudioUrl(entry)
      });

      if (selectedWordlistId) addFlashcardToWordlist(selectedWordlistId, card.id);

      Alert.alert('Added', `Saved "${entry.word}" as a flashcard.`);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to add flashcard.');
    }
  };

  return (
    <LinearGradient colors={["#0f172a", "#0b1224"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 18, paddingTop: 48, gap: 14 }}>
        <Text style={{ color: 'white', fontSize: 24, fontWeight: '800' }}>Search</Text>
        <Text style={{ color: '#cbd5e1' }}>Look up a word in a free dictionary and save it as a flashcard.</Text>

        <View style={{ backgroundColor: '#111827', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#1f2937', gap: 10 }}>
          <Text style={{ color: '#e2e8f0', fontWeight: '700' }}>Dictionary</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={runSearch}
              placeholder="Search a word (e.g., resilient)"
              placeholderTextColor="#475569"
              autoCapitalize="none"
              style={{
                flex: 1,
                backgroundColor: '#0f172a',
                color: 'white',
                padding: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#1f2937'
              }}
            />
            <Pressable onPress={runSearch} disabled={loading} style={{ backgroundColor: loading ? '#334155' : '#22d3ee', padding: 12, borderRadius: 12, justifyContent: 'center' }}>
              <Feather name="search" size={18} color="#0f172a" />
            </Pressable>
          </View>

          <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '700' }}>Save to wordlist (optional)</Text>
          {wordlistArray.length === 0 ? (
            <Link href="/wordlists" asChild>
              <Pressable style={{ backgroundColor: '#0f172a', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#1f2937', flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <Feather name="layers" size={16} color="#a855f7" />
                <Text style={{ color: 'white', fontWeight: '700' }}>Create a wordlist first</Text>
              </Pressable>
            </Link>
          ) : (
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
          )}
        </View>

        {error ? (
          <View style={{ backgroundColor: '#111827', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#7f1d1d' }}>
            <Text style={{ color: '#fecaca', fontWeight: '800' }}>Search failed</Text>
            <Text style={{ color: '#fecaca', marginTop: 6 }}>{error}</Text>
          </View>
        ) : null}

        {entry ? (
          <View style={{ backgroundColor: '#111827', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#1f2937', gap: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: 'white', fontSize: 22, fontWeight: '900' }}>{entry.word}</Text>
                <Text style={{ color: '#94a3b8' }}>{entry.phonetic || entry.phonetics?.find((p) => p.text)?.text || ''}</Text>
              </View>
              <Pressable onPress={addAsFlashcard} style={{ backgroundColor: '#22d3ee', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <Feather name="plus" size={16} color="#0f172a" />
                <Text style={{ color: '#0f172a', fontWeight: '900' }}>Add</Text>
              </Pressable>
            </View>

            <View style={{ gap: 10 }}>
              {entry.meanings?.slice(0, 3).map((m, idx) => (
                <View key={`${m.partOfSpeech}-${idx}`} style={{ gap: 6 }}>
                  <Text style={{ color: '#a855f7', fontWeight: '800' }}>{m.partOfSpeech}</Text>
                  {m.definitions?.slice(0, 3).map((d, i) => (
                    <View key={`${idx}-${i}`} style={{ gap: 4 }}>
                      <Text style={{ color: '#e2e8f0' }}>- {d.definition}</Text>
                      {d.example ? <Text style={{ color: '#94a3b8' }}>Example: {d.example}</Text> : null}
                    </View>
                  ))}
                </View>
              ))}
            </View>

            {entry.sourceUrls?.[0] ? (
              <Text style={{ color: '#475569', fontSize: 12 }}>Source: {entry.sourceUrls[0]}</Text>
            ) : null}
          </View>
        ) : (
          <View style={{ backgroundColor: '#111827', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#1f2937' }}>
            <Text style={{ color: '#94a3b8' }}>
              {loading ? 'Searching...' : 'Type a word and hit search.'}
            </Text>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

function pickDefinition(entry: DictionaryApiEntry): string | null {
  const meaning = entry.meanings?.[0];
  const def = meaning?.definitions?.[0]?.definition;
  if (!def) return null;
  return meaning?.partOfSpeech ? `(${meaning.partOfSpeech}) ${def}` : def;
}

function pickAudioUrl(entry: DictionaryApiEntry): string | undefined {
  const audio = entry.phonetics?.find((p) => p.audio)?.audio;
  if (!audio) return undefined;
  if (audio.startsWith('http://') || audio.startsWith('https://')) return audio;
  return undefined;
}

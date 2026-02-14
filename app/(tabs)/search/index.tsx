import { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View, type TextStyle, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useLibraryStore } from '@/store/useLibrary';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAppTheme, type AppColors } from '@/theme/useAppTheme';

type DictionarySource = 'en' | 'eng-chs';

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

type MyMemoryResponse = {
  responseData?: { translatedText?: string };
  responseStatus?: number;
  responseDetails?: string;
};

const DICTIONARY_SOURCES: Array<{ id: DictionarySource; label: string; description: string }> = [
  { id: 'en', label: 'English', description: 'Definitions (dictionaryapi.dev)' },
  { id: 'eng-chs', label: 'ENG-CHS', description: 'English -> Chinese (CHS)' }
];

export default function DictionarySearchScreen() {
  const { colors, gradient } = useAppTheme();
  const { wordlists, addFlashcard, addFlashcardToWordlist } = useLibraryStore();
  const wordlistArray = useMemo(() => Object.values(wordlists), [wordlists]);

  const [query, setQuery] = useState('');
  const [source, setSource] = useState<DictionarySource>('en');
  const [sourcePickerOpen, setSourcePickerOpen] = useState(false);
  const [selectedWordlistId, setSelectedWordlistId] = useState<string | undefined>(wordlistArray[0]?.id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entry, setEntry] = useState<DictionaryApiEntry | null>(null);
  const [chsMeaning, setChsMeaning] = useState<string | null>(null);
  const [chsMeaningError, setChsMeaningError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedWordlistId && wordlists[selectedWordlistId]) return;
    setSelectedWordlistId(wordlistArray[0]?.id);
  }, [selectedWordlistId, wordlistArray, wordlists]);

  useEffect(() => {
    setError(null);
    setEntry(null);
    setChsMeaning(null);
    setChsMeaningError(null);
  }, [source]);

  const runSearch = async () => {
    const q = query.trim().toLowerCase();
    if (!q) return;

    setLoading(true);
    setError(null);
    setEntry(null);
    setChsMeaning(null);
    setChsMeaningError(null);

    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(q)}`);
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Dictionary lookup failed (${res.status})`);
      }

      const data = (await res.json()) as DictionaryApiEntry[];
      const first = data?.[0] ?? null;
      setEntry(first);

      if (source === 'eng-chs' && first) {
        const base = pickDefinition(first) ?? first.word;
        try {
          setChsMeaning(await translateToChs(base));
        } catch (e: any) {
          setChsMeaningError(typeof e?.message === 'string' ? e.message : 'Failed to translate meaning.');
        }
      }
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
      const meaning = source === 'eng-chs' && chsMeaning ? chsMeaning : definition;
      const comment = source === 'eng-chs' && chsMeaning && meaning !== definition ? `EN: ${definition}` : '';

      const card = addFlashcard({
        word: entry.word,
        meaning,
        comment,
        frequency: 0,
        dictionaryId: source === 'eng-chs' ? 'eng-chs' : 'dictionaryapi.dev',
        audioUrl: pickAudioUrl(entry)
      });

      if (selectedWordlistId) addFlashcardToWordlist(selectedWordlistId, card.id);

      Alert.alert('Added', `Saved "${entry.word}" as a flashcard.`);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to add flashcard.');
    }
  };

  const activeSource = DICTIONARY_SOURCES.find((s) => s.id === source) ?? DICTIONARY_SOURCES[0];

  return (
    <LinearGradient colors={gradient} style={{ flex: 1 }}>
      <ScreenHeader title="Search" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 18, gap: 14 }}>
        <Text style={{ color: colors.textSecondary }}>Look up a word in a free dictionary and save it as a flashcard.</Text>

        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: colors.border, gap: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <Text style={{ color: colors.text, fontWeight: '700' }}>Dictionary</Text>
            <Pressable onPress={() => setSourcePickerOpen(true)} style={{ backgroundColor: colors.surface2, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ color: colors.text, fontWeight: '700' }}>{activeSource.label}</Text>
              <Feather name="chevron-down" size={16} color={colors.textMuted} />
            </Pressable>
          </View>
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>{activeSource.description}</Text>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={runSearch}
              placeholder={source === 'eng-chs' ? 'Search (e.g., resilient) - ENG-CHS' : 'Search a word (e.g., resilient)'}
              placeholderTextColor={colors.placeholder}
              autoCapitalize="none"
              style={{
                flex: 1,
                backgroundColor: colors.surface2,
                color: colors.text,
                padding: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border
              }}
            />
            <Pressable
              onPress={runSearch}
              disabled={loading}
              style={{
                backgroundColor: loading ? colors.surface2 : colors.accent2,
                padding: 12,
                borderRadius: 12,
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: loading ? colors.border : colors.accent2
              }}
            >
              <Feather name="search" size={18} color={loading ? colors.textMuted : colors.onAccent} />
            </Pressable>
          </View>

          <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '700' }}>Save to wordlist (optional)</Text>
          {wordlistArray.length === 0 ? (
            <Link href="/wordlists" asChild>
              <Pressable
                style={{
                  backgroundColor: colors.surface2,
                  padding: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  flexDirection: 'row',
                  gap: 10,
                  alignItems: 'center'
                }}
              >
                <Feather name="layers" size={16} color={colors.accent} />
                <Text style={{ color: colors.text, fontWeight: '700' }}>Create a wordlist first</Text>
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
                    backgroundColor: selectedWordlistId === wl.id ? colors.accent : colors.surface2,
                    borderWidth: 1,
                    borderColor: colors.border
                  }}
                >
                  <Text style={{ color: selectedWordlistId === wl.id ? 'white' : colors.text, fontWeight: '700' }}>{wl.name}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <Modal transparent visible={sourcePickerOpen} animationType="fade" onRequestClose={() => setSourcePickerOpen(false)}>
          <View style={modalOverlay}>
            <Pressable style={{ flex: 1 }} onPress={() => setSourcePickerOpen(false)} />
            <View style={modalSheet(colors)}>
              <Text style={modalTitle(colors)}>Choose dictionary</Text>
              {DICTIONARY_SOURCES.map((opt) => {
                const selected = opt.id === source;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => {
                      setSource(opt.id);
                      setSourcePickerOpen(false);
                    }}
                    style={modalOption(colors, selected)}
                  >
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text style={modalOptionLabel(colors, selected)}>{opt.label}</Text>
                      <Text style={modalOptionDescription(colors)}>{opt.description}</Text>
                    </View>
                    {selected ? <Feather name="check" size={18} color={colors.accent2} /> : null}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Modal>

        {error ? (
          <View style={{ backgroundColor: colors.surface, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: colors.danger }}>
            <Text style={{ color: colors.danger, fontWeight: '800' }}>Search failed</Text>
            <Text style={{ color: colors.textSecondary, marginTop: 6 }}>{error}</Text>
          </View>
        ) : null}

        {source === 'eng-chs' && chsMeaningError ? (
          <View style={{ backgroundColor: colors.surface, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: colors.warning }}>
            <Text style={{ color: colors.warning, fontWeight: '800' }}>CHS meaning unavailable</Text>
            <Text style={{ color: colors.textSecondary, marginTop: 6 }}>{chsMeaningError}</Text>
          </View>
        ) : null}

        {entry ? (
          <View style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border, gap: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 22, fontWeight: '900' }}>{entry.word}</Text>
                <Text style={{ color: colors.textMuted }}>{entry.phonetic || entry.phonetics?.find((p) => p.text)?.text || ''}</Text>
              </View>
              <Pressable
                onPress={addAsFlashcard}
                style={{ backgroundColor: colors.accent2, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, flexDirection: 'row', gap: 8, alignItems: 'center' }}
              >
                <Feather name="plus" size={16} color={colors.onAccent} />
                <Text style={{ color: colors.onAccent, fontWeight: '900' }}>Add</Text>
              </Pressable>
            </View>

            {source === 'eng-chs' ? (
              <View style={{ backgroundColor: colors.surface2, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border, gap: 6 }}>
                <Text style={{ color: colors.accent2, fontWeight: '800', fontSize: 12 }}>Chinese (CHS)</Text>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '800' }}>{chsMeaning || (loading ? 'Translating...' : 'No CHS meaning')}</Text>
                <Text style={{ color: colors.textFaint, fontSize: 12 }}>Saved flashcard meaning uses CHS when available.</Text>
              </View>
            ) : null}

            <View style={{ gap: 10 }}>
              {source === 'eng-chs' ? <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '700' }}>English definitions</Text> : null}
              {entry.meanings?.slice(0, 3).map((m, idx) => (
                <View key={`${m.partOfSpeech}-${idx}`} style={{ gap: 6 }}>
                  <Text style={{ color: colors.accent, fontWeight: '800' }}>{m.partOfSpeech}</Text>
                  {m.definitions?.slice(0, 3).map((d, i) => (
                    <View key={`${idx}-${i}`} style={{ gap: 4 }}>
                      <Text style={{ color: colors.textSecondary }}>- {d.definition}</Text>
                      {d.example ? <Text style={{ color: colors.textMuted }}>Example: {d.example}</Text> : null}
                    </View>
                  ))}
                </View>
              ))}
            </View>

            {entry.sourceUrls?.[0] ? (
              <Text style={{ color: colors.textFaint, fontSize: 12 }}>Source: {entry.sourceUrls[0]}</Text>
            ) : null}
          </View>
        ) : (
          <View style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.textMuted }}>{loading ? 'Searching...' : 'Type a word and hit search.'}</Text>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

async function translateToChs(text: string): Promise<string> {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|zh-CN`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ENG-CHS lookup failed (${res.status})`);
  const data = (await res.json()) as MyMemoryResponse;
  const translated = data?.responseData?.translatedText;
  if (!translated) throw new Error(data?.responseDetails || 'ENG-CHS lookup failed.');
  return translated;
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

const modalOverlay: ViewStyle = {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.65)',
  justifyContent: 'flex-end',
  padding: 18
};

const modalSheet = (colors: AppColors): ViewStyle => ({
  backgroundColor: colors.surface,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: colors.border,
  padding: 14,
  gap: 10
});

const modalTitle = (colors: AppColors): TextStyle => ({
  color: colors.text,
  fontWeight: '900',
  fontSize: 16
});

const modalOption = (colors: AppColors, selected: boolean): ViewStyle => ({
  backgroundColor: selected ? colors.surface2 : colors.surface,
  borderRadius: 14,
  padding: 12,
  borderWidth: 1,
  borderColor: selected ? colors.accent2 : colors.border,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12
});

const modalOptionLabel = (colors: AppColors, selected: boolean): TextStyle => ({
  color: colors.text,
  fontWeight: selected ? '900' : '800'
});

const modalOptionDescription = (colors: AppColors): TextStyle => ({
  color: colors.textMuted,
  fontSize: 12
});

import { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, ScrollView, Text, TextInput, View, type TextStyle, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { MotiView } from 'moti';
import { useLibraryStore } from '@/store/useLibrary';
import { OrderStrategy } from '@/types';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAppTheme, type AppColors } from '@/theme/useAppTheme';

export default function WordlistsScreen() {
  const { colors, gradient } = useAppTheme();
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
    <LinearGradient colors={gradient} style={{ flex: 1 }}>
      <ScreenHeader title="Wordlists" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 18, gap: 14 }}>
        <Text style={{ color: colors.textSecondary }}>Create decks, reorder, and jump into Learn/Test.</Text>

        <View style={{ backgroundColor: colors.surface, padding: 14, borderRadius: 16, gap: 12, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.text, fontWeight: '700' }}>Create a wordlist</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Name"
            placeholderTextColor={colors.placeholder}
            style={{ backgroundColor: colors.surface2, color: colors.text, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border }}
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
            style={{ backgroundColor: colors.accent, padding: 12, borderRadius: 12, alignItems: 'center' }}
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
              style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border, gap: 12 }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>{item.name}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>{countFor(item.id)} cards - Order: {item.order}</Text>
                </View>
                <Pressable
                  onPress={() => confirmDelete(() => deleteWordlist(item.id))}
                  style={{ padding: 8 }}
                >
                  <Feather name="trash-2" size={18} color={colors.danger} />
                </Pressable>
              </View>

              <OrderRow current={item.order} onSelect={(order) => reorderWordlist(item.id, order)} colors={colors} />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Link href={`/wordlists/${item.id}`} asChild>
                  <Pressable style={pill(colors.accent2)}>
                    <Feather name="edit-3" size={16} color={colors.onAccent} />
                    <Text style={pillText(colors.onAccent)}>Manage</Text>
                  </Pressable>
                </Link>
                <Link href={{ pathname: '/wordlists/learn', params: { id: item.id } }} asChild>
                  <Pressable style={pill(colors.accent)}>
                    <Feather name="play" size={16} color="white" />
                    <Text style={pillText('white')}>Learn</Text>
                  </Pressable>
                </Link>
                <Link href={{ pathname: '/wordlists/test', params: { id: item.id } }} asChild>
                  <Pressable style={pill(colors.warning)}>
                    <Feather name="zap" size={16} color={colors.onAccent} />
                    <Text style={pillText(colors.onAccent)}>Test</Text>
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

function OrderRow({ current, onSelect, colors }: { current: OrderStrategy; onSelect: (order: OrderStrategy) => void; colors: AppColors }) {
  const options: OrderStrategy[] = ['created_at', 'alpha', 'shuffle'];
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {options.map((opt) => (
        <Pressable key={opt} onPress={() => onSelect(opt)} style={{
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 10,
          backgroundColor: current === opt ? colors.accent : colors.surface2,
          borderWidth: 1,
          borderColor: colors.border
        }}>
          <Text style={{ color: current === opt ? 'white' : colors.text, fontWeight: '700', fontSize: 12 }}>{opt}</Text>
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

const pill = (bg: string): ViewStyle => ({
  backgroundColor: bg,
  paddingVertical: 10,
  paddingHorizontal: 12,
  borderRadius: 12,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6
});

const pillText = (color: string): TextStyle => ({ color, fontWeight: '800', fontSize: 13 });

import { Pressable, ScrollView, Text, View, type TextStyle, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLibraryStore } from '@/store/useLibrary';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAppTheme } from '@/theme/useAppTheme';
import type { ThemeMode } from '@/store/useSettings';

export default function ProfileScreen() {
  const { colors, gradient, mode, scheme, setThemeMode } = useAppTheme();
  const { userId, stats } = useLibraryStore();

  return (
    <LinearGradient colors={gradient} style={{ flex: 1 }}>
      <ScreenHeader title="Profile" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 18, gap: 12 }}>
        <Text style={{ color: colors.textSecondary }}>Signed in as {userId}</Text>

        <View style={[card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[cardTitle, { color: colors.text }]}>Theme</Text>
          <Text style={{ color: colors.textMuted }}>
            Choose between dark, light, or follow your system setting.
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            <ThemeOption label="System" value="system" current={mode} onSelect={setThemeMode} colors={colors} />
            <ThemeOption label="Light" value="light" current={mode} onSelect={setThemeMode} colors={colors} />
            <ThemeOption label="Dark" value="dark" current={mode} onSelect={setThemeMode} colors={colors} />
          </View>

          <Text style={{ color: colors.textFaint, fontSize: 12 }}>Current: {scheme} ({mode})</Text>
        </View>

        <View style={[card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[cardTitle, { color: colors.text }]}>Stats</Text>
          <Text style={{ color: colors.textSecondary }}>Flashcards: {stats.flashcards}</Text>
          <Text style={{ color: colors.textSecondary }}>Wordlists: {stats.wordlists}</Text>
          <Text style={{ color: colors.textSecondary }}>Folders: {stats.folders}</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

function ThemeOption({
  label,
  value,
  current,
  onSelect,
  colors
}: {
  label: string;
  value: ThemeMode;
  current: ThemeMode;
  onSelect: (mode: ThemeMode) => void;
  colors: { surface2: string; border: string; accent2: string; text: string; onAccent: string };
}) {
  const selected = current === value;

  return (
    <Pressable
      onPress={() => onSelect(value)}
      style={{
        backgroundColor: selected ? colors.accent2 : colors.surface2,
        borderColor: selected ? colors.accent2 : colors.border,
        borderWidth: 1,
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 12
      }}
    >
      <Text style={{ color: selected ? colors.onAccent : colors.text, fontWeight: '800' }}>{label}</Text>
    </Pressable>
  );
}

const card: ViewStyle = {
  padding: 16,
  borderRadius: 16,
  borderWidth: 1,
  gap: 10
};

const cardTitle: TextStyle = {
  fontWeight: '800'
};

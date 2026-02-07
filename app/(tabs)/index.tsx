import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { MotiView } from 'moti';
import { ScrollView, Text, View, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLibraryStore } from '@/store/useLibrary';

export default function HomeScreen() {
  const { stats } = useLibraryStore();

  return (
    <LinearGradient colors={["#0f172a", "#111827", "#0b1224"]} style={{ flex: 1 }}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 48, gap: 18 }}>
        <Text style={{ color: 'white', fontSize: 26, fontWeight: '800' }}>English Learning Lab</Text>
        <Text style={{ color: '#cbd5e1', fontSize: 15 }}>
          Flashcards, focused drills, and AI-generated practice tailored to your decks.
        </Text>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <StatPill label="Flashcards" value={stats.flashcards} icon="type" />
          <StatPill label="Wordlists" value={stats.wordlists} icon="layers" />
          <StatPill label="Folders" value={stats.folders} icon="folder" />
        </View>

        <Section title="Quick start">
          <ActionLink href="/wordlists/index" title="Create a wordlist" subtitle="Add cards and start a Learn/Test session" icon="plus-square" />
          <ActionLink href="/ai-lab/index" title="Generate examples" subtitle="Pick a list to review by example" icon="zap" />
          <ActionLink href="/ai-lab/index" title="Quiz me" subtitle="AI-powered MCQ and fill-in-the-blank" icon="edit-3" />
        </Section>
      </ScrollView>
    </LinearGradient>
  );
}

function StatPill({ label, value, icon }: { label: string; value: number; icon: keyof typeof Feather.glyphMap }) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 8 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: 100, type: 'timing', duration: 300 }}
      style={{
        flex: 1,
        backgroundColor: '#1f2937',
        borderRadius: 14,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
      }}
    >
      <Feather name={icon} size={18} color="#a855f7" />
      <View>
        <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>{value}</Text>
        <Text style={{ color: '#94a3b8', fontSize: 12 }}>{label}</Text>
      </View>
    </MotiView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 10 }}>
      <Text style={{ color: '#e2e8f0', fontWeight: '700', fontSize: 18 }}>{title}</Text>
      <View style={{ gap: 12 }}>{children}</View>
    </View>
  );
}

function ActionLink({ href, title, subtitle, icon }: { href: string; title: string; subtitle: string; icon: keyof typeof Feather.glyphMap }) {
  return (
    <Link href={href} asChild>
      <Pressable style={{
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: '#273449'
      }}>
        <Feather name={icon} size={20} color="#a855f7" />
        <View style={{ flex: 1 }}>
          <Text style={{ color: 'white', fontWeight: '700', fontSize: 15 }}>{title}</Text>
          <Text style={{ color: '#94a3b8', fontSize: 12 }}>{subtitle}</Text>
        </View>
        <Feather name="chevron-right" size={18} color="#94a3b8" />
      </Pressable>
    </Link>
  );
}

import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function AiLabIndex() {
  return (
    <LinearGradient colors={["#0f172a", "#111827", "#0b1224"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 48, gap: 16 }}>
        <Text style={{ color: 'white', fontSize: 24, fontWeight: '800' }}>AI Lab</Text>
        <Text style={{ color: '#cbd5e1' }}>
          Generate examples and quizzes from your wordlists. This screen is a placeholder for now.
        </Text>

        <View style={{ backgroundColor: '#111827', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#1f2937', flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <Feather name="zap" size={20} color="#a855f7" />
          <Text style={{ color: '#e2e8f0', fontWeight: '700' }}>Coming soon</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

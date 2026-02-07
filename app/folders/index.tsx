import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, Text, View, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLibraryStore } from '@/store/useLibrary';

export default function FoldersIndex() {
  const { folders, addFolder } = useLibraryStore();
  const items = Object.values(folders);

  const createFolder = () => {
    const count = items.length + 1;
    addFolder({ name: `Folder ${count}`, comment: 'New folder' });
  };

  return (
    <LinearGradient colors={["#0f172a", "#111827", "#0b1224"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 48, gap: 16 }}>
        <Text style={{ color: 'white', fontSize: 24, fontWeight: '800' }}>Folders</Text>
        <Text style={{ color: '#cbd5e1' }}>Group wordlists into folders.</Text>

        <Pressable onPress={createFolder} style={{ backgroundColor: '#a855f7', padding: 14, borderRadius: 14, alignItems: 'center' }}>
          <Text style={{ color: 'white', fontWeight: '800' }}>Create folder</Text>
        </Pressable>

        <View style={{ gap: 12 }}>
          {items.length === 0 ? (
            <Text style={{ color: '#94a3b8' }}>No folders yet.</Text>
          ) : (
            items.map((folder) => (
              <View key={folder.id} style={{ backgroundColor: '#111827', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1f2937', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Feather name="folder" size={18} color="#a855f7" />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: 'white', fontWeight: '700' }}>{folder.name}</Text>
                  <Text style={{ color: '#94a3b8', fontSize: 12 }}>{folder.comment || 'No description'}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

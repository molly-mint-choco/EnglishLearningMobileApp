import { useState, useMemo } from 'react';
import { Alert, FlatList, Pressable, ScrollView, Text, TextInput, View, type TextStyle, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useLibraryStore } from '@/store/useLibrary';
import { ScreenHeader } from '@/components/ScreenHeader';

export default function FoldersScreen() {
  const { folders, addFolder, deleteFolder, wordlists, folderWordlists, addWordlistToFolder, removeWordlistFromFolder } = useLibraryStore();
  const [name, setName] = useState('New Folder');
  const folderArray = useMemo(() => Object.values(folders), [folders]);
  const wordlistArray = useMemo(() => Object.values(wordlists), [wordlists]);

  return (
    <LinearGradient colors={["#0f172a", "#0b1224"]} style={{ flex: 1 }}>
      <ScreenHeader title="Folders" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 18, gap: 14 }}>
        <Text style={{ color: '#cbd5e1' }}>Group wordlists for courses or themes.</Text>

        <View style={{ backgroundColor: '#111827', padding: 14, borderRadius: 16, gap: 10, borderWidth: 1, borderColor: '#1f2937' }}>
          <Text style={{ color: '#e2e8f0', fontWeight: '700' }}>Create folder</Text>
          <TextInput value={name} onChangeText={setName} placeholder="Name" placeholderTextColor="#475569" style={inputStyle} />
          <Pressable
            onPress={() => {
              try {
                addFolder({ name: name.trim() || 'Untitled', comment: '' });
                setName('New Folder');
              } catch (e: any) {
                Alert.alert('Limit', e.message);
              }
            }}
            style={{ backgroundColor: '#a855f7', padding: 12, borderRadius: 12, alignItems: 'center' }}
          >
            <Text style={{ color: 'white', fontWeight: '800' }}>Add</Text>
          </Pressable>
        </View>

        <FlatList
          data={folderArray}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => {
            const wlIds = folderWordlists.filter((fw) => fw.folderId === item.id).map((fw) => fw.wordlistId);
            return (
              <View style={{ backgroundColor: '#111827', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#1f2937', gap: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>{item.name}</Text>
                    <Text style={{ color: '#94a3b8', fontSize: 12 }}>{wlIds.length} wordlists</Text>
                  </View>
                  <Pressable onPress={() => confirmDelete(() => deleteFolder(item.id))} style={{ padding: 6 }}>
                    <Feather name="trash-2" size={18} color="#f87171" />
                  </Pressable>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {wlIds.map((id) => {
                    const wl = wordlists[id];
                    if (!wl) return null;
                    return (
                      <Pressable key={id} onPress={() => removeWordlistFromFolder(item.id, id)} style={chip('#22d3ee')}>
                        <Text style={chipText('#0f172a')}>{wl.name}</Text>
                        <Feather name="x" size={14} color="#0f172a" />
                      </Pressable>
                    );
                  })}
                  <Text style={{ color: '#475569', alignSelf: 'center' }}>{wlIds.length === 0 ? 'No wordlists yet' : ''}</Text>
                </ScrollView>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {wordlistArray.map((wl) => (
                    <Pressable key={wl.id} onPress={() => addWordlistToFolder(item.id, wl.id)} style={chip('#1f2937')}>
                      <Text style={chipText('white')}>{wl.name}</Text>
                      <Feather name="plus" size={14} color="white" />
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            );
          }}
        />
      </ScrollView>
    </LinearGradient>
  );
}

function confirmDelete(onConfirm: () => void) {
  Alert.alert('Delete folder', 'This removes only the folder, not the wordlists inside.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: onConfirm }
  ]);
}

const inputStyle: TextStyle = {
  backgroundColor: '#0f172a',
  color: 'white',
  padding: 12,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#1f2937'
};

const chip = (bg: string): ViewStyle => ({
  backgroundColor: bg,
  paddingVertical: 8,
  paddingHorizontal: 10,
  borderRadius: 12,
  flexDirection: 'row',
  gap: 6,
  alignItems: 'center'
});

const chipText = (color: string): TextStyle => ({ color, fontWeight: '700' });

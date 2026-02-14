import { useState, useMemo } from 'react';
import { Alert, FlatList, Pressable, ScrollView, Text, TextInput, View, type TextStyle, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useLibraryStore } from '@/store/useLibrary';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAppTheme } from '@/theme/useAppTheme';

export default function FoldersScreen() {
  const { colors, gradient } = useAppTheme();
  const { folders, addFolder, deleteFolder, wordlists, folderWordlists, addWordlistToFolder, removeWordlistFromFolder } = useLibraryStore();
  const [name, setName] = useState('New Folder');
  const folderArray = useMemo(() => Object.values(folders), [folders]);
  const wordlistArray = useMemo(() => Object.values(wordlists), [wordlists]);

  return (
    <LinearGradient colors={gradient} style={{ flex: 1 }}>
      <ScreenHeader title="Folders" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 18, gap: 14 }}>
        <Text style={{ color: colors.textSecondary }}>Group wordlists for courses or themes.</Text>

        <View style={{ backgroundColor: colors.surface, padding: 14, borderRadius: 16, gap: 10, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.text, fontWeight: '700' }}>Create folder</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Name"
            placeholderTextColor={colors.placeholder}
            style={inputStyle(colors)}
          />
          <Pressable
            onPress={() => {
              try {
                addFolder({ name: name.trim() || 'Untitled', comment: '' });
                setName('New Folder');
              } catch (e: any) {
                Alert.alert('Limit', e.message);
              }
            }}
            style={{ backgroundColor: colors.accent, padding: 12, borderRadius: 12, alignItems: 'center' }}
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
              <View style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border, gap: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>{item.name}</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 12 }}>{wlIds.length} wordlists</Text>
                  </View>
                  <Pressable onPress={() => confirmDelete(() => deleteFolder(item.id))} style={{ padding: 6 }}>
                    <Feather name="trash-2" size={18} color={colors.danger} />
                  </Pressable>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {wlIds.map((id) => {
                    const wl = wordlists[id];
                    if (!wl) return null;
                    return (
                      <Pressable key={id} onPress={() => removeWordlistFromFolder(item.id, id)} style={chip(colors.accent2, colors.border)}>
                        <Text style={chipText(colors.onAccent)}>{wl.name}</Text>
                        <Feather name="x" size={14} color={colors.onAccent} />
                      </Pressable>
                    );
                  })}
                  <Text style={{ color: colors.textFaint, alignSelf: 'center' }}>{wlIds.length === 0 ? 'No wordlists yet' : ''}</Text>
                </ScrollView>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {wordlistArray.map((wl) => (
                    <Pressable key={wl.id} onPress={() => addWordlistToFolder(item.id, wl.id)} style={chip(colors.surface2, colors.border)}>
                      <Text style={chipText(colors.text)}>{wl.name}</Text>
                      <Feather name="plus" size={14} color={colors.text} />
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

const inputStyle = (colors: { surface2: string; text: string; border: string }): TextStyle => ({
  backgroundColor: colors.surface2,
  color: colors.text,
  padding: 12,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.border
});

const chip = (bg: string, borderColor: string): ViewStyle => ({
  backgroundColor: bg,
  paddingVertical: 8,
  paddingHorizontal: 10,
  borderRadius: 12,
  borderWidth: 1,
  borderColor,
  flexDirection: 'row',
  gap: 6,
  alignItems: 'center'
});

const chipText = (color: string): TextStyle => ({ color, fontWeight: '700' });

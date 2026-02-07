import { create } from 'zustand';
import { nanoid } from 'nanoid/non-secure';
import { Flashcard, Folder, FolderWordlist, OrderStrategy, Wordlist, WordlistFlashcard } from '@/types';

const MAX_FLASHCARDS_PER_WORDLIST = 5000;
const MAX_WORDLISTS_PER_USER = 1000;
const MAX_FOLDERS_PER_USER = 500;
const MAX_WORDLISTS_PER_FOLDER = 500;

interface LibraryState {
  userId: string;
  flashcards: Record<string, Flashcard>;
  wordlists: Record<string, Wordlist>;
  wordlistFlashcards: WordlistFlashcard[];
  folders: Record<string, Folder>;
  folderWordlists: FolderWordlist[];
  addFlashcard: (payload: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Flashcard;
  updateFlashcardComment: (id: string, comment: string) => void;
  deleteFlashcard: (id: string) => void;
  addWordlist: (payload: Pick<Wordlist, 'name' | 'comment' | 'order'>) => Wordlist;
  deleteWordlist: (id: string) => void;
  addFlashcardToWordlist: (wordlistId: string, flashcardId: string) => void;
  removeFlashcardFromWordlist: (wordlistId: string, flashcardId: string) => void;
  addFolder: (payload: Pick<Folder, 'name' | 'comment'>) => Folder;
  deleteFolder: (id: string) => void;
  addWordlistToFolder: (folderId: string, wordlistId: string) => void;
  removeWordlistFromFolder: (folderId: string, wordlistId: string) => void;
  reorderWordlist: (wordlistId: string, order: OrderStrategy) => void;
  bumpFrequency: (flashcardId: string) => void;
  stats: { flashcards: number; wordlists: number; folders: number };
}

const now = () => new Date().toISOString();

export const useLibraryStore = create<LibraryState>((set, get) => ({
  userId: 'demo-user',
  flashcards: seedFlashcards(),
  wordlists: seedWordlists(),
  wordlistFlashcards: seedWordlistFlashcards(),
  folders: seedFolders(),
  folderWordlists: [],
  stats: { flashcards: 3, wordlists: 1, folders: 0 },

  addFlashcard: (payload) => {
    const id = nanoid();
    const card: Flashcard = {
      id,
      createdAt: now(),
      updatedAt: now(),
      createdBy: get().userId,
      frequency: payload.frequency ?? 0,
      ...payload
    };
    set((state) => ({ flashcards: { ...state.flashcards, [id]: card }, stats: { ...state.stats, flashcards: Object.keys(state.flashcards).length + 1 } }));
    return card;
  },

  updateFlashcardComment: (id, comment) => {
    if (comment.length > 500) throw new Error('Comment max length is 500 characters');
    set((state) => {
      const card = state.flashcards[id];
      if (!card) return state;
      return {
        ...state,
        flashcards: {
          ...state.flashcards,
          [id]: { ...card, comment, updatedAt: now() }
        }
      };
    });
  },

  deleteFlashcard: (id) => {
    set((state) => {
      const updatedCards = { ...state.flashcards };
      delete updatedCards[id];
      return {
        ...state,
        flashcards: updatedCards,
        wordlistFlashcards: state.wordlistFlashcards.filter((wfc) => wfc.flashcardId !== id),
        stats: { ...state.stats, flashcards: Object.keys(updatedCards).length }
      };
    });
  },

  addWordlist: ({ name, comment, order }) => {
    const currentCount = Object.keys(get().wordlists).length;
    if (currentCount >= MAX_WORDLISTS_PER_USER) throw new Error('Wordlist cap reached (1000).');
    const id = nanoid();
    const wl: Wordlist = {
      id,
      name,
      comment,
      order,
      createdAt: now(),
      updatedAt: now(),
      createdBy: get().userId
    };
    set((state) => ({ wordlists: { ...state.wordlists, [id]: wl }, stats: { ...state.stats, wordlists: currentCount + 1 } }));
    return wl;
  },

  deleteWordlist: (id) => {
    set((state) => {
      const updated = { ...state.wordlists };
      delete updated[id];
      return {
        ...state,
        wordlists: updated,
        wordlistFlashcards: state.wordlistFlashcards.filter((wfc) => wfc.wordlistId !== id),
        folderWordlists: state.folderWordlists.filter((fw) => fw.wordlistId !== id),
        stats: { ...state.stats, wordlists: Object.keys(updated).length }
      };
    });
  },

  addFlashcardToWordlist: (wordlistId, flashcardId) => {
    const state = get();
    const count = state.wordlistFlashcards.filter((wfc) => wfc.wordlistId === wordlistId).length;
    if (count >= MAX_FLASHCARDS_PER_WORDLIST) throw new Error('This wordlist already has 5000 flashcards.');
    const exists = state.wordlistFlashcards.some((wfc) => wfc.wordlistId === wordlistId && wfc.flashcardId === flashcardId);
    if (exists) return;
    const record: WordlistFlashcard = { id: nanoid(), wordlistId, flashcardId, createdAt: now() };
    set({ wordlistFlashcards: [...state.wordlistFlashcards, record] });
  },

  removeFlashcardFromWordlist: (wordlistId, flashcardId) => {
    set((state) => ({
      wordlistFlashcards: state.wordlistFlashcards.filter((wfc) => !(wfc.wordlistId === wordlistId && wfc.flashcardId === flashcardId))
    }));
  },

  addFolder: ({ name, comment }) => {
    const currentCount = Object.keys(get().folders).length;
    if (currentCount >= MAX_FOLDERS_PER_USER) throw new Error('Folder cap reached (500).');
    const id = nanoid();
    const folder: Folder = {
      id,
      name,
      comment,
      createdAt: now(),
      updatedAt: now(),
      createdBy: get().userId
    };
    set((state) => ({ folders: { ...state.folders, [id]: folder }, stats: { ...state.stats, folders: currentCount + 1 } }));
    return folder;
  },

  deleteFolder: (id) => {
    set((state) => {
      const updated = { ...state.folders };
      delete updated[id];
      return {
        ...state,
        folders: updated,
        folderWordlists: state.folderWordlists.filter((fw) => fw.folderId !== id),
        stats: { ...state.stats, folders: Object.keys(updated).length }
      };
    });
  },

  addWordlistToFolder: (folderId, wordlistId) => {
    const state = get();
    const count = state.folderWordlists.filter((fw) => fw.folderId === folderId).length;
    if (count >= MAX_WORDLISTS_PER_FOLDER) throw new Error('This folder already has 500 wordlists.');
    const exists = state.folderWordlists.some((fw) => fw.folderId === folderId && fw.wordlistId === wordlistId);
    if (exists) return;
    const record: FolderWordlist = { id: nanoid(), folderId, wordlistId, createdAt: now() };
    set({ folderWordlists: [...state.folderWordlists, record] });
  },

  removeWordlistFromFolder: (folderId, wordlistId) => {
    set((state) => ({
      folderWordlists: state.folderWordlists.filter((fw) => !(fw.folderId === folderId && fw.wordlistId === wordlistId))
    }));
  },

  reorderWordlist: (wordlistId, order) => {
    set((state) => {
      const wl = state.wordlists[wordlistId];
      if (!wl) return state;
      return {
        ...state,
        wordlists: {
          ...state.wordlists,
          [wordlistId]: { ...wl, order, shuffleSeed: order === 'shuffle' ? Math.random() : wl.shuffleSeed }
        }
      };
    });
  },

  bumpFrequency: (flashcardId) => {
    set((state) => {
      const card = state.flashcards[flashcardId];
      if (!card) return state;
      return {
        ...state,
        flashcards: {
          ...state.flashcards,
          [flashcardId]: { ...card, frequency: card.frequency + 1, updatedAt: now() }
        }
      };
    });
  }
}));

function seedFlashcards(): Record<string, Flashcard> {
  const base: Flashcard[] = [
    {
      id: 'card-focus',
      word: 'focus',
      dictionaryId: 'wordnet',
      meaning: 'The center of interest or activity.',
      audioUrl: '',
      comment: 'Use this often in UI copy.',
      frequency: 3,
      createdAt: now(),
      updatedAt: now(),
      createdBy: 'demo-user'
    },
    {
      id: 'card-eloquent',
      word: 'eloquent',
      dictionaryId: 'wordnet',
      meaning: 'Fluent or persuasive in speaking or writing.',
      audioUrl: '',
      comment: '',
      frequency: 1,
      createdAt: now(),
      updatedAt: now(),
      createdBy: 'demo-user'
    },
    {
      id: 'card-resilient',
      word: 'resilient',
      dictionaryId: 'wordnet',
      meaning: 'Able to withstand or recover quickly from difficult conditions.',
      audioUrl: '',
      comment: 'Appears in tech culture pieces.',
      frequency: 2,
      createdAt: now(),
      updatedAt: now(),
      createdBy: 'demo-user'
    }
  ];

  return base.reduce((acc, card) => ({ ...acc, [card.id]: card }), {} as Record<string, Flashcard>);
}

function seedWordlists(): Record<string, Wordlist> {
  const wl: Wordlist = {
    id: 'wl-starter',
    name: 'Starter Deck',
    comment: 'Ten-minute warmup words',
    order: 'created_at',
    createdAt: now(),
    updatedAt: now(),
    createdBy: 'demo-user'
  };
  return { [wl.id]: wl };
}

function seedWordlistFlashcards(): WordlistFlashcard[] {
  return [
    { id: nanoid(), wordlistId: 'wl-starter', flashcardId: 'card-focus', createdAt: now() },
    { id: nanoid(), wordlistId: 'wl-starter', flashcardId: 'card-eloquent', createdAt: now() },
    { id: nanoid(), wordlistId: 'wl-starter', flashcardId: 'card-resilient', createdAt: now() }
  ];
}

function seedFolders(): Record<string, Folder> {
  return {};
}

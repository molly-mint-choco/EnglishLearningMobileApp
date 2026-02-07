export type OrderStrategy = 'created_at' | 'alpha' | 'shuffle';

export interface Flashcard {
  id: string;
  word: string;
  dictionaryId?: string;
  meaning: string;
  audioUrl?: string;
  comment?: string;
  frequency: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface Wordlist {
  id: string;
  name: string;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
  order: OrderStrategy;
  shuffleSeed?: number;
}

export interface WordlistFlashcard {
  id: string;
  wordlistId: string;
  flashcardId: string;
  createdAt: string;
}

export interface Folder {
  id: string;
  name: string;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
}

export interface FolderWordlist {
  id: string;
  folderId: string;
  wordlistId: string;
  createdAt: string;
}

export type LearnMode = 'learn' | 'test';

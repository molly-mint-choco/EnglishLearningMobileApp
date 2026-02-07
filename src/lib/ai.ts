import { Flashcard } from '@/types';

export interface ExampleSentence {
  word: string;
  sentences: string[];
}

export interface QuizQuestion {
  id: string;
  type: 'mcq' | 'fill';
  prompt: string;
  choices?: string[];
  answer: string;
}

export async function generateExamples(wordlistName: string, cards: Flashcard[]): Promise<ExampleSentence[]> {
  // Placeholder stub: replace with Supabase Edge + LLM call
  return cards.slice(0, 5).map((card) => ({
    word: card.word,
    sentences: [
      `In ${wordlistName}, we often stress the word "${card.word}" when presenting.`,
      `She stayed ${card.word} despite the noisy room.`,
      `${card.word} practice keeps your skills sharp.`
    ]
  }));
}

export async function generateQuiz(wordlistName: string, cards: Flashcard[]): Promise<QuizQuestion[]> {
  return cards.slice(0, 5).map((card, idx) => ({
    id: `${card.id}-${idx}`,
    type: idx % 2 === 0 ? 'mcq' : 'fill',
    prompt: idx % 2 === 0
      ? `Choose the closest meaning of "${card.word}"`
      : `Fill in the blank: She remained ____ under pressure ("${card.word}").`,
    choices: idx % 2 === 0 ? shuffle([card.meaning, 'A random distractor', 'Another distractor', 'Yet another']) : undefined,
    answer: card.meaning
  }));
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

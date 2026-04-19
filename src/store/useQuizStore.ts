import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { QuizSet, Question } from '../types';

interface QuizStore {
  quizSets: QuizSet[];
  addQuizSet: (quiz: QuizSet) => void;
  removeQuizSet: (id: string) => void;
  appendQuestions: (quizId: string, newQuestions: Question[]) => { added: number; duplicates: number };
}

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      quizSets: [],
      addQuizSet: (quiz) => set((state) => ({ quizSets: [quiz, ...state.quizSets] })),
      removeQuizSet: (id) => set((state) => ({ quizSets: state.quizSets.filter(q => q.id !== id) })),
      appendQuestions: (quizId, newQuestions) => {
        let added = 0;
        let duplicates = 0;

        set((state) => {
          const quizSets = state.quizSets.map(quiz => {
            if (quiz.id === quizId) {
              const existingIds = new Set(quiz.questions.map(q => q.id));
              const existingTexts = new Set(quiz.questions.map(q => q.text.trim().toLowerCase()));
              
              const uniqueNewQuestions = newQuestions.filter(q => {
                const isDup = existingIds.has(q.id) || existingTexts.has(q.text.trim().toLowerCase());
                if (isDup) duplicates++;
                else added++;
                return !isDup;
              });
              
              return {
                ...quiz,
                questions: [...quiz.questions, ...uniqueNewQuestions]
              };
            }
            return quiz;
          });
          return { quizSets };
        });

        return { added, duplicates };
      }
    }),
    {
      name: 'quiz-storage',
    }
  )
);

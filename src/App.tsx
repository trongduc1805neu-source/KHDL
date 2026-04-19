import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { ViewState } from './types';
import { Dashboard } from './components/Dashboard';
import { ImportQuiz } from './components/ImportQuiz';
import { StudyQuiz } from './components/StudyQuiz';
import { SrsSetup } from './components/SrsSetup';
import { SrsStudy } from './components/SrsStudy';

export default function App() {
  const [viewState, setViewState] = useState<ViewState>({ type: 'dashboard' });

  const renderView = () => {
    switch (viewState.type) {
      case 'dashboard':
        return <Dashboard setViewState={setViewState} />;
      case 'import':
        return <ImportQuiz setViewState={setViewState} targetQuizId={viewState.targetQuizId} />;
      case 'study':
        return <StudyQuiz quizId={viewState.quizId} setViewState={setViewState} />;
      case 'srs-setup':
        return <SrsSetup setViewState={setViewState} />;
      case 'srs-study':
        return <SrsStudy quizIds={viewState.quizIds} setViewState={setViewState} />;
      default:
        return <Dashboard setViewState={setViewState} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] font-sans text-[#2d3436]">
      <header className="bg-[#1e272e] text-[#ffffff] sticky top-0 z-10 w-full mb-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-[944px] mx-auto px-6 h-20 flex items-center">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setViewState({ type: 'dashboard' })}
          >
            <div className="bg-white/10 p-2 rounded-lg text-white group-hover:bg-white/20 transition-colors">
              <BookOpen size={20} />
            </div>
            <span className="font-[600] text-[16px] tracking-[1.5px] uppercase opacity-90">
              QuizFlow
            </span>
          </div>
        </div>
      </header>

      <main className="pb-20">
        {renderView()}
      </main>
    </div>
  );
}

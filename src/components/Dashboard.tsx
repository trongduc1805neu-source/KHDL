import { BookOpen, Trash2, PlusCircle } from 'lucide-react';
import { useQuizStore } from '../store/useQuizStore';
import { ViewState } from '../types';

interface DashboardProps {
  setViewState: (view: ViewState) => void;
}

export function Dashboard({ setViewState }: DashboardProps) {
  const { quizSets, removeQuizSet } = useQuizStore();

  return (
    <div className="max-w-[944px] mx-auto px-6">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#edf2f7]">
        <div>
          <h2 className="text-[24px] font-[600] text-[#2d3436] m-0">Library Overview</h2>
          <span className="text-[14px] text-[#636e72]">Manage your assessment and question banks</span>
        </div>
        <button
          onClick={() => setViewState({ type: 'import' })}
          className="flex items-center gap-2 bg-[#1e272e] hover:bg-[#1e272e]/90 text-white px-5 py-2.5 rounded-[8px] font-[600] text-[13px] transition-colors shadow-sm"
        >
          <PlusCircle size={16} />
          <span>New Assessment</span>
        </button>
      </div>

      {quizSets.length === 0 ? (
        <div className="bg-white rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.05)] p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-[#f1f2f6] text-[#a4b0be] rounded-full flex items-center justify-center mb-6">
            <BookOpen size={32} />
          </div>
          <h3 className="text-[18px] font-[600] text-[#2d3436] mb-2">No assessments found</h3>
          <p className="text-[14px] text-[#636e72] max-w-sm mb-6">
            Import a JSON payload to generate a new quiz and start studying.
          </p>
          <button
            onClick={() => setViewState({ type: 'import' })}
            className="inline-block px-4 py-2 border border-[#edf2f7] text-[#1e272e] rounded-[6px] font-[600] text-[12px] uppercase tracking-[1px] hover:bg-[#f4f7f6] transition-colors"
          >
            Start Extraction
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizSets.map((quiz) => (
            <div key={quiz.id} className="bg-white rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.05)] p-8 flex flex-col group relative border border-transparent hover:border-[#edf2f7] transition-all">
              <button 
                onClick={() => removeQuizSet(quiz.id)}
                className="absolute top-6 right-6 text-[#a4b0be] hover:text-[#ff7675] hover:bg-[#ff7675]/10 p-2 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                title="Delete Assessment"
              >
                <Trash2 size={16} />
              </button>
              
              <div className="mb-6">
                <span className="text-[12px] uppercase tracking-[1px] text-[#a4b0be] font-[600]">Assessment</span>
                <h3 className="text-[18px] font-[600] text-[#2d3436] mt-1 line-clamp-2" title={quiz.title}>
                  {quiz.title}
                </h3>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <span className="block text-[24px] font-[600] text-[#2d3436]">{quiz.questions.length}</span>
                  <span className="text-[12px] opacity-50 uppercase tracking-[1px] text-[#636e72]">Questions</span>
                </div>
                <div>
                  <span className="block text-[14px] font-[500] text-[#2d3436]">{new Date(quiz.createdAt).toLocaleDateString()}</span>
                  <span className="text-[12px] opacity-50 uppercase tracking-[1px] text-[#636e72]">Import Date</span>
                </div>
              </div>
              
              <div className="mt-auto pt-6 border-t border-[#f1f2f6] flex gap-3">
                <button
                  onClick={() => setViewState({ type: 'study', quizId: quiz.id })}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#f4f7f6] hover:bg-[#1e272e] text-[#2d3436] hover:text-white py-3 rounded-[8px] font-[600] text-[13px] transition-colors"
                >
                  <BookOpen size={16} />
                  <span>Begin Study</span>
                </button>
                <button
                  onClick={() => setViewState({ type: 'import', targetQuizId: quiz.id })}
                  className="flex items-center justify-center gap-2 bg-white border border-[#edf2f7] hover:border-[#a4b0be] text-[#2d3436] px-4 py-3 rounded-[8px] font-[600] text-[13px] transition-colors"
                  title="Append questions"
                >
                  <PlusCircle size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

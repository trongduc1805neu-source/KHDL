import { useState } from 'react';
import { ArrowLeft, CheckSquare, Square } from 'lucide-react';
import { useQuizStore } from '../store/useQuizStore';
import { ViewState } from '../types';
import { cn } from '../lib/utils';

interface SrsSetupProps {
  setViewState: (view: ViewState) => void;
}

export function SrsSetup({ setViewState }: SrsSetupProps) {
  const { quizSets } = useQuizStore();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(quizSets.map(q => q.id)));

  const toggleQuiz = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const getDueCount = (quizId: string) => {
    const qz = quizSets.find(q => q.id === quizId);
    if (!qz) return 0;
    const now = Date.now();
    return qz.questions.filter(q => !q.srs || q.srs.nextReviewDate <= now).length;
  };

  const totalDue = Array.from(selectedIds).reduce((acc, id) => acc + getDueCount(id), 0);

  return (
    <div className="max-w-[700px] mx-auto px-6 py-10">
      <button 
        onClick={() => setViewState({ type: 'dashboard' })}
        className="flex items-center text-[12px] uppercase tracking-[1px] font-[600] text-[#a4b0be] hover:text-[#2d3436] mb-8 transition-colors"
      >
        <ArrowLeft size={14} className="mr-2" /> Quay lại
      </button>
      
      <h2 className="text-[24px] font-[600] text-[#2d3436] mb-2">Trộn đề & Ôn tập (Anki Mode)</h2>
      <p className="text-[14px] text-[#636e72] mb-8">
        Phương pháp lặp lại ngắt quãng (Spaced Repetition) giúp tối ưu hóa trí nhớ. Vui lòng chọn các chương (bộ đề) bạn muốn trộn để ôn tập.
      </p>

      <div className="bg-white rounded-[16px] shadow-sm border border-[#edf2f7] overflow-hidden mb-8">
        <div className="p-4 bg-[#f4f7f6] border-b border-[#edf2f7] flex justify-between items-center">
          <span className="font-[600] text-[14px] text-[#2d3436]">Danh sách bộ đề (Chương)</span>
          <button 
            onClick={() => setSelectedIds(new Set(quizSets.map(q => q.id)))}
            className="text-[12px] font-[600] text-[#00b894] hover:underline uppercase tracking-[1px]"
          >
            Chọn tất cả
          </button>
        </div>
        <div className="divide-y divide-[#edf2f7]">
          {quizSets.length === 0 && (
            <div className="p-8 text-center text-[#a4b0be] text-[14px]">
              Chưa có bộ đề nào. Trở lại Thư viện để thêm mới.
            </div>
          )}
          {quizSets.map(quiz => {
            const due = getDueCount(quiz.id);
            const isSelected = selectedIds.has(quiz.id);
            return (
              <div 
                key={quiz.id} 
                onClick={() => toggleQuiz(quiz.id)}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#fafafa] transition-colors"
              >
                <div className="flex items-center gap-4">
                  {isSelected ? <CheckSquare size={20} className="text-[#00b894]" /> : <Square size={20} className="text-[#a4b0be]" />}
                  <div>
                    <h3 className="text-[15px] font-[600] text-[#2d3436] line-clamp-1">{quiz.title}</h3>
                    <span className="text-[12px] text-[#636e72]">Tổng: {quiz.questions.length} câu</span>
                  </div>
                </div>
                {due > 0 ? (
                  <span className="px-3 py-1 bg-[#e3fcef] text-[#00b894] text-[12px] font-[700] rounded-full">
                    {due} câu đến hạn
                  </span>
                ) : (
                  <span className="text-[12px] text-[#a4b0be] font-[500]">Hết câu hỏi</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between bg-[#1e272e] text-white p-6 rounded-[16px]">
        <div>
          <span className="block text-[12px] opacity-70 uppercase tracking-[1px] mb-1">Tổng câu cần ôn</span>
          <span className="text-[32px] font-[700]">{totalDue}</span>
        </div>
        <button
          onClick={() => totalDue > 0 && setViewState({ type: 'srs-study', quizIds: Array.from(selectedIds) })}
          disabled={totalDue === 0}
          className={cn(
            "px-8 py-3.5 rounded-[8px] font-[600] text-[13px] uppercase tracking-[1px] transition-all border border-transparent",
            totalDue > 0 
              ? "bg-[#00b894] hover:bg-[#00a884] text-white" 
              : "bg-white/10 text-white/30 cursor-not-allowed"
          )}
        >
          Bắt đầu học
        </button>
      </div>
    </div>
  );
}

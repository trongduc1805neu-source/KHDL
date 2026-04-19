import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useQuizStore } from '../store/useQuizStore';
import { ViewState, Question, SRSData } from '../types';
import { cn } from '../lib/utils';

interface SrsStudyProps {
  quizIds: string[];
  setViewState: (view: ViewState) => void;
}

type ActiveCard = Question & { quizId: string };

function calculateNextSRS(quality: number, oldSrs?: SRSData): SRSData {
  const srs = oldSrs || { repetition: 0, interval: 0, easeFactor: 2.5, nextReviewDate: Date.now() };
  let newRepetition = srs.repetition;
  let newInterval = srs.interval;
  let newEaseFactor = srs.easeFactor;

  if (quality === 1) { // Lại
    newRepetition = 0;
    newInterval = 0; // minutes
    newEaseFactor = Math.max(1.3, newEaseFactor - 0.2);
  } else if (quality === 2) { // Khó
    newInterval = srs.interval === 0 ? 1 : srs.interval * 1.2;
    newEaseFactor = Math.max(1.3, newEaseFactor - 0.15);
  } else if (quality === 3) { // Tốt
    if (srs.repetition === 0) newInterval = 1;
    else if (srs.repetition === 1) newInterval = 6;
    else newInterval = srs.interval * newEaseFactor;
    newRepetition++;
  } else if (quality === 4) { // Dễ
    if (srs.repetition === 0) newInterval = 4;
    else if (srs.repetition === 1) newInterval = 10;
    else newInterval = srs.interval * newEaseFactor * 1.3;
    newRepetition++;
    newEaseFactor += 0.15;
  }

  return {
    repetition: newRepetition,
    interval: newInterval, // days
    easeFactor: newEaseFactor,
    nextReviewDate: Date.now() + (quality === 1 ? 10 * 60 * 1000 : newInterval * 24 * 60 * 60 * 1000)
  };
}

function formatInterval(quality: number, srs?: SRSData) {
  if (quality === 1) return '< 10m';
  const next = calculateNextSRS(quality, srs);
  if (next.interval < 1) return '< 1d';
  if (next.interval < 30) return `${Math.round(next.interval)}d`;
  if (next.interval < 365) return `${Math.round(next.interval / 30)}mo`;
  return `${Math.round(next.interval / 365)}y`;
}

export function SrsStudy({ quizIds, setViewState }: SrsStudyProps) {
  const { quizSets, updateQuestionSRS } = useQuizStore();
  const [queue, setQueue] = useState<ActiveCard[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [totalCards, setTotalCards] = useState(0); // for progress
  
  useEffect(() => {
    const cards: ActiveCard[] = [];
    quizSets.filter(q => quizIds.includes(q.id)).forEach(quiz => {
      quiz.questions.forEach(q => {
        if (!q.srs || q.srs.nextReviewDate <= Date.now()) {
          cards.push({ ...q, quizId: quiz.id });
        }
      });
    });
    // Shuffle
    const shuffled = cards.sort(() => Math.random() - 0.5);
    setQueue(shuffled);
    setTotalCards(shuffled.length);
  }, [quizSets, quizIds]);

  if (totalCards > 0 && queue.length === 0) {
    return (
      <div className="max-w-[700px] mx-auto px-6 py-20 text-center">
        <div className="w-20 h-20 bg-[#e3fcef] text-[#00b894] rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-[28px] font-[700] text-[#2d3436] mb-4">Hoàn thành Ôn tập!</h2>
        <p className="text-[#636e72] mb-8">Bạn đã học xong toàn bộ các câu hỏi đến hạn. Tuyệt vời!</p>
        <button 
          onClick={() => setViewState({ type: 'dashboard' })}
          className="bg-[#1e272e] text-white px-8 py-3 rounded-[8px] font-[600] text-[13px] uppercase tracking-[1px] hover:bg-[#2d3436] transition-colors"
        >
          Về Thư viện
        </button>
      </div>
    );
  }

  if (queue.length === 0) return null;

  const currentCard = queue[0];
  const progress = ((totalCards - queue.length) / totalCards) * 100;

  const handleSelectOption = (key: string) => {
    if (showAnswer) return;
    setSelectedAnswer(key);
  };

  const handleRate = (quality: 1|2|3|4) => {
    const newSrs = calculateNextSRS(quality, currentCard.srs);
    updateQuestionSRS(currentCard.quizId, currentCard.id, newSrs);

    if (quality === 1) {
      // Put at the end of the queue
      setQueue(prev => {
        const remaining = prev.slice(1);
        return [...remaining, currentCard];
      });
    } else {
      // Remove from queue
      setQueue(prev => prev.slice(1));
    }
    setShowAnswer(false);
    setSelectedAnswer(null);
  };

  return (
    <div className="max-w-[700px] mx-auto px-6 py-10 flex flex-col min-h-screen">
      <div className="flex-none">
        <button 
          onClick={() => setViewState({ type: 'dashboard' })}
          className="flex items-center text-[12px] uppercase tracking-[1px] font-[600] text-[#a4b0be] hover:text-[#2d3436] mb-10 transition-colors"
        >
          <ArrowLeft size={14} className="mr-2" /> Dừng ôn tập
        </button>

        <div className="flex items-end justify-between mb-4">
          <div>
            <span className="text-[12px] uppercase tracking-[1px] font-[600] text-[#a4b0be]">Tiến độ ({totalCards - queue.length}/{totalCards})</span>
          </div>
          <div className="text-[13px] text-[#636e72] font-mono">Đang chờ: {queue.length} câu</div>
        </div>
        
        <div className="w-full bg-[#edf2f7] rounded-full h-1 mt-2 mb-10 overflow-hidden">
          <div 
            className="bg-[#00b894] h-1 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="flex-grow flex flex-col justify-center">
        <h2 className="text-[22px] font-[600] text-[#2d3436] leading-[1.6] mb-6 whitespace-pre-line">
          {currentCard.text}
        </h2>

        {currentCard.codeSnippet && (
          <div className="bg-[#1e272e] rounded-xl p-6 mb-10 overflow-x-auto shadow-sm">
            <pre className="font-mono text-sm leading-relaxed text-[#a4b0be]">
              <code>{currentCard.codeSnippet}</code>
            </pre>
          </div>
        )}

        <div className="space-y-4 mb-10">
          {Object.entries(currentCard.options).map(([key, value]) => {
            const isCorrectAnswer = currentCard.correctAnswer === key;
            const isSelected = selectedAnswer === key;

            let bgClass = "border-[#edf2f7] bg-white hover:border-[#a4b0be] cursor-pointer";
            let badgeClass = "bg-[#f1f2f6] text-[#747d8c]";
            let textClass = "text-[#2d3436]";

            if (showAnswer) {
              if (isCorrectAnswer) {
                bgClass = "border-[#00b894] bg-[#e3fcef] cursor-default";
                badgeClass = "bg-[#00b894] text-white";
                textClass = "text-[#00b894] font-[600]";
              } else if (isSelected) {
                bgClass = "border-[#ff7675] bg-[#fff0f0] opacity-80 cursor-default";
                badgeClass = "bg-[#ff7675] text-white";
                textClass = "text-[#ff7675] font-[500]";
              } else {
                bgClass = "border-[#edf2f7] bg-white opacity-50 cursor-default";
              }
            } else {
              if (isSelected) {
                bgClass = "border-[#1e272e] bg-[#f4f7f6]";
                badgeClass = "bg-[#1e272e] text-white";
                textClass = "text-[#1e272e] font-[600]";
              }
            }

            return (
              <div
                key={key}
                onClick={() => handleSelectOption(key)}
                className={cn(
                  "flex items-center p-5 rounded-[16px] border-2 transition-all duration-200",
                  bgClass
                )}
              >
                <span className={cn(
                  "w-8 h-8 rounded-[8px] flex items-center justify-center text-[12px] font-[700] mr-5 shrink-0 transition-colors",
                  badgeClass
                )}>
                  {key}
                </span>
                <p className={cn("text-[15px] leading-relaxed", textClass)}>{value}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-none pt-4 pb-10">
        {!showAnswer ? (
          <button
            onClick={() => setShowAnswer(true)}
            disabled={!selectedAnswer}
            className={cn(
              "w-full py-4 rounded-[12px] font-[600] text-[15px] uppercase tracking-[1px] transition-all",
              selectedAnswer 
                ? "bg-[#1e272e] text-white hover:bg-[#2d3436]" 
                : "bg-[#edf2f7] text-[#a4b0be] cursor-not-allowed"
            )}
          >
            Kiểm tra đáp án
          </button>
        ) : (
          <div>
            <div className="text-center mb-4">
              <span className="text-[13px] font-[600] uppercase tracking-[1px] text-[#636e72]">
                Bạn có trả lời đúng không? Hãy tự đánh giá trí nhớ:
              </span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <button
                onClick={() => handleRate(1)}
                className="flex flex-col items-center justify-center py-3 bg-[#fff0f0] border border-[#ff7675]/30 rounded-[12px] hover:bg-[#ffe4e4] transition-colors group"
              >
                <span className="text-[14px] font-[600] text-[#ff7675]">Lại</span>
                <span className="text-[11px] text-[#ff7675]/60 mt-1">{formatInterval(1, currentCard.srs)}</span>
              </button>
              <button
                onClick={() => handleRate(2)}
                className="flex flex-col items-center justify-center py-3 bg-[#fdf3e8] border border-[#f3a683]/30 rounded-[12px] hover:bg-[#fce8d5] transition-colors"
              >
                <span className="text-[14px] font-[600] text-[#f3a683]">Khó</span>
                <span className="text-[11px] text-[#f3a683]/60 mt-1">{formatInterval(2, currentCard.srs)}</span>
              </button>
              <button
                onClick={() => handleRate(3)}
                className="flex flex-col items-center justify-center py-3 bg-[#e3fcef] border border-[#00b894]/30 rounded-[12px] hover:bg-[#d1fbe5] transition-colors"
              >
                <span className="text-[14px] font-[600] text-[#00b894]">Tốt</span>
                <span className="text-[11px] text-[#00b894]/60 mt-1">{formatInterval(3, currentCard.srs)}</span>
              </button>
              <button
                onClick={() => handleRate(4)}
                className="flex flex-col items-center justify-center py-3 bg-[#e8f4fc] border border-[#0984e3]/30 rounded-[12px] hover:bg-[#d5edfe] transition-colors"
              >
                <span className="text-[14px] font-[600] text-[#0984e3]">Dễ</span>
                <span className="text-[11px] text-[#0984e3]/60 mt-1">{formatInterval(4, currentCard.srs)}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

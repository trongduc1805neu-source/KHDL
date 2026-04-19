import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useQuizStore } from '../store/useQuizStore';
import { ViewState } from '../types';
import { cn } from '../lib/utils';

interface StudyQuizProps {
  quizId: string;
  setViewState: (view: ViewState) => void;
}

export function StudyQuiz({ quizId, setViewState }: StudyQuizProps) {
  const { quizSets } = useQuizStore();
  const quiz = quizSets.find((q) => q.id === quizId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [draftSelection, setDraftSelection] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  if (!quiz) return null;

  const question = quiz.questions[currentIndex];
  // isChecked means the user has submitted their answer for the current question
  const isChecked = selectedAnswers[question.id] !== undefined;
  const isLastQuestion = currentIndex === quiz.questions.length - 1;

  const handleSelectOption = (key: string) => {
    if (isChecked) return;
    setDraftSelection(key);
  };

  const handleSubmitOrNext = () => {
    if (!isChecked) {
      if (!draftSelection) return;
      // Submit the draft selection as the final answer
      setSelectedAnswers((prev) => ({ ...prev, [question.id]: draftSelection }));
    } else {
      // Clear draft for the next question and proceed
      setDraftSelection(null);
      if (isLastQuestion) setShowResults(true);
      else setCurrentIndex((prev) => prev + 1);
    }
  };

  const resetStudy = () => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setDraftSelection(null);
    setShowResults(false);
  };

  if (showResults) {
    const totalCorrect = quiz.questions.filter((q) => selectedAnswers[q.id] === q.correctAnswer).length;
    const percentage = Math.round((totalCorrect / quiz.questions.length) * 100);

    return (
      <div className="max-w-[944px] mx-auto flex h-[calc(100vh-140px)] justify-center items-center px-4">
        <div className="w-[944px] bg-white rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.05)] flex overflow-hidden min-h-[500px] h-[80vh]">
          {/* Sidebar */}
          <aside className="w-[300px] bg-[#1e272e] text-white p-10 flex flex-col justify-between shrink-0">
            <div>
              <h1 className="text-[14px] uppercase tracking-[2px] opacity-60 mb-10 m-0">Assessment Result</h1>
              <div className="mb-10">
                <div className="text-[72px] font-[700] leading-[1]">{percentage}%</div>
                <div className="text-[16px] opacity-70 mt-2">Accuracy Achieved</div>
              </div>
              <div className="mt-8 space-y-6">
                <div>
                  <span className="block text-[24px] font-[600]">{totalCorrect} / {quiz.questions.length}</span>
                  <span className="text-[12px] opacity-50 uppercase tracking-[1px]">Correct Answers</span>
                </div>
                <div>
                  <span className="block text-[20px] font-[600] line-clamp-2" title={quiz.title}>{quiz.title}</span>
                  <span className="text-[12px] opacity-50 uppercase tracking-[1px]">Assessment Set</span>
                </div>
              </div>
            </div>
            <div className="text-[11px] opacity-40 leading-[1.6]">
              Completed: {new Date().toLocaleString()}<br/>
              Attempt logged.
            </div>
          </aside>
          
          {/* Main Content */}
          <main className="flex-1 p-10 flex flex-col overflow-y-auto">
            <div className="flex justify-between items-end mb-8 pb-5 border-b border-[#edf2f7]">
              <div>
                <h2 className="m-0 text-[24px] font-[600] text-[#2d3436]">Detailed Breakdown</h2>
                <span className="text-[14px] text-[#636e72]">Reviewing all {quiz.questions.length} questions</span>
              </div>
              <span className="text-[14px] font-[600] text-[#2d3436]">
                Status: <strong style={{color: percentage >= 50 ? '#00b894' : '#ff7675'}}>{percentage >= 50 ? 'Passed' : 'Failed'}</strong>
              </span>
            </div>

            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left text-[12px] uppercase tracking-[1px] text-[#a4b0be] py-3 px-4 border-b-2 border-[#f1f2f6]">#</th>
                  <th className="text-left text-[12px] uppercase tracking-[1px] text-[#a4b0be] py-3 px-4 border-b-2 border-[#f1f2f6]">Question Identifier</th>
                  <th className="text-left text-[12px] uppercase tracking-[1px] text-[#a4b0be] py-3 px-4 border-b-2 border-[#f1f2f6]">Your Ans</th>
                  <th className="text-left text-[12px] uppercase tracking-[1px] text-[#a4b0be] py-3 px-4 border-b-2 border-[#f1f2f6]">Correct</th>
                  <th className="text-left text-[12px] uppercase tracking-[1px] text-[#a4b0be] py-3 px-4 border-b-2 border-[#f1f2f6]">Result</th>
                </tr>
              </thead>
              <tbody>
                {quiz.questions.map((q, idx) => {
                  const uAns = selectedAnswers[q.id] || "NONE";
                  const isMatch = uAns === q.correctAnswer;
                  return (
                    <tr key={q.id}>
                      <td className="py-4 px-4 text-[14px] border-b border-[#f1f2f6] text-[#2d3436] font-[500]">{idx + 1}</td>
                      <td className="py-4 px-4 border-b border-[#f1f2f6] font-mono text-[12px] text-[#747d8c]">...{q.id.slice(-8)}</td>
                      <td className="py-4 px-4 border-b border-[#f1f2f6]">
                        <span className={cn(
                          "inline-block px-2.5 py-1 rounded-[6px] font-[600] text-[12px]",
                          uAns === "NONE" ? "bg-[#f1f2f6] text-[#747d8c]" : (isMatch ? "bg-[#e3fcef] text-[#00b894]" : "bg-[#ffe4e4] text-[#ff7675]")
                        )}>{uAns}</span>
                      </td>
                      <td className="py-4 px-4 border-b border-[#f1f2f6]">
                        <span className="inline-block px-2.5 py-1 rounded-[6px] font-[600] text-[12px] bg-[#e3fcef] text-[#00b894]">
                          {q.correctAnswer}
                        </span>
                      </td>
                      <td className="py-4 px-4 border-b border-[#f1f2f6] text-[13px] font-[500]">
                        <span className={cn(
                          "w-2.5 h-2.5 rounded-full inline-block mr-2",
                          isMatch ? "bg-[#00b894]" : "bg-[#ff7675]"
                        )}></span>
                        <span className={isMatch ? "text-[#00b894]" : "text-[#747d8c]"}>{isMatch ? 'Correct' : 'Incorrect'}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            
            <div className="mt-10 flex gap-4">
              <button onClick={() => setViewState({ type: 'dashboard' })} className="px-6 py-2.5 border border-[#edf2f7] rounded-[8px] text-[13px] uppercase tracking-[1px] font-[600] text-[#1e272e] hover:bg-[#f4f7f6]">Library</button>
              <button onClick={resetStudy} className="px-6 py-2.5 bg-[#1e272e] rounded-[8px] text-[13px] uppercase tracking-[1px] font-[600] text-white hover:bg-[#2d3436]">Retry Assessment</button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Quiz taking layout using the Clean Minimalism styles
  return (
    <div className="max-w-[700px] mx-auto px-6 py-10">
      <button 
        onClick={() => setViewState({ type: 'dashboard' })}
        className="flex items-center text-[12px] uppercase tracking-[1px] font-[600] text-[#a4b0be] hover:text-[#2d3436] mb-10 transition-colors"
      >
        <ArrowLeft size={14} className="mr-2" /> Suspend Attempt
      </button>

      <div className="flex items-end justify-between mb-4">
        <div>
          <span className="text-[12px] uppercase tracking-[1px] font-[600] text-[#a4b0be]">Question {currentIndex + 1} of {quiz.questions.length}</span>
        </div>
        <div className="text-[13px] text-[#636e72] font-mono">ID: ...{question.id.slice(-8)}</div>
      </div>
      
      <div className="w-full bg-[#edf2f7] rounded-full h-1 mt-2 mb-10 overflow-hidden">
        <div 
          className="bg-[#1e272e] h-1 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }}
        ></div>
      </div>

      <h2 className="text-[22px] font-[600] text-[#2d3436] leading-[1.6] mb-6">
        {question.text}
      </h2>

      {question.codeSnippet && (
        <div className="bg-[#1e272e] rounded-xl p-6 mb-10 overflow-x-auto shadow-sm">
          <pre className="font-mono text-sm leading-relaxed text-[#a4b0be]">
            <code>{question.codeSnippet}</code>
          </pre>
        </div>
      )}

      <div className={cn("space-y-4", !question.codeSnippet && "mb-10")}>
        {Object.entries(question.options).map(([key, value]) => {
          const isConfirmed = isChecked;
          const isSelected = isConfirmed ? selectedAnswers[question.id] === key : draftSelection === key;
          const isActuallyCorrect = question.correctAnswer === key;

          let stateClass = "border-[#edf2f7] bg-white hover:border-[#a4b0be] cursor-pointer";
          let indexClass = "bg-[#f1f2f6] text-[#747d8c]";
          let textClass = "text-[#2d3436]";

          if (isConfirmed) {
            if (isActuallyCorrect) {
              stateClass = "border-[#00b894] bg-[#e3fcef] z-10 relative";
              indexClass = "bg-[#00b894] text-white";
              textClass = "text-[#00b894] font-[600]";
            } else if (isSelected) {
              stateClass = "border-[#ff7675] bg-[#fff0f0] opacity-80 cursor-not-allowed";
              indexClass = "bg-[#ff7675] text-white";
              textClass = "text-[#ff7675] font-[500]";
            } else {
              stateClass = "border-[#edf2f7] bg-white opacity-50 cursor-not-allowed";
            }
          } else {
            // Unconfirmed draft selection visual mapping
            if (isSelected) {
              stateClass = "border-[#1e272e] bg-[#f4f7f6]";
              indexClass = "bg-[#1e272e] text-white";
              textClass = "text-[#1e272e] font-[600]";
            }
          }

          return (
            <div
              key={key}
              onClick={() => handleSelectOption(key)}
              className={cn(
                "flex items-center p-5 rounded-[16px] border-2 transition-all duration-200",
                stateClass
              )}
            >
              <span className={cn(
                "w-8 h-8 rounded-[8px] flex items-center justify-center text-[12px] font-[700] mr-5 shrink-0 transition-colors",
                indexClass
              )}>
                {key}
              </span>
              <p className={cn("text-[15px] leading-relaxed", textClass)}>{value}</p>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-6 border-t border-[#edf2f7]">
        <button
          onClick={handleSubmitOrNext}
          disabled={!isChecked && !draftSelection}
          className={cn(
            "px-8 py-3.5 rounded-[8px] font-[600] text-[13px] uppercase tracking-[1px] transition-all",
            (isChecked || draftSelection) 
              ? "bg-[#1e272e] text-white hover:bg-[#2d3436]" 
              : "bg-[#edf2f7] text-[#a4b0be] cursor-not-allowed"
          )}
        >
          {!isChecked ? 'Check Answer' : (isLastQuestion ? 'Complete Assessment' : 'Proceed')}
        </button>
      </div>
    </div>
  );
}

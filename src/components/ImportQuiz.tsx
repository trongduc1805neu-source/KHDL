import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useQuizStore } from '../store/useQuizStore';
import { Question, ViewState } from '../types';

interface ImportQuizProps {
  setViewState: (view: ViewState) => void;
  targetQuizId?: string;
}

export function ImportQuiz({ setViewState, targetQuizId = 'NEW' }: ImportQuizProps) {
  const { addQuizSet, quizSets, appendQuestions } = useQuizStore();
  const [selectedQuiz, setSelectedQuiz] = useState<string>(targetQuizId || 'NEW');
  const [title, setTitle] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (targetQuizId) {
      setSelectedQuiz(targetQuizId);
    }
  }, [targetQuizId]);

  const parseNotionJson = (jsonObj: any[]): Question[] => {
    const parsed: Question[] = [];
    if (!Array.isArray(jsonObj)) throw new Error('Dữ liệu JSON gốc phải là một mảng [].');
    for (const item of jsonObj) {
      try {
        const props = item.properties || item;
        const getText = (field: any) => {
          if (!field) return '';
          if (field.rich_text && Array.isArray(field.rich_text)) return field.rich_text.map((rt: any) => rt.plain_text || '').join('');
          if (typeof field === 'string') return field;
          return '';
        };
        const questionText = getText(props.question) || getText(props.Question) || 'Câu hỏi trống';
        const codeSnippet = getText(props.code) || getText(props.Code) || '';
        const correctAnswer = (getText(props.correct) || getText(props.Correct)).trim().toUpperCase();
        const options: Record<string, string> = {};
        ['A', 'B', 'C', 'D', 'E', 'F'].forEach(opt => {
          const optText = getText(props[opt]);
          if (optText) options[opt] = optText;
        });
        if (questionText && Object.keys(options).length > 0) {
          parsed.push({
            id: item._id || crypto.randomUUID(),
            text: questionText,
            codeSnippet: codeSnippet ? codeSnippet : undefined,
            options,
            correctAnswer: correctAnswer || 'A',
          });
        }
      } catch (err) {
        console.warn("Lỗi phân tích phần tử", err);
      }
    }
    return parsed;
  };

  const handleImport = () => {
    setError(null); setSuccess(null);
    if (selectedQuiz === 'NEW' && !title.trim()) return setError('Vui lòng nhập tên bộ đề.');
    if (!jsonInput.trim()) return setError('Vui lòng dán dữ liệu JSON.');

    try {
      const rawData = JSON.parse(jsonInput);
      const parsedQuestions = parseNotionJson(rawData);
      if (parsedQuestions.length === 0) return setError('Không tìm thấy câu hỏi hợp lệ nào trong JSON.');
      
      if (selectedQuiz === 'NEW') {
        addQuizSet({ id: crypto.randomUUID(), title: title.trim(), questions: parsedQuestions, createdAt: Date.now() });
        setSuccess(`Trích xuất thành công ${parsedQuestions.length} câu hỏi!`);
      } else {
        const result = appendQuestions(selectedQuiz, parsedQuestions);
        setSuccess(`Đã thêm ${result.added} câu hỏi mới. Bỏ qua ${result.duplicates} câu trùng lặp.`);
      }
      
      setTimeout(() => setViewState({ type: 'dashboard' }), 2000);
    } catch (err: any) {
      setError(`Lỗi phân tích JSON: ${err.message || 'JSON không hợp lệ'}`);
    }
  };

  return (
    <div className="max-w-[944px] mx-auto px-6">
      <button 
        onClick={() => setViewState({ type: 'dashboard' })}
        className="flex items-center text-[12px] uppercase tracking-[1px] font-[600] text-[#a4b0be] hover:text-[#2d3436] mb-8 transition-colors"
      >
        <ArrowLeft size={14} className="mr-2" /> Quay lại Thư viện
      </button>

      <div className="bg-white rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="p-10 border-b border-[#edf2f7]">
          <h2 className="text-[24px] font-[600] text-[#2d3436] m-0">Trích xuất Dữ liệu JSON</h2>
          <span className="text-[14px] text-[#636e72] mt-1 block">Chuyển đổi dữ liệu gốc thành bộ đề trắc nghiệm</span>
        </div>

        <div className="p-10 space-y-8">
          {error && (
            <div className="bg-[#ff7675]/10 border border-[#ff7675]/20 text-[#ff7675] px-5 py-4 rounded-[12px] flex items-center justify-between">
              <span className="text-[14px] font-[600]">{error}</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff7675] inline-block"></span>
            </div>
          )}

          {success && (
            <div className="bg-[#e3fcef] border border-[#00b894]/20 text-[#00b894] px-5 py-4 rounded-[12px] flex items-center gap-3">
              <CheckCircle2 size={18} />
              <span className="text-[14px] font-[600]">{success}</span>
            </div>
          )}

          <div>
            <label className="block text-[12px] font-[600] text-[#a4b0be] uppercase tracking-[1px] mb-3">
              Lưu vào bộ đề
            </label>
            <div className="relative">
              <select
                value={selectedQuiz}
                onChange={(e) => setSelectedQuiz(e.target.value)}
                className="w-full px-5 py-3 border border-[#edf2f7] rounded-[12px] focus:border-[#1e272e] focus:ring-1 focus:ring-[#1e272e] outline-none transition-all text-[#2d3436] text-[14px] bg-white appearance-none"
              >
                <option value="NEW">+ Tạo bộ đề mới</option>
                {quizSets.map(q => (
                  <option key={q.id} value={q.id}>Thêm vào: {q.title}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-[#a4b0be]">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

          {selectedQuiz === 'NEW' && (
            <div>
              <label className="block text-[12px] font-[600] text-[#a4b0be] uppercase tracking-[1px] mb-3">
                Tên bộ đề mới
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Trắc nghiệm Cơ sở dữ liệu Chương 1"
                className="w-full px-5 py-3 border border-[#edf2f7] rounded-[12px] focus:border-[#1e272e] focus:ring-1 focus:ring-[#1e272e] outline-none transition-all text-[#2d3436] text-[14px]"
              />
            </div>
          )}

          <div>
            <label className="block text-[12px] font-[600] text-[#a4b0be] uppercase tracking-[1px] mb-3">
              Dữ liệu gốc (JSON Array)
            </label>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder={`[\n  {\n    "properties": {\n      "question": { "rich_text": [...] },\n      ...\n    }\n  }\n]`}
              className="w-full h-[300px] px-5 py-4 border border-[#edf2f7] rounded-[12px] focus:border-[#1e272e] focus:ring-1 focus:ring-[#1e272e] outline-none font-mono text-[13px] text-[#636e72] resize-y bg-[#f4f7f6]/50"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleImport}
              className="bg-[#1e272e] hover:bg-[#2d3436] text-white px-8 py-3.5 rounded-[8px] font-[600] text-[13px] uppercase tracking-[1px] transition-colors"
            >
              Trích xuất dữ liệu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

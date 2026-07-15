"use client";

import { useState } from "react";
import { submitQuiz } from "../../lib/api/enrollment";

type Question = {
  id: string;
  question: string;
  options: string[];
  sortOrder: number;
};

type QuizResult = {
  score: number;
  isPassed: boolean;
  passMark: number;
  correct: number;
  total: number;
};

type Props = {
  lessonId: string;
  passMark: number;
  questions: Question[];
  token: string;
  onPassed?: () => void;
};

export default function QuizInterface({ lessonId, passMark, questions, token, onPassed }: Props) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  async function handleSubmit() {
    if (!allAnswered) return;
    setLoading(true);
    setError(null);
    try {
      const res = await submitQuiz(lessonId, answers, token);
      setResult(res);
      if (res.isPassed) onPassed?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setAnswers({});
    setResult(null);
    setError(null);
  }

  if (result) {
    return (
      <div className="text-center space-y-6 py-8">
        <div
          className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-white ${result.isPassed ? "bg-green-500" : "bg-red-500"}`}
        >
          {Math.round(result.score)}
        </div>

        <div>
          <h3 className={`text-xl font-bold ${result.isPassed ? "text-green-700" : "text-red-700"}`}>
            {result.isPassed ? "Selamat, Anda Lulus!" : "Belum Lulus"}
          </h3>
          <p className="text-[#6E6E73] text-sm mt-1">
            {result.correct} dari {result.total} jawaban benar · Nilai minimum {result.passMark}
          </p>
        </div>

        {!result.isPassed && (
          <button
            type="button"
            onClick={reset}
            className="btn-primary px-6 py-2"
          >
            Coba Lagi
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#1D1D1F]">Quiz</h2>
        <span className="text-xs text-[#6E6E73]">Nilai minimum: {passMark}</span>
      </div>

      {error && (
        <div role="alert" className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {questions.map((q, idx) => (
        <div key={q.id} className="space-y-3">
          <p className="font-medium text-[#1D1D1F]">
            <span className="text-[#0077A8] mr-2">{idx + 1}.</span>
            {q.question}
          </p>
          {/* Finding #8b: expose the option set as a radiogroup labelled by the
              question so screen readers tie the choices to their prompt. */}
          <div className="space-y-2" role="radiogroup" aria-label={`${idx + 1}. ${q.question}`}>
            {(q.options as string[]).map((opt, optIdx) => {
              const selected = answers[q.id] === optIdx;
              return (
                <label
                  key={optIdx}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                    selected
                      ? "border-[#0077A8] bg-[#E8F4FB] text-[#0077A8]"
                      : "border-[#E5E5EA] hover:border-[#0077A8]/40 hover:bg-[#F5F5F7]"
                  }`}
                >
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    value={optIdx}
                    checked={selected}
                    onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                    className="sr-only"
                  />
                  <span
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      selected ? "border-[#0077A8] bg-[#0077A8]" : "border-[#C7C7CC]"
                    }`}
                  >
                    {selected && <span className="w-2 h-2 rounded-full bg-white" />}
                  </span>
                  <span className="text-sm">{opt}</span>
                </label>
              );
            })}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!allAnswered || loading}
        className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" aria-hidden="true" />
            Mengirim…
          </>
        ) : (
          "Kirim Jawaban"
        )}
      </button>
    </div>
  );
}

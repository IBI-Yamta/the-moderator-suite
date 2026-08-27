import React, { useState } from "react";
import { X, Save, Check } from "lucide-react";
import { ObjectiveQuestion, OptionItem } from "../types";
import { cleanOptionText } from "../utils/parser";

interface QuestionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: ObjectiveQuestion | null;
  onSave: (updated: ObjectiveQuestion) => void;
}

export const QuestionEditModal: React.FC<QuestionEditModalProps> = ({
  isOpen,
  onClose,
  question,
  onSave,
}) => {
  if (!isOpen || !question) return null;

  const [questionText, setQuestionText] = useState(question.questionText);
  const [options, setOptions] = useState<OptionItem[]>([...question.options]);
  const [correctAnswer, setCorrectAnswer] = useState(question.correctAnswer || "a");

  const handleOptionChange = (index: number, newText: string) => {
    const updated = [...options];
    updated[index] = { ...updated[index], text: cleanOptionText(newText) };
    setOptions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...question,
      questionText,
      options: options.map(opt => ({
        ...opt,
        text: cleanOptionText(opt.text),
      })),
      correctAnswer,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h2 className="text-base font-bold text-slate-900">
            Edit Question {question.questionNumber}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Question Stem:
            </label>
            <textarea
              rows={3}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block font-semibold text-slate-700 mb-1">
              Options (Linear formatting):
            </label>
            {options.map((opt, idx) => (
              <div key={opt.key} className="flex items-center space-x-2">
                <span className="w-8 font-bold text-slate-700 text-center uppercase">
                  ({opt.key})
                </span>
                <input
                  type="text"
                  value={opt.text}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Correct Answer Key (for marking scheme):
            </label>
            <select
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {options.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  Option ({opt.key.toUpperCase()}): {opt.text}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-sm transition"
            >
              <Save className="w-4 h-4 mr-1.5" />
              Update Question
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

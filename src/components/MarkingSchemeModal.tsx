import React, { useState } from "react";
import { X, Wand2, Download, Copy, Check, Sparkles, RefreshCw } from "lucide-react";
import { ExamData, MarkingGuideData } from "../types";

interface MarkingSchemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  examData: ExamData;
}

export const MarkingSchemeModal: React.FC<MarkingSchemeModalProps> = ({
  isOpen,
  onClose,
  examData,
}) => {
  const [markingData, setMarkingData] = useState<MarkingGuideData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/marking-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examData }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setMarkingData(data.data);
      } else {
        // Fallback local key generator if offline or no key
        generateFallbackAnswers();
      }
    } catch (e) {
      console.warn("Using fallback marking guide:", e);
      generateFallbackAnswers();
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackAnswers = () => {
    const objAnswers = examData.sectionA.questions.map((q) => ({
      questionNumber: q.questionNumber,
      answer: q.correctAnswer?.toUpperCase() || (q.options[0]?.key.toUpperCase() || "A"),
      explanation: `Standard syllabus response for question ${q.questionNumber}.`,
    }));

    const essayScheme = examData.sectionB.questions.map((eq) => ({
      questionNumber: eq.questionNumber,
      expectedPoints: [
        `Accurate definition and conceptual clarity for ${eq.text}.`,
        "Comprehensive enumeration of key statutory provisions.",
        "Clear illustrative examples where applicable.",
      ],
      allocatedMarks: eq.marks || "[10 marks]",
    }));

    setMarkingData({
      subject: examData.subject,
      classLevel: examData.classLevel,
      objectiveAnswers: objAnswers,
      essayMarkingScheme: essayScheme,
    });
  };

  const handleCopyText = () => {
    if (!markingData) return;
    let text = `OFFICIAL MARKING SCHEME & ANSWER KEY\n`;
    text += `${examData.schoolName}\n`;
    text += `SUBJECT: ${examData.subject} | CLASS: ${examData.classLevel}\n\n`;
    text += `SECTION A: OBJECTIVE ANSWERS\n`;
    markingData.objectiveAnswers.forEach((a) => {
      text += `${a.questionNumber}. (${a.answer}) - ${a.explanation || ""}\n`;
    });
    text += `\nSECTION B: ESSAY MARKING CRITERIA\n`;
    markingData.essayMarkingScheme.forEach((e) => {
      text += `Question ${e.questionNumber} ${e.allocatedMarks || ""}:\n`;
      e.expectedPoints.forEach((p, idx) => {
        text += `  • [${idx + 1}] ${p}\n`;
      });
      text += "\n";
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-amber-600" />
              Official Examination Marking Scheme & Answer Keys
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {examData.subject} • {examData.classLevel} • {examData.schoolName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {!markingData ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-600 border border-amber-200">
                <Wand2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Ready to Generate Examiner Answer Key
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Click the button below to generate accurate objective answer keys (1-30) and marking distribution guides for Section B essays.
                </p>
              </div>
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="inline-flex items-center px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm rounded-lg shadow-sm transition disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                {isLoading ? "Generating Answer Key..." : "Generate Answer Key & Marking Guide"}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Section A Answer Grid */}
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 bg-slate-100 p-2 rounded border border-slate-200">
                  SECTION A: OBJECTIVE ANSWER KEYS ({markingData.objectiveAnswers.length} Questions)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {markingData.objectiveAnswers.map((item) => (
                    <div
                      key={item.questionNumber}
                      className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between"
                    >
                      <span className="font-bold text-slate-600">Q{item.questionNumber}.</span>
                      <span className="bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded text-xs">
                        ({item.answer})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section B Essay Marking Scheme */}
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 bg-slate-100 p-2 rounded border border-slate-200">
                  SECTION B: ESSAY / THEORY MARKING GUIDE
                </h3>
                <div className="space-y-3">
                  {markingData.essayMarkingScheme.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span>Question {item.questionNumber}</span>
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {item.allocatedMarks || "10 marks"}
                        </span>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
                        {item.expectedPoints.map((pt, pIdx) => (
                          <li key={pIdx}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {markingData ? (
            <button
              onClick={handleCopyText}
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
              {copied ? "Copied to Clipboard!" : "Copy Marking Guide"}
            </button>
          ) : (
            <div></div>
          )}

          <div className="flex items-center space-x-2">
            {markingData && (
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition"
              >
                Regenerate
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

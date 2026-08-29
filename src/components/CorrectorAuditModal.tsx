import React, { useState, useMemo } from "react";
import {
  X,
  CheckCircle2,
  ShieldCheck,
  FileCheck,
  ArrowRight,
  Sparkles,
  BookOpen,
  Brain,
  Gauge,
  AlertTriangle,
  Lightbulb,
  Layers,
  Search,
  Check,
  Copy,
  Info,
  Clock,
  BarChart2,
  SlidersHorizontal,
} from "lucide-react";
import { AuditReport, ExamData } from "../types";
import { analyzeExamReadability, ReadabilityMetrics } from "../utils/readability";

interface CorrectorAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  audit: AuditReport;
  examData?: ExamData;
  subject: string;
  classLevel: string;
}

export const CorrectorAuditModal: React.FC<CorrectorAuditModalProps> = ({
  isOpen,
  onClose,
  audit,
  examData,
  subject,
  classLevel,
}) => {
  const [activeTab, setActiveTab] = useState<"audit" | "readability">("audit");
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [filterSection, setFilterSection] = useState<"all" | "objective" | "theory">("all");
  const [vocabSearch, setVocabSearch] = useState("");

  // Compute Readability Metrics from live exam content
  const readability: ReadabilityMetrics = useMemo(() => {
    if (!examData) {
      return analyzeExamReadability({
        schoolName: "",
        schoolMotto: "",
        schoolAddress: "",
        contactInfo: "",
        termSession: "",
        subject,
        classLevel,
        timeAllowed: "",
        fullMarks: "",
        footerNotice: "",
        optionsStyle: "(a), (b), (c), (d)",
        layoutColumns: 2,
        fontSize: "12pt",
        lineSpacing: "1.15",
        fontFamily: "Times New Roman",
        optionsLinear: false,
        sectionA: { title: "SECTION A", instruction: "", questions: [] },
        sectionB: { title: "SECTION B", instruction: "", questions: [] },
      });
    }
    return analyzeExamReadability(examData);
  }, [examData, subject, classLevel]);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Filter flagged questions
  const filteredFlaggedQuestions = readability.flaggedQuestions.filter((q) => {
    if (filterSection === "objective") return q.section.includes("Objective");
    if (filterSection === "theory") return q.section.includes("Theory");
    return true;
  });

  // Filter vocabulary
  const filteredVocab = readability.difficultWords.filter(
    (item) =>
      item.word.toLowerCase().includes(vocabSearch.toLowerCase()) ||
      item.simpleAlternative.toLowerCase().includes(vocabSearch.toLowerCase())
  );

  // Determine score color
  const getFleschColor = (score: number) => {
    if (score >= 70) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 50) return "text-blue-600 bg-blue-50 border-blue-200";
    if (score >= 35) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-rose-600 bg-rose-50 border-rose-200";
  };

  const getFleschLabel = (score: number) => {
    if (score >= 80) return "Very Easy / Primary Friendly";
    if (score >= 70) return "Easy / Plain Conversational";
    if (score >= 60) return "Standard / Junior Secondary";
    if (score >= 50) return "Fairly Difficult / Senior Secondary";
    if (score >= 30) return "Difficult / Academic Text";
    return "Very Dense / Advanced";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden text-slate-800">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shadow-2xs">
              {activeTab === "audit" ? <ShieldCheck className="w-5 h-5" /> : <Brain className="w-5 h-5 text-indigo-600" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {activeTab === "audit" ? "Academic & Moderation Audit" : "Student Readability & Complexity Analysis"}
                </h2>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {classLevel || "Standard"}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {subject} • Analyzed at {audit.timestamp || "Active Session"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Selector */}
        <div className="flex items-center px-6 border-b border-slate-200 bg-white gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("audit")}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 transition cursor-pointer ${
              activeTab === "audit"
                ? "border-emerald-600 text-emerald-700 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Academic Normalization Audit</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
              {audit.corrections.length} fixes
            </span>
          </button>

          <button
            onClick={() => setActiveTab("readability")}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 transition cursor-pointer ${
              activeTab === "readability"
                ? "border-indigo-600 text-indigo-700 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Brain className="w-4 h-4 text-indigo-600" />
            <span>Student Readability & Complexity Tool</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                readability.suitabilityStatus === "appropriate"
                  ? "bg-emerald-100 text-emerald-800"
                  : readability.suitabilityStatus === "too_complex"
                  ? "bg-rose-100 text-rose-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              Grade {readability.fleschKincaidGrade}
            </span>
          </button>
        </div>

        {/* Tab 1: Academic & Normalization Audit */}
        {activeTab === "audit" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Quality Score & Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 bg-slate-100/60 border-b border-slate-200 text-center">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Quality Score
                </span>
                <span className="text-2xl font-extrabold text-emerald-600">
                  {audit.qualityScore || 98}%
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Total Questions
                </span>
                <span className="text-2xl font-extrabold text-slate-800">
                  {audit.totalQuestions}
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Auto Corrections
                </span>
                <span className="text-2xl font-extrabold text-blue-600">
                  {audit.corrections.length}
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Marks Total
                </span>
                <span className="text-2xl font-extrabold text-slate-800">
                  {audit.totalCalculatedMarks}
                </span>
              </div>
            </div>

            {/* Examiner Comments */}
            {audit.examinerComments && (
              <div className="px-6 py-3 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs flex items-start space-x-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Chief Examiner Note: </span>
                  {audit.examinerComments}
                </div>
              </div>
            )}

            {/* Detailed Correction Log */}
            <div className="p-6 flex-1 overflow-y-auto space-y-3">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Applied Corrections & Typography Standardizations ({audit.corrections.length}):
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">WAEC / NECO Aligned</span>
              </div>

              {audit.corrections.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-sm">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="font-bold text-slate-700">Paper is 100% compliant with standard examination formatting!</p>
                  <p className="text-xs text-slate-400 mt-1">No abbreviations, broken options, or syntax errors detected.</p>
                </div>
              ) : (
                audit.corrections.map((corr, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white transition text-xs space-y-1.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          corr.type === "abbreviation"
                            ? "bg-purple-100 text-purple-800"
                            : corr.type === "option_fix"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {corr.type}
                      </span>
                      <span className="text-slate-400 font-mono text-[10px]">#{idx + 1}</span>
                    </div>
                    <p className="font-semibold text-slate-800">{corr.description}</p>
                    <div className="flex items-center space-x-2 font-mono text-[11px] pt-1">
                      <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-200 truncate max-w-[200px]">
                        {corr.original}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 truncate max-w-[300px]">
                        {corr.corrected}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Secondary Readability & Student Complexity Tool */}
        {activeTab === "readability" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Score Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 bg-indigo-50/40 border-b border-indigo-100 text-center">
              {/* Flesch-Kincaid Grade */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Readability Grade
                </span>
                <div className="my-1">
                  <span className="text-2xl font-black text-indigo-700">
                    Grade {readability.fleschKincaidGrade}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">
                  Equivalent to {readability.recommendedGrade}
                </span>
              </div>

              {/* Flesch Reading Ease */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Reading Ease Index
                </span>
                <div className="my-1">
                  <span className="text-2xl font-black text-slate-800">
                    {readability.fleschReadingEase}
                    <span className="text-xs font-normal text-slate-400">/100</span>
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 truncate">
                  {getFleschLabel(readability.fleschReadingEase)}
                </span>
              </div>

              {/* Avg Sentence Length */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Words Per Sentence
                </span>
                <div className="my-1">
                  <span className="text-2xl font-black text-slate-800">
                    {readability.avgWordsPerSentence}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">
                  {readability.avgWordsPerSentence <= 16 ? "Optimal (<16 words)" : "Dense (>16 words)"}
                </span>
              </div>

              {/* Estimated Reading Time */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Student Read Time
                </span>
                <div className="my-1">
                  <span className="text-2xl font-black text-slate-800">
                    ~{readability.readingTimeMinutes} min
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">
                  {readability.wordCount} words • {readability.complexWordPercentage}% complex
                </span>
              </div>
            </div>

            {/* Target Class Suitability Status Banner */}
            <div
              className={`px-6 py-3 border-b flex items-start space-x-3 text-xs ${
                readability.suitabilityStatus === "appropriate"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : readability.suitabilityStatus === "too_complex"
                  ? "bg-rose-50 border-rose-200 text-rose-900"
                  : "bg-amber-50 border-amber-200 text-amber-900"
              }`}
            >
              {readability.suitabilityStatus === "appropriate" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="font-bold flex items-center gap-2">
                  <span>Target Class Evaluation: {classLevel || "Standard"}</span>
                  <span className="px-2 py-0.2 rounded text-[10px] font-black uppercase tracking-wider bg-white/70">
                    {readability.suitabilityStatus.replace("_", " ")}
                  </span>
                </div>
                <p className="mt-0.5 leading-relaxed">{readability.suitabilityMessage}</p>
              </div>
            </div>

            {/* Scrollable Diagnostic Body */}
            <div className="p-6 flex-1 overflow-y-auto space-y-6 text-xs">
              {/* Section 1: Readability Recommendations & Pedagogical Guidelines */}
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    Readability & Comprehension Improvement Tips:
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {readability.readabilityTips.map((tip, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-slate-700 leading-relaxed"
                    >
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                        {idx + 1}
                      </span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 2: Flagged Questions for Simplification */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                      Questions with High Reading Complexity ({filteredFlaggedQuestions.length})
                    </h3>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1 text-[11px]">
                    <button
                      onClick={() => setFilterSection("all")}
                      className={`px-2 py-0.5 rounded-md font-semibold transition ${
                        filterSection === "all"
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      All ({readability.flaggedQuestions.length})
                    </button>
                    <button
                      onClick={() => setFilterSection("objective")}
                      className={`px-2 py-0.5 rounded-md font-semibold transition ${
                        filterSection === "objective"
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      Section A
                    </button>
                    <button
                      onClick={() => setFilterSection("theory")}
                      className={`px-2 py-0.5 rounded-md font-semibold transition ${
                        filterSection === "theory"
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      Section B
                    </button>
                  </div>
                </div>

                {filteredFlaggedQuestions.length === 0 ? (
                  <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/50 text-emerald-800 text-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                    <p className="font-bold">No excessively long or confusing questions detected!</p>
                    <p className="text-[11px] text-emerald-600 mt-0.5">
                      All question stems are within recommended sentence length constraints.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {filteredFlaggedQuestions.map((q) => (
                      <div
                        key={q.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition shadow-2xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-[10px]">
                            {q.section} • Q{q.questionNumber}
                          </span>
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            {q.reason}
                          </span>
                        </div>

                        <p className="font-serif text-slate-800 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                          "{q.text}"
                        </p>

                        <div className="flex items-start gap-2 bg-blue-50/70 p-2.5 rounded-lg border border-blue-100 text-[11px] text-blue-900">
                          <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <span className="font-bold">Readability Suggestion: </span>
                            {q.suggestion}
                          </div>
                          <button
                            onClick={() => handleCopy(q.text, String(q.id))}
                            className="text-blue-700 hover:text-blue-900 p-1 rounded hover:bg-blue-100 transition"
                            title="Copy question text"
                          >
                            {copiedText === String(q.id) ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 3: Academic Vocabulary & Student-Friendly Simplification Guide */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                      Academic Vocabulary Simplification Guide
                    </h3>
                  </div>

                  <div className="relative min-w-[180px]">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={vocabSearch}
                      onChange={(e) => setVocabSearch(e.target.value)}
                      placeholder="Search words in exam..."
                      className="w-full pl-8 pr-2.5 py-1 text-[11px] rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {filteredVocab.map((vocab, vIdx) => (
                    <div
                      key={vIdx}
                      className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between text-[11px]"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 font-mono capitalize">{vocab.word}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-600 font-mono">
                            {vocab.syllables} syl
                          </span>
                        </div>
                        <div className="text-slate-500 text-[10px] mt-0.5">
                          Suggested: <strong className="text-emerald-700">{vocab.simpleAlternative}</strong>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono text-slate-400">×{vocab.frequency}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {activeTab === "audit"
                ? "All typographical corrections and mark allocations are auto-audited."
                : "Readability formulas use standard Flesch-Kincaid & Gunning Fog indexes tailored for Nigerian & West African curricula."}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition shadow-2xs cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

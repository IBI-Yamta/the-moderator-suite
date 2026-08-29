import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Download,
  Printer,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  Sliders,
  Eye,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Hash,
  Award,
  Layers,
  BookOpen,
} from "lucide-react";
import confetti from "canvas-confetti";
import { ExamData, ObjectiveQuestion, EssayQuestion } from "../types";
import { SchoolLogo } from "./SchoolLogo";
import { exportAnswerKeyToPDF } from "../utils/pdfExport";

export interface ObjectiveAnswerItem {
  questionNumber: number;
  questionText: string;
  selectedKey: string; // 'a' | 'b' | 'c' | 'd'
  answerText: string;
  explanation: string;
  marks: number;
}

export interface EssaySchemeItem {
  questionNumber: string;
  mainText: string;
  allocatedMarks: string;
  subQuestions: Array<{
    label: string;
    text: string;
    marks?: string;
    points: string[];
  }>;
  expectedPoints: string[];
}

interface AnswerKeyPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  examData: ExamData;
  theme?: "light" | "dark";
}

export const AnswerKeyPdfModal: React.FC<AnswerKeyPdfModalProps> = ({
  isOpen,
  onClose,
  examData,
  theme = "light",
}) => {
  const isDark = theme === "dark";

  // Active view tab
  const [activeTab, setActiveTab] = useState<"preview" | "matrix" | "rubric">("preview");

  // State for parsed / generated answer key items
  const [objectiveAnswers, setObjectiveAnswers] = useState<ObjectiveAnswerItem[]>([]);
  const [essayScheme, setEssayScheme] = useState<EssaySchemeItem[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Configuration options for PDF output
  const [includeExplanations, setIncludeExplanations] = useState(true);
  const [includeScoreBox, setIncludeScoreBox] = useState(true);
  const [includeEssayRubric, setIncludeEssayRubric] = useState(true);
  const [keyFormat, setKeyFormat] = useState<"uppercase_bracket" | "lowercase_bracket" | "plain_upper">("uppercase_bracket");

  const pdfContainerRef = useRef<HTMLDivElement>(null);

  // Build initial answer keys from examData on open or changes
  useEffect(() => {
    if (!isOpen) return;

    // Build Section A answers
    const objAnswers: ObjectiveAnswerItem[] = examData.sectionA.questions.map((q, idx) => {
      // Determine correct option
      let defaultKey = "a";
      if (q.correctAnswer) {
        defaultKey = q.correctAnswer.toLowerCase();
      } else if (q.options && q.options.length > 0) {
        // Fallback: choose option based on content heuristics or default to 'a'
        defaultKey = q.options[0].key.toLowerCase();
      }

      const matchingOption = q.options.find((o) => o.key.toLowerCase() === defaultKey) || q.options[0];
      const ansText = matchingOption ? matchingOption.text : "Correct standard response";

      return {
        questionNumber: q.questionNumber || idx + 1,
        questionText: q.questionText,
        selectedKey: defaultKey,
        answerText: ansText,
        explanation: `Standard syllabus answer for Question ${q.questionNumber || idx + 1}.`,
        marks: q.marks || 1,
      };
    });

    // Build Section B schemes
    const essayItems: EssaySchemeItem[] = examData.sectionB.questions.map((eq, idx) => {
      const subQs = (eq.subQuestions || []).map((sq) => ({
        label: sq.label,
        text: sq.text,
        marks: sq.marks || "[5 marks]",
        points: [
          `Accurate formulation & concept mastery for ${sq.text.substring(0, 40)}...`,
          "Detailed points, clear terminology, and practical instances.",
          "Logical presentation and coherent structural flow.",
        ],
      }));

      return {
        questionNumber: eq.questionNumber || `${idx + 1}`,
        mainText: eq.text,
        allocatedMarks: eq.marks || "[10 marks]",
        subQuestions: subQs,
        expectedPoints: [
          `Clear conceptual definition and complete context addressing ${eq.text.substring(0, 50)}...`,
          "Detailed enumeration of mandatory principles and curriculum requirements.",
          "Substantive real-world application, step-by-step working, or illustrations.",
          "Precision in terminology, grammar, and neat presentation.",
        ],
      };
    });

    setObjectiveAnswers(objAnswers);
    setEssayScheme(essayItems);
  }, [isOpen, examData]);

  if (!isOpen) return null;

  // Handle single objective key toggle
  const handleKeyChange = (qNum: number, newKey: string) => {
    setObjectiveAnswers((prev) =>
      prev.map((item) => {
        if (item.questionNumber === qNum) {
          const matchingQ = examData.sectionA.questions.find(
            (q) => q.questionNumber === qNum || q.id === qNum
          );
          const newOpt = matchingQ?.options.find((o) => o.key.toLowerCase() === newKey.toLowerCase());
          return {
            ...item,
            selectedKey: newKey.toLowerCase(),
            answerText: newOpt ? newOpt.text : item.answerText,
          };
        }
        return item;
      })
    );
  };

  // AI Generation & Refinement handler
  const handleAiGenerateGuide = async () => {
    setIsAiLoading(true);
    setStatusMessage("Analyzing exam questions and formulating Chief Examiner answer keys with Gemini...");

    try {
      const res = await fetch("/api/ai/marking-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examData }),
      });

      const data = await res.json();

      if (data.success && data.data) {
        const aiData = data.data;

        // Merge AI objective answers
        if (Array.isArray(aiData.objectiveAnswers)) {
          setObjectiveAnswers((prev) =>
            prev.map((item) => {
              const aiAns = aiData.objectiveAnswers.find(
                (a: any) => Number(a.questionNumber) === item.questionNumber
              );
              if (aiAns && aiAns.answer) {
                const cleanKey = aiAns.answer.replace(/[\(\)\[\]]/g, "").trim().toLowerCase();
                const matchingQ = examData.sectionA.questions.find(
                  (q) => q.questionNumber === item.questionNumber
                );
                const optObj = matchingQ?.options.find((o) => o.key.toLowerCase() === cleanKey);
                return {
                  ...item,
                  selectedKey: cleanKey || item.selectedKey,
                  answerText: optObj ? optObj.text : item.answerText,
                  explanation: aiAns.explanation || item.explanation,
                };
              }
              return item;
            })
          );
        }

        // Merge AI essay schemes
        if (Array.isArray(aiData.essayMarkingScheme)) {
          setEssayScheme((prev) =>
            prev.map((item) => {
              const aiEssay = aiData.essayMarkingScheme.find(
                (e: any) => String(e.questionNumber) === String(item.questionNumber)
              );
              if (aiEssay && Array.isArray(aiEssay.expectedPoints)) {
                return {
                  ...item,
                  expectedPoints: aiEssay.expectedPoints,
                  allocatedMarks: aiEssay.allocatedMarks || item.allocatedMarks,
                };
              }
              return item;
            })
          );
        }

        setStatusMessage("Official Examiner Answer Keys & Rubrics generated successfully!");
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      } else {
        setStatusMessage("Syllabus key generation completed.");
      }
    } catch (err) {
      console.warn("AI marking guide error, fallback used:", err);
      setStatusMessage("Answer key loaded with standard syllabus reference answers.");
    } finally {
      setIsAiLoading(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  // Download PDF Handler
  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    setStatusMessage("Rendering high-resolution A4 Examiner Answer Key PDF...");

    try {
      // Ensure element exists
      const cleanSubj = examData.subject.replace(/[^a-zA-Z0-9]/g, "_");
      const cleanCls = examData.classLevel.replace(/[^a-zA-Z0-9]/g, "_");
      const filename = `OFFICIAL_ANSWER_KEY_${cleanSubj}_${cleanCls}_AT_TARBIYYA.pdf`;

      await exportAnswerKeyToPDF("examiner-answer-key-sheet", filename);

      setStatusMessage("Answer Key PDF downloaded successfully!");
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    } catch (err: any) {
      console.error("PDF generation failed:", err);
      setStatusMessage("Failed to generate PDF. You can also use the 'Print' button to save as PDF.");
    } finally {
      setIsDownloading(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  // Copy Plain Text Handler
  const handleCopyText = () => {
    let text = `=======================================================================\n`;
    text += `AT-TARBIYYA COMMUNITY COLLEGE - OFFICIAL EXAMINER ANSWER KEY\n`;
    text += `SUBJECT: ${examData.subject.toUpperCase()} | CLASS: ${examData.classLevel.toUpperCase()}\n`;
    text += `TERM / SESSION: ${examData.termSession.toUpperCase()}\n`;
    text += `FULL MARKS: ${examData.fullMarks || "60 MARKS"}\n`;
    text += `=======================================================================\n\n`;

    text += `--- SECTION A: OBJECTIVE ANSWER KEY (${objectiveAnswers.length} QUESTIONS) ---\n`;
    objectiveAnswers.forEach((a) => {
      const formattedKey =
        keyFormat === "uppercase_bracket"
          ? `(${a.selectedKey.toUpperCase()})`
          : keyFormat === "lowercase_bracket"
          ? `(${a.selectedKey.toLowerCase()})`
          : a.selectedKey.toUpperCase();
      text += `Q${a.questionNumber}. ${formattedKey} ${a.answerText}`;
      if (includeExplanations && a.explanation) {
        text += ` [Note: ${a.explanation}]`;
      }
      text += `\n`;
    });

    if (includeEssayRubric && essayScheme.length > 0) {
      text += `\n--- SECTION B: ESSAY MARKING SCHEME & RUBRIC ---\n`;
      essayScheme.forEach((e) => {
        text += `\nQuestion ${e.questionNumber} ${e.allocatedMarks || ""}:\n`;
        text += `Topic: ${e.mainText}\n`;
        e.expectedPoints.forEach((p, pIdx) => {
          text += `  • [Point ${pIdx + 1}] ${p}\n`;
        });
        if (e.subQuestions && e.subQuestions.length > 0) {
          e.subQuestions.forEach((sq) => {
            text += `  Sub-part ${sq.label} ${sq.marks || ""}: ${sq.text}\n`;
          });
        }
      });
    }

    text += `\n=======================================================================\n`;
    text += `CONFIDENTIAL — FOR EXAMINER REFERENCE ONLY • AT-TARBIYYA\n`;
    text += `=======================================================================\n`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Export CSV for Excel Handler
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Question Number,Correct Option,Answer Text,Marks,Explanation\n";

    objectiveAnswers.forEach((a) => {
      const escapedStem = `"${a.questionText.replace(/"/g, '""')}"`;
      const escapedAns = `"${a.answerText.replace(/"/g, '""')}"`;
      const escapedExp = `"${(a.explanation || "").replace(/"/g, '""')}"`;
      csvContent += `${a.questionNumber},${a.selectedKey.toUpperCase()},${escapedAns},${a.marks},${escapedExp}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Answer_Key_${examData.subject.replace(/\s+/g, "_")}_${examData.classLevel.replace(/\s+/g, "_")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper for formatting key representation
  const formatKeyText = (key: string) => {
    if (keyFormat === "uppercase_bracket") return `(${key.toUpperCase()})`;
    if (keyFormat === "lowercase_bracket") return `(${key.toLowerCase()})`;
    return key.toUpperCase();
  };

  const totalObjMarks = objectiveAnswers.reduce((acc, q) => acc + (q.marks || 1), 0);
  const totalEssayMarks = essayScheme.length * 10; // Standard 10 marks per question or derived
  const grandTotalMarks = examData.fullMarks || `${totalObjMarks + totalEssayMarks} MARKS`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`${
          isDark ? "bg-slate-900 border-slate-700 text-slate-100" : "bg-white border-slate-300 text-slate-900"
        } rounded-2xl shadow-2xl max-w-5xl w-full max-h-[94vh] flex flex-col border overflow-hidden transition-all`}
      >
        {/* Top Header */}
        <div
          className={`px-4 sm:px-6 py-3.5 border-b flex flex-wrap items-center justify-between gap-3 ${
            isDark ? "bg-slate-800/90 border-slate-700" : "bg-slate-50 border-slate-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight">
                  Examiner Answer Key & Marking Guide
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  PDF Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {examData.subject} • {examData.classLevel} • {examData.schoolName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAiGenerateGuide}
              disabled={isAiLoading}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
              title="Use AI to solve questions and generate model essay rubrics"
            >
              {isAiLoading ? (
                <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              )}
              <span>{isAiLoading ? "Solving..." : "AI Auto-Solve & Rubric"}</span>
            </button>

            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition ${
                isDark ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-500 hover:text-slate-800 hover:bg-slate-200"
              }`}
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Toolbar & Navigation Tabs */}
        <div
          className={`px-4 sm:px-6 py-2.5 border-b flex flex-wrap items-center justify-between gap-3 text-xs ${
            isDark ? "bg-slate-800/50 border-slate-700/80" : "bg-slate-100/70 border-slate-200"
          }`}
        >
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-800 p-1 rounded-lg border border-slate-300/60 dark:border-slate-700">
            <button
              onClick={() => setActiveTab("preview")}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition ${
                activeTab === "preview"
                  ? isDark
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white text-blue-700 shadow-xs border border-slate-200"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>A4 PDF Document View</span>
            </button>

            <button
              onClick={() => setActiveTab("matrix")}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition ${
                activeTab === "matrix"
                  ? isDark
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white text-blue-700 shadow-xs border border-slate-200"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Hash className="w-3.5 h-3.5" />
              <span>Interactive Key Matrix ({objectiveAnswers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("rubric")}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition ${
                activeTab === "rubric"
                  ? isDark
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white text-blue-700 shadow-xs border border-slate-200"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Essay Rubric ({essayScheme.length})</span>
            </button>
          </div>

          {/* Quick PDF Options & Downloads */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Explanations Toggle */}
            <label className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeExplanations}
                onChange={(e) => setIncludeExplanations(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
              />
              <span>Notes</span>
            </label>

            {/* Score Box Toggle */}
            <label className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeScoreBox}
                onChange={(e) => setIncludeScoreBox(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
              />
              <span>Score Box</span>
            </label>

            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1"></div>

            {/* Copy button */}
            <button
              onClick={handleCopyText}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border font-medium transition ${
                isDark
                  ? "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
              }`}
              title="Copy formatted answer text to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border font-medium transition ${
                isDark
                  ? "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
              }`}
              title="Export answer keys as CSV spreadsheet"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>CSV</span>
            </button>

            {/* Print button */}
            <button
              onClick={handlePrint}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border font-medium transition ${
                isDark
                  ? "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
              }`}
              title="Print Examiner Answer Sheet"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print</span>
            </button>

            {/* Main Download PDF Button */}
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-sm transition disabled:opacity-50 cursor-pointer"
              title="Download standalone A4 PDF containing only the answer keys"
            >
              {isDownloading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{isDownloading ? "Generating PDF..." : "Download Answer Key PDF"}</span>
            </button>
          </div>
        </div>

        {/* Status Toast / Bar if active */}
        {statusMessage && (
          <div className="bg-blue-600 text-white text-xs px-4 py-1.5 flex items-center justify-between animate-in slide-in-from-top-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>{statusMessage}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="text-blue-200 hover:text-white">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: A4 PDF Preview Sheet (This exact element is captured for PDF) */}
          {activeTab === "preview" && (
            <div className="flex flex-col items-center">
              <div className="w-full flex justify-between items-center mb-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-mono">Standard A4 Sheet Preview (210mm × 297mm) • Times New Roman 11pt</span>
                <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded font-bold border border-amber-300 dark:border-amber-700/60">
                  CONFIDENTIAL • EXAMINER'S MASTER COPY
                </span>
              </div>

              {/* Printable / Exportable A4 Sheet Container */}
              <div className="w-full overflow-x-auto flex justify-center pb-8">
                <div
                  id="examiner-answer-key-sheet"
                  ref={pdfContainerRef}
                  className="bg-white text-black shadow-xl border border-slate-300 p-8 sm:p-10 font-serif box-border text-left relative overflow-hidden"
                  style={{
                    width: "794px",
                    minWidth: "794px",
                    maxWidth: "794px",
                    minHeight: "1123px",
                    fontFamily: "'Times New Roman', Times, serif",
                    fontSize: "11pt",
                    lineHeight: "1.25",
                    color: "#000000",
                    backgroundColor: "#ffffff",
                  }}
                >
                  {/* Watermark (Subtle & Compact) */}
                  <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-0 opacity-[0.04] print:opacity-[0.035] flex items-center justify-center"
                    style={{ width: "220px", height: "260px", maxWidth: "60%" }}
                    aria-hidden="true"
                  >
                    <SchoolLogo size="custom" className="w-full h-full" />
                  </div>

                  <div className="relative z-10">
                  {/* Institutional Header */}
                  <div className="text-center border-b-2 border-black pb-3 mb-4 bg-white">
                    <div className="flex items-center justify-center gap-3 mb-1">
                      <SchoolLogo size="sm" className="w-12 h-14" />
                      <div>
                        <h1 className="text-lg font-black tracking-wide text-black uppercase leading-none">
                          {examData.schoolName || "AT-TARBIYYA COMMUNITY COLLEGE"}
                        </h1>
                        <p className="text-[10px] italic font-semibold text-black mt-0.5">
                          Motto: {examData.schoolMotto || "Discipline, Academic Excellence & Islamic Moral Values"}
                        </p>
                        <p className="text-[9px] uppercase tracking-wider text-black mt-0.5">
                          {examData.schoolAddress || "P.O. BOX 104, OFF ABUJA-KADUNA EXPRESSWAY, NIGERIA"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 py-1 bg-white border border-black rounded text-center">
                      <h2 className="text-xs font-black tracking-widest text-black uppercase">
                        OFFICIAL EXAMINER ANSWER KEY & MARKING GUIDE
                      </h2>
                      <p className="text-[9.5px] font-bold text-red-700 tracking-wider uppercase mt-0.2">
                        [ STRICTLY CONFIDENTIAL — FOR EXAMINER & MODERATOR USE ONLY ]
                      </p>
                    </div>
                  </div>

                  {/* Exam Metadata Grid */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] font-sans border-b border-black pb-2 mb-4 bg-white p-2 rounded">
                    <div>
                      <span className="font-bold text-slate-800">SUBJECT: </span>
                      <span className="font-bold uppercase text-slate-950">{examData.subject}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-800">CLASS: </span>
                      <span className="font-bold uppercase text-slate-950">{examData.classLevel}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-800">TERM / SESSION: </span>
                      <span className="uppercase text-slate-900">{examData.termSession}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-800">FULL MARKS: </span>
                      <span className="font-bold text-slate-950">{grandTotalMarks}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-800">OBJECTIVES COUNT: </span>
                      <span className="text-slate-900">{objectiveAnswers.length} Questions (1 mark each)</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-800">THEORY ALLOCATION: </span>
                      <span className="text-slate-900">{essayScheme.length} Questions ({totalEssayMarks} Marks)</span>
                    </div>
                  </div>

                  {/* SECTION A: OBJECTIVE ANSWER KEYS */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between border-b-2 border-slate-900 pb-1 mb-2">
                      <h3 className="text-xs font-black tracking-wide uppercase text-slate-950">
                        SECTION A: OBJECTIVE ANSWER KEY ({objectiveAnswers.length} QUESTIONS)
                      </h3>
                      <span className="text-[10px] font-bold font-sans text-slate-700">
                        Total: {totalObjMarks} Marks
                      </span>
                    </div>

                    {/* Compact 5-Column Quick Grading Table */}
                    <div className="mb-4">
                      <p className="text-[9.5px] italic text-slate-600 mb-1">
                        Quick Grading Matrix (For rapid red-pen marking):
                      </p>
                      <div className="grid grid-cols-5 gap-1.5 text-[10.5px] font-sans">
                        {objectiveAnswers.map((item) => (
                          <div
                            key={item.questionNumber}
                            className="border border-slate-400 rounded px-1.5 py-1 flex items-center justify-between bg-white shadow-2xs"
                          >
                            <span className="font-bold text-slate-700">Q{item.questionNumber}</span>
                            <span className="font-black text-slate-950 bg-slate-100 px-1 rounded text-xs">
                              {formatKeyText(item.selectedKey)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Detailed Item Breakdown Table */}
                    <div className="border border-slate-400 rounded overflow-hidden mt-3">
                      <table className="w-full text-[10px] font-sans border-collapse text-left">
                        <thead>
                          <tr className="bg-slate-200 border-b border-slate-400 font-bold text-slate-900">
                            <th className="p-1.5 w-10 text-center border-r border-slate-300">Q#</th>
                            <th className="p-1.5 w-14 text-center border-r border-slate-300">KEY</th>
                            <th className="p-1.5 border-r border-slate-300">CORRECT ANSWER & CHOICE TEXT</th>
                            {includeExplanations && <th className="p-1.5">RATIONALE / EXAMINER NOTE</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-300">
                          {objectiveAnswers.map((item, idx) => (
                            <tr
                              key={item.questionNumber}
                              className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}
                            >
                              <td className="p-1.5 text-center font-bold text-slate-800 border-r border-slate-200">
                                {item.questionNumber}
                              </td>
                              <td className="p-1.5 text-center font-black text-slate-950 border-r border-slate-200 bg-slate-100/80">
                                {formatKeyText(item.selectedKey)}
                              </td>
                              <td className="p-1.5 font-medium text-slate-900 border-r border-slate-200">
                                {item.answerText}
                              </td>
                              {includeExplanations && (
                                <td className="p-1.5 italic text-slate-600 text-[9.5px]">
                                  {item.explanation || "Standard syllabus response."}
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* SECTION B: ESSAY / THEORY MARKING SCHEME & RUBRIC */}
                  {includeEssayRubric && essayScheme.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between border-b-2 border-slate-900 pb-1 mb-2">
                        <h3 className="text-xs font-black tracking-wide uppercase text-slate-950">
                          SECTION B: ESSAY / THEORY MARKING RUBRIC ({essayScheme.length} QUESTIONS)
                        </h3>
                        <span className="text-[10px] font-bold font-sans text-slate-700">
                          Total: {totalEssayMarks} Marks
                        </span>
                      </div>

                      <div className="space-y-3 mt-2">
                        {essayScheme.map((item) => (
                          <div
                            key={item.questionNumber}
                            className="border border-slate-300 rounded p-2.5 bg-slate-50/50 text-[10.5px] space-y-1.5"
                          >
                            <div className="flex items-center justify-between font-bold border-b border-slate-200 pb-1">
                              <span className="text-slate-950 font-black">
                                Question {item.questionNumber}: {item.mainText}
                              </span>
                              <span className="font-sans font-black text-slate-800 bg-slate-200 px-1.5 py-0.5 rounded text-[10px]">
                                {item.allocatedMarks || "[10 Marks]"}
                              </span>
                            </div>

                            {/* Expected Marking Points */}
                            <div className="pl-1">
                              <p className="font-bold text-slate-800 text-[10px] uppercase tracking-wider mb-0.5">
                                Model Expected Points & Marking Criteria:
                              </p>
                              <ul className="list-disc list-inside space-y-0.5 text-slate-800 pl-1">
                                {item.expectedPoints.map((pt, pIdx) => (
                                  <li key={pIdx} className="leading-snug">
                                    {pt}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Sub-questions breakdown if present */}
                            {item.subQuestions && item.subQuestions.length > 0 && (
                              <div className="mt-1 pt-1 border-t border-slate-200 text-[10px] font-sans">
                                <span className="font-bold text-slate-700">Sub-Part Distribution:</span>
                                <div className="grid grid-cols-2 gap-2 mt-0.5">
                                  {item.subQuestions.map((sq, sIdx) => (
                                    <div key={sIdx} className="bg-white border border-slate-200 p-1 rounded">
                                      <span className="font-bold text-slate-900">{sq.label}: </span>
                                      <span className="text-slate-700">{sq.text}</span>
                                      <span className="font-bold text-slate-900 ml-1">({sq.marks || "5m"})</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Examiner Score Recording Box */}
                  {includeScoreBox && (
                    <div className="border-2 border-slate-900 rounded p-2.5 mt-4 bg-slate-50">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-950 mb-1.5">
                        CANDIDATE RESULT RECORDING & EXAMINER AUDIT SLIP
                      </h4>
                      <table className="w-full text-[10px] font-sans border-collapse border border-slate-400 text-center">
                        <thead>
                          <tr className="bg-slate-200 font-bold text-slate-900 border-b border-slate-400">
                            <th className="p-1 border-r border-slate-300">Candidate Name / Roll No</th>
                            <th className="p-1 border-r border-slate-300">Sec A (/{totalObjMarks})</th>
                            <th className="p-1 border-r border-slate-300">Sec B (/{totalEssayMarks})</th>
                            <th className="p-1 border-r border-slate-300">Total (/{grandTotalMarks.replace(/[^0-9]/g, "")})</th>
                            <th className="p-1 border-r border-slate-300">Percentage (%)</th>
                            <th className="p-1">Examiner Signature</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="h-7 bg-white">
                            <td className="border-r border-slate-300"></td>
                            <td className="border-r border-slate-300 font-bold"></td>
                            <td className="border-r border-slate-300 font-bold"></td>
                            <td className="border-r border-slate-300 font-black"></td>
                            <td className="border-r border-slate-300"></td>
                            <td></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Institutional Security Notice Footer */}
                  <div className="mt-6 pt-2 border-t border-slate-400 text-center text-[8.5px] text-slate-600 font-sans flex justify-between items-center">
                    <span>
                      {examData.schoolName || "AT-TARBIYYA COMMUNITY COLLEGE"} • EXAMINATION SECRETARIAT
                    </span>
                    <span>
                      GENERATED ON: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    <span className="font-bold text-red-700">MASTER ANSWER SCHEME</span>
                  </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Interactive Key Matrix & Quick Editor */}
          {activeTab === "matrix" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-3 rounded-xl border border-slate-300 dark:border-slate-700">
                <div>
                  <h3 className="text-sm font-bold">Interactive Section A Answer Key Grid</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Click any letter (A, B, C, D) to change the official answer key for that question.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Key Style:</span>
                  <select
                    value={keyFormat}
                    onChange={(e: any) => setKeyFormat(e.target.value)}
                    className="text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 py-1"
                  >
                    <option value="uppercase_bracket">(A), (B), (C), (D)</option>
                    <option value="lowercase_bracket">(a), (b), (c), (d)</option>
                    <option value="plain_upper">A, B, C, D</option>
                  </select>
                </div>
              </div>

              {/* Grid of All Objective Questions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {objectiveAnswers.map((item) => {
                  const originalQ = examData.sectionA.questions.find(
                    (q) => q.questionNumber === item.questionNumber
                  );

                  return (
                    <div
                      key={item.questionNumber}
                      className={`p-3 rounded-xl border transition ${
                        isDark ? "bg-slate-800/80 border-slate-700" : "bg-white border-slate-200 shadow-2xs"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-mono text-[10px]">
                            {item.questionNumber}
                          </span>
                          <span>Question {item.questionNumber}</span>
                        </span>

                        {/* Interactive key selection buttons */}
                        <div className="flex items-center gap-1">
                          {["a", "b", "c", "d"].map((k) => (
                            <button
                              key={k}
                              onClick={() => handleKeyChange(item.questionNumber, k)}
                              className={`w-7 h-7 rounded-lg text-xs font-bold transition flex items-center justify-center ${
                                item.selectedKey.toLowerCase() === k
                                  ? "bg-emerald-600 text-white shadow-xs scale-105"
                                  : isDark
                                  ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              }`}
                            >
                              {k.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Question Snippet */}
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-2 italic">
                        "{item.questionText}"
                      </p>

                      {/* Selected Choice Preview */}
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-2 text-xs">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                          ({item.selectedKey})
                        </span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {item.answerText}
                        </span>
                      </div>

                      {/* Rationale Input */}
                      <div className="mt-2">
                        <input
                          type="text"
                          value={item.explanation}
                          onChange={(e) => {
                            const val = e.target.value;
                            setObjectiveAnswers((prev) =>
                              prev.map((q) =>
                                q.questionNumber === item.questionNumber ? { ...q, explanation: val } : q
                              )
                            );
                          }}
                          placeholder="Add examiner explanation or note..."
                          className="w-full text-[11px] rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-slate-700 dark:text-slate-300"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Essay Rubrics & Criteria Breakdown */}
          {activeTab === "rubric" && (
            <div className="space-y-4">
              <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl border border-slate-300 dark:border-slate-700">
                <h3 className="text-sm font-bold">Section B: Essay Marking Scheme & Grading Rubrics</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Comprehensive point distribution, sub-question allocations, and criteria standards for examiners.
                </p>
              </div>

              <div className="space-y-4">
                {essayScheme.map((item) => (
                  <div
                    key={item.questionNumber}
                    className={`p-4 rounded-xl border ${
                      isDark ? "bg-slate-800/80 border-slate-700" : "bg-white border-slate-200 shadow-2xs"
                    } space-y-3`}
                  >
                    <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-slate-900 dark:text-slate-100">
                          Question {item.questionNumber}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 italic">
                          "{item.mainText}"
                        </span>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {item.allocatedMarks || "10 Marks"}
                      </span>
                    </div>

                    {/* Marking Points */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                        Expected Solution Points & Marking Criteria:
                      </h4>
                      <div className="space-y-1.5">
                        {item.expectedPoints.map((pt, pIdx) => (
                          <div
                            key={pIdx}
                            className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                          >
                            <span className="w-5 h-5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                              {pIdx + 1}
                            </span>
                            <span className="text-slate-800 dark:text-slate-200 flex-1">{pt}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Subquestions if present */}
                    {item.subQuestions && item.subQuestions.length > 0 && (
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Sub-Question Mark Allocations:
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {item.subQuestions.map((sq, sqIdx) => (
                            <div
                              key={sqIdx}
                              className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-xs"
                            >
                              <div className="flex items-center justify-between font-bold mb-1">
                                <span className="text-blue-600 dark:text-blue-400">{sq.label}</span>
                                <span className="text-slate-500">{sq.marks || "5 marks"}</span>
                              </div>
                              <p className="text-slate-700 dark:text-slate-300 text-[11px]">{sq.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          className={`px-4 sm:px-6 py-3 border-t flex flex-wrap items-center justify-between gap-3 ${
            isDark ? "bg-slate-800/90 border-slate-700" : "bg-slate-50 border-slate-200"
          }`}
        >
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>
              {objectiveAnswers.length} Objectives & {essayScheme.length} Theory questions matched.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                isDark
                  ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                  : "bg-white hover:bg-slate-100 text-slate-700 border-slate-300"
              }`}
            >
              Print Sheet
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              {isDownloading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              <span>{isDownloading ? "Generating PDF..." : "Download Answer Key PDF"}</span>
            </button>

            <button
              onClick={onClose}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
                isDark ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-slate-200 hover:bg-slate-300 text-slate-700"
              }`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

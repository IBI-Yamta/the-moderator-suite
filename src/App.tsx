import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Toolbar } from "./components/Toolbar";
import { ExamPaper } from "./components/ExamPaper";
import { LandingPage } from "./components/LandingPage";
import { PasteInputModal } from "./components/PasteInputModal";
import { CorrectorAuditModal } from "./components/CorrectorAuditModal";
import { MarkingSchemeModal } from "./components/MarkingSchemeModal";
import { SchoolInfoModal } from "./components/SchoolInfoModal";
import { QuestionEditModal } from "./components/QuestionEditModal";
import { ImageOcrModal } from "./components/ImageOcrModal";
import { ExamData, AuditReport, ObjectiveQuestion, EssayQuestion } from "./types";
import { INITIAL_EXAM_DATA, AT_TARBIYYA_GOVERNMENT_RAW } from "./utils/sampleData";
import { parseAndModerateExam, proofreadExamInPlace, serializeExamToText, cleanOptionText } from "./utils/parser";
import { exportExamToPDF, printExamPaper } from "./utils/pdfExport";
import confetti from "canvas-confetti";
import { CheckCircle2, AlertCircle, Sparkles, FileText, Download } from "lucide-react";

export default function App() {
  const [currentView, setCurrentView] = useState<"landing" | "workspace">("landing");
  const [examData, setExamData] = useState<ExamData>(INITIAL_EXAM_DATA);
  const [auditReport, setAuditReport] = useState<AuditReport>({
    timestamp: new Date().toLocaleTimeString(),
    totalQuestions: 36,
    sectionACount: 30,
    sectionBCount: 6,
    totalCalculatedMarks: 70,
    corrections: [
      {
        type: "abbreviation",
        original: "gov",
        corrected: "GOVERNMENT",
        description: "Expanded subject abbreviation 'gov' to 'GOVERNMENT'",
      },
      {
        type: "abbreviation",
        original: "s.s.s 2",
        corrected: "SSS 2",
        description: "Standardized class level 's.s.s 2' to 'SSS 2'",
      },
      {
        type: "option_fix",
        original: "called the(A)candidates B returning officers(C)civil servants d ) electorate",
        corrected: "(a) candidates (b) returning officers (c) civil servants (d) electorate",
        description: "Fixed merged delimiters and linearized options to standard (a), (b), (c), (d)",
      },
      {
        type: "formatting",
        original: "Default styling",
        corrected: "Times New Roman 12pt (1.15 line-spacing)",
        description: "Applied Times New Roman 12pt and 1.15 line spacing",
      },
      {
        type: "formatting",
        original: "Section Headers",
        corrected: "Italicized Section A, Section B, and instructions",
        description: "Italicized Section titles, exam instructions, and notice",
      },
    ],
    qualityScore: 99,
    examinerComments: "Exam paper formatted cleanly to At-Tarbiyya Community College standards.",
  });

  // Modal states
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isMarkingModalOpen, setIsMarkingModalOpen] = useState(false);
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<ObjectiveQuestion | null>(null);

  // Zoom & UI state
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));
  const [zoom, setZoom] = useState(1.0);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarInputText, setSidebarInputText] = useState("");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Deterministic rule-based auto-fix and format
  const handleParseText = (rawText: string, customConfig?: { subject?: string; classLevel?: string; timeAllowed?: string; fullMarks?: string }) => {
    const baseData: ExamData = {
      ...examData,
      ...(customConfig?.subject ? { subject: customConfig.subject } : {}),
      ...(customConfig?.classLevel ? { classLevel: customConfig.classLevel } : {}),
      ...(customConfig?.timeAllowed ? { timeAllowed: customConfig.timeAllowed } : {}),
      ...(customConfig?.fullMarks ? { fullMarks: customConfig.fullMarks } : {}),
    };
    const { exam, audit } = parseAndModerateExam(rawText, baseData);
    setExamData(exam);
    setAuditReport(audit);
    showToast(`Moderated & Formatted ${audit.totalQuestions} questions with ${audit.corrections.length} auto-corrections!`);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
  };

  // Image OCR Apply handler
  const handleApplyImageExam = (exam: ExamData, rawText: string) => {
    setExamData(exam);
    const totalQ = (exam.sectionA.questions.length || 0) + (exam.sectionB.questions.length || 0);
    setAuditReport({
      timestamp: new Date().toLocaleTimeString(),
      totalQuestions: totalQ,
      sectionACount: exam.sectionA.questions.length,
      sectionBCount: exam.sectionB.questions.length,
      totalCalculatedMarks: parseInt(exam.fullMarks) || 60,
      corrections: [
        {
          type: "formatting",
          original: "Handwritten/Photographed Image Sheet",
          corrected: "Standard Times New Roman 12pt Exam Paper",
          description: "OCR Vision extracted handwritten and printed questions, standardized options to (a)-(d), and formatted to 1.15 line spacing.",
        },
      ],
      qualityScore: 99,
      examinerComments: `Successfully converted ${totalQ} questions from image to standard WAEC/NECO paper.`,
    });
    setCurrentView("workspace");
    showToast(`Transcribed & Loaded ${totalQ} questions from image paper!`);
    confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
  };

  // Launch from Landing Page
  const handleProcessAndLaunch = async (
    rawText: string,
    customConfig?: Partial<ExamData>,
    useAi?: boolean
  ) => {
    const updatedBase: ExamData = {
      ...examData,
      ...(customConfig || {}),
    };
    setExamData(updatedBase);

    if (useAi) {
      setCurrentView("workspace");
      await handleAiModerate(rawText);
    } else {
      const { exam, audit } = parseAndModerateExam(rawText, updatedBase);
      setExamData(exam);
      setAuditReport(audit);
      setCurrentView("workspace");
      showToast(`Exam loaded with ${audit.totalQuestions} questions & ${audit.corrections.length} auto-corrections!`);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    }
  };

  // AI-powered deep moderation with Gemini 3.7
  const handleAiModerate = async (rawTextToModerate?: string) => {
    setIsAiLoading(true);
    showToast("Chief Examiner AI is proofreading spellings, grammar & options...");
    try {
      const textPayload = typeof rawTextToModerate === "string" && rawTextToModerate.trim() 
        ? rawTextToModerate.trim() 
        : serializeExamToText(examData);

      const res = await fetch("/api/ai/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText: textPayload,
          currentExam: examData,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        const aiResult = data.data;
        const updatedExam: ExamData = {
          ...examData,
          schoolName: aiResult.schoolName || examData.schoolName,
          schoolAddress: aiResult.schoolAddress || examData.schoolAddress,
          termSession: aiResult.termSession || examData.termSession,
          subject: aiResult.subject || examData.subject,
          classLevel: aiResult.classLevel || examData.classLevel,
          timeAllowed: aiResult.timeAllowed || examData.timeAllowed,
          fullMarks: aiResult.fullMarks || examData.fullMarks,
          sectionA: {
            title: aiResult.sectionA?.title || examData.sectionA.title,
            instruction: aiResult.sectionA?.instruction || examData.sectionA.instruction,
            questions: (aiResult.sectionA?.questions || []).map((q: any, i: number) => ({
              id: q.id || i + 1,
              questionNumber: q.questionNumber || i + 1,
              questionText: q.questionText,
              options: (q.options || []).map((opt: any) => ({
                key: (opt.key || "a").toLowerCase(),
                text: cleanOptionText(opt.text || ""),
              })),
              correctAnswer: q.correctAnswer,
            })),
          },
          sectionB: {
            title: aiResult.sectionB?.title || examData.sectionB.title,
            instruction: aiResult.sectionB?.instruction || examData.sectionB.instruction,
            questions: aiResult.sectionB?.questions || examData.sectionB.questions,
          },
        };

        const newCorrections = (aiResult.moderationSummary?.correctionsMade || []).map((c: string) => ({
          type: "typo" as const,
          original: "Raw draft",
          corrected: c,
          description: c,
        }));

        setExamData(updatedExam);
        setAuditReport({
          timestamp: new Date().toLocaleTimeString(),
          totalQuestions: (updatedExam.sectionA.questions.length || 0) + (updatedExam.sectionB.questions.length || 0),
          sectionACount: updatedExam.sectionA.questions.length,
          sectionBCount: updatedExam.sectionB.questions.length,
          totalCalculatedMarks: parseInt(updatedExam.fullMarks) || 60,
          corrections: [...auditReport.corrections, ...newCorrections],
          qualityScore: aiResult.moderationSummary?.qualityScore || 99,
          examinerComments: aiResult.moderationSummary?.examinerComments || "AI Academic spellcheck and sentence proofreading complete.",
        });

        setIsPasteModalOpen(false);
        showToast("AI Proofreading complete! Spelling & sentences auto-corrected.");
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      } else {
        // Fallback: use deterministic in-place proofreader on existing exam or user text
        if (typeof rawTextToModerate === "string" && rawTextToModerate.trim()) {
          handleParseText(rawTextToModerate);
        } else {
          const { exam, audit } = proofreadExamInPlace(examData);
          setExamData(exam);
          setAuditReport({
            ...audit,
            corrections: [...auditReport.corrections, ...audit.corrections],
          });
          showToast(`Proofread complete: ${audit.corrections.length} spelling & grammar improvements applied!`);
        }
      }
    } catch (err: any) {
      console.warn("AI moderation fallback:", err);
      if (typeof rawTextToModerate === "string" && rawTextToModerate.trim()) {
        handleParseText(rawTextToModerate);
      } else {
        const { exam, audit } = proofreadExamInPlace(examData);
        setExamData(exam);
        setAuditReport({
          ...audit,
          corrections: [...auditReport.corrections, ...audit.corrections],
        });
        showToast(`Proofread complete: ${audit.corrections.length} spelling & grammar improvements applied!`);
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  // PDF Export
  const handleDownloadPDF = async () => {
    setIsExportingPDF(true);
    showToast("Generating crisp Examination PDF...");
    try {
      const cleanSub = examData.subject.replace(/[^a-zA-Z0-9]/g, "_");
      const cleanClass = examData.classLevel.replace(/[^a-zA-Z0-9]/g, "_");
      const filename = `The_Moderator_AT_TARBIYYA_${cleanSub}_${cleanClass}.pdf`;
      await exportExamToPDF("exam-paper-printable", filename);
      showToast("PDF Downloaded successfully!");
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch (e: any) {
      console.error("PDF Export error:", e);
      showToast("PDF generation in progress, invoking print dialog fallback...");
      printExamPaper();
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handlePrint = () => {
    printExamPaper();
  };

  const handleUpdateExamData = (updated: Partial<ExamData>) => {
    setExamData((prev) => ({ ...prev, ...updated }));
  };

  const handleSaveQuestion = (updated: ObjectiveQuestion) => {
    setExamData((prev) => ({
      ...prev,
      sectionA: {
        ...prev.sectionA,
        questions: prev.sectionA.questions.map((q) => (q.id === updated.id ? updated : q)),
      },
    }));
    showToast(`Updated Question ${updated.questionNumber}!`);
  };

  const totalQuestions = examData.sectionA.questions.length + examData.sectionB.questions.length;

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-[#f0f2f5] text-slate-800"} flex flex-col font-sans selection:bg-blue-600 selection:text-white transition-colors duration-200`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1e293b] text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700 flex items-center space-x-2 animate-in slide-in-from-bottom-5 duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {currentView === "landing" ? (
        <LandingPage
          onProcessAndLaunch={handleProcessAndLaunch}
          onOpenImageModal={() => setIsImageModalOpen(true)}
          isAiLoading={isAiLoading}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      ) : (
        <>
          {/* Top Navigation Bar */}
          <Navbar
            onOpenPasteModal={() => setIsPasteModalOpen(true)}
            onOpenImageModal={() => setIsImageModalOpen(true)}
            onOpenAuditModal={() => setIsAuditModalOpen(true)}
            onOpenMarkingModal={() => setIsMarkingModalOpen(true)}
            onOpenSchoolModal={() => setIsSchoolModalOpen(true)}
            onDownloadPDF={handleDownloadPDF}
            onPrint={handlePrint}
            onAiModerate={() => handleAiModerate()}
            isAiLoading={isAiLoading}
            correctionCount={auditReport.corrections.length}
            subject={examData.subject}
            classLevel={examData.classLevel}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            onBackToLanding={() => setCurrentView("landing")}
            theme={theme}
            onToggleTheme={toggleTheme}
          />

          {/* Secondary Controls Toolbar */}
          <Toolbar
            examData={examData}
            onUpdateExamData={handleUpdateExamData}
            zoom={zoom}
            onZoomChange={setZoom}
            totalQuestions={totalQuestions}
            totalMarks={examData.fullMarks}
            theme={theme}
          />

          {/* Main Workspace Stage */}
          <main className="flex-1 flex overflow-hidden relative">
            {/* Optional Quick Editor Sidebar */}
            {isSidebarOpen && (
              <aside className={`w-[380px] ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} border-r p-5 flex flex-col gap-4 overflow-y-auto shrink-0 shadow-sm transition-all duration-200 no-print`}>
                <div className={`flex items-center justify-between pb-2 border-b ${theme === "dark" ? "border-slate-800" : "border-slate-100"}`}>
                  <div>
                    <h3 className={`text-xs font-bold uppercase tracking-wider ${theme === "dark" ? "text-slate-200" : "text-slate-800"}`}>Quick Raw Input</h3>
                    <p className="text-[11px] text-slate-400">Paste unformatted questions directly</p>
                  </div>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="text-xs text-slate-400 hover:text-slate-600 px-1.5 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    ✕
                  </button>
                </div>

                <textarea
                  value={sidebarInputText}
                  onChange={(e) => setSidebarInputText(e.target.value)}
                  className={`w-full h-64 p-3 ${theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-800"} border rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none leading-relaxed`}
                  placeholder="Paste exam questions here..."
                />

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleParseText(sidebarInputText)}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Auto-Fix & Format
                  </button>
                  <button
                    onClick={() => handleAiModerate(sidebarInputText)}
                    disabled={isAiLoading}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    AI Chief Moderator
                  </button>
                </div>

                {/* Quick Metrics */}
                <div className={`mt-auto p-3 ${theme === "dark" ? "bg-slate-800/80 border-slate-700" : "bg-slate-50 border-slate-200"} rounded-lg border text-xs space-y-1`}>
                  <div className={`flex justify-between ${theme === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                    <span>Quality Score:</span>
                    <span className="font-bold text-emerald-500">{auditReport.qualityScore}%</span>
                  </div>
                  <div className={`flex justify-between ${theme === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                    <span>Auto-Corrections:</span>
                    <span className="font-bold text-blue-500">{auditReport.corrections.length} Applied</span>
                  </div>
                </div>
              </aside>
            )}

            {/* Paper Preview Canvas Area */}
            <section className={`flex-1 ${theme === "dark" ? "bg-slate-950" : "bg-[#f0f2f5]"} p-4 sm:p-8 overflow-auto flex flex-col items-center transition-colors duration-200`}>
              {/* Live Preview Indicator Header */}
              <div className="w-full max-w-[210mm] flex justify-between items-center mb-4 text-xs font-medium text-slate-500 px-1 no-print">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  A4 Live Preview — Times New Roman {examData.fontSize} ({examData.lineSpacing} Line Spacing)
                </span>
                <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                  At-Tarbiyya Community College Standard
                </span>
              </div>

              <div
                className="transition-transform duration-150 origin-top shadow-2xl rounded-xs mb-12"
                style={{ transform: `scale(${zoom})` }}
              >
                <ExamPaper
                  examData={examData}
                  onEditQuestion={(q) => setEditingQuestion(q)}
                />
              </div>
            </section>
          </main>

          {/* Floating Action Bar on Mobile/Tablet */}
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-2 bg-[#1e293b]/95 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700 shadow-2xl lg:hidden no-print">
            <button
              onClick={() => setIsPasteModalOpen(true)}
              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-600 text-white shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 mr-1" />
              Paste
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isExportingPDF}
              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-600 text-white shadow-sm"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              PDF
            </button>
          </div>

          {/* Modals */}
          <PasteInputModal
            isOpen={isPasteModalOpen}
            onClose={() => setIsPasteModalOpen(false)}
            onParseText={handleParseText}
            onAiModerateText={(txt) => handleAiModerate(txt)}
            isAiLoading={isAiLoading}
          />

          <CorrectorAuditModal
            isOpen={isAuditModalOpen}
            onClose={() => setIsAuditModalOpen(false)}
            audit={auditReport}
            subject={examData.subject}
            classLevel={examData.classLevel}
          />

          <MarkingSchemeModal
            isOpen={isMarkingModalOpen}
            onClose={() => setIsMarkingModalOpen(false)}
            examData={examData}
          />

          <SchoolInfoModal
            isOpen={isSchoolModalOpen}
            onClose={() => setIsSchoolModalOpen(false)}
            examData={examData}
            onSave={handleUpdateExamData}
          />

          <QuestionEditModal
            isOpen={Boolean(editingQuestion)}
            onClose={() => setEditingQuestion(null)}
            question={editingQuestion}
            onSave={handleSaveQuestion}
          />
        </>
      )}

      {/* OCR Question Image Import Modal (accessible globally) */}
      <ImageOcrModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onApplyExam={handleApplyImageExam}
        initialSubject={examData.subject}
        initialClassLevel={examData.classLevel}
        theme={theme}
      />
    </div>
  );
}

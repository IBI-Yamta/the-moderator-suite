import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Camera,
  UploadCloud,
  Sparkles,
  Image as ImageIcon,
  Trash2,
  FileText,
  CheckCircle2,
  AlertCircle,
  Eye,
  Plus,
  RefreshCw,
  Zap,
} from "lucide-react";
import { ExamData } from "../types";
import { getSampleQuestionImages, SampleQuestionImage } from "../utils/sampleImageData";

export interface ImageFileItem {
  id: string;
  name: string;
  size: number;
  dataUrl: string;
  mimeType: string;
}

interface ImageOcrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyExam: (exam: ExamData, rawText: string) => void;
  onAppendQuestions?: (newQuestionsA: any[], newQuestionsB: any[]) => void;
  currentExam?: ExamData;
  theme?: "light" | "dark";
}

function cleanErrorMessage(raw: any): string {
  if (!raw) return "An unexpected error occurred. Please try again.";
  const msg = typeof raw === "string" ? raw : raw?.message || JSON.stringify(raw);
  try {
    const parsed = JSON.parse(msg);
    if (parsed.error?.message) return parsed.error.message;
    if (parsed.message) return parsed.message;
  } catch {}
  return msg;
}

export const ImageOcrModal: React.FC<ImageOcrModalProps> = ({
  isOpen,
  onClose,
  onApplyExam,
  onAppendQuestions,
  currentExam,
  theme = "light",
}) => {
  const [images, setImages] = useState<ImageFileItem[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ocrStatus, setOcrStatus] = useState<string>("");
  const [extractedRawText, setExtractedRawText] = useState<string>("");
  const [extractedExam, setExtractedExam] = useState<ExamData | null>(null);
  const [ocrReport, setOcrReport] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"upload" | "preview">("upload");

  // Optional custom configuration hints
  const [customSubject, setCustomSubject] = useState(currentExam?.subject || "");
  const [customClass, setCustomClass] = useState(currentExam?.classLevel || "");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Load sample visual options
  const sampleImages = getSampleQuestionImages();

  // Listen to clipboard paste (Ctrl+V / Cmd+V)
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.items) {
        const items = Array.from(e.clipboardData.items);
        for (const item of items) {
          if (item.type.startsWith("image/")) {
            const file = item.getAsFile();
            if (file) {
              addFile(file);
            }
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [isOpen]);

  if (!isOpen) return null;

  const addFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (JPEG, PNG, WEBP, HEIC, GIF).");
      return;
    }

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setImages((prev) => [
          ...prev,
          {
            id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            name: file.name || `Question_Photo_${prev.length + 1}.jpg`,
            size: file.size,
            dataUrl,
            mimeType: file.type || "image/jpeg",
          },
        ]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(addFile);
    }
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    if (previewImage) setPreviewImage(null);
  };

  const handleSelectSample = (sample: SampleQuestionImage) => {
    setErrorMessage(null);
    setImages([
      {
        id: `sample_${sample.id}`,
        name: `${sample.title}.jpg`,
        size: 150000,
        dataUrl: sample.dataUrl,
        mimeType: "image/jpeg",
      },
    ]);
    setCustomSubject(sample.subject);
    setCustomClass(sample.classLevel);
  };

  // Perform AI OCR and Exam Conversion
  const handleExtractAndConvert = async () => {
    if (images.length === 0) {
      setErrorMessage("Please upload or capture at least one question image.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setOcrStatus("Transcribing handwritten & printed question text with Gemini 3.7 Vision...");

    try {
      const payload = {
        images: images.map((img) => ({
          base64: img.dataUrl,
          mimeType: img.mimeType,
        })),
        customConfig: {
          subject: customSubject.trim() || undefined,
          classLevel: customClass.trim() || undefined,
        },
      };

      const res = await fetch("/api/ai/ocr-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.data) {
        throw new Error(data.error || "Failed to transcribe questions from image.");
      }

      const result = data.data;

      // Construct standard ExamData object
      const formattedExam: ExamData = {
        schoolName: result.schoolName || "AT-TARBIYYA COMMUNITY COLLEGE",
        schoolMotto: "Knowledge, Discipline and Moral Excellence",
        schoolAddress: result.schoolAddress || "P.O. BOX 104, OFF ROADS, NIGERIA",
        contactInfo: "",
        termSession: result.termSession || "FIRST TERM EXAMINATION 2025/2026 SESSION",
        subject: result.subject || customSubject || "GENERAL SUBJECT",
        classLevel: result.classLevel || customClass || "SSS 1",
        timeAllowed: result.timeAllowed || "1 HOUR 30 MINS",
        fullMarks: result.fullMarks || "60 MARKS",
        sectionA: {
          title: result.sectionA?.title || "SECTION A: OBJECTIVE QUESTIONS [30 MARKS]",
          instruction:
            result.sectionA?.instruction ||
            "Instruction: Answer all questions in this section by selecting the most appropriate option.",
          marks: result.sectionA?.marks || "30 MARKS",
          questions: (result.sectionA?.questions || []).map((q: any, idx: number) => ({
            id: q.id || idx + 1,
            questionNumber: q.questionNumber || idx + 1,
            questionText: q.questionText,
            options: (q.options || []).map((opt: any) => ({
              key: (opt.key || "a").toLowerCase(),
              text: opt.text || "",
            })),
            correctAnswer: q.correctAnswer,
          })),
        },
        sectionB: {
          title: result.sectionB?.title || "SECTION B: ESSAY QUESTIONS [30 MARKS]",
          instruction:
            result.sectionB?.instruction ||
            "Instruction: Answer any THREE (3) questions in this section. Each question carries equal marks.",
          marks: result.sectionB?.marks || "30 MARKS",
          questions: (result.sectionB?.questions || []).map((q: any, idx: number) => ({
            questionNumber: String(q.questionNumber || idx + 1),
            text: q.text || "",
            marks: q.marks || "[10 marks]",
            subQuestions: q.subQuestions || [],
          })),
        },
        footerNotice: "DO NOT WRITE ON THIS QUESTION PAPER",
        optionsStyle: "(a), (b), (c), (d)",
        layoutColumns: 1,
        fontSize: "12pt",
        lineSpacing: "1.15",
        fontFamily: "Times New Roman",
        optionsLinear: true,
      };

      setExtractedExam(formattedExam);
      setExtractedRawText(result.rawExtractedText || "");
      setOcrReport(result.ocrReport || null);
      setActiveTab("preview");
    } catch (err: any) {
      console.error("Image OCR Error:", err);
      const friendly = cleanErrorMessage(err?.message || err);
      setErrorMessage(
        friendly || "Failed to process image questions. Please ensure the photo is clear and try again."
      );
    } finally {
      setIsLoading(false);
      setOcrStatus("");
    }
  };

  const handleConfirmApply = () => {
    if (extractedExam) {
      onApplyExam(extractedExam, extractedRawText);
      onClose();
    }
  };

  const isDark = theme === "dark";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`${
          isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
        } rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border overflow-hidden transition-colors duration-200`}
      >
        {/* Modal Header */}
        <div
          className={`px-6 py-4 border-b ${
            isDark ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200"
          } flex items-center justify-between`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600 shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">Import Question Images & Photos</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                  AI OCR Vision
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Convert handwritten notebooks, photographed chalkboard questions, or printed test sheets into standardized WAEC/NECO format.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs (Upload / Preview) */}
        {extractedExam && (
          <div
            className={`px-6 py-2 border-b flex items-center justify-between text-xs ${
              isDark ? "bg-slate-950 border-slate-800" : "bg-slate-100 border-slate-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("upload")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  activeTab === "upload"
                    ? "bg-blue-600 text-white shadow-xs"
                    : isDark
                    ? "text-slate-400 hover:text-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                1. Source Images ({images.length})
              </button>
              <button
                onClick={() => setActiveTab("preview")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                  activeTab === "preview"
                    ? "bg-blue-600 text-white shadow-xs"
                    : isDark
                    ? "text-slate-400 hover:text-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                2. Transcribed Exam Result
              </button>
            </div>

            {ocrReport && (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                Accuracy Score: <strong>{ocrReport.qualityScore}%</strong> • {ocrReport.extractedQuestionsCount} Questions Detected
              </span>
            )}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5">
          {activeTab === "upload" ? (
            <>
              {/* Error banner */}
              {errorMessage && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Extraction Warning:</span> {errorMessage}
                  </div>
                </div>
              )}

              {/* Drag & Drop Upload Zone */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onDragEnter={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  if (e.dataTransfer.files) {
                    Array.from(e.dataTransfer.files).forEach(addFile);
                  }
                }}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all flex flex-col items-center justify-center gap-3 ${
                  dragActive
                    ? "border-blue-500 bg-blue-50/40 dark:bg-blue-950/40"
                    : isDark
                    ? "border-slate-800 bg-slate-950/50 hover:border-blue-500/50"
                    : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-slate-100/60"
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600">
                  <UploadCloud className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-semibold">
                    Drag & drop question images here, or browse files
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
                    Supports JPG, PNG, WEBP, HEIC. You can also paste from clipboard (
                    <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono text-[10px]">
                      Ctrl+V
                    </kbd>
                    ) or take a photo with your camera.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    Browse Photos / Files
                  </button>

                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className={`px-4 py-2 ${
                      isDark
                        ? "bg-slate-800 hover:bg-slate-700 text-slate-200"
                        : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-300"
                    } rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition cursor-pointer`}
                  >
                    <Camera className="w-3.5 h-3.5 text-blue-500" />
                    Snap with Camera
                  </button>
                </div>
              </div>

              {/* Uploaded Images List */}
              {images.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Uploaded Question Images ({images.length})
                    </span>
                    <button
                      onClick={() => setImages([])}
                      className="text-red-500 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1 text-[11px]"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear all
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {images.map((img, index) => (
                      <div
                        key={img.id}
                        className={`group relative rounded-xl border overflow-hidden p-2 ${
                          isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
                        } flex flex-col gap-1.5`}
                      >
                        <div className="relative aspect-3/4 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                          <img
                            src={img.dataUrl}
                            alt={img.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setPreviewImage(img.dataUrl)}
                              className="p-1.5 bg-white/90 text-slate-800 rounded-lg hover:bg-white text-xs"
                              title="View full image"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(img.id)}
                              className="p-1.5 bg-red-600/90 text-white rounded-lg hover:bg-red-600 text-xs"
                              title="Remove image"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[11px] px-1">
                          <span className="font-medium truncate max-w-[100px]">{img.name}</span>
                          <span className="text-slate-400 text-[10px]">Pg {index + 1}</span>
                        </div>
                      </div>
                    ))}

                    {/* Add More Button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`aspect-3/4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 text-xs font-semibold ${
                        isDark
                          ? "border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200"
                          : "border-slate-300 hover:border-slate-400 text-slate-500 hover:text-slate-700"
                      } transition cursor-pointer`}
                    >
                      <Plus className="w-5 h-5" />
                      <span>Add Page</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Sample Visual Question Cards (For 1-Click Instant Testing) */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Or Test with Visual Sample Sheets (1-Click)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sampleImages.map((sample) => (
                    <div
                      key={sample.id}
                      onClick={() => handleSelectSample(sample)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                        isDark
                          ? "bg-slate-950 border-slate-800 hover:border-blue-500/60 hover:bg-slate-900"
                          : "bg-slate-50 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50"
                      }`}
                    >
                      <div className="w-12 h-14 rounded-lg bg-slate-200 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-300 dark:border-slate-700">
                        <img
                          src={sample.dataUrl}
                          alt={sample.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold truncate">{sample.title}</h4>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 font-medium">
                            {sample.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {sample.subtitle}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Optional Subject & Class Hint Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Subject Name (Optional Override)
                  </label>
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder="e.g. BIOLOGY, CIVIC EDUCATION, GOVERNMENT"
                    className={`w-full px-3 py-2 text-xs rounded-lg border ${
                      isDark
                        ? "bg-slate-950 border-slate-800 text-slate-200"
                        : "bg-slate-50 border-slate-300 text-slate-800"
                    } focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Class Level (Optional Override)
                  </label>
                  <input
                    type="text"
                    value={customClass}
                    onChange={(e) => setCustomClass(e.target.value)}
                    placeholder="e.g. SSS 2, SSS 1, JSS 3"
                    className={`w-full px-3 py-2 text-xs rounded-lg border ${
                      isDark
                        ? "bg-slate-950 border-slate-800 text-slate-200"
                        : "bg-slate-50 border-slate-300 text-slate-800"
                    } focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                  />
                </div>
              </div>
            </>
          ) : (
            /* Transcribed Results Preview Tab */
            <div className="space-y-4">
              <div
                className={`p-4 rounded-xl border ${
                  isDark ? "bg-slate-950 border-slate-800" : "bg-blue-50/60 border-blue-200"
                } flex flex-wrap items-center justify-between gap-3 text-xs`}
              >
                <div>
                  <h3 className="font-bold text-sm text-blue-600 dark:text-blue-400">
                    {extractedExam?.subject} ({extractedExam?.classLevel})
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                    {extractedExam?.sectionA.questions.length || 0} Objective Questions &bull;{" "}
                    {extractedExam?.sectionB.questions.length || 0} Essay / Theory Questions &bull; Total Marks:{" "}
                    {extractedExam?.fullMarks}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 rounded-lg text-xs font-semibold">
                    Standard TNR 12pt Ready
                  </span>
                </div>
              </div>

              {/* Section A sample preview */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Section A: Objective Questions Transcribed ({extractedExam?.sectionA.questions.length})
                </h4>
                <div
                  className={`max-h-60 overflow-y-auto p-3 rounded-xl border ${
                    isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
                  } space-y-2.5 text-xs`}
                >
                  {extractedExam?.sectionA.questions.map((q) => (
                    <div key={q.id} className="space-y-1">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {q.questionNumber}. {q.questionText}
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-600 dark:text-slate-400 pl-4 font-serif">
                        {q.options.map((opt) => (
                          <span key={opt.key}>
                            ({opt.key}) {opt.text}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section B sample preview */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Section B: Essay / Theory Questions ({extractedExam?.sectionB.questions.length})
                </h4>
                <div
                  className={`max-h-52 overflow-y-auto p-3 rounded-xl border ${
                    isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
                  } space-y-2 text-xs font-serif`}
                >
                  {extractedExam?.sectionB.questions.map((q) => (
                    <div key={q.questionNumber} className="space-y-1">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {q.questionNumber}. {q.text} {q.marks && <span className="italic">{q.marks}</span>}
                      </p>
                      {q.subQuestions && q.subQuestions.length > 0 && (
                        <div className="pl-4 space-y-0.5 text-slate-600 dark:text-slate-400">
                          {q.subQuestions.map((sub, i) => (
                            <p key={i}>
                              ({sub.label}) {sub.text} {sub.marks && <span className="italic">{sub.marks}</span>}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Raw Transcribed Plain Text View */}
              <details className="text-xs">
                <summary className="font-semibold text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                  View Raw Transcribed Plain Text
                </summary>
                <textarea
                  readOnly
                  value={extractedRawText}
                  rows={6}
                  className={`w-full mt-2 p-3 font-mono text-xs rounded-lg border ${
                    isDark ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-300 text-slate-800"
                  } outline-none`}
                />
              </details>
            </div>
          )}
        </div>

        {/* Full Image Zoom Modal Preview */}
        {previewImage && (
          <div
            className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-4"
            onClick={() => setPreviewImage(null)}
          >
            <div className="relative max-w-3xl max-h-[85vh]">
              <img
                src={previewImage}
                alt="Enlarged question sheet"
                className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
              />
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black text-white rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div
          className={`px-6 py-4 border-t ${
            isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
          } flex flex-wrap items-center justify-between gap-3`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              isDark
                ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                : "text-slate-600 hover:text-slate-800 hover:bg-slate-200"
            }`}
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            {activeTab === "upload" ? (
              <button
                type="button"
                onClick={handleExtractAndConvert}
                disabled={isLoading || images.length === 0}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>{ocrStatus || "Reading & Converting Questions..."}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span>Transcribe & Convert to Exam</span>
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab("upload")}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl border ${
                    isDark
                      ? "border-slate-800 hover:bg-slate-800 text-slate-300"
                      : "border-slate-300 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  Back to Images
                </button>
                <button
                  type="button"
                  onClick={handleConfirmApply}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Apply & Open Standard Exam Paper</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

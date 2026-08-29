import React, { useState, useRef } from "react";
import {
  FileText,
  UploadCloud,
  Sparkles,
  CheckCircle2,
  FileCheck,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Sliders,
  Type,
  AlertCircle,
  FileCode,
  File,
  RotateCcw,
  Zap,
  Sun,
  Moon,
  Camera,
  Image as ImageIcon,
  History,
} from "lucide-react";
import { SchoolLogo } from "./SchoolLogo";
import { extractTextFromFile } from "../utils/fileExtractor";
import { AT_TARBIYYA_GOVERNMENT_RAW } from "../utils/sampleData";
import { getSampleQuestionImages } from "../utils/sampleImageData";
import { ExamData } from "../types";

interface LandingPageProps {
  onProcessAndLaunch: (rawText: string, customConfig?: Partial<ExamData>, useAi?: boolean) => void;
  onOpenImageModal?: () => void;
  onOpenHistoryModal?: () => void;
  isAiLoading: boolean;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
}

const SAMPLE_EXAMS = [
  {
    id: "gov_ss2",
    title: "SSS 2 Government (2nd Term)",
    description: "40 Objective questions + Section B Essay on Federalism & Constitution",
    subject: "Government",
    classLevel: "Senior Secondary School 2 (SSS 2)",
    text: AT_TARBIYYA_GOVERNMENT_RAW,
  },
  {
    id: "civic_ss1",
    title: "SSS 1 Civic Education",
    description: "Values, citizenship, human rights & constitutional democracy",
    subject: "Civic Education",
    classLevel: "Senior Secondary School 1 (SSS 1)",
    text: `AT-TARBIYYA COMMUNITY COLLEGE
SECOND TERM EXAMINATION 2025/2026 SESSION
SUBJECT: CIVIC EDUCATION
CLASS: SSS 1
TIME ALLOWED: 1 Hour 30 Minutes

SECTION A: OBJECTIVE QUESTIONS
Instruction: Answer ALL questions in this section by selecting the correct option.

1. Which of the following is a core pillar of democratic governance in Nigeria?
a) Totalitarian rule
b) Rule of law
c) Military decree
d) Absolute monarchy

2. The fundamental rights of Nigerian citizens are entrenched in which chapter of the 1999 Constitution?
a) Chapter I
b) Chapter II
c) Chapter IV
d) Chapter VIII

3. Cultism in Nigerian educational institutions leads to all of the following EXCEPT
a) loss of lives
b) breakdown of peace
c) academic excellence
d) rustication of students

4. The agency responsible for fighting drug trafficking and abuse in Nigeria is
a) EFCC
b) NDLEA
c) NAFDAC
d) ICPC

5. Self-reliance empowers youths primarily by
a) encouraging foreign dependency
b) creating employment and reducing poverty
c) increasing import bills
d) promoting exam malpractice

SECTION B: ESSAY QUESTIONS
Instruction: Answer any THREE (3) questions. Each carries 10 marks.

1. (a) Define Rule of Law. [3 marks]
(b) Explain three fundamental principles of the rule of law according to A.V. Dicey. [7 marks]

2. (a) What is Cultism? [3 marks]
(b) Discuss four preventive measures against cultism in secondary schools. [7 marks]

3. (a) Differentiate between civic rights and civic responsibilities. [4 marks]
(b) List three consequences of political apathy in Nigeria. [6 marks]

4. (a) Define Citizenship and outline three modes of acquiring Nigerian citizenship. [5 marks]
(b) Explain five obligations of a responsible citizen in Nigeria. [5 marks]

5. (a) What is Capitalist Democracy? [4 marks]
(b) Enumerate six characteristics of a democratic system of government. [6 marks]

6. (a) Define Human Trafficking and state three causes. [5 marks]
(b) Highlight five government agencies in Nigeria fighting social vices and human trafficking. [5 marks]`,
  },
  {
    id: "irs_ss2",
    title: "SSS 2 Islamic Studies",
    description: "Hadith sciences, Surah studies, Islamic jurisprudence (Fiqh)",
    subject: "Islamic Religious Studies",
    classLevel: "Senior Secondary School 2 (SSS 2)",
    text: `AT-TARBIYYA COMMUNITY COLLEGE
SECOND TERM EXAMINATION 2025/2026 SESSION
SUBJECT: ISLAMIC RELIGIOUS STUDIES
CLASS: SSS 2
TIME ALLOWED: 2 Hours

SECTION A: OBJECTIVE QUESTIONS
Instruction: Choose the correct option from (a) - (d).

1. The primary and most authoritative source of Islamic Law (Shari'ah) is the
a) Ijma
b) Holy Qur'an
c) Qiyas
d) Fatwa

2. Hadith Qudsi refers to a tradition where the
a) wording and meaning are from the Prophet (pbuh)
b) meaning is from Allah while wording is from the Prophet (pbuh)
c) wording is narrated by companions only
d) chain of narrators is broken

3. The Treaty of Hudaybiyyah was signed in the year
a) 2nd year of Hijrah
b) 6th year of Hijrah
c) 8th year of Hijrah
d) 10th year of Hijrah

4. Which of the following companions compiled the first standardized Mushaf of the Qur'an?
a) Abu Bakr As-Siddiq (R.A)
b) Umar ibn Al-Khattab (R.A)
c) Uthman ibn Affan (R.A)
d) Ali ibn Abi Talib (R.A)

5. In Islamic inheritance (Miras), the fixed share of a wife with surviving children is
a) 1/2
b) 1/4
c) 1/8
d) 1/3

SECTION B: ESSAY QUESTIONS
Instruction: Answer any THREE (3) questions in this section. Each question carries 10 marks.

1. (a) Translate Surah Al-Hujurat verses 10-12. [5 marks]
(b) Highlight four lessons derived from the verses regarding brotherhood and social ethics. [5 marks]

2. (a) Define Sunnah and state its three classifications. [4 marks]
(b) Explain the role of Sunnah in explaining ambiguous Qur'anic injunctions with two examples. [6 marks]

3. (a) Explain the major differences between Hadith Sahih and Hadith Da'if. [5 marks]
(b) Describe the three stages in the historical compilation of the Holy Qur'an. [5 marks]

4. (a) Define Shari'ah and list its four fundamental sources. [5 marks]
(b) Highlight the contribution of Caliph Umar ibn Al-Khattab to Islamic administrative justice. [5 marks]

5. (a) What is Zakat? Mention four categories of people entitled to receive Zakat according to Surah At-Tawbah. [6 marks]
(b) Distinguish between Zakat and Sadaqah in Islamic practice. [4 marks]

6. (a) Explain the concept of Nikah (Marriage) in Islam and state four conditions for its validity. [6 marks]
(b) Outline the rights and duties of spouses toward each other in Islam. [4 marks]`,
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onProcessAndLaunch,
  onOpenImageModal,
  onOpenHistoryModal,
  isAiLoading,
  theme = "light",
  onToggleTheme,
}) => {
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState<"paste" | "upload" | "image">("paste");
  const [inputText, setInputText] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Image OCR state in landing
  const [uploadedImages, setUploadedImages] = useState<Array<{ id: string; name: string; dataUrl: string; mimeType: string }>>([]);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [ocrStatusText, setOcrStatusText] = useState("");
  const sampleVisualImages = getSampleQuestionImages();

  // Configuration state
  const [subject, setSubject] = useState("Government");
  const [classLevel, setClassLevel] = useState("Senior Secondary School 2 (SSS 2)");
  const [termSession, setTermSession] = useState("SECOND TERM EXAMINATION 2025/2026 SESSION");
  const [timeAllowed, setTimeAllowed] = useState("2 Hours");
  const [optionsStyle, setOptionsStyle] = useState<"(a), (b), (c), (d)" | "(A), (B), (C), (D)">("(a), (b), (c), (d)");
  const [layoutColumns, setLayoutColumns] = useState<1 | 2>(2);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleAddImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setExtractError("Please upload a valid image file (JPG, PNG, WEBP, HEIC).");
      return;
    }
    setExtractError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setUploadedImages((prev) => [
          ...prev,
          {
            id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: file.name || `Question_Photo_${prev.length + 1}.jpg`,
            dataUrl,
            mimeType: file.type || "image/jpeg",
          },
        ]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSampleImage = (sample: typeof sampleVisualImages[0]) => {
    setExtractError(null);
    setUploadedImages([
      {
        id: `sample_${sample.id}`,
        name: `${sample.title}.jpg`,
        dataUrl: sample.dataUrl,
        mimeType: "image/jpeg",
      },
    ]);
    setSubject(sample.subject);
    setClassLevel(sample.classLevel);
  };

  const handleImageOcrConvert = async () => {
    if (uploadedImages.length === 0) {
      setExtractError("Please select or capture a question image first.");
      return;
    }
    setIsOcrLoading(true);
    setExtractError(null);
    setOcrStatusText("Transcribing handwritten & printed question text with Gemini 3.7 Vision...");

    try {
      const payload = {
        images: uploadedImages.map((img) => ({
          base64: img.dataUrl,
          mimeType: img.mimeType,
        })),
        customConfig: {
          subject: subject.trim() || undefined,
          classLevel: classLevel.trim() || undefined,
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
      const rawExtracted = result.rawExtractedText || "";
      setInputText(rawExtracted);

      // Launch directly with the transcribed data
      onProcessAndLaunch(
        rawExtracted,
        {
          schoolName: result.schoolName || "AT-TARBIYYA COMMUNITY COLLEGE",
          termSession: result.termSession || termSession,
          subject: result.subject || subject,
          classLevel: result.classLevel || classLevel,
          timeAllowed: result.timeAllowed || timeAllowed,
          fullMarks: result.fullMarks || "60 MARKS",
          optionsStyle,
          layoutColumns,
          fontSize: "12pt",
          lineSpacing: "1.15",
        },
        false
      );
    } catch (err: any) {
      console.error("Landing Image OCR Error:", err);
      let msg = err?.message || "Failed to process question image. Please ensure photo is legible.";
      try {
        const parsed = JSON.parse(msg);
        if (parsed.error?.message) msg = parsed.error.message;
        else if (parsed.message) msg = parsed.message;
      } catch {}
      setExtractError(msg);
    } finally {
      setIsOcrLoading(false);
      setOcrStatusText("");
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    setExtractError(null);
    setIsExtracting(true);

    try {
      const result = await extractTextFromFile(file);
      if (result.error) {
        setExtractError(result.error);
      } else {
        setInputText(result.extractedText);
        // Try auto-detecting subject
        if (result.extractedText.toLowerCase().includes("civic")) {
          setSubject("Civic Education");
        } else if (result.extractedText.toLowerCase().includes("islamic") || result.extractedText.toLowerCase().includes("irs")) {
          setSubject("Islamic Religious Studies");
        } else if (result.extractedText.toLowerCase().includes("government")) {
          setSubject("Government");
        } else if (result.extractedText.toLowerCase().includes("mathematics") || result.extractedText.toLowerCase().includes("maths")) {
          setSubject("Mathematics");
        } else if (result.extractedText.toLowerCase().includes("english")) {
          setSubject("English Language");
        }
      }
    } catch (e: any) {
      setExtractError(e?.message || "Failed to read file.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSample = (sample: typeof SAMPLE_EXAMS[0]) => {
    setInputText(sample.text);
    setSubject(sample.subject);
    setClassLevel(sample.classLevel);
    setUploadedFile(null);
    setExtractError(null);
  };

  const handleStart = (useAi: boolean = false) => {
    const textToProcess = inputText.trim();
    if (!textToProcess) {
      alert("Please paste question text or upload a Word/PDF document first.");
      return;
    }

    onProcessAndLaunch(
      textToProcess,
      {
        subject,
        classLevel,
        termSession,
        timeAllowed,
        optionsStyle,
        layoutColumns,
        fontSize: "12pt",
        lineSpacing: "1.15",
      },
      useAi
    );
  };

  return (
    <div className={`min-h-screen ${isDark ? "bg-slate-950 text-slate-100" : "bg-[#f4f6f9] text-slate-800"} flex flex-col font-sans selection:bg-blue-600 selection:text-white transition-colors duration-200`}>
      {/* Top Header Bar */}
      <header className={`border-b ${isDark ? "border-slate-800 bg-[#1e293b]" : "border-slate-200 bg-white"} px-6 py-4 sticky top-0 z-30 shadow-xs transition-colors duration-200`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SchoolLogo size="sm" className="bg-white p-1 rounded-md shadow-xs border border-slate-200" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`text-base sm:text-lg font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"} flex items-center`}>
                  THE MODERATOR
                </h1>
                <span className="text-[11px] bg-blue-500/20 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30 font-medium">
                  At-Tarbiyya Examination Suite
                </span>
              </div>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"} font-mono`}>
                Official Examination Moderation, Formatting & Audit Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`hidden md:flex items-center gap-3 text-xs ${isDark ? "text-slate-400" : "text-slate-500"} font-mono`}>
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Standard: Times New Roman 12pt (1.15)
              </span>
            </div>

            {/* History Quick Access Button */}
            {onOpenHistoryModal && (
              <button
                id="btn-landing-history"
                onClick={onOpenHistoryModal}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                  isDark
                    ? "bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700"
                    : "bg-slate-100 hover:bg-slate-200 text-amber-800 border-slate-300 shadow-2xs"
                }`}
                title="View previous exam papers and generation history"
              >
                <History className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">Exam History</span>
              </button>
            )}

            {/* Light / Dark Mode Toggle Button */}
            {onToggleTheme && (
              <button
                id="btn-landing-toggle-theme"
                onClick={onToggleTheme}
                className={`p-2 rounded-lg transition border flex items-center justify-center ${
                  isDark
                    ? "bg-slate-800 text-amber-300 hover:bg-slate-700 border-slate-700 hover:text-amber-200"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300 hover:text-slate-900 shadow-2xs"
                }`}
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-300 animate-in spin-in-180 duration-200" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-700 animate-in spin-in-180 duration-200" />
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Hero & Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
        {/* School Crest & Welcome Hero Section */}
        <section className={`${isDark ? "bg-gradient-to-br from-[#1e293b] to-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900 shadow-sm"} border rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center gap-6 md:gap-10 transition-colors duration-200`}>
          <div className="shrink-0 flex items-center justify-center p-3 bg-white rounded-2xl shadow-lg border border-slate-200">
            <SchoolLogo size="lg" />
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${isDark ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-800"} border text-xs font-semibold uppercase tracking-wider`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              At-Tarbiyya Community College • Exam Moderation Portal
            </div>
            <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold ${isDark ? "text-white" : "text-slate-900"} tracking-tight`}>
              Transform Raw Questions into Standardized Examination Papers
            </h2>
            <p className={`text-sm sm:text-base ${isDark ? "text-slate-300" : "text-slate-600"} leading-relaxed max-w-3xl`}>
              Import unformatted question files or paste drafts. The Moderator automatically expands abbreviations, organizes horizontal linear option structures (a)-(d), standardizes Section A/B formatting, generates answer keys, and delivers print-ready PDF examination papers in strictly compliant <strong className={isDark ? "text-white" : "text-slate-900"}>Times New Roman 12pt</strong>.
            </p>
          </div>
        </section>

        {/* Core Input & Configuration Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Import / Input Workspace (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className={`${isDark ? "bg-[#1e293b] border-slate-800" : "bg-white border-slate-200 shadow-sm"} border rounded-xl p-5 shadow-lg flex flex-col gap-4 transition-colors duration-200`}>
              {/* Tab Selector */}
              <div className={`flex flex-wrap items-center justify-between border-b ${isDark ? "border-slate-800" : "border-slate-200"} pb-3 gap-2`}>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setActiveTab("paste")}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer ${
                      activeTab === "paste"
                        ? "bg-blue-600 text-white shadow-sm"
                        : isDark
                        ? "text-slate-400 hover:text-white hover:bg-slate-800"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    Paste Questions Text
                  </button>

                  <button
                    onClick={() => setActiveTab("upload")}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer ${
                      activeTab === "upload"
                        ? "bg-blue-600 text-white shadow-sm"
                        : isDark
                        ? "text-slate-400 hover:text-white hover:bg-slate-800"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <UploadCloud className="w-4 h-4" />
                    Import Word / PDF
                  </button>

                  <button
                    onClick={() => setActiveTab("image")}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer ${
                      activeTab === "image"
                        ? "bg-blue-600 text-white shadow-sm"
                        : isDark
                        ? "text-slate-400 hover:text-white hover:bg-slate-800"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <Camera className="w-4 h-4 text-amber-400" />
                    <span>Import Question Photo / Scan</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-blue-500/20 text-blue-400 rounded-full font-bold">
                      OCR
                    </span>
                  </button>
                </div>

                <span className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"} font-mono hidden sm:inline`}>
                  {inputText.length} characters • {inputText.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>

              {/* Tab 1: Paste Text */}
              {activeTab === "paste" && (
                <div className="space-y-3">
                  <div className={`flex items-center justify-between text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    <span>Paste raw or unformatted draft questions below:</span>
                    {inputText.length > 0 && (
                      <button
                        onClick={() => setInputText("")}
                        className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1 font-medium"
                      >
                        <RotateCcw className="w-3 h-3" /> Clear Text
                      </button>
                    )}
                  </div>

                  <textarea
                    id="landing-paste-textarea"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    rows={12}
                    className={`w-full p-4 ${isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-300 text-slate-900"} border rounded-lg text-xs sm:text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y leading-relaxed shadow-inner`}
                    placeholder="Paste unformatted questions, Section A and Section B text..."
                  />
                </div>
              )}

              {/* Tab 2: File Upload (Word docx, PDF, TXT) */}
              {activeTab === "upload" && (
                <div className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".docx,.pdf,.txt,.doc"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />

                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                      dragActive
                        ? "border-blue-500 bg-blue-500/10"
                        : isDark
                        ? "border-slate-700 bg-slate-950/60 hover:border-slate-500 hover:bg-slate-950"
                        : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-slate-100"
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-full ${isDark ? "bg-blue-600/20 text-blue-400" : "bg-blue-100 text-blue-600"} flex items-center justify-center`}>
                      <UploadCloud className="w-7 h-7" />
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>
                        Click to upload or drag & drop examination file
                      </p>
                      <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"} mt-1`}>
                        Supports <strong className={isDark ? "text-slate-300" : "text-slate-700"}>Microsoft Word (.docx)</strong>,{" "}
                        <strong className={isDark ? "text-slate-300" : "text-slate-700"}>PDF (.pdf)</strong>, and{" "}
                        <strong className={isDark ? "text-slate-300" : "text-slate-700"}>Plain Text (.txt)</strong>
                      </p>
                    </div>
                  </div>

                  {isExtracting && (
                    <div className="p-3 bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-300 rounded-lg text-xs flex items-center gap-2">
                      <Sparkles className="w-4 h-4 animate-spin text-blue-500" />
                      <span>Extracting question text from file...</span>
                    </div>
                  )}

                  {extractError && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 rounded-lg text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                      <span>{extractError}</span>
                    </div>
                  )}

                  {uploadedFile && !isExtracting && !extractError && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <FileCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="font-semibold truncate">{uploadedFile.name}</span>
                        <span className="text-slate-500 font-mono text-[10px]">
                          ({(uploadedFile.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <span className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                        Loaded
                      </span>
                    </div>
                  )}

                  {/* Extracted Preview Area */}
                  {inputText && (
                    <div className="space-y-1.5">
                      <label className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"} font-medium`}>
                        Extracted Document Preview:
                      </label>
                      <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        rows={6}
                        className={`w-full p-3 ${isDark ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-300 text-slate-800"} border rounded-lg text-xs font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none`}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Image / Photo OCR (Handwritten or Printed) */}
              {activeTab === "image" && (
                <div className="space-y-4">
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        Array.from(e.target.files).forEach(handleAddImageFile);
                      }
                    }}
                    className="hidden"
                  />

                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => {
                      if (e.target.files) {
                        Array.from(e.target.files).forEach(handleAddImageFile);
                      }
                    }}
                    className="hidden"
                  />

                  {/* Drop zone / selector */}
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragActive(false);
                      if (e.dataTransfer.files) {
                        Array.from(e.dataTransfer.files).forEach(handleAddImageFile);
                      }
                    }}
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-all flex flex-col items-center justify-center gap-3 ${
                      dragActive
                        ? "border-blue-500 bg-blue-500/10"
                        : isDark
                        ? "border-slate-700 bg-slate-950/60 hover:border-slate-500"
                        : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-slate-100"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full ${isDark ? "bg-amber-500/20 text-amber-400" : "bg-amber-100 text-amber-600"} flex items-center justify-center`}>
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>
                        Upload question photos, handwritten notes, or test handouts
                      </p>
                      <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"} mt-1`}>
                        Supports JPEG, PNG, WEBP, HEIC. Multi-page question sheets supported.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        Choose Photo Files
                      </button>

                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className={`px-3.5 py-1.5 ${
                          isDark
                            ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                            : "bg-white hover:bg-slate-100 text-slate-700 border-slate-300"
                        } border rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition cursor-pointer`}
                      >
                        <Camera className="w-3.5 h-3.5 text-blue-500" />
                        Take Photo
                      </button>
                    </div>
                  </div>

                  {/* OCR Loading Banner */}
                  {isOcrLoading && (
                    <div className="p-3 bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-300 rounded-lg text-xs flex items-center gap-2">
                      <Sparkles className="w-4 h-4 animate-spin text-blue-500" />
                      <span>{ocrStatusText || "Transcribing handwritten and printed questions via Gemini Vision..."}</span>
                    </div>
                  )}

                  {/* Extract error */}
                  {extractError && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 rounded-lg text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                      <span>{extractError}</span>
                    </div>
                  )}

                  {/* Uploaded images gallery */}
                  {uploadedImages.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Selected Images ({uploadedImages.length}):
                        </span>
                        <button
                          type="button"
                          onClick={() => setUploadedImages([])}
                          className="text-rose-500 text-[11px] hover:underline"
                        >
                          Clear
                        </button>
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                        {uploadedImages.map((img, i) => (
                          <div
                            key={img.id}
                            className={`p-1.5 rounded-lg border ${
                              isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
                            } space-y-1`}
                          >
                            <div className="aspect-3/4 bg-slate-200 dark:bg-slate-800 rounded overflow-hidden">
                              <img
                                src={img.dataUrl}
                                alt={img.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <p className="text-[10px] truncate text-slate-600 dark:text-slate-400 font-mono">
                              Pg {i + 1}: {img.name}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Transcribe and Launch button */}
                      <button
                        type="button"
                        onClick={handleImageOcrConvert}
                        disabled={isOcrLoading}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer mt-2"
                      >
                        <Sparkles className="w-4 h-4 text-yellow-300" />
                        <span>Transcribe Images & Format Standard Exam</span>
                      </button>
                    </div>
                  )}

                  {/* Sample Visual Test Sheets */}
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-500" />
                      1-Click Visual Sample Sheets:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {sampleVisualImages.map((sample) => (
                        <div
                          key={sample.id}
                          onClick={() => handleSelectSampleImage(sample)}
                          className={`p-2 rounded-lg border cursor-pointer transition flex items-center gap-2.5 ${
                            isDark
                              ? "bg-slate-950 border-slate-800 hover:border-blue-500/50 hover:bg-slate-900"
                              : "bg-slate-50 border-slate-200 hover:border-blue-400 hover:bg-blue-50/40"
                          }`}
                        >
                          <div className="w-10 h-12 bg-slate-200 dark:bg-slate-800 rounded overflow-hidden shrink-0 border border-slate-300 dark:border-slate-700">
                            <img
                              src={sample.dataUrl}
                              alt={sample.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold truncate">{sample.title}</h5>
                            <p className="text-[10px] text-slate-500 truncate">{sample.type}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Sample Presets Quick-Load */}
              <div className={`border-t ${isDark ? "border-slate-800" : "border-slate-200"} pt-3 flex flex-col gap-2`}>
                <span className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-600"} uppercase tracking-wider`}>
                  Quick Load Exam Samples:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {SAMPLE_EXAMS.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => handleSelectSample(sample)}
                      className={`p-2.5 rounded-lg ${isDark ? "bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-200" : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800"} border text-left transition group shadow-2xs`}
                    >
                      <p className="text-xs font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {sample.title}
                      </p>
                      <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"} truncate mt-0.5`}>
                        {sample.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Parameters & Launch Action (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className={`${isDark ? "bg-[#1e293b] border-slate-800" : "bg-white border-slate-200 shadow-sm"} border rounded-xl p-5 shadow-lg space-y-4 transition-colors duration-200`}>
              <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? "text-slate-200 border-slate-800" : "text-slate-800 border-slate-200"} flex items-center gap-2 border-b pb-2.5`}>
                <Sliders className="w-4 h-4 text-blue-500" />
                Exam Paper Parameters
              </h3>

              {/* Subject Input */}
              <div className="space-y-1">
                <label className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-600"}`}>Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className={`w-full px-3 py-2 ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-300 text-slate-900"} border rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium`}
                />
              </div>

              {/* Class Level */}
              <div className="space-y-1">
                <label className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-600"}`}>Class Level</label>
                <input
                  type="text"
                  value={classLevel}
                  onChange={(e) => setClassLevel(e.target.value)}
                  className={`w-full px-3 py-2 ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-300 text-slate-900"} border rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium`}
                />
              </div>

              {/* Term & Session */}
              <div className="space-y-1">
                <label className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-600"}`}>Term & Session</label>
                <input
                  type="text"
                  value={termSession}
                  onChange={(e) => setTermSession(e.target.value)}
                  className={`w-full px-3 py-2 ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-300 text-slate-900"} border rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium`}
                />
              </div>

              {/* Time Allowed */}
              <div className="space-y-1">
                <label className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-600"}`}>Time Allowed</label>
                <input
                  type="text"
                  value={timeAllowed}
                  onChange={(e) => setTimeAllowed(e.target.value)}
                  className={`w-full px-3 py-2 ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-300 text-slate-900"} border rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium`}
                />
              </div>

              {/* Layout Columns */}
              <div className="space-y-1">
                <label className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-600"}`}>Objective Layout</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLayoutColumns(2)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition ${
                      layoutColumns === 2
                        ? isDark
                          ? "bg-blue-600/30 border-blue-500 text-blue-300"
                          : "bg-blue-50 border-blue-500 text-blue-700 font-bold"
                        : isDark
                        ? "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                        : "bg-slate-50 border-slate-300 text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    2 Columns (Newspaper)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLayoutColumns(1)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition ${
                      layoutColumns === 1
                        ? isDark
                          ? "bg-blue-600/30 border-blue-500 text-blue-300"
                          : "bg-blue-50 border-blue-500 text-blue-700 font-bold"
                        : isDark
                        ? "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                        : "bg-slate-50 border-slate-300 text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    1 Column (Full Width)
                  </button>
                </div>
              </div>

              {/* Option Keys */}
              <div className="space-y-1">
                <label className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-600"}`}>Options Notation</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOptionsStyle("(a), (b), (c), (d)")}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition ${
                      optionsStyle === "(a), (b), (c), (d)"
                        ? isDark
                          ? "bg-blue-600/30 border-blue-500 text-blue-300"
                          : "bg-blue-50 border-blue-500 text-blue-700 font-bold"
                        : isDark
                        ? "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                        : "bg-slate-50 border-slate-300 text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    (a), (b), (c), (d)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOptionsStyle("(A), (B), (C), (D)")}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition ${
                      optionsStyle === "(A), (B), (C), (D)"
                        ? isDark
                          ? "bg-blue-600/30 border-blue-500 text-blue-300"
                          : "bg-blue-50 border-blue-500 text-blue-700 font-bold"
                        : isDark
                        ? "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                        : "bg-slate-50 border-slate-300 text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    (A), (B), (C), (D)
                  </button>
                </div>
              </div>

              {/* Primary Action Buttons */}
              <div className={`pt-3 border-t ${isDark ? "border-slate-800" : "border-slate-200"} space-y-2.5`}>
                <button
                  id="btn-launch-moderator"
                  onClick={() => handleStart(false)}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition shadow-lg flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Format & Load Exam Paper</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  id="btn-ai-launch-moderator"
                  onClick={() => handleStart(true)}
                  disabled={isAiLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>AI Chief Examiner Deep Moderate</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Standard Badges */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          <div className={`${isDark ? "bg-[#1e293b]/80 border-slate-800" : "bg-white border-slate-200 shadow-xs"} border rounded-xl p-4 flex items-start gap-3`}>
            <div className={`p-2 ${isDark ? "bg-blue-600/20 text-blue-400" : "bg-blue-100 text-blue-600"} rounded-lg shrink-0`}>
              <Type className="w-5 h-5" />
            </div>
            <div>
              <h4 className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-900"} uppercase tracking-wider`}>Times New Roman 12pt</h4>
              <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-600"} mt-0.5 leading-relaxed`}>
                Strict academic typography standard with 1.15 line spacing and crisp print geometry.
              </p>
            </div>
          </div>

          <div className={`${isDark ? "bg-[#1e293b]/80 border-slate-800" : "bg-white border-slate-200 shadow-xs"} border rounded-xl p-4 flex items-start gap-3`}>
            <div className={`p-2 ${isDark ? "bg-emerald-600/20 text-emerald-400" : "bg-emerald-100 text-emerald-600"} rounded-lg shrink-0`}>
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-900"} uppercase tracking-wider`}>Abbreviation Expander</h4>
              <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-600"} mt-0.5 leading-relaxed`}>
                Automatically resolves shorthand like <em>dept., fed., gov., const., adm.</em> into formal text.
              </p>
            </div>
          </div>

          <div className={`${isDark ? "bg-[#1e293b]/80 border-slate-800" : "bg-white border-slate-200 shadow-xs"} border rounded-xl p-4 flex items-start gap-3`}>
            <div className={`p-2 ${isDark ? "bg-amber-600/20 text-amber-400" : "bg-amber-100 text-amber-600"} rounded-lg shrink-0`}>
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-900"} uppercase tracking-wider`}>Linear (a)-(d) Options</h4>
              <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-600"} mt-0.5 leading-relaxed`}>
                Flattens stacked objective options into clean horizontal lines saving paper and ink.
              </p>
            </div>
          </div>

          <div className={`${isDark ? "bg-[#1e293b]/80 border-slate-800" : "bg-white border-slate-200 shadow-xs"} border rounded-xl p-4 flex items-start gap-3`}>
            <div className={`p-2 ${isDark ? "bg-purple-600/20 text-purple-400" : "bg-purple-100 text-purple-600"} rounded-lg shrink-0`}>
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-900"} uppercase tracking-wider`}>Answer Key & Marking Scheme</h4>
              <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-600"} mt-0.5 leading-relaxed`}>
                Instant Chief Examiner marking guide with objective answer key and essay mark breakdown.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={`border-t ${isDark ? "border-slate-800 bg-[#1e293b] text-slate-500" : "border-slate-200 bg-white text-slate-500"} py-4 px-6 text-center text-xs font-mono transition-colors duration-200`}>
        AT-TARBIYYA COMMUNITY COLLEGE • THE MODERATOR v2.4 • &quot;العلم حياة&quot; (Knowledge is Life)
      </footer>
    </div>
  );
};

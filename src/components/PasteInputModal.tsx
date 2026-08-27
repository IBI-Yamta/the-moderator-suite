import React, { useState, useRef } from "react";
import { X, Sparkles, Wand2, FileText, CheckCircle2, RotateCcw, UploadCloud, FileCheck, AlertCircle } from "lucide-react";
import { AT_TARBIYYA_GOVERNMENT_RAW, MATHEMATICS_SAMPLE_RAW, ENGLISH_SAMPLE_RAW } from "../utils/sampleData";
import { extractTextFromFile } from "../utils/fileExtractor";

interface PasteInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onParseText: (text: string) => void;
  onAiModerateText: (text: string) => void;
  isAiLoading: boolean;
}

export const PasteInputModal: React.FC<PasteInputModalProps> = ({
  isOpen,
  onClose,
  onParseText,
  onAiModerateText,
  isAiLoading,
}) => {
  const [modalTab, setModalTab] = useState<"paste" | "file">("paste");
  const [rawText, setRawText] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    setExtractError(null);
    setIsExtracting(true);

    try {
      const result = await extractTextFromFile(file);
      if (result.error) {
        setExtractError(result.error);
      } else {
        setRawText(result.extractedText);
      }
    } catch (e: any) {
      setExtractError(e?.message || "Failed to parse file.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleApply = () => {
    onParseText(rawText);
    onClose();
  };

  const handleAiApply = () => {
    onAiModerateText(rawText);
  };

  const handleLoadSample = (sample: string) => {
    setRawText(sample);
    setUploadedFile(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              The Moderator: Import & Paste Questions
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Paste raw questions or import Microsoft Word (.docx), PDF, or text files to format into Times New Roman 12pt (1.15 line-spacing).
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher & Quick Sample Presets */}
        <div className="px-6 py-2.5 bg-slate-100/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setModalTab("paste")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                modalTab === "paste"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              Paste Text
            </button>
            <button
              onClick={() => setModalTab("file")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                modalTab === "file"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              Upload Word / PDF File
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleLoadSample(AT_TARBIYYA_GOVERNMENT_RAW)}
              className="px-2 py-1 bg-white border border-slate-300 rounded text-slate-700 hover:text-blue-700 text-xs"
            >
              Gov SSS 2
            </button>
            <button
              onClick={() => handleLoadSample(MATHEMATICS_SAMPLE_RAW)}
              className="px-2 py-1 bg-white border border-slate-300 rounded text-slate-700 hover:text-blue-700 text-xs"
            >
              Maths JSS 3
            </button>
            <button
              onClick={() => setRawText("")}
              className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-xs"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Main Workspace */}
        <div className="p-6 flex-1 overflow-y-auto space-y-3">
          {modalTab === "file" && (
            <div className="space-y-3">
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
                onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileUpload(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-slate-100/60"
                }`}
              >
                <UploadCloud className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Click to select or drag & drop Word (.docx), PDF, or Text file
                  </p>
                </div>
              </div>

              {isExtracting && (
                <div className="p-2.5 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Extracting text from file...</span>
                </div>
              )}

              {extractError && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{extractError}</span>
                </div>
              )}

              {uploadedFile && !isExtracting && !extractError && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center justify-between">
                  <span className="font-semibold">{uploadedFile.name}</span>
                  <span className="text-emerald-600 font-bold">Successfully Extracted</span>
                </div>
              )}
            </div>
          )}

          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Raw Question Paper Content:
          </label>
          <textarea
            id="raw-exam-textarea"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={modalTab === "file" ? 8 : 12}
            placeholder="Paste questions here..."
            className="w-full p-4 font-mono text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 leading-relaxed outline-none shadow-inner"
          />

          {/* Real-time Feature Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600">
            <div className="flex items-center space-x-1 bg-emerald-50 text-emerald-800 p-1.5 rounded border border-emerald-200 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Full Abbreviation Expansion</span>
            </div>
            <div className="flex items-center space-x-1 bg-emerald-50 text-emerald-800 p-1.5 rounded border border-emerald-200 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Times New Roman 12pt</span>
            </div>
            <div className="flex items-center space-x-1 bg-emerald-50 text-emerald-800 p-1.5 rounded border border-emerald-200 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>1.15 Line Spacing</span>
            </div>
            <div className="flex items-center space-x-1 bg-emerald-50 text-emerald-800 p-1.5 rounded border border-emerald-200 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Linear (a)-(d) Options</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition"
          >
            Cancel
          </button>

          <div className="flex items-center space-x-3">
            <button
              id="btn-auto-fix-apply"
              onClick={handleApply}
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Auto-Fix & Format
            </button>

            <button
              id="btn-ai-deep-moderate"
              onClick={handleAiApply}
              disabled={isAiLoading}
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 mr-2 text-yellow-300" />
              {isAiLoading ? "Moderating with AI..." : "AI Chief Examiner"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from "react";
import { FileText, Download, Printer, Wand2, CheckCircle2, Sparkles, Settings2, RefreshCw, Layers, SlidersHorizontal, ArrowLeft, Home, Sun, Moon, Camera } from "lucide-react";
import { SchoolLogo } from "./SchoolLogo";

interface NavbarProps {
  onOpenPasteModal: () => void;
  onOpenImageModal: () => void;
  onOpenAuditModal: () => void;
  onOpenMarkingModal: () => void;
  onOpenSchoolModal: () => void;
  onDownloadPDF: () => void;
  onPrint: () => void;
  onAiModerate: () => void;
  isAiLoading: boolean;
  correctionCount: number;
  subject: string;
  classLevel: string;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  onBackToLanding?: () => void;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenPasteModal,
  onOpenImageModal,
  onOpenAuditModal,
  onOpenMarkingModal,
  onOpenSchoolModal,
  onDownloadPDF,
  onPrint,
  onAiModerate,
  isAiLoading,
  correctionCount,
  subject,
  classLevel,
  isSidebarOpen,
  onToggleSidebar,
  onBackToLanding,
  theme = "light",
  onToggleTheme,
}) => {
  return (
    <header className="bg-[#1e293b] text-white px-4 sm:px-6 py-3 flex justify-between items-center shadow-md border-b border-slate-800 sticky top-0 z-40 no-print">
      {/* Left: Brand Identity & Back to Landing */}
      <div className="flex items-center gap-3">
        {onBackToLanding && (
          <button
            onClick={onBackToLanding}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition flex items-center gap-1.5 text-xs font-semibold"
            title="Return to Landing Page & Import New Questions"
          >
            <ArrowLeft className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Import New</span>
          </button>
        )}

        <div className="flex items-center gap-2.5">
          <div className="bg-white p-1 rounded-lg shadow-sm flex items-center justify-center">
            <SchoolLogo size="sm" className="w-7 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center">
                THE MODERATOR
                <span className="text-blue-400 font-normal text-xs ml-2 hidden sm:inline px-2 py-0.5 bg-blue-950/60 rounded-full border border-blue-800/60">
                  At-Tarbiyya v2.4
                </span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 font-mono hidden md:block">
              {subject} • {classLevel} • Times New Roman 12pt (1.15)
            </p>
          </div>
        </div>
      </div>

      {/* Center/Right: Action Suite & School Instance */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Toggle Editor Panel button for desktop */}
        {onToggleSidebar && (
          <button
            id="btn-toggle-sidebar"
            onClick={onToggleSidebar}
            className={`hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
              isSidebarOpen
                ? "bg-blue-600/20 text-blue-300 border-blue-500/40"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
            }`}
            title="Toggle input workspace pane"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{isSidebarOpen ? "Hide Editor" : "Quick Editor"}</span>
          </button>
        )}

        <button
          id="btn-import-image-ocr"
          onClick={onOpenImageModal}
          className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-700/60 transition shadow-xs cursor-pointer"
          title="Import question paper photos, scans, or handwritten sheets"
        >
          <Camera className="w-4 h-4 mr-1.5 text-blue-400" />
          <span className="hidden sm:inline">Import Photo / Scan</span>
          <span className="sm:hidden">Photo</span>
        </button>

        <button
          id="btn-paste-questions"
          onClick={onOpenPasteModal}
          className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shadow-xs"
          title="Paste raw question text"
        >
          <FileText className="w-4 h-4 mr-1.5 text-blue-400" />
          <span className="hidden sm:inline">Paste / Import</span>
          <span className="sm:hidden">Paste</span>
        </button>

        <button
          id="btn-ai-moderate"
          onClick={onAiModerate}
          disabled={isAiLoading}
          className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-xs disabled:opacity-50"
          title="Run AI Chief Examiner audit on the exam paper"
        >
          {isAiLoading ? (
            <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-yellow-300" />
          )}
          <span className="hidden sm:inline">AI Moderate</span>
          <span className="sm:hidden">AI</span>
        </button>

        <button
          id="btn-audit-corrections"
          onClick={onOpenAuditModal}
          className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shadow-xs"
          title="View corrector audit log"
        >
          <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-400" />
          <span>Audit Log</span>
          {correctionCount > 0 && (
            <span className="ml-1.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-emerald-500/30">
              {correctionCount}
            </span>
          )}
        </button>

        <button
          id="btn-marking-guide"
          onClick={onOpenMarkingModal}
          className="hidden md:inline-flex items-center px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shadow-xs"
          title="View answer keys and marking scheme"
        >
          <Wand2 className="w-4 h-4 mr-1.5 text-amber-400" />
          Answer Key
        </button>

        <div className="h-5 w-px bg-slate-700 mx-0.5 hidden sm:block"></div>

        {/* Print Button */}
        <button
          id="btn-print-paper"
          onClick={onPrint}
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shadow-xs"
          title="Print or Save as Vector PDF via browser"
        >
          <Printer className="w-4 h-4 sm:mr-1 text-slate-300 inline" />
          <span className="hidden md:inline">Print</span>
        </button>

        {/* Download PDF Button */}
        <button
          id="btn-download-pdf"
          onClick={onDownloadPDF}
          className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm"
          title="Download Examination Paper in PDF File"
        >
          <Download className="w-4 h-4 mr-1.5" />
          <span>Export PDF</span>
        </button>

        {/* School Info Settings */}
        <button
          id="btn-school-settings"
          onClick={onOpenSchoolModal}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Configure school name, address, and exam session"
        >
          <Settings2 className="w-4 h-4" />
        </button>

        {/* Light / Dark Mode Toggle */}
        {onToggleTheme && (
          <button
            id="btn-toggle-theme"
            onClick={onToggleTheme}
            className={`p-2 rounded-lg transition border flex items-center justify-center ${
              theme === "dark"
                ? "bg-slate-800 text-amber-300 hover:bg-slate-700 border-slate-700 hover:text-amber-200"
                : "bg-slate-800 text-blue-300 hover:bg-slate-700 border-slate-700 hover:text-white"
            }`}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-300 animate-in spin-in-180 duration-200" />
            ) : (
              <Moon className="w-4 h-4 text-blue-300 animate-in spin-in-180 duration-200" />
            )}
          </button>
        )}
      </div>
    </header>
  );
};


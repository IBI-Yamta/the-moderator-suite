import React, { useState } from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, ChevronDown, ChevronUp, Settings, Sparkles, Scale, BookOpen, Building2, History, BookmarkPlus } from "lucide-react";
import { ExamData, CompletionProgress } from "../types";
import { calculateCompletionProgress } from "../utils/completionTracker";

interface ExamProgressBarProps {
  examData: ExamData;
  onOpenSchoolModal: () => void;
  onOpenAuditModal: () => void;
  onOpenHistoryModal: () => void;
  onSaveSnapshot: () => void;
  theme?: "light" | "dark";
}

export const ExamProgressBar: React.FC<ExamProgressBarProps> = ({
  examData,
  onOpenSchoolModal,
  onOpenAuditModal,
  onOpenHistoryModal,
  onSaveSnapshot,
  theme = "light",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const progress: CompletionProgress = calculateCompletionProgress(examData);
  const isDark = theme === "dark";

  // Color selection based on progress
  let progressColor = "bg-amber-500";
  let textColor = "text-amber-600 dark:text-amber-400";
  let statusBadge = "In Progress";
  let badgeColor = "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-700/60";

  if (progress.overallPercentage >= 95) {
    progressColor = "bg-emerald-500";
    textColor = "text-emerald-600 dark:text-emerald-400";
    statusBadge = "100% Ready for Print & PDF";
    badgeColor = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/60";
  } else if (progress.overallPercentage >= 75) {
    progressColor = "bg-blue-600";
    textColor = "text-blue-600 dark:text-blue-400";
    statusBadge = "Almost Ready";
    badgeColor = "bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300 dark:border-blue-700/60";
  }

  const marksDiff = progress.calculatedMarks - progress.targetMarks;

  return (
    <div
      className={`w-full ${
        isDark ? "bg-slate-900/90 border-slate-800 text-slate-100" : "bg-white/95 border-slate-200/90 text-slate-800"
      } border-b shadow-2xs transition-all duration-200 no-print z-20 backdrop-blur-xs`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2">
        {/* Main Progress Bar Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4">
          {/* Left: Progress Track & Percentage */}
          <div className="flex-1 min-w-[240px] flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-blue-500" />
                <span>Paper Status:</span>
              </span>
              <span className={`text-xs sm:text-sm font-extrabold ${textColor}`}>
                {progress.overallPercentage}%
              </span>
            </div>

            {/* Progress Track */}
            <div className="flex-1 max-w-xs sm:max-w-sm h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative shadow-inner">
              <div
                className={`h-full ${progressColor} transition-all duration-500 rounded-full`}
                style={{ width: `${progress.overallPercentage}%` }}
              />
            </div>

            {/* Status Pill */}
            <span
              className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${badgeColor}`}
            >
              {progress.overallPercentage >= 95 ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
              ) : (
                <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
              )}
              <span>{statusBadge}</span>
            </span>
          </div>

          {/* Center: Live Key Metrics Pills */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
            {/* Header Fields Pill */}
            <button
              onClick={onOpenSchoolModal}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border transition cursor-pointer ${
                progress.requiredFieldsComplete
                  ? isDark
                    ? "bg-slate-800/80 text-emerald-300 border-emerald-900/60 hover:bg-slate-800"
                    : "bg-emerald-50/80 text-emerald-800 border-emerald-200 hover:bg-emerald-100/60"
                  : isDark
                  ? "bg-amber-950/40 text-amber-300 border-amber-800/60 hover:bg-amber-950/60"
                  : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
              }`}
              title="Click to edit school & exam information"
            >
              <Building2 className="w-3 h-3 text-blue-500" />
              <span className="font-semibold">{examData.subject || "Subject"}</span>
              <span className="text-slate-400 dark:text-slate-500">•</span>
              <span>{examData.classLevel || "Class"}</span>
              {progress.requiredFieldsComplete ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-500 ml-0.5" />
              ) : (
                <AlertCircle className="w-3 h-3 text-amber-500 ml-0.5" />
              )}
            </button>

            {/* Questions Count Pill */}
            <div
              className={`hidden md:inline-flex items-center gap-1.5 px-2 py-1 rounded-md border ${
                isDark ? "bg-slate-800/80 text-slate-300 border-slate-700" : "bg-slate-50 text-slate-700 border-slate-200"
              }`}
            >
              <BookOpen className="w-3 h-3 text-indigo-400" />
              <span>
                <strong>{examData.sectionA.questions.length}</strong> Obj + <strong>{examData.sectionB.questions.length}</strong> Theory
              </span>
            </div>

            {/* Total Marks Tally vs Defined Full Marks */}
            <div
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border font-mono ${
                progress.totalMarksMatched
                  ? isDark
                    ? "bg-emerald-950/50 text-emerald-300 border-emerald-800/60"
                    : "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : isDark
                  ? "bg-amber-950/50 text-amber-300 border-amber-800/60"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}
              title={
                progress.totalMarksMatched
                  ? "Allocated questions marks match the target full marks in school information."
                  : `Target: ${progress.targetMarks} marks | Questions allocated: ${progress.calculatedMarks} marks (${marksDiff > 0 ? `+${marksDiff} excess` : `${marksDiff} deficit`})`
              }
            >
              <span>Marks:</span>
              <span className="font-bold">
                {progress.calculatedMarks}/{progress.targetMarks}
              </span>
              {progress.totalMarksMatched ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-500 ml-0.5" />
              ) : (
                <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1 py-0.2 rounded font-bold">
                  {marksDiff > 0 ? `+${marksDiff}` : marksDiff}
                </span>
              )}
            </div>
          </div>

          {/* Right: Actions & Expand Checklist */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Save Snapshot Button */}
            <button
              id="btn-save-snapshot"
              onClick={onSaveSnapshot}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition border ${
                isDark
                  ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
              }`}
              title="Save an instant snapshot of this revision to your history"
            >
              <BookmarkPlus className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden sm:inline">Save Version</span>
            </button>

            {/* History Button */}
            <button
              id="btn-open-history"
              onClick={onOpenHistoryModal}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition border ${
                isDark
                  ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
              }`}
              title="Open previously generated / modified question papers"
            >
              <History className="w-3.5 h-3.5 text-amber-500" />
              <span>History</span>
            </button>

            {/* Expand / Collapse Details Button */}
            <button
              id="btn-toggle-progress-details"
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-1 sm:px-2 sm:py-1 rounded-md text-xs font-medium transition flex items-center gap-1 ${
                isDark
                  ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
              title={isExpanded ? "Hide checklist breakdown" : "Show full paper completion checklist"}
            >
              <span className="hidden md:inline">{isExpanded ? "Hide Details" : "Checklist"}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Expandable Breakdown Drawer */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2 duration-200 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {progress.categories.map((cat) => (
                <div
                  key={cat.id}
                  className={`p-3 rounded-lg border flex flex-col justify-between ${
                    isDark ? "bg-slate-800/60 border-slate-700/80" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{cat.title}</span>
                      <span
                        className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                          cat.score >= 85
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {cat.score}%
                      </span>
                    </div>

                    <ul className="space-y-1.5 text-[11px]">
                      {cat.details.map((d, i) => (
                        <li key={i} className="flex items-start gap-1.5 leading-tight">
                          {d.status === "pass" && <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />}
                          {d.status === "warn" && <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />}
                          {d.status === "fail" && <AlertCircle className="w-3 h-3 text-rose-500 shrink-0 mt-0.5" />}
                          <span className={d.status === "fail" ? "text-rose-500 font-semibold" : isDark ? "text-slate-300" : "text-slate-600"}>
                            <strong>{d.label}:</strong> {d.message}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Contextual Action Shortcut */}
                  <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex justify-end">
                    {cat.id === "school_info" && (
                      <button
                        onClick={onOpenSchoolModal}
                        className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <Settings className="w-2.5 h-2.5" /> Edit School Info
                      </button>
                    )}
                    {cat.id === "section_a" && (
                      <button
                        onClick={onOpenAuditModal}
                        className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <Sparkles className="w-2.5 h-2.5" /> View Audit Report
                      </button>
                    )}
                    {cat.id === "marks_alignment" && !progress.totalMarksMatched && (
                      <button
                        onClick={onOpenSchoolModal}
                        className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                      >
                        <Scale className="w-2.5 h-2.5" /> Set Target to {progress.calculatedMarks}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

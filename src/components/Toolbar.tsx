import React from "react";
import { Columns2, Columns, ZoomIn, ZoomOut, RotateCcw, Type, CheckCircle2 } from "lucide-react";
import { ExamData } from "../types";

interface ToolbarProps {
  examData: ExamData;
  onUpdateExamData: (updated: Partial<ExamData>) => void;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  totalQuestions: number;
  totalMarks: string;
  theme?: "light" | "dark";
}

export const Toolbar: React.FC<ToolbarProps> = ({
  examData,
  onUpdateExamData,
  zoom,
  onZoomChange,
  totalQuestions,
  totalMarks,
  theme = "light",
}) => {
  const isDark = theme === "dark";

  return (
    <div className={`${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} border-b px-4 sm:px-8 py-2.5 shadow-xs sticky top-0 z-30 no-print transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        {/* Left: Typography & Layout Settings */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Mandatory Times New Roman Standard */}
          <div className={`flex items-center space-x-1.5 ${isDark ? "bg-slate-800 text-slate-200 border-slate-700" : "bg-slate-100/90 text-slate-700 border-slate-200"} px-2.5 py-1 rounded-md font-serif border shadow-2xs`}>
            <Type className="w-3.5 h-3.5 text-blue-500" />
            <span className={`font-semibold text-xs ${isDark ? "text-slate-200" : "text-slate-800"}`}>Times New Roman</span>
            <span className="text-[10px] bg-blue-500/20 text-blue-400 font-sans px-1.5 py-0.2 rounded font-semibold border border-blue-500/30">Standard</span>
          </div>

          {/* Font Size Selector */}
          <div className={`flex items-center space-x-1 ${isDark ? "bg-slate-800/90 border-slate-700" : "bg-slate-100 border-slate-200"} p-0.5 rounded-md border`}>
            <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"} px-2 font-medium`}>Size:</span>
            {(["11pt", "12pt", "13pt"] as const).map((size) => (
              <button
                key={size}
                id={`btn-size-${size}`}
                onClick={() => onUpdateExamData({ fontSize: size })}
                className={`px-2 py-0.5 rounded text-xs font-medium transition ${
                  examData.fontSize === size
                    ? isDark
                      ? "bg-blue-600 text-white shadow-xs font-bold"
                      : "bg-white text-blue-700 shadow-xs border border-slate-300/80 font-bold"
                    : isDark
                    ? "text-slate-300 hover:text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Line Spacing Selector */}
          <div className={`flex items-center space-x-1 ${isDark ? "bg-slate-800/90 border-slate-700" : "bg-slate-100 border-slate-200"} p-0.5 rounded-md border`}>
            <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"} px-2 font-medium`}>Spacing:</span>
            {(["1.0", "1.15", "1.25"] as const).map((spacing) => (
              <button
                key={spacing}
                id={`btn-spacing-${spacing}`}
                onClick={() => onUpdateExamData({ lineSpacing: spacing })}
                className={`px-2 py-0.5 rounded text-xs font-medium transition ${
                  examData.lineSpacing === spacing
                    ? isDark
                      ? "bg-blue-600 text-white shadow-xs font-bold"
                      : "bg-white text-blue-700 shadow-xs border border-slate-300/80 font-bold"
                    : isDark
                    ? "text-slate-300 hover:text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {spacing}
              </button>
            ))}
          </div>

          {/* Options Style */}
          <div className={`flex items-center space-x-1 ${isDark ? "bg-slate-800/90 border-slate-700" : "bg-slate-100 border-slate-200"} p-0.5 rounded-md border`}>
            <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"} px-2 font-medium`}>Options:</span>
            <button
              id="btn-options-lowercase"
              onClick={() => onUpdateExamData({ optionsStyle: "(a), (b), (c), (d)" })}
              className={`px-2 py-0.5 rounded text-xs font-medium transition ${
                examData.optionsStyle === "(a), (b), (c), (d)"
                  ? isDark
                    ? "bg-blue-600 text-white shadow-xs font-bold"
                    : "bg-white text-blue-700 shadow-xs border border-slate-300/80 font-bold"
                  : isDark
                  ? "text-slate-300 hover:text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Standard lowercase options (a), (b), (c), (d)"
            >
              (a), (b), (c), (d)
            </button>
            <button
              id="btn-options-uppercase"
              onClick={() => onUpdateExamData({ optionsStyle: "(A), (B), (C), (D)" })}
              className={`px-2 py-0.5 rounded text-xs font-medium transition ${
                examData.optionsStyle === "(A), (B), (C), (D)"
                  ? isDark
                    ? "bg-blue-600 text-white shadow-xs font-bold"
                    : "bg-white text-blue-700 shadow-xs border border-slate-300/80 font-bold"
                  : isDark
                  ? "text-slate-300 hover:text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Uppercase options (A), (B), (C), (D)"
            >
              (A), (B), (C), (D)
            </button>
          </div>

          {/* Column Layout */}
          <div className={`flex items-center space-x-1 ${isDark ? "bg-slate-800/90 border-slate-700" : "bg-slate-100 border-slate-200"} p-0.5 rounded-md border`}>
            <button
              id="btn-layout-2col"
              onClick={() => onUpdateExamData({ layoutColumns: 2 })}
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium transition ${
                examData.layoutColumns === 2
                  ? isDark
                    ? "bg-blue-600 text-white shadow-xs font-bold"
                    : "bg-white text-blue-700 shadow-xs border border-slate-300/80 font-bold"
                  : isDark
                  ? "text-slate-300 hover:text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="2-Column Newspaper Layout (Nigerian Exam Standard)"
            >
              <Columns2 className="w-3.5 h-3.5 mr-1" />
              2 Columns
            </button>
            <button
              id="btn-layout-1col"
              onClick={() => onUpdateExamData({ layoutColumns: 1 })}
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium transition ${
                examData.layoutColumns === 1
                  ? isDark
                    ? "bg-blue-600 text-white shadow-xs font-bold"
                    : "bg-white text-blue-700 shadow-xs border border-slate-300/80 font-bold"
                  : isDark
                  ? "text-slate-300 hover:text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="1-Column Full Width Layout"
            >
              <Columns className="w-3.5 h-3.5 mr-1" />
              1 Column
            </button>
          </div>
        </div>

        {/* Right: Auto-Correct Status, Zoom & Summary Counters */}
        <div className="flex items-center space-x-3">
          {/* Auto-Correct Active Badge */}
          <div className={`hidden sm:flex items-center space-x-1 px-2.5 py-1 ${isDark ? "bg-emerald-950/60 text-emerald-300 border-emerald-800/60" : "bg-emerald-50 text-emerald-700 border-emerald-200"} rounded-md text-[11px] font-bold uppercase tracking-wider shadow-2xs border`}>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Auto-Correct Active</span>
          </div>

          {/* Quick Stats Pill */}
          <div className={`hidden xl:flex items-center space-x-2 text-xs ${isDark ? "text-slate-400 bg-slate-800 border-slate-700" : "text-slate-500 bg-slate-50 border-slate-200"} px-2.5 py-1 rounded-md border font-mono`}>
            <span>{totalQuestions} Questions</span>
            <span>•</span>
            <span className={`font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>Full Marks: {totalMarks}</span>
          </div>

          {/* Zoom Controller */}
          <div className={`flex items-center space-x-1 ${isDark ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"} p-0.5 rounded-md border`}>
            <button
              id="btn-zoom-out"
              onClick={() => onZoomChange(Math.max(0.6, zoom - 0.1))}
              className={`p-1 ${isDark ? "text-slate-300 hover:text-white hover:bg-slate-700" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"} rounded`}
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className={`text-xs font-mono px-1.5 ${isDark ? "text-slate-200" : "text-slate-700"} min-w-[40px] text-center`}>
              {Math.round(zoom * 100)}%
            </span>
            <button
              id="btn-zoom-in"
              onClick={() => onZoomChange(Math.min(1.5, zoom + 0.1))}
              className={`p-1 ${isDark ? "text-slate-300 hover:text-white hover:bg-slate-700" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"} rounded`}
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-zoom-reset"
              onClick={() => onZoomChange(1.0)}
              className={`p-1 ${isDark ? "text-slate-400 hover:text-slate-200 hover:bg-slate-700" : "text-slate-500 hover:text-slate-800 hover:bg-slate-200"} rounded`}
              title="Reset Zoom to 100%"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


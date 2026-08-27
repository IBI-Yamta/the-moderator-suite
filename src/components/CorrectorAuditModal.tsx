import React from "react";
import { X, CheckCircle2, ShieldCheck, FileCheck, ArrowRight, Sparkles, BookOpen } from "lucide-react";
import { AuditReport } from "../types";

interface CorrectorAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  audit: AuditReport;
  subject: string;
  classLevel: string;
}

export const CorrectorAuditModal: React.FC<CorrectorAuditModalProps> = ({
  isOpen,
  onClose,
  audit,
  subject,
  classLevel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Examiner & Corrector Audit Report
              </h2>
              <p className="text-xs text-slate-500">
                {subject} • {classLevel} • Logged at {audit.timestamp}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quality Score & Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-6 bg-slate-100/60 border-b border-slate-200 text-center">
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
            <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Quality Score</span>
            <span className="text-2xl font-extrabold text-emerald-600">
              {audit.qualityScore || 98}%
            </span>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
            <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Questions</span>
            <span className="text-2xl font-extrabold text-slate-800">
              {audit.totalQuestions}
            </span>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
            <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Corrections Made</span>
            <span className="text-2xl font-extrabold text-blue-600">
              {audit.corrections.length}
            </span>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
            <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Marks Total</span>
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
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Applied Corrections & Normalizations ({audit.corrections.length}):
          </h3>

          {audit.corrections.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              Paper is fully clean and compliant with academic standards!
            </div>
          ) : (
            audit.corrections.map((corr, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-white transition text-xs space-y-1"
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

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg transition"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};

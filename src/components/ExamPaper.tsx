import React from "react";
import { ExamData, ObjectiveQuestion, EssayQuestion } from "../types";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { SchoolLogo } from "./SchoolLogo";
import { cleanOptionText } from "../utils/parser";

interface ExamPaperProps {
  examData: ExamData;
  onEditQuestion?: (q: ObjectiveQuestion) => void;
  onEditEssayQuestion?: (q: EssayQuestion) => void;
}

export const ExamPaper: React.FC<ExamPaperProps> = ({
  examData,
  onEditQuestion,
  onEditEssayQuestion,
}) => {
  const isUppercase = examData.optionsStyle.includes("(A)");

  const formatOptionKey = (key: string): string => {
    const k = key.toLowerCase();
    if (examData.optionsStyle === "(a), (b), (c), (d)") return `(${k})`;
    if (examData.optionsStyle === "(A), (B), (C), (D)") return `(${k.toUpperCase()})`;
    if (examData.optionsStyle === "a), b), c), d)") return `${k})`;
    if (examData.optionsStyle === "A., B., C., D.") return `${k.toUpperCase()}.`;
    return `(${k})`;
  };

  const lineSpacingClass =
    examData.lineSpacing === "1.0"
      ? "leading-tight"
      : examData.lineSpacing === "1.25"
      ? "leading-snug"
      : "leading-[1.15]";

  const fontSizeClass =
    examData.fontSize === "10pt"
      ? "text-[10pt]"
      : examData.fontSize === "11pt"
      ? "text-[11pt]"
      : examData.fontSize === "13pt"
      ? "text-[13pt]"
      : "text-[12pt]";

  // Split Objective questions into 2 columns if 2-col layout is selected
  const half = Math.ceil(examData.sectionA.questions.length / 2);
  const col1Questions = examData.sectionA.questions.slice(0, half);
  const col2Questions = examData.sectionA.questions.slice(half);

  return (
    <div
      id="exam-paper-printable"
      className={`exam-page font-times bg-white text-black p-8 sm:p-12 transition-all ${fontSizeClass} ${lineSpacingClass}`}
      style={{
        fontFamily: '"Times New Roman", Times, "Liberation Serif", serif',
        lineHeight: examData.lineSpacing,
      }}
    >
      {/* 1. Header: School Crest & Details */}
      <div className="border-b-2 border-black pb-3 mb-3">
        <div className="flex items-center justify-between gap-4">
          {/* Official At-Tarbiyya Crest Logo */}
          <div className="shrink-0 flex items-center justify-center">
            <SchoolLogo size="md" className="drop-shadow-xs" />
          </div>

          {/* School Name & Titles */}
          <div className="text-center flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold uppercase tracking-wide leading-tight text-black font-times">
              {examData.schoolName}
            </h1>
            <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 mt-0.5 font-times">
              {examData.schoolMotto}
            </p>
            <p className="text-[11px] sm:text-xs font-serif text-slate-800 mt-0.5">
              {examData.schoolAddress}
            </p>
          </div>

          {/* Right Spacer or Crest mirror for balanced centering */}
          <div className="shrink-0 flex items-center justify-center opacity-0 pointer-events-none hidden sm:block">
            <SchoolLogo size="md" />
          </div>
        </div>
      </div>

      {/* 2. Examination Session Bar */}
      <div className="border-t border-b-2 border-black py-1.5 px-2 mb-2 flex items-center justify-between text-xs sm:text-sm font-bold">
        <div className="uppercase tracking-wide">
          {examData.termSession}
        </div>
        <div className="border-2 border-black px-3 py-0.5 uppercase bg-slate-100 font-extrabold text-sm sm:text-base">
          {examData.classLevel}
        </div>
      </div>

      {/* 3. Subject & Marks Row */}
      <div className="flex flex-wrap items-center justify-between px-2 py-1 bg-slate-50 border border-black text-xs sm:text-sm font-bold uppercase mb-4">
        <div>
          SUBJECT: <span className="font-extrabold">{examData.subject}</span>
        </div>
        {examData.timeAllowed && (
          <div>
            TIME: <span>{examData.timeAllowed}</span>
          </div>
        )}
        <div>
          FULL MARKS: <span className="font-extrabold">{examData.fullMarks}</span>
        </div>
      </div>

      {/* 4. SECTION A HEADER */}
      <div className="mb-4">
        <div className="bg-slate-900 text-white text-center py-1 px-3 font-bold text-xs sm:text-sm uppercase tracking-wider mb-1 shadow-xs print:bg-black">
          <em>{examData.sectionA.title}</em>
        </div>
        <div className="text-xs sm:text-sm italic text-slate-900 px-1 font-serif">
          <em>{examData.sectionA.instruction}</em>
        </div>
      </div>

      {/* 5. SECTION A: OBJECTIVE QUESTIONS */}
      {examData.layoutColumns === 2 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 relative mb-6">
          {/* Center Dividing Rule for Print / Newspaper Column */}
          <div className="hidden md:block absolute top-0 bottom-0 left-1/2 -ml-px w-px bg-slate-400"></div>

          {/* Column 1 */}
          <div className="space-y-2.5">
            {col1Questions.map((q) => (
              <div
                key={q.id}
                className="group relative text-justify page-break-inside-avoid"
              >
                <div className="flex items-start">
                  <span className="font-bold mr-1 shrink-0">{q.questionNumber}.</span>
                  <div className="flex-1">
                    <span>{q.questionText}</span>
                    {/* Linear Options */}
                    <span className="ml-1 inline">
                      {q.options.map((opt) => (
                        <span key={opt.key} className="inline-block mr-2 whitespace-normal">
                          <span className="font-semibold">{formatOptionKey(opt.key)}</span>
                          <span className="ml-0.5">{cleanOptionText(opt.text)}</span>
                        </span>
                      ))}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Column 2 */}
          <div className="space-y-2.5">
            {col2Questions.map((q) => (
              <div
                key={q.id}
                className="group relative text-justify page-break-inside-avoid"
              >
                <div className="flex items-start">
                  <span className="font-bold mr-1 shrink-0">{q.questionNumber}.</span>
                  <div className="flex-1">
                    <span>{q.questionText}</span>
                    {/* Linear Options */}
                    <span className="ml-1 inline">
                      {q.options.map((opt) => (
                        <span key={opt.key} className="inline-block mr-2 whitespace-normal">
                          <span className="font-semibold">{formatOptionKey(opt.key)}</span>
                          <span className="ml-0.5">{cleanOptionText(opt.text)}</span>
                        </span>
                      ))}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* 1-Column Layout */
        <div className="space-y-3 mb-6">
          {examData.sectionA.questions.map((q) => (
            <div
              key={q.id}
              className="group relative text-justify page-break-inside-avoid"
            >
              <div className="flex items-start">
                <span className="font-bold mr-1.5 shrink-0">{q.questionNumber}.</span>
                <div className="flex-1">
                  <span>{q.questionText}</span>
                  {/* Linear Options */}
                  <div className="mt-0.5">
                    {q.options.map((opt) => (
                      <span key={opt.key} className="inline-block mr-3">
                        <span className="font-semibold">{formatOptionKey(opt.key)}</span>
                        <span className="ml-0.5">{cleanOptionText(opt.text)}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 6. SECTION B: ESSAY QUESTIONS */}
      {examData.sectionB && examData.sectionB.questions.length > 0 && (
        <div className="mt-8 page-break-inside-avoid">
          {/* Section B Banner */}
          <div className="bg-slate-900 text-white text-center py-1 px-3 font-bold text-xs sm:text-sm uppercase tracking-wider mb-1 shadow-xs print:bg-black">
            <em>{examData.sectionB.title}</em>
          </div>
          <div className="text-xs sm:text-sm italic text-slate-900 px-1 mb-4 font-serif">
            <em>{examData.sectionB.instruction}</em>
          </div>

          {/* Essay Questions List */}
          <div className="space-y-4">
            {examData.sectionB.questions.map((eq, eqIdx) => (
              <div
                key={eqIdx}
                className="border-b border-slate-200 pb-3 last:border-none page-break-inside-avoid"
              >
                {/* Main Question Label & Text */}
                {eq.subQuestions && eq.subQuestions.length > 0 ? (
                  <div className="space-y-1.5">
                    {eq.subQuestions.map((sub, subIdx) => {
                      const isNested = sub.label.match(/^(i|ii|iii|iv|v|vi)$/i);
                      return (
                        <div
                          key={subIdx}
                          className={`flex items-start justify-between ${
                            isNested ? "pl-6 sm:pl-8" : ""
                          }`}
                        >
                          <div className="flex items-start flex-1 mr-4">
                            <span className="font-bold mr-1.5 shrink-0">
                              {sub.label}.
                            </span>
                            <span className="text-slate-900">{sub.text}</span>
                          </div>
                          {sub.marks && (
                            <span className="font-bold text-right shrink-0 text-slate-800">
                              <em>{sub.marks}</em>
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex items-start flex-1 mr-4">
                      <span className="font-bold mr-2 shrink-0">
                        {eq.questionNumber}.
                      </span>
                      <span>{eq.text}</span>
                    </div>
                    {eq.marks && (
                      <span className="font-bold text-right shrink-0">
                        <em>{eq.marks}</em>
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Footer: Do Not Write Notice & Moderator Verification Stamp */}
      <div className="mt-10 pt-4 border-t-2 border-black text-center font-bold text-xs sm:text-sm tracking-wider uppercase">
        <em>{examData.footerNotice}</em>
      </div>

      <div className="mt-4 pt-2 border-t border-slate-200 flex justify-between items-center text-[9pt] sm:text-[10pt] text-slate-400 font-mono">
        <span>Moderator ID: #9921-X (At-Tarbiyya Standards)</span>
        <span>Page 1 of 1</span>
      </div>
    </div>
  );
};

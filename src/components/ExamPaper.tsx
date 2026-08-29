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
  const orientation = examData.pageOrientation || "portrait";

  return (
    <div
      id="exam-paper-printable"
      className={`exam-page orientation-${orientation} font-times bg-white text-black p-4 sm:p-8 md:p-10 transition-all relative overflow-hidden ${fontSizeClass} ${lineSpacingClass}`}
      style={{
        fontFamily: '"Times New Roman", Times, "Liberation Serif", serif',
        lineHeight: examData.lineSpacing,
        color: "#000000",
        backgroundColor: "#ffffff",
      }}
    >
      <style>{`
        @page {
          size: A4 ${orientation};
          margin: 6mm 6mm 6mm 6mm;
        }
      `}</style>

      {/* Official School Crest Logo Background Watermark (Subtle & Compact) */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-0 opacity-[0.04] print:opacity-[0.035] flex items-center justify-center"
        style={{ width: "220px", height: "260px", maxWidth: "60%" }}
        aria-hidden="true"
      >
        <SchoolLogo size="custom" className="w-full h-full" />
      </div>

      <div className="relative z-10">
        {/* 1. Header: School Crest & Details (Compact & Borderless) */}
        <div className="pb-1 mb-1 text-black bg-white">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            {/* Official At-Tarbiyya Crest Logo (Reduced Size) */}
            <div className="shrink-0 flex items-center justify-center">
              <SchoolLogo size="sm" className="w-11 h-13 sm:w-12 sm:h-14" />
            </div>

            {/* School Name & Titles */}
            <div className="text-center flex-1 min-w-0">
              <h1 className="text-sm sm:text-base md:text-lg font-bold uppercase tracking-wider leading-tight text-black font-times">
                {examData.schoolName}
              </h1>
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-black mt-0.5 font-times leading-tight">
                {examData.schoolMotto}
              </p>
              <p className="text-[9.5px] sm:text-[10.5px] font-serif text-black mt-0.5 leading-tight">
                {examData.schoolAddress}
              </p>
            </div>

            {/* Right Spacer matching logo for balanced centering */}
            <div className="shrink-0 flex items-center justify-center opacity-0 pointer-events-none hidden sm:block w-11 h-13 sm:w-12 sm:h-14">
              <SchoolLogo size="sm" />
            </div>
          </div>
        </div>

        {/* 2. Examination Session & Class Bar */}
        <div className="py-1 mb-1 flex items-center justify-between text-xs sm:text-sm font-bold text-black bg-white">
          <div className="uppercase tracking-wide text-black font-semibold">
            {examData.termSession}
          </div>
          {/* Individual Grey Rectangle for CLASS */}
          <div className="border border-black bg-gray-100 px-2.5 py-0.5 uppercase font-bold text-xs sm:text-sm text-black">
            CLASS: <span className="font-extrabold">{examData.classLevel}</span>
          </div>
        </div>

        {/* 3. Subject & Marks Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 py-1 text-xs sm:text-sm font-bold uppercase mb-1 text-black bg-white">
          {/* Individual Grey Rectangle for SUBJECT */}
          <div className="border border-black bg-gray-100 px-2.5 py-0.5 font-bold text-xs sm:text-sm text-black">
            SUBJECT: <span className="font-extrabold">{examData.subject}</span>
          </div>
          {examData.timeAllowed && (
            <div>
              TIME: <span className="text-black">{examData.timeAllowed}</span>
            </div>
          )}
          <div>
            FULL MARKS: <span className="font-extrabold text-black">{examData.fullMarks}</span>
          </div>
        </div>

        {/* Thick Horizontal Line Separating Headers and Section A */}
        <div className="border-b-2 border-black my-2 w-full"></div>

        {/* 4. SECTION A HEADER (White Background, Underlined, No Black Boxes) */}
        <div className="mb-2 text-center">
          <div className="font-bold text-xs sm:text-sm uppercase tracking-wide text-black underline mb-0.5 bg-white">
            {examData.sectionA.title}
          </div>
          <div className="text-xs italic text-black px-1 font-serif text-left sm:text-center">
            <em>{examData.sectionA.instruction}</em>
          </div>
        </div>

        {/* 5. SECTION A: OBJECTIVE QUESTIONS */}
        {examData.layoutColumns === 2 ? (
          <div className="exam-2col-grid grid grid-cols-2 gap-x-8 gap-y-2 relative mb-4 bg-white">
            {/* Straight Vertical Line Separator for the 2 Columns */}
            <div className="exam-col-divider block absolute top-0 bottom-0 left-1/2 -ml-px w-px bg-black pointer-events-none"></div>

            {/* Column 1 */}
            <div className="space-y-2 bg-white pr-2">
              {col1Questions.map((q) => (
                <div
                  key={q.id}
                  className="relative text-justify page-break-inside-avoid break-words bg-white text-black"
                >
                  <div className="flex items-start">
                    <span className="font-bold mr-1 shrink-0 text-black">{q.questionNumber}.</span>
                    <div className="flex-1 min-w-0 text-black">
                      <span className="text-black">{q.questionText}</span>
                      {/* Linear Options */}
                      <span className="ml-1 inline text-black">
                        {q.options.map((opt) => (
                          <span key={opt.key} className="inline-block mr-2 whitespace-normal break-words text-black">
                            <span className="font-bold text-black">{formatOptionKey(opt.key)}</span>
                            <span className="ml-0.5 text-black">{cleanOptionText(opt.text)}</span>
                          </span>
                        ))}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Column 2 */}
            <div className="space-y-2 bg-white pl-2">
              {col2Questions.map((q) => (
                <div
                  key={q.id}
                  className="relative text-justify page-break-inside-avoid break-words bg-white text-black"
                >
                  <div className="flex items-start">
                    <span className="font-bold mr-1 shrink-0 text-black">{q.questionNumber}.</span>
                    <div className="flex-1 min-w-0 text-black">
                      <span className="text-black">{q.questionText}</span>
                      {/* Linear Options */}
                      <span className="ml-1 inline text-black">
                        {q.options.map((opt) => (
                          <span key={opt.key} className="inline-block mr-2 whitespace-normal break-words text-black">
                            <span className="font-bold text-black">{formatOptionKey(opt.key)}</span>
                            <span className="ml-0.5 text-black">{cleanOptionText(opt.text)}</span>
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
          <div className="space-y-2.5 mb-4 bg-white">
            {examData.sectionA.questions.map((q) => (
              <div
                key={q.id}
                className="relative text-justify page-break-inside-avoid break-words bg-white text-black"
              >
                <div className="flex items-start">
                  <span className="font-bold mr-1.5 shrink-0 text-black">{q.questionNumber}.</span>
                  <div className="flex-1 min-w-0 text-black">
                    <span className="text-black">{q.questionText}</span>
                    {/* Linear Options */}
                    <div className="mt-0.5 text-black">
                      {q.options.map((opt) => (
                        <span key={opt.key} className="inline-block mr-3 whitespace-normal break-words text-black">
                          <span className="font-bold text-black">{formatOptionKey(opt.key)}</span>
                          <span className="ml-0.5 text-black">{cleanOptionText(opt.text)}</span>
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
          <div className="mt-5 page-break-inside-avoid bg-white">
            {/* Section B Banner (Pure White, Underlined, No Black Box) */}
            <div className="mb-2 text-center">
              <div className="font-bold text-xs sm:text-sm uppercase tracking-wide text-black underline mb-0.5 bg-white">
                {examData.sectionB.title}
              </div>
              <div className="text-xs italic text-black px-1 mb-2 font-serif text-left sm:text-center">
                <em>{examData.sectionB.instruction}</em>
              </div>
            </div>

            {/* Essay Questions List - Strictly Arranged in Sequential Numerical Order & Borderless */}
            <div className="space-y-3 bg-white">
              {examData.sectionB.questions.map((eq, eqIdx) => {
                const questionNum = eqIdx + 1;
                const hasSubQuestions = Boolean(eq.subQuestions && eq.subQuestions.length > 0);
                const isGenericStem = !eq.text || eq.text.toLowerCase().startsWith("answer all parts");
                const hasDistinctStem = !isGenericStem && eq.text.trim().length > 0;

                return (
                  <div
                    key={eqIdx}
                    className="pb-2 last:pb-0 page-break-inside-avoid break-words bg-white text-black"
                  >
                    {hasDistinctStem ? (
                      /* Main question stem present */
                      <div>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start flex-1 mr-4 min-w-0">
                            <span className="font-bold mr-2 shrink-0 text-black">
                              {questionNum}.
                            </span>
                            <span className="text-black font-semibold">{eq.text}</span>
                          </div>
                          {eq.marks && (
                            <span className="font-bold text-right shrink-0 text-black">
                              <em>{eq.marks}</em>
                            </span>
                          )}
                        </div>

                        {/* Indented Sub-parts */}
                        {hasSubQuestions && (
                          <div className="pl-6 sm:pl-8 space-y-1 mt-1.5">
                            {eq.subQuestions.map((sub, subIdx) => {
                              const isNested = sub.label.match(/^(i|ii|iii|iv|v|vi)$/i);
                              return (
                                <div
                                  key={subIdx}
                                  className={`flex items-start justify-between ${
                                    isNested ? "pl-4" : ""
                                  }`}
                                >
                                  <div className="flex items-start flex-1 mr-4 min-w-0">
                                    <span className="font-bold mr-1.5 shrink-0 text-black">
                                      ({sub.label.toLowerCase()})
                                    </span>
                                    <span className="text-black">{sub.text}</span>
                                  </div>
                                  {sub.marks && (
                                    <span className="font-bold text-right shrink-0 text-black">
                                      <em>{sub.marks}</em>
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : hasSubQuestions ? (
                      /* Sub-questions starting right beside the question number (e.g. 1. (a) ... (b) ...) */
                      <div className="space-y-1">
                        {eq.subQuestions.map((sub, subIdx) => {
                          const isNested = sub.label.match(/^(i|ii|iii|iv|v|vi)$/i);
                          return (
                            <div
                              key={subIdx}
                              className={`flex items-start justify-between ${
                                subIdx > 0 ? "pl-6 sm:pl-7" : ""
                              } ${isNested && subIdx > 0 ? "pl-10" : ""}`}
                            >
                              <div className="flex items-start flex-1 mr-4 min-w-0">
                                {subIdx === 0 && (
                                  <span className="font-bold mr-1.5 shrink-0 text-black">
                                    {questionNum}.
                                  </span>
                                )}
                                <span className="font-bold mr-1.5 shrink-0 text-black">
                                  ({sub.label.toLowerCase()})
                                </span>
                                <span className="text-black">{sub.text}</span>
                              </div>
                              {sub.marks && (
                                <span className="font-bold text-right shrink-0 text-black">
                                  <em>{sub.marks}</em>
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* Direct Single Essay Question */
                      <div className="flex items-start justify-between">
                        <div className="flex items-start flex-1 mr-4 min-w-0">
                          <span className="font-bold mr-2 shrink-0 text-black">
                            {questionNum}.
                          </span>
                          <span className="text-black">{eq.text}</span>
                        </div>
                        {eq.marks && (
                          <span className="font-bold text-right shrink-0 text-black">
                            <em>{eq.marks}</em>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 7. Footer: Do Not Write Notice & Moderator Verification (Clean & Borderless) */}
        <div className="mt-6 pt-2 text-center font-bold text-xs tracking-wider uppercase text-black">
          <em>{examData.footerNotice}</em>
        </div>

        <div className="mt-2 pt-1 flex justify-between items-center text-[8.5pt] sm:text-[9pt] text-black font-mono">
          <span>Moderator ID: #9921-X (At-Tarbiyya Standards)</span>
          <span>Page 1 of 1</span>
        </div>
      </div>
    </div>
  );
};

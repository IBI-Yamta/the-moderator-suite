export interface OptionItem {
  key: string; // 'a' | 'b' | 'c' | 'd'
  text: string;
}

export interface ObjectiveQuestion {
  id: number;
  questionNumber: number;
  questionText: string;
  options: OptionItem[];
  correctAnswer?: string;
  marks?: number;
}

export interface EssaySubQuestion {
  label: string; // e.g. "1a", "i", "ii", "1b"
  text: string;
  marks?: string; // e.g. "[2 marks]"
}

export interface EssayQuestion {
  questionNumber: string; // e.g. "1", "2", "3"
  text: string;
  marks?: string; // e.g. "[10 marks]"
  subQuestions: EssaySubQuestion[];
}

export interface ExamSectionA {
  title: string; // e.g. "SECTION A: OBJECTIVE QUESTIONS [30 MARKS]"
  instruction: string; // e.g. "Instruction: Answer all questions in this section by selecting the most appropriate option."
  marks?: string;
  questions: ObjectiveQuestion[];
}

export interface ExamSectionB {
  title: string; // e.g. "SECTION B: ESSAY QUESTIONS [40 MARKS]"
  instruction: string; // e.g. "Instruction: Answer any FOUR (4) questions. Each question carries 10 marks..."
  marks?: string;
  questions: EssayQuestion[];
}

export interface ExamData {
  schoolName: string;
  schoolMotto: string;
  schoolAddress: string;
  contactInfo: string;
  termSession: string;
  subject: string;
  classLevel: string;
  timeAllowed: string;
  fullMarks: string;
  sectionA: ExamSectionA;
  sectionB: ExamSectionB;
  footerNotice: string;
  optionsStyle: "(a), (b), (c), (d)" | "(A), (B), (C), (D)" | "a), b), c), d)" | "A., B., C., D.";
  layoutColumns: 1 | 2;
  fontSize: "10pt" | "11pt" | "12pt" | "13pt";
  lineSpacing: "1.0" | "1.15" | "1.25" | "1.5";
  fontFamily: "Times New Roman" | "Georgia" | "Arial" | "Calibri";
  optionsLinear: boolean;
  pageOrientation?: "portrait" | "landscape";
}

export interface CorrectionItem {
  type: "abbreviation" | "option_fix" | "typo" | "grammar" | "formatting" | "punctuation";
  original: string;
  corrected: string;
  description: string;
  location?: string;
}

export interface AuditReport {
  timestamp: string;
  totalQuestions: number;
  sectionACount: number;
  sectionBCount: number;
  totalCalculatedMarks: number;
  corrections: CorrectionItem[];
  examinerComments?: string;
  qualityScore?: number;
}

export interface MarkingGuideData {
  subject: string;
  classLevel: string;
  objectiveAnswers: {
    questionNumber: number;
    answer: string;
    explanation?: string;
  }[];
  essayMarkingScheme: {
    questionNumber: string;
    expectedPoints: string[];
    allocatedMarks?: string;
  }[];
}

export type ExamHistorySource = "ai_moderate" | "ocr_scan" | "paste_import" | "manual_snapshot" | "quick_edit";

export interface ExamHistoryItem {
  id: string;
  timestamp: string; // ISO string
  formattedDate: string; // e.g. "Aug 28, 2026, 2:30 PM"
  title: string;
  subject: string;
  classLevel: string;
  termSession: string;
  totalQuestions: number;
  sectionACount: number;
  sectionBCount: number;
  fullMarks: string;
  calculatedMarks: number;
  source: ExamHistorySource;
  qualityScore?: number;
  correctionsCount?: number;
  examData: ExamData;
  auditReport?: AuditReport;
}

export interface CompletionCategory {
  id: string;
  title: string;
  score: number; // 0 to 100
  weight: number; // percentage weight
  isComplete: boolean;
  details: {
    label: string;
    status: "pass" | "warn" | "fail";
    message: string;
  }[];
}

export interface CompletionProgress {
  overallPercentage: number;
  isReady: boolean;
  requiredFieldsComplete: boolean;
  totalMarksMatched: boolean;
  targetMarks: number;
  calculatedMarks: number;
  categories: CompletionCategory[];
  issuesCount: number;
}

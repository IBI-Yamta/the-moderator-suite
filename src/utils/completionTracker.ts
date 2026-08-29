import { ExamData, CompletionProgress, CompletionCategory } from "../types";
import { calculateExamMarks } from "./historyStorage";

/**
 * Evaluates the full completion status of the examination paper
 * based on required school information fields, question validity, and total marks tally.
 */
export function calculateCompletionProgress(examData: ExamData): CompletionProgress {
  const targetMarks = parseInt(examData.fullMarks, 10) || 60;
  const calculatedMarks = calculateExamMarks(examData);

  // 1. School Information & Header Fields (Weight: 25%)
  const headerDetails: CompletionCategory["details"] = [];
  let headerPassed = 0;
  let headerTotal = 0;

  // School Name
  headerTotal++;
  if (examData.schoolName?.trim()) {
    headerDetails.push({ label: "School Name", status: "pass", message: `Defined: "${examData.schoolName}"` });
    headerPassed++;
  } else {
    headerDetails.push({ label: "School Name", status: "fail", message: "School name is missing" });
  }

  // Subject
  headerTotal++;
  if (examData.subject?.trim()) {
    headerDetails.push({ label: "Subject", status: "pass", message: `Defined: "${examData.subject}"` });
    headerPassed++;
  } else {
    headerDetails.push({ label: "Subject", status: "fail", message: "Subject is required" });
  }

  // Class Level
  headerTotal++;
  if (examData.classLevel?.trim()) {
    headerDetails.push({ label: "Class Level", status: "pass", message: `Defined: "${examData.classLevel}"` });
    headerPassed++;
  } else {
    headerDetails.push({ label: "Class Level", status: "fail", message: "Class level is missing" });
  }

  // Term & Session
  headerTotal++;
  if (examData.termSession?.trim()) {
    headerDetails.push({ label: "Term & Session", status: "pass", message: `Defined: "${examData.termSession}"` });
    headerPassed++;
  } else {
    headerDetails.push({ label: "Term & Session", status: "warn", message: "Academic session / term is missing" });
  }

  // Full Marks Target Defined
  headerTotal++;
  if (targetMarks > 0) {
    headerDetails.push({ label: "Full Marks Target", status: "pass", message: `Target defined: ${targetMarks} Marks` });
    headerPassed++;
  } else {
    headerDetails.push({ label: "Full Marks Target", status: "fail", message: "Target full marks not set in school info" });
  }

  // Optional: Time Allowed (if defined, passes; if blank, friendly note without penalty)
  if (examData.timeAllowed?.trim()) {
    headerTotal++;
    headerDetails.push({ label: "Time Allowed", status: "pass", message: `Allocated: "${examData.timeAllowed}"` });
    headerPassed++;
  }

  // Optional: School Address
  if (examData.schoolAddress?.trim()) {
    headerTotal++;
    headerDetails.push({ label: "School Address", status: "pass", message: "School location defined" });
    headerPassed++;
  }

  const headerScore = headerTotal > 0 ? Math.round((headerPassed / headerTotal) * 100) : 100;

  // 2. Section A: Multiple-Choice Objectives (Weight: 35%)
  const secADetails: CompletionCategory["details"] = [];
  const secAQuestions = examData.sectionA?.questions || [];
  let secAPassed = 0;
  let secATotalChecks = 3;

  if (examData.sectionA?.instruction?.trim()) {
    secADetails.push({ label: "Section A Instructions", status: "pass", message: "Instructions provided" });
    secAPassed++;
  } else {
    secADetails.push({ label: "Section A Instructions", status: "warn", message: "Section instruction missing" });
  }

  if (secAQuestions.length > 0) {
    secADetails.push({
      label: "Objectives Count",
      status: "pass",
      message: `${secAQuestions.length} multiple-choice question(s) present`,
    });
    secAPassed++;
  } else {
    secADetails.push({
      label: "Objectives Count",
      status: "warn",
      message: "No Section A objective questions added",
    });
  }

  // Check validity of options (a, b, c, d)
  let incompleteQuestions = 0;
  secAQuestions.forEach((q) => {
    const validOpts = q.options?.filter((opt) => opt.text && opt.text.trim().length > 0) || [];
    if (validOpts.length < 3 || !q.questionText?.trim()) {
      incompleteQuestions++;
    }
  });

  if (secAQuestions.length > 0 && incompleteQuestions === 0) {
    secADetails.push({
      label: "Option Consistency",
      status: "pass",
      message: `All ${secAQuestions.length} questions have complete options (a-d)`,
    });
    secAPassed++;
  } else if (secAQuestions.length > 0) {
    secADetails.push({
      label: "Option Consistency",
      status: "warn",
      message: `${incompleteQuestions} question(s) have missing or incomplete options`,
    });
  } else {
    secADetails.push({
      label: "Option Consistency",
      status: "pass",
      message: "No objective questions to validate",
    });
    secAPassed++;
  }

  const secAScore = Math.round((secAPassed / secATotalChecks) * 100);

  // 3. Section B: Essay & Structured Questions (Weight: 20%)
  const secBDetails: CompletionCategory["details"] = [];
  const secBQuestions = examData.sectionB?.questions || [];
  let secBScore = 100;

  if (secBQuestions.length > 0) {
    let bPassed = 0;
    let bChecks = 2;

    if (examData.sectionB?.instruction?.trim()) {
      secBDetails.push({ label: "Section B Instructions", status: "pass", message: "Essay rubric instruction provided" });
      bPassed++;
    } else {
      secBDetails.push({ label: "Section B Instructions", status: "warn", message: "Essay instruction missing" });
    }

    // Check subquestions and marks
    let questionsWithMarks = 0;
    secBQuestions.forEach((q) => {
      if (q.marks || q.subQuestions.some((s) => s.marks)) {
        questionsWithMarks++;
      }
    });

    if (questionsWithMarks >= secBQuestions.length) {
      secBDetails.push({
        label: "Theory Marks Allocated",
        status: "pass",
        message: `All ${secBQuestions.length} theory questions have allocated marks`,
      });
      bPassed++;
    } else {
      secBDetails.push({
        label: "Theory Marks Allocated",
        status: "warn",
        message: `${secBQuestions.length - questionsWithMarks} question(s) lack explicit mark allocations`,
      });
    }

    secBScore = Math.round((bPassed / bChecks) * 100);
  } else {
    secBDetails.push({
      label: "Section B",
      status: "pass",
      message: "Optional / Purely Multiple-Choice Paper Mode",
    });
  }

  // 4. Total Marks Alignment vs Defined Target (Weight: 20%)
  const marksDetails: CompletionCategory["details"] = [];
  let marksScore = 0;
  const marksDiff = calculatedMarks - targetMarks;

  if (targetMarks > 0 && (calculatedMarks === targetMarks || Math.abs(marksDiff) === 0)) {
    marksScore = 100;
    marksDetails.push({
      label: "Marks Balance",
      status: "pass",
      message: `Perfect match: Allocated marks (${calculatedMarks}) equal target full marks (${targetMarks}).`,
    });
  } else if (targetMarks > 0 && Math.abs(marksDiff) <= 5) {
    marksScore = 80;
    marksDetails.push({
      label: "Marks Balance",
      status: "warn",
      message: `Minor difference: Allocated ${calculatedMarks} Marks vs ${targetMarks} Target (${marksDiff > 0 ? `+${marksDiff}` : marksDiff} marks).`,
    });
  } else if (targetMarks > 0) {
    marksScore = Math.max(30, Math.round(100 - Math.min(70, Math.abs(marksDiff) * 3)));
    marksDetails.push({
      label: "Marks Balance",
      status: "fail",
      message: `Marks mismatch: Questions total ${calculatedMarks} Marks, but School Header specifies ${targetMarks} Marks (${marksDiff > 0 ? `+${marksDiff} excess` : `${Math.abs(marksDiff)} deficit`}).`,
    });
  } else {
    marksScore = 50;
    marksDetails.push({
      label: "Marks Balance",
      status: "warn",
      message: "Target marks not defined in School Information",
    });
  }

  // Compute Overall Weighted Percentage
  // Weights: Header (25%), Sec A (35%), Sec B (20%), Marks Alignment (20%)
  const overallPercentage = Math.min(
    100,
    Math.round(
      headerScore * 0.25 +
      secAScore * 0.35 +
      secBScore * 0.20 +
      marksScore * 0.20
    )
  );

  const categories: CompletionCategory[] = [
    {
      id: "school_info",
      title: "School & Exam Information",
      score: headerScore,
      weight: 25,
      isComplete: headerScore >= 85,
      details: headerDetails,
    },
    {
      id: "section_a",
      title: "Section A: Multiple-Choice Objectives",
      score: secAScore,
      weight: 35,
      isComplete: secAScore >= 85,
      details: secADetails,
    },
    {
      id: "section_b",
      title: "Section B: Essay & Theory Questions",
      score: secBScore,
      weight: 20,
      isComplete: secBScore >= 80,
      details: secBDetails,
    },
    {
      id: "marks_alignment",
      title: "Total Marks Alignment",
      score: marksScore,
      weight: 20,
      isComplete: marksScore >= 85,
      details: marksDetails,
    },
  ];

  let issuesCount = 0;
  categories.forEach((cat) => {
    cat.details.forEach((d) => {
      if (d.status === "fail" || d.status === "warn") issuesCount++;
    });
  });

  // If there are zero failed or warning issues across all checklist items, enforce 100%
  const finalPercentage = issuesCount === 0 ? 100 : overallPercentage;

  return {
    overallPercentage: finalPercentage,
    isReady: finalPercentage >= 85 && headerScore >= 80,
    requiredFieldsComplete: headerScore >= 80,
    totalMarksMatched: Math.abs(marksDiff) === 0,
    targetMarks,
    calculatedMarks,
    categories,
    issuesCount,
  };
}

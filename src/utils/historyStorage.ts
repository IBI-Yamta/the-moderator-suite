import { ExamData, AuditReport, ExamHistoryItem, ExamHistorySource } from "../types";
import { INITIAL_EXAM_DATA } from "./sampleData";

const STORAGE_KEY = "the_moderator_exam_history_v1.0";
const MAX_HISTORY_ITEMS = 40;

function formatTimestamp(date: Date): string {
  try {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return date.toLocaleString();
  }
}

/**
 * Calculates total allocated marks in an exam data structure
 */
export function calculateExamMarks(examData: ExamData): number {
  let secAMarks = 0;
  // Parse section A marks from title e.g. "[30 MARKS]" or default 1 mark per question
  const secATitleMarks = examData.sectionA.title.match(/[\[(](\d+)\s*marks?[\])]/i);
  if (secATitleMarks) {
    secAMarks = parseInt(secATitleMarks[1], 10);
  } else {
    secAMarks = examData.sectionA.questions.length;
  }

  let secBMarks = 0;
  // Check section B title marks
  const secBTitleMarks = examData.sectionB.title.match(/[\[(](\d+)\s*marks?[\])]/i);
  if (secBTitleMarks) {
    secBMarks = parseInt(secBTitleMarks[1], 10);
  } else {
    // Sum individual question/sub-question marks
    examData.sectionB.questions.forEach((q) => {
      const qMarks = q.marks?.match(/[\[(]?(\d+)\s*marks?[\])]?/i);
      if (qMarks) {
        secBMarks += parseInt(qMarks[1], 10);
      } else {
        // Check subquestions
        let subSum = 0;
        q.subQuestions.forEach((sub) => {
          const sMarks = sub.marks?.match(/[\[(]?(\d+)\s*marks?[\])]?/i);
          if (sMarks) subSum += parseInt(sMarks[1], 10);
        });
        secBMarks += subSum > 0 ? subSum : 10;
      }
    });
  }

  return secAMarks + secBMarks;
}

/**
 * Retrieves all saved examination history from localStorage
 */
export function getExamHistory(): ExamHistoryItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed initial history item if empty
      const initialItem: ExamHistoryItem = {
        id: "seed-default-gov-sss2",
        timestamp: new Date().toISOString(),
        formattedDate: formatTimestamp(new Date()),
        title: "GOVERNMENT — SSS 2 (WAEC/NECO Standard)",
        subject: INITIAL_EXAM_DATA.subject,
        classLevel: INITIAL_EXAM_DATA.classLevel,
        termSession: INITIAL_EXAM_DATA.termSession,
        totalQuestions:
          INITIAL_EXAM_DATA.sectionA.questions.length + INITIAL_EXAM_DATA.sectionB.questions.length,
        sectionACount: INITIAL_EXAM_DATA.sectionA.questions.length,
        sectionBCount: INITIAL_EXAM_DATA.sectionB.questions.length,
        fullMarks: INITIAL_EXAM_DATA.fullMarks,
        calculatedMarks: calculateExamMarks(INITIAL_EXAM_DATA),
        source: "manual_snapshot",
        qualityScore: 99,
        correctionsCount: 5,
        examData: INITIAL_EXAM_DATA,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify([initialItem]));
      return [initialItem];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (err) {
    console.error("Failed to load exam history from localStorage:", err);
  }
  return [];
}

/**
 * Saves a new exam snapshot into history
 */
export function saveExamToHistory(
  examData: ExamData,
  source: ExamHistorySource = "manual_snapshot",
  customTitle?: string,
  auditReport?: AuditReport
): ExamHistoryItem {
  const history = getExamHistory();
  const now = new Date();

  const totalQuestions =
    (examData.sectionA?.questions?.length || 0) + (examData.sectionB?.questions?.length || 0);

  const title =
    customTitle?.trim() ||
    `${examData.subject || "EXAM"} — ${examData.classLevel || "CLASS"} (${now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })})`;

  const newItem: ExamHistoryItem = {
    id: `exam-hist-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: now.toISOString(),
    formattedDate: formatTimestamp(now),
    title,
    subject: examData.subject || "Untitled Subject",
    classLevel: examData.classLevel || "General",
    termSession: examData.termSession || "",
    totalQuestions,
    sectionACount: examData.sectionA?.questions?.length || 0,
    sectionBCount: examData.sectionB?.questions?.length || 0,
    fullMarks: examData.fullMarks || "60",
    calculatedMarks: calculateExamMarks(examData),
    source,
    qualityScore: auditReport?.qualityScore || 98,
    correctionsCount: auditReport?.corrections?.length || 0,
    examData: JSON.parse(JSON.stringify(examData)), // deep copy
    auditReport: auditReport ? JSON.parse(JSON.stringify(auditReport)) : undefined,
  };

  // Avoid creating duplicate history within 15 seconds for identical subject & question count
  if (history.length > 0) {
    const latest = history[0];
    const timeDiff = now.getTime() - new Date(latest.timestamp).getTime();
    if (
      timeDiff < 15000 &&
      latest.subject.toLowerCase() === newItem.subject.toLowerCase() &&
      latest.totalQuestions === newItem.totalQuestions &&
      latest.source === newItem.source
    ) {
      // Update top item instead
      history[0] = { ...newItem, id: latest.id, title: customTitle || latest.title };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      } catch (e) {
        console.error("Storage error:", e);
      }
      return history[0];
    }
  }

  // Prepend new item and keep up to MAX_HISTORY_ITEMS
  const updatedHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (err) {
    console.error("Failed to write exam history:", err);
  }

  return newItem;
}

/**
 * Updates the title of an existing history item
 */
export function renameHistoryItem(id: string, newTitle: string): boolean {
  const history = getExamHistory();
  const target = history.find((item) => item.id === id);
  if (!target) return false;

  target.title = newTitle.trim();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    return true;
  } catch (err) {
    console.error("Error renaming history item:", err);
    return false;
  }
}

/**
 * Deletes a single history item by id
 */
export function deleteHistoryItem(id: string): ExamHistoryItem[] {
  const history = getExamHistory();
  const filtered = history.filter((item) => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error("Failed to delete history item:", err);
  }
  return filtered;
}

/**
 * Clears all saved exam history
 */
export function clearExamHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error("Failed to clear exam history:", err);
  }
}

/**
 * Exports history records as a downloadable JSON file
 */
export function exportHistoryAsJSON(): void {
  const history = getExamHistory();
  const blob = new Blob([JSON.stringify(history, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `The_Moderator_Exam_History_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

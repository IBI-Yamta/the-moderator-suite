import { ExamData, ObjectiveQuestion, EssayQuestion } from "../types";

export interface ReadabilityMetrics {
  fleschReadingEase: number; // 0 - 100
  fleschKincaidGrade: number; // e.g. 7.5
  gunningFog: number;
  wordCount: number;
  sentenceCount: number;
  syllableCount: number;
  avgWordsPerSentence: number;
  avgSyllablesPerWord: number;
  complexWordPercentage: number; // words >= 3 syllables
  readingTimeMinutes: number;
  targetClass: string;
  suitabilityStatus: "appropriate" | "too_complex" | "too_simple" | "slightly_challenging";
  suitabilityMessage: string;
  recommendedGrade: string;
  flaggedQuestions: Array<{
    id: string | number;
    section: "Section A (Objective)" | "Section B (Theory)";
    questionNumber: string | number;
    text: string;
    reason: string;
    score: number; // complexity score
    suggestion: string;
  }>;
  difficultWords: Array<{
    word: string;
    syllables: number;
    frequency: number;
    simpleAlternative: string;
  }>;
  readabilityTips: string[];
}

/**
 * Counts syllables in an English word using phonetic heuristics
 */
export function countSyllables(rawWord: string): number {
  const word = rawWord.toLowerCase().replace(/[^a-z]/g, "");
  if (!word) return 0;
  if (word.length <= 3) return 1;

  // Specific common suffixes
  let working = word
    .replace(/(?:[^laeiouy]es|ed|e)$/, "")
    .replace(/^y/, "");

  const matches = working.match(/[aeiouy]{1,2}/g);
  return matches ? Math.max(1, matches.length) : 1;
}

/**
 * Common academic words and simpler student-friendly alternatives
 */
const SIMPLER_ALTERNATIVES: Record<string, string> = {
  demonstrate: "show / prove",
  utilize: "use",
  subsequently: "then / later",
  disseminate: "spread / share",
  consequence: "result",
  facilitate: "help / make easy",
  differentiate: "tell apart / distinguish",
  ascertain: "find out / check",
  fundamental: "basic / main",
  approximately: "about / roughly",
  sufficient: "enough",
  numerous: "many",
  terminate: "end / stop",
  commence: "start / begin",
  implement: "carry out / apply",
  comprehend: "understand",
  elucidate: "explain clearly",
  paramount: "very important",
  ameliorate: "improve",
  adversely: "badly / negatively",
  illustrate: "draw or show",
  proliferate: "increase rapidly",
  erroneous: "wrong / incorrect",
  substantiate: "back up with proof",
  ubiquitous: "found everywhere",
  prerequisite: "requirement",
  constitutes: "makes up",
  endeavor: "try / effort",
  reiterate: "repeat",
  exemplify: "give an example of",
  evaluate: "judge / assess",
  formulate: "create / develop",
  categorize: "group / classify",
  investigate: "look into / study",
  indicate: "point out / show",
  emphasize: "stress / highlight",
  characteristic: "feature / trait",
  advantageous: "helpful / useful",
  deteriorate: "get worse",
  feasible: "possible / workable",
};

/**
 * Target reading levels for typical educational classes
 */
function getExpectedGradeLevel(classLevel: string): { minGrade: number; maxGrade: number; label: string } {
  const c = (classLevel || "").toUpperCase().replace(/\s+/g, "");
  if (c.includes("PRI1") || c.includes("BASIC1")) return { minGrade: 1, maxGrade: 2, label: "Primary 1 (Ages 6-7)" };
  if (c.includes("PRI2") || c.includes("BASIC2")) return { minGrade: 2, maxGrade: 3, label: "Primary 2 (Ages 7-8)" };
  if (c.includes("PRI3") || c.includes("BASIC3")) return { minGrade: 3, maxGrade: 4, label: "Primary 3 (Ages 8-9)" };
  if (c.includes("PRI4") || c.includes("BASIC4")) return { minGrade: 4, maxGrade: 5, label: "Primary 4 (Ages 9-10)" };
  if (c.includes("PRI5") || c.includes("BASIC5")) return { minGrade: 5, maxGrade: 6, label: "Primary 5 (Ages 10-11)" };
  if (c.includes("PRI6") || c.includes("BASIC6")) return { minGrade: 6, maxGrade: 7, label: "Primary 6 (Ages 11-12)" };
  if (c.includes("JSS1") || c.includes("BASIC7")) return { minGrade: 7, maxGrade: 8, label: "JSS 1 / Grade 7 (Ages 12-13)" };
  if (c.includes("JSS2") || c.includes("BASIC8")) return { minGrade: 8, maxGrade: 9, label: "JSS 2 / Grade 8 (Ages 13-14)" };
  if (c.includes("JSS3") || c.includes("BASIC9")) return { minGrade: 9, maxGrade: 10, label: "JSS 3 / Grade 9 (Ages 14-15)" };
  if (c.includes("SS1") || c.includes("SSS1")) return { minGrade: 10, maxGrade: 11, label: "SS 1 / Grade 10 (Ages 15-16)" };
  if (c.includes("SS2") || c.includes("SSS2")) return { minGrade: 11, maxGrade: 12, label: "SS 2 / Grade 11 (Ages 16-17)" };
  if (c.includes("SS3") || c.includes("SSS3")) return { minGrade: 11, maxGrade: 13, label: "SS 3 / Grade 12 (WAEC/NECO Standard)" };
  return { minGrade: 7, maxGrade: 10, label: "Secondary Standard" };
}

/**
 * Analyzes the full exam content for reading complexity, grade level, and student readability
 */
export function analyzeExamReadability(exam: ExamData): ReadabilityMetrics {
  const allTexts: string[] = [];
  const flaggedQuestions: ReadabilityMetrics["flaggedQuestions"] = [];
  const wordFrequency: Record<string, number> = {};

  // Gather Section A text
  if (exam.sectionA?.questions) {
    exam.sectionA.questions.forEach((q: ObjectiveQuestion) => {
      const qText = q.questionText || "";
      allTexts.push(qText);
      const optTexts = (q.options || []).map((o) => o.text).join(" ");
      allTexts.push(optTexts);

      // Evaluate individual question complexity
      const words = qText.split(/\s+/).filter(Boolean);
      const syllables = words.reduce((acc, w) => acc + countSyllables(w), 0);
      const hasDoubleNegative = /\b(?:not\s+un|never\s+fail|not\s+inappropriate|not\s+illegal)\b/i.test(qText);
      const hasNegativeConstraint = /\b(?:EXCEPT|NOT|LEAST|NEVER)\b/.test(qText);
      const isLong = words.length > 24;

      let reason = "";
      let suggestion = "";
      let score = 0;

      if (hasDoubleNegative) {
        reason = "Contains confusing double-negative phrasing";
        suggestion = "Rephrase in positive, direct affirmative terms.";
        score += 35;
      } else if (isLong) {
        reason = `Overly dense sentence (${words.length} words)`;
        suggestion = "Split into a short context clause followed by a concise question.";
        score += 25;
      } else if (words.length > 0 && syllables / words.length > 1.8) {
        reason = "Heavy concentration of polysyllabic academic words";
        suggestion = "Substitute with simpler synonyms without altering technical subject accuracy.";
        score += 20;
      }

      if (reason) {
        flaggedQuestions.push({
          id: `secA-${q.id || q.questionNumber}`,
          section: "Section A (Objective)",
          questionNumber: q.questionNumber || q.id,
          text: qText,
          reason,
          score,
          suggestion,
        });
      }
    });
  }

  // Gather Section B text
  if (exam.sectionB?.questions) {
    exam.sectionB.questions.forEach((eq: EssayQuestion) => {
      const mainText = eq.text || "";
      allTexts.push(mainText);

      const words = mainText.split(/\s+/).filter(Boolean);
      if (words.length > 28) {
        flaggedQuestions.push({
          id: `secB-${eq.questionNumber}`,
          section: "Section B (Theory)",
          questionNumber: eq.questionNumber,
          text: mainText,
          reason: `Lengthy essay prompt (${words.length} words)`,
          score: 25,
          suggestion: "Break down into distinct bulleted sub-parts (a, b, c) with assigned mark allocations.",
        });
      }

      if (eq.subQuestions) {
        eq.subQuestions.forEach((sub) => {
          allTexts.push(sub.text || "");
          const subWords = (sub.text || "").split(/\s+/).filter(Boolean);
          if (subWords.length > 25) {
            flaggedQuestions.push({
              id: `secB-${eq.questionNumber}-${sub.label}`,
              section: "Section B (Theory)",
              questionNumber: `${eq.questionNumber}(${sub.label})`,
              text: sub.text,
              reason: "Sub-question prompt exceeds recommended 20-word limit",
              score: 20,
              suggestion: "Clarify the directive verb (e.g. State, Explain, List) at the start of the line.",
            });
          }
        });
      }
    });
  }

  // Combined corpus analysis
  const fullCorpus = allTexts.join(" ").trim();
  const sentences = fullCorpus
    .split(/[.!?]+(?:\s+|$)/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3);
  
  const rawWords = fullCorpus
    .split(/[\s,;:"'()\[\]{}]+/)
    .map((w) => w.toLowerCase().replace(/[^a-z]/g, ""))
    .filter((w) => w.length > 1);

  const wordCount = Math.max(1, rawWords.length);
  const sentenceCount = Math.max(1, sentences.length);

  let totalSyllables = 0;
  let complexWordCount = 0;

  rawWords.forEach((w) => {
    wordFrequency[w] = (wordFrequency[w] || 0) + 1;
    const syl = countSyllables(w);
    totalSyllables += syl;
    if (syl >= 3) {
      complexWordCount++;
    }
  });

  const avgWordsPerSentence = wordCount / sentenceCount;
  const avgSyllablesPerWord = totalSyllables / wordCount;
  const complexWordPercentage = Math.round((complexWordCount / wordCount) * 100);

  // Standard Flesch Reading Ease formula: 206.835 - (1.015 * ASL) - (84.6 * ASW)
  let rawFRE = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
  const fleschReadingEase = Math.max(0, Math.min(100, Math.round(rawFRE * 10) / 10));

  // Standard Flesch-Kincaid Grade Level formula: (0.39 * ASL) + (11.8 * ASW) - 15.59
  let rawFKGL = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;
  const fleschKincaidGrade = Math.max(1, Math.min(16, Math.round(rawFKGL * 10) / 10));

  // Gunning Fog Index: 0.4 * ((words/sentences) + 100 * (complexWords/words))
  let rawFog = 0.4 * (avgWordsPerSentence + complexWordPercentage);
  const gunningFog = Math.max(1, Math.min(18, Math.round(rawFog * 10) / 10));

  // Estimate student reading time (~140 words per minute for school exams)
  const readingTimeMinutes = Math.max(1, Math.round((wordCount / 140) * 10) / 10);

  // Determine Class Level Fit
  const target = getExpectedGradeLevel(exam.classLevel);
  let suitabilityStatus: ReadabilityMetrics["suitabilityStatus"] = "appropriate";
  let suitabilityMessage = "";

  if (fleschKincaidGrade > target.maxGrade + 1.5) {
    suitabilityStatus = "too_complex";
    suitabilityMessage = `Reading level (Grade ${fleschKincaidGrade}) is noticeably above the target for ${exam.classLevel || "this class"} (${target.label}). Students may struggle with vocabulary or sentence length.`;
  } else if (fleschKincaidGrade > target.maxGrade) {
    suitabilityStatus = "slightly_challenging";
    suitabilityMessage = `Reading level (Grade ${fleschKincaidGrade}) is moderately demanding for ${exam.classLevel || "this class"}. Good for rigorous examination, but ensure instructions are crystal clear.`;
  } else if (fleschKincaidGrade < target.minGrade - 2.0 && target.minGrade >= 6) {
    suitabilityStatus = "too_simple";
    suitabilityMessage = `Reading level (Grade ${fleschKincaidGrade}) is quite low for ${exam.classLevel || "this class"}. Ensure standard academic and technical terminology is not overly omitted.`;
  } else {
    suitabilityStatus = "appropriate";
    suitabilityMessage = `Optimal readability! The complexity (Grade ${fleschKincaidGrade}) accurately matches the expected reading comprehension for ${exam.classLevel || "this class"}.`;
  }

  // Difficult words extraction
  const difficultWords: ReadabilityMetrics["difficultWords"] = [];
  const seenWords = new Set<string>();

  Object.entries(wordFrequency).forEach(([word, freq]) => {
    if (seenWords.has(word)) return;
    const syl = countSyllables(word);
    const alt = SIMPLER_ALTERNATIVES[word];
    if (alt || (syl >= 3 && word.length >= 7)) {
      difficultWords.push({
        word,
        syllables: syl,
        frequency: freq,
        simpleAlternative: alt || "Consider simpler phrasing",
      });
      seenWords.add(word);
    }
  });

  difficultWords.sort((a, b) => b.frequency - a.frequency);

  // Readability Tips
  const readabilityTips: string[] = [];
  if (avgWordsPerSentence > 18) {
    readabilityTips.push(
      `Average sentence length is ${avgWordsPerSentence.toFixed(1)} words. Aim for 12–16 words per question stem so students don't re-read questions multiple times.`
    );
  } else {
    readabilityTips.push("Sentence length is well-balanced and easy for students to parse during timed tests.");
  }

  if (complexWordPercentage > 18) {
    readabilityTips.push(
      `${complexWordPercentage}% of words have 3+ syllables. Replace non-technical filler words with concise everyday equivalents.`
    );
  }

  if (flaggedQuestions.length > 0) {
    readabilityTips.push(
      `${flaggedQuestions.length} question(s) flagged with potential readability bottlenecks (long sentences, multi-clause stems, or double negatives).`
    );
  }

  readabilityTips.push("Ensure negative question constraints (e.g. NOT, EXCEPT) are written in bold CAPITAL letters for visual clarity.");

  return {
    fleschReadingEase,
    fleschKincaidGrade,
    gunningFog,
    wordCount,
    sentenceCount,
    syllableCount: totalSyllables,
    avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
    avgSyllablesPerWord: Math.round(avgSyllablesPerWord * 100) / 100,
    complexWordPercentage,
    readingTimeMinutes,
    targetClass: target.label,
    suitabilityStatus,
    suitabilityMessage,
    recommendedGrade: `Grade ${Math.floor(fleschKincaidGrade)} - ${Math.ceil(fleschKincaidGrade)}`,
    flaggedQuestions,
    difficultWords: difficultWords.slice(0, 12),
    readabilityTips,
  };
}

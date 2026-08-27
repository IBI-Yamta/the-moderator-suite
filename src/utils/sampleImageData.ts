/**
 * Realistic visual sample question paper images generated as data URLs
 * for instant one-click testing of handwritten & printed question OCR.
 */

export interface SampleQuestionImage {
  id: string;
  title: string;
  subtitle: string;
  subject: string;
  classLevel: string;
  type: "Handwritten Notebook" | "Chalkboard Photo" | "Printed Question Handout";
  dataUrl: string;
}

// Generates a crisp canvas image simulating a handwritten exam draft
function generateHandwrittenDraftDataUrl(): string {
  if (typeof document === "undefined") return "";
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 1600;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    // Background: lined notebook paper with subtle warm tone
    ctx.fillStyle = "#fffdf7";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Margin line (red)
    ctx.strokeStyle = "#f87171";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(120, 0);
    ctx.lineTo(120, canvas.height);
    ctx.stroke();

    // Horizontal notebook lines (light blue)
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    for (let y = 140; y < canvas.height; y += 42) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Header stamp / handwriting
    ctx.fillStyle = "#1e3a8a";
    ctx.font = "bold 28px 'Segoe UI', Arial, sans-serif";
    ctx.fillText("BIOLOGY CONTINUOUS ASSESSMENT TEST (SS 2)", 160, 90);
    ctx.font = "italic 20px 'Segoe UI', Arial, sans-serif";
    ctx.fillStyle = "#475569";
    ctx.fillText("Time: 1 hr 30 mins | Marks: 60 (Sec A: 30, Sec B: 30)", 160, 125);

    // Section A Header
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 22px 'Courier New', monospace";
    ctx.fillText("SECTION A: OBJECTIVE QUESTIONS (Answer All)", 160, 180);

    const questionsA = [
      {
        q: "1. The powerhouse of the cell responsible for ATP production is?",
        opts: "(a) Ribosome  (b) Mitochondria  (c) Nucleus  (d) Golgi body",
      },
      {
        q: "2. Photosynthesis occurs in which organelle of plant cells?",
        opts: "(a) Chloroplast  (b) Vacuole  (c) Cell wall  (d) Centrosome",
      },
      {
        q: "3. The enzyme responsible for breaking down starch into maltose in the mouth is?",
        opts: "(a) Pepsin  (b) Ptyalin (Amylase)  (c) Trypsin  (d) Lipase",
      },
      {
        q: "4. Which blood group is known as the universal donor in blood transfusion?",
        opts: "(a) Group A  (b) Group B  (c) Group AB  (d) Group O",
      },
      {
        q: "5. The movement of water molecules through a semi-permeable membrane is called?",
        opts: "(a) Diffusion  (b) Osmosis  (c) Plasmolysis  (d) Active transport",
      },
      {
        q: "6. Which part of the human brain controls involuntary actions such as heartbeat & breathing?",
        opts: "(a) Cerebrum  (b) Cerebellum  (c) Medulla oblongata  (d) Hypothalamus",
      },
    ];

    let currentY = 230;
    ctx.font = "20px 'Georgia', serif";
    ctx.fillStyle = "#1e293b";

    questionsA.forEach((item) => {
      ctx.font = "bold 20px 'Georgia', serif";
      ctx.fillText(item.q, 160, currentY);
      currentY += 38;
      ctx.font = "18px 'Courier New', monospace";
      ctx.fillStyle = "#334155";
      ctx.fillText(item.opts, 180, currentY);
      currentY += 48;
      ctx.fillStyle = "#1e293b";
    });

    // Section B Header
    currentY += 20;
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 22px 'Courier New', monospace";
    ctx.fillText("SECTION B: ESSAY / THEORY (Answer any 3 questions)", 160, currentY);
    currentY += 45;

    const questionsB = [
      "1. (a) Define respiration and distinguish between aerobic and anaerobic respiration. [6 marks]",
      "   (b) State four (4) characteristics of respiratory surfaces in living organisms. [4 marks]",
      "2. (a) What is pollination? List three agents of cross-pollination. [5 marks]",
      "   (b) Draw and label the internal structure of a dicotyledonous leaf. [5 marks]",
      "3. (a) Explain the term homeostasis and name three organs involved in osmoregulation. [5 marks]",
      "   (b) Describe the mechanism of gaseous exchange in bony fish. [5 marks]",
    ];

    ctx.font = "19px 'Georgia', serif";
    questionsB.forEach((line) => {
      ctx.fillText(line, 160, currentY);
      currentY += 42;
    });

    return canvas.toDataURL("image/jpeg", 0.9);
  } catch (e) {
    console.warn("Could not generate handwritten canvas preview:", e);
    return "";
  }
}

// Generates a second sample: Civic Education / Government exam printed draft
function generateCivicExamDataUrl(): string {
  if (typeof document === "undefined") return "";
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 1500;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    // Crisp white paper
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Outer border
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

    // School Title Header
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 26px 'Times New Roman', serif";
    ctx.textAlign = "center";
    ctx.fillText("AT-TARBIYYA COMMUNITY COLLEGE", canvas.width / 2, 90);
    ctx.font = "18px 'Times New Roman', serif";
    ctx.fillText("FIRST TERM EXAMINATION - CIVIC EDUCATION & CITIZENSHIP", canvas.width / 2, 125);
    ctx.fillText("CLASS: SSS 1 | TIME ALLOWED: 1 HR 45 MINS | TOTAL: 60 MARKS", canvas.width / 2, 155);

    // Divider
    ctx.beginPath();
    ctx.moveTo(80, 175);
    ctx.lineTo(canvas.width - 80, 175);
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.textAlign = "left";
    ctx.font = "bold 20px 'Times New Roman', serif";
    ctx.fillText("SECTION A: OBJECTIVE QUESTIONS [30 MARKS]", 80, 215);
    ctx.font = "italic 17px 'Times New Roman', serif";
    ctx.fillText("Instruction: Answer all questions in this section.", 80, 245);

    const questions = [
      {
        q: "1. The supreme document from which all other laws derive their validity in Nigeria is the:",
        opts: "(a) Criminal Code  (b) Constitution  (c) Hansard  (d) Civil Service Manual",
      },
      {
        q: "2. The arm of govt. responsible for interpreting the law and punishing offenders is the:",
        opts: "(a) Executive  (b) Legislature  (c) Judiciary  (d) Electoral Commission",
      },
      {
        q: "3. Which of the following is an obligation of a good citizen towards national dev.?",
        opts: "(a) Evading tax  (b) Payment of taxes  (c) Bribery  (d) Civil disobedience",
      },
      {
        q: "4. The concept of Rule of Law was popularized by which constitutional theorist?",
        opts: "(a) Baron de Montesquieu  (b) A.V. Dicey  (c) John Locke  (d) Jean Bodin",
      },
      {
        q: "5. Fundamental Human Rights in Nigeria are entrenched in which chapter of the 1999 Constitution?",
        opts: "(a) Chapter II  (b) Chapter IV  (c) Chapter VI  (d) Chapter VIII",
      },
    ];

    let currentY = 285;
    questions.forEach((item) => {
      ctx.font = "bold 18px 'Times New Roman', serif";
      ctx.fillText(item.q, 80, currentY);
      currentY += 32;
      ctx.font = "17px 'Times New Roman', serif";
      ctx.fillText(item.opts, 100, currentY);
      currentY += 44;
    });

    // Section B
    currentY += 20;
    ctx.font = "bold 20px 'Times New Roman', serif";
    ctx.fillText("SECTION B: ESSAY QUESTIONS [30 MARKS]", 80, currentY);
    currentY += 32;
    ctx.font = "italic 17px 'Times New Roman', serif";
    ctx.fillText("Instruction: Answer any THREE (3) questions. Each carries 10 marks.", 80, currentY);
    currentY += 40;

    const essayQuestions = [
      "1. (a) Define citizenship and state three ways of acquiring Nigerian citizenship. [6 marks]",
      "   (b) Mention four fundamental rights of a Nigerian citizen. [4 marks]",
      "2. (a) What is democracy? Outline four features of democratic governance. [6 marks]",
      "   (b) Distinguish between direct democracy and representative democracy. [4 marks]",
      "3. (a) Explain the principle of Separation of Powers. [5 marks]",
      "   (b) How does Checks and Balances prevent tyranny in governance? [5 marks]",
    ];

    ctx.font = "18px 'Times New Roman', serif";
    essayQuestions.forEach((line) => {
      ctx.fillText(line, 80, currentY);
      currentY += 36;
    });

    return canvas.toDataURL("image/jpeg", 0.9);
  } catch (e) {
    console.warn("Could not generate civic canvas preview:", e);
    return "";
  }
}

let cachedSamples: SampleQuestionImage[] | null = null;

export function getSampleQuestionImages(): SampleQuestionImage[] {
  if (cachedSamples) return cachedSamples;

  const sample1 = generateHandwrittenDraftDataUrl();
  const sample2 = generateCivicExamDataUrl();

  cachedSamples = [
    {
      id: "biology-handwritten",
      title: "Handwritten Biology Paper",
      subtitle: "SS 2 Term Exam (6 Objectives & 3 Multi-part Theory Questions)",
      subject: "Biology",
      classLevel: "SSS 2",
      type: "Handwritten Notebook",
      dataUrl: sample1,
    },
    {
      id: "civic-printed-sheet",
      title: "Printed Civic Education Sheet",
      subtitle: "SSS 1 Term Exam with WAEC/NECO standard structure",
      subject: "Civic Education",
      classLevel: "SSS 1",
      type: "Printed Question Handout",
      dataUrl: sample2,
    },
  ];

  return cachedSamples;
}

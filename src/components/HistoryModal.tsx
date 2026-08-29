import React, { useState, useMemo } from "react";
import {
  X,
  History,
  RotateCcw,
  Sparkles,
  Camera,
  FileText,
  Trash2,
  Download,
  Search,
  CheckCircle2,
  Calendar,
  Layers,
  Eye,
  BookmarkPlus,
  Scale,
  Edit2,
  Check,
  BookOpen,
  ArrowRight,
  Filter,
  ArrowUpDown,
  SlidersHorizontal,
  GraduationCap,
  BookMarked,
  Clock,
  ChevronDown,
} from "lucide-react";
import { ExamData, ExamHistoryItem, ExamHistorySource } from "../types";
import {
  getExamHistory,
  deleteHistoryItem,
  clearExamHistory,
  renameHistoryItem,
  exportHistoryAsJSON,
  saveExamToHistory,
} from "../utils/historyStorage";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentExam: ExamData;
  onRestoreExam: (exam: ExamData, sourceTitle: string) => void;
  theme?: "light" | "dark";
}

type SortField = "date" | "hierarchy" | "class" | "subject" | "term" | "session";
type SortDirection = "asc" | "desc";

// Helper functions for parsing academic metadata
function extractTerm(termSessionStr: string): string {
  if (!termSessionStr) return "General";
  const s = termSessionStr.toLowerCase();
  if (s.includes("1st") || s.includes("first")) return "1st Term";
  if (s.includes("2nd") || s.includes("second")) return "2nd Term";
  if (s.includes("3rd") || s.includes("third")) return "3rd Term";
  return "General Term";
}

function getTermRank(termStr: string): number {
  if (termStr.includes("1st") || termStr.includes("first")) return 1;
  if (termStr.includes("2nd") || termStr.includes("second")) return 2;
  if (termStr.includes("3rd") || termStr.includes("third")) return 3;
  return 99;
}

function extractSession(termSessionStr: string): string {
  if (!termSessionStr) return "General";
  const sessionMatch = termSessionStr.match(/\b(20\d\d\s*[\/-]\s*20\d\d|20\d\d)\b/);
  if (sessionMatch) return sessionMatch[0].replace(/\s+/g, "");
  return "General";
}

function getClassRank(classLevel: string): number {
  if (!classLevel) return 999;
  const c = classLevel.toUpperCase().replace(/\s+/g, "");
  if (c.includes("PRI1") || c.includes("PRIMARY1") || c.includes("BASIC1")) return 11;
  if (c.includes("PRI2") || c.includes("PRIMARY2") || c.includes("BASIC2")) return 12;
  if (c.includes("PRI3") || c.includes("PRIMARY3") || c.includes("BASIC3")) return 13;
  if (c.includes("PRI4") || c.includes("PRIMARY4") || c.includes("BASIC4")) return 14;
  if (c.includes("PRI5") || c.includes("PRIMARY5") || c.includes("BASIC5")) return 15;
  if (c.includes("PRI6") || c.includes("PRIMARY6") || c.includes("BASIC6")) return 16;
  if (c.includes("JSS1") || c.includes("JSE1") || c.includes("BASIC7")) return 21;
  if (c.includes("JSS2") || c.includes("JSE2") || c.includes("BASIC8")) return 22;
  if (c.includes("JSS3") || c.includes("JSE3") || c.includes("BASIC9")) return 23;
  if (c.includes("SS1") || c.includes("SSS1")) return 31;
  if (c.includes("SS2") || c.includes("SSS2")) return 32;
  if (c.includes("SS3") || c.includes("SSS3")) return 33;
  return 100;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  currentExam,
  onRestoreExam,
  theme = "light",
}) => {
  const [historyItems, setHistoryItems] = useState<ExamHistoryItem[]>(() => getExamHistory());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  
  // Ordering and Filtering States
  const [sortBy, setSortBy] = useState<SortField>("hierarchy");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [filterClass, setFilterClass] = useState<string>("all");
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [filterTerm, setFilterTerm] = useState<string>("all");
  const [filterSession, setFilterSession] = useState<string>("all");
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  const [previewItem, setPreviewItem] = useState<ExamHistoryItem | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const isDark = theme === "dark";

  // Reload history when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setHistoryItems(getExamHistory());
      setPreviewItem(null);
      setDeleteConfirmId(null);
      setEditingId(null);
    }
  }, [isOpen]);

  // Extract unique filter options from items
  const uniqueClasses = useMemo(() => {
    const set = new Set<string>();
    historyItems.forEach((item) => {
      if (item.classLevel && item.classLevel.trim()) set.add(item.classLevel.trim());
    });
    return Array.from(set).sort((a, b) => getClassRank(a) - getClassRank(b));
  }, [historyItems]);

  const uniqueSubjects = useMemo(() => {
    const set = new Set<string>();
    historyItems.forEach((item) => {
      if (item.subject && item.subject.trim()) set.add(item.subject.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [historyItems]);

  const uniqueTerms = useMemo(() => {
    const set = new Set<string>();
    historyItems.forEach((item) => {
      const term = extractTerm(item.termSession || item.examData?.termSession || "");
      if (term) set.add(term);
    });
    return Array.from(set).sort((a, b) => getTermRank(a) - getTermRank(b));
  }, [historyItems]);

  const uniqueSessions = useMemo(() => {
    const set = new Set<string>();
    historyItems.forEach((item) => {
      const session = extractSession(item.termSession || item.examData?.termSession || "");
      if (session && session !== "General") set.add(session);
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [historyItems]);

  // Check if any custom filter is active
  const hasActiveCustomFilters =
    filterClass !== "all" ||
    filterSubject !== "all" ||
    filterTerm !== "all" ||
    filterSession !== "all" ||
    sortBy !== "date" ||
    selectedSource !== "all";

  const handleResetFilters = () => {
    setFilterClass("all");
    setFilterSubject("all");
    setFilterTerm("all");
    setFilterSession("all");
    setSelectedSource("all");
    setSortBy("date");
    setSortDirection("desc");
    setSearchQuery("");
  };

  // Filtered & Ordered List
  const processedItems = useMemo(() => {
    // 1. Filtering
    const filtered = historyItems.filter((item) => {
      const itemTerm = extractTerm(item.termSession || item.examData?.termSession || "");
      const itemSession = extractSession(item.termSession || item.examData?.termSession || "");

      const matchesSearch =
        searchQuery === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.classLevel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        itemTerm.toLowerCase().includes(searchQuery.toLowerCase()) ||
        itemSession.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSource =
        selectedSource === "all" || item.source === selectedSource;

      const matchesClass =
        filterClass === "all" || item.classLevel.toLowerCase() === filterClass.toLowerCase();

      const matchesSubject =
        filterSubject === "all" || item.subject.toLowerCase() === filterSubject.toLowerCase();

      const matchesTerm =
        filterTerm === "all" || itemTerm.toLowerCase() === filterTerm.toLowerCase();

      const matchesSession =
        filterSession === "all" || itemSession.toLowerCase() === filterSession.toLowerCase();

      return (
        matchesSearch &&
        matchesSource &&
        matchesClass &&
        matchesSubject &&
        matchesTerm &&
        matchesSession
      );
    });

    // 2. Ordering
    return filtered.sort((a, b) => {
      const aTerm = extractTerm(a.termSession || a.examData?.termSession || "");
      const bTerm = extractTerm(b.termSession || b.examData?.termSession || "");
      const aSession = extractSession(a.termSession || a.examData?.termSession || "");
      const bSession = extractSession(b.termSession || b.examData?.termSession || "");

      let comparison = 0;

      switch (sortBy) {
        case "hierarchy": {
          // Combined Order: Class -> Subject -> Term -> Session
          const classDiff = getClassRank(a.classLevel) - getClassRank(b.classLevel);
          if (classDiff !== 0) {
            comparison = classDiff;
            break;
          }
          const subjDiff = a.subject.localeCompare(b.subject);
          if (subjDiff !== 0) {
            comparison = subjDiff;
            break;
          }
          const termDiff = getTermRank(aTerm) - getTermRank(bTerm);
          if (termDiff !== 0) {
            comparison = termDiff;
            break;
          }
          comparison = bSession.localeCompare(aSession);
          break;
        }

        case "class": {
          const rankDiff = getClassRank(a.classLevel) - getClassRank(b.classLevel);
          comparison = rankDiff !== 0 ? rankDiff : a.classLevel.localeCompare(b.classLevel);
          break;
        }

        case "subject": {
          comparison = a.subject.localeCompare(b.subject);
          break;
        }

        case "term": {
          const rankDiff = getTermRank(aTerm) - getTermRank(bTerm);
          comparison = rankDiff !== 0 ? rankDiff : aTerm.localeCompare(bTerm);
          break;
        }

        case "session": {
          comparison = aSession.localeCompare(bSession);
          break;
        }

        case "date":
        default: {
          const aTime = new Date(a.timestamp).getTime() || 0;
          const bTime = new Date(b.timestamp).getTime() || 0;
          comparison = aTime - bTime;
          break;
        }
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [
    historyItems,
    searchQuery,
    selectedSource,
    filterClass,
    filterSubject,
    filterTerm,
    filterSession,
    sortBy,
    sortDirection,
  ]);

  if (!isOpen) return null;

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteHistoryItem(id);
    setHistoryItems(updated);
    if (previewItem?.id === id) setPreviewItem(null);
    setDeleteConfirmId(null);
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all exam history? This action cannot be undone.")) {
      clearExamHistory();
      setHistoryItems([]);
      setPreviewItem(null);
    }
  };

  const handleStartRename = (item: ExamHistoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(item.id);
    setEditTitle(item.title);
  };

  const handleSaveRename = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      renameHistoryItem(id, editTitle);
      setHistoryItems(getExamHistory());
    }
    setEditingId(null);
  };

  const handleTakeNewSnapshot = () => {
    const saved = saveExamToHistory(currentExam, "manual_snapshot", `${currentExam.subject} (${currentExam.classLevel}) — Saved Paper`);
    setHistoryItems(getExamHistory());
    setPreviewItem(saved);
  };

  const getSourceBadge = (source: ExamHistorySource) => {
    switch (source) {
      case "ai_moderate":
        return {
          label: "AI Moderated",
          icon: <Sparkles className="w-3 h-3 text-yellow-500" />,
          color: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
        };
      case "ocr_scan":
        return {
          label: "OCR Vision Scan",
          icon: <Camera className="w-3 h-3 text-blue-500" />,
          color: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
        };
      case "paste_import":
        return {
          label: "Text Import",
          icon: <FileText className="w-3 h-3 text-emerald-500" />,
          color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
        };
      default:
        return {
          label: "Saved Snapshot",
          icon: <BookmarkPlus className="w-3 h-3 text-amber-500" />,
          color: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border ${
          isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
        }`}
      >
        {/* Header */}
        <div className={`px-5 py-3.5 border-b flex items-center justify-between ${isDark ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">Examination Revision & Archive</h2>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                  {historyItems.length} saved
                </span>
                {processedItems.length !== historyItems.length && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
                    {processedItems.length} showing
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Order, filter, inspect, and restore question papers categorized by Class, Subject, Term, and Session.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTakeNewSnapshot}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition shadow-xs cursor-pointer"
              title="Bookmark and save active workspace paper"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Snapshot Active Paper</span>
              <span className="sm:hidden">Snapshot</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className={`px-5 py-2.5 border-b flex flex-wrap items-center justify-between gap-2.5 ${isDark ? "bg-slate-900/60 border-slate-800" : "bg-slate-100/60 border-slate-200"}`}>
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search class, subject, term..."
              className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none ${
                isDark ? "bg-slate-950 border-slate-700 text-slate-200" : "bg-white border-slate-300 text-slate-800"
              }`}
            />
          </div>

          {/* Source Filter Tabs */}
          <div className="hidden lg:flex items-center gap-1 text-xs">
            {[
              { id: "all", label: "All" },
              { id: "ai_moderate", label: "AI Moderated" },
              { id: "ocr_scan", label: "OCR" },
              { id: "paste_import", label: "Text Imports" },
              { id: "manual_snapshot", label: "Snapshots" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedSource(tab.id)}
                className={`px-2 py-1 rounded-md text-xs font-medium transition whitespace-nowrap ${
                  selectedSource === tab.id
                    ? "bg-blue-600 text-white font-bold shadow-xs"
                    : isDark
                    ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Filter & Order Action Icon Button */}
          <div className="flex items-center gap-1.5 ml-auto text-xs">
            <button
              onClick={() => setShowFilterDrawer(!showFilterDrawer)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                showFilterDrawer || hasActiveCustomFilters
                  ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                  : isDark
                  ? "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100 shadow-2xs"
              }`}
              title="Toggle ordering and filter controls"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Order & Filter</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                showFilterDrawer || hasActiveCustomFilters
                  ? "bg-white text-blue-700"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              }`}>
                {sortBy === "hierarchy" ? "Hierarchy" : sortBy.toUpperCase()}
              </span>
            </button>

            {/* Direction Toggle Button */}
            <button
              onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
              className={`p-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
                isDark ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200" : "bg-white border-slate-300 hover:bg-slate-100 text-slate-700 shadow-2xs"
              }`}
              title={`Sort direction: ${sortDirection === "asc" ? "Ascending (A-Z, 1-3)" : "Descending (Z-A, 3-1)"}`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>

            {/* Export & Cleanup */}
            <button
              onClick={exportHistoryAsJSON}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              title="Download full backup JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Backup</span>
            </button>

            {historyItems.length > 0 && (
              <button
                onClick={handleClearAll}
                className="inline-flex items-center gap-1 p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                title="Clear all saved history"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Expandable Order & Filter Drawer */}
        {showFilterDrawer && (
          <div className={`px-5 py-3 border-b border-blue-500/30 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs animate-in slide-in-from-top-2 duration-150 ${
            isDark ? "bg-slate-950/90" : "bg-blue-50/70"
          }`}>
            {/* 1. Sort / Order By Selection */}
            <div className="col-span-2 sm:col-span-1 lg:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Order Hierarchy
              </label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortField)}
                  className={`w-full py-1.5 px-2 text-xs font-semibold rounded-lg border outline-none cursor-pointer ${
                    isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                  }`}
                >
                  <option value="hierarchy">Class → Subject → Term → Session</option>
                  <option value="class">Order by Class Level</option>
                  <option value="subject">Order by Subject (A-Z)</option>
                  <option value="term">Order by Term (1st, 2nd, 3rd)</option>
                  <option value="session">Order by Academic Session</option>
                  <option value="date">Order by Creation Date</option>
                </select>
              </div>
            </div>

            {/* 2. Filter by Class */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Class
              </label>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className={`w-full py-1.5 px-2 text-xs rounded-lg border outline-none cursor-pointer ${
                  filterClass !== "all" ? "border-blue-500 font-bold" : ""
                } ${isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`}
              >
                <option value="all">All Classes ({historyItems.length})</option>
                {uniqueClasses.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Filter by Subject */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Subject
              </label>
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className={`w-full py-1.5 px-2 text-xs rounded-lg border outline-none cursor-pointer ${
                  filterSubject !== "all" ? "border-blue-500 font-bold" : ""
                } ${isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`}
              >
                <option value="all">All Subjects</option>
                {uniqueSubjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Filter by Term */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Term
              </label>
              <select
                value={filterTerm}
                onChange={(e) => setFilterTerm(e.target.value)}
                className={`w-full py-1.5 px-2 text-xs rounded-lg border outline-none cursor-pointer ${
                  filterTerm !== "all" ? "border-blue-500 font-bold" : ""
                } ${isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`}
              >
                <option value="all">All Terms</option>
                {uniqueTerms.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Filter by Session & Reset */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Session
              </label>
              <div className="flex items-center gap-1.5">
                <select
                  value={filterSession}
                  onChange={(e) => setFilterSession(e.target.value)}
                  className={`flex-1 py-1.5 px-2 text-xs rounded-lg border outline-none cursor-pointer ${
                    filterSession !== "all" ? "border-blue-500 font-bold" : ""
                  } ${isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`}
                >
                  <option value="all">All Sessions</option>
                  {uniqueSessions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                {hasActiveCustomFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/60 font-bold text-xs"
                    title="Reset all filters and restore default order"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Body: Two-Column Layout (List on Left, Preview on Right) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* History List */}
          <div className="w-full md:w-1/2 border-r border-slate-200 dark:border-slate-800 overflow-y-auto p-4 space-y-3">
            {processedItems.length === 0 ? (
              <div className="py-16 text-center text-slate-400 dark:text-slate-500">
                <History className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="font-semibold text-sm">No matching exam revisions</p>
                <p className="text-xs mt-1">Try adjusting your search query, class, subject, or term filters.</p>
                {hasActiveCustomFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="mt-3 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              processedItems.map((item, itemIdx) => {
                const badge = getSourceBadge(item.source);
                const isSelected = previewItem?.id === item.id;
                const itemTerm = extractTerm(item.termSession || item.examData?.termSession || "");
                const itemSession = extractSession(item.termSession || item.examData?.termSession || "");

                return (
                  <div
                    key={item.id}
                    onClick={() => setPreviewItem(item)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group ${
                      isSelected
                        ? isDark
                          ? "bg-slate-800/90 border-blue-500 shadow-md ring-1 ring-blue-500/50"
                          : "bg-blue-50/70 border-blue-400 shadow-sm ring-1 ring-blue-400/50"
                        : isDark
                        ? "bg-slate-800/40 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700"
                        : "bg-white border-slate-200/90 hover:bg-slate-50/80 hover:border-slate-300 shadow-2xs"
                    }`}
                  >
                    {/* Header Row: Title or Rename Input + Actions */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      {editingId === item.id ? (
                        <div className="flex-1 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full px-2 py-0.5 text-xs font-semibold rounded border border-blue-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                            autoFocus
                          />
                          <button
                            onClick={(e) => handleSaveRename(item.id, e)}
                            className="p-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-snug">
                            {item.title}
                          </h3>
                          <button
                            onClick={(e) => handleStartRename(item, e)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                            title="Rename snapshot"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {/* Source Tag Badge */}
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${badge.color}`}>
                        {badge.icon}
                        <span>{badge.label}</span>
                      </span>
                    </div>

                    {/* Academic Badges Row: Class, Subject, Term, Session */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                      {/* Class Badge */}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/50 dark:border-amber-800">
                        <GraduationCap className="w-3 h-3" />
                        <span>CLASS: {item.classLevel || "General"}</span>
                      </span>

                      {/* Subject Badge */}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300/50 dark:border-blue-800">
                        <BookMarked className="w-3 h-3" />
                        <span>{item.subject || "Subject"}</span>
                      </span>

                      {/* Term & Session Badge */}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{itemTerm} • {itemSession}</span>
                      </span>
                    </div>

                    {/* Metadata Sub-Row */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {item.formattedDate}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {item.totalQuestions} Questions ({item.sectionACount} Obj, {item.sectionBCount} Theory)
                      </span>
                      <span>•</span>
                      <span className="text-blue-600 dark:text-blue-400 font-bold">
                        {item.calculatedMarks}/{item.fullMarks} Marks
                      </span>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRestoreExam(item.examData, item.title);
                            onClose();
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] transition shadow-2xs"
                          title="Restore this question paper to the live workspace"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Restore</span>
                        </button>

                        <button
                          onClick={() => setPreviewItem(item)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-medium"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Preview</span>
                        </button>
                      </div>

                      {/* Delete Action with 2-step confirm */}
                      {deleteConfirmId === item.id ? (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <span className="text-[10px] text-rose-500 font-bold">Confirm?</span>
                          <button
                            onClick={(e) => handleDelete(item.id, e)}
                            className="px-1.5 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold hover:bg-rose-700"
                          >
                            Yes
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmId(null);
                            }}
                            className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px]"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(item.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition rounded hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Delete this revision"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Preview Panel on Right */}
          <div className="w-full md:w-1/2 flex-1 flex flex-col bg-slate-50/50 dark:bg-slate-950/50 overflow-hidden">
            {previewItem ? (
              <div className="flex-1 flex flex-col h-full overflow-hidden p-5">
                {/* Preview Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                      Snapshot Inspection
                    </span>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                      {previewItem.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs font-mono">
                      <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold">
                        {previewItem.classLevel}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-bold">
                        {previewItem.subject}
                      </span>
                      <span className="text-slate-500">
                        {extractTerm(previewItem.termSession || previewItem.examData?.termSession || "")} • {extractSession(previewItem.termSession || previewItem.examData?.termSession || "")}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onRestoreExam(previewItem.examData, previewItem.title);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore into Workspace</span>
                  </button>
                </div>

                {/* Question Summary & Content Scroll */}
                <div className="flex-1 overflow-y-auto py-3 space-y-4 text-xs font-serif leading-relaxed">
                  {/* Paper Header Notice */}
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-sans text-xs space-y-1">
                    <div className="font-bold text-center uppercase tracking-wide text-slate-900 dark:text-slate-100">
                      {previewItem.examData.schoolName}
                    </div>
                    <div className="text-center text-[11px] text-slate-500">{previewItem.examData.schoolAddress}</div>
                    <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-1 text-[11px] font-mono text-slate-600 dark:text-slate-400">
                      <span>Subject: <strong>{previewItem.examData.subject}</strong></span>
                      <span>Class: <strong>{previewItem.examData.classLevel}</strong></span>
                      <span>Full Marks: <strong>{previewItem.examData.fullMarks}</strong></span>
                    </div>
                  </div>

                  {/* Section A Preview */}
                  {previewItem.examData.sectionA?.questions?.length > 0 && (
                    <div className="space-y-2">
                      <div className="font-sans font-bold text-xs text-slate-800 dark:text-slate-200 uppercase pb-1 border-b border-slate-200 dark:border-slate-800 flex justify-between">
                        <span>{previewItem.examData.sectionA.title}</span>
                        <span className="text-slate-400 font-normal">({previewItem.examData.sectionA.questions.length} Questions)</span>
                      </div>
                      <ol className="space-y-2.5">
                        {previewItem.examData.sectionA.questions.map((q, idx) => (
                          <li key={q.id || idx} className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80">
                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                              {q.questionNumber || idx + 1}. {q.questionText}
                            </p>
                            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-1 text-[11px] text-slate-600 dark:text-slate-400 font-sans">
                              {q.options?.map((opt) => (
                                <span key={opt.key}>
                                  <strong>({opt.key})</strong> {opt.text}
                                </span>
                              ))}
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Section B Preview */}
                  {previewItem.examData.sectionB?.questions?.length > 0 && (
                    <div className="space-y-2">
                      <div className="font-sans font-bold text-xs text-slate-800 dark:text-slate-200 uppercase pb-1 border-b border-slate-200 dark:border-slate-800 flex justify-between">
                        <span>{previewItem.examData.sectionB.title}</span>
                        <span className="text-slate-400 font-normal">({previewItem.examData.sectionB.questions.length} Questions)</span>
                      </div>
                      <div className="space-y-2">
                        {previewItem.examData.sectionB.questions.map((q, idx) => (
                          <div key={idx} className="p-2.5 rounded bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80">
                            <div className="flex justify-between font-semibold text-slate-900 dark:text-slate-100">
                              <span>Question {q.questionNumber}: {q.text}</span>
                              {q.marks && <span className="font-mono text-blue-600 dark:text-blue-400">{q.marks}</span>}
                            </div>
                            {q.subQuestions?.length > 0 && (
                              <ul className="mt-1.5 space-y-1 pl-3 border-l-2 border-slate-200 dark:border-slate-700 text-[11px] font-sans">
                                {q.subQuestions.map((sub, sIdx) => (
                                  <li key={sIdx} className="flex justify-between text-slate-600 dark:text-slate-400">
                                    <span><strong>({sub.label})</strong> {sub.text}</span>
                                    {sub.marks && <span className="font-mono">{sub.marks}</span>}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 dark:text-slate-500">
                <BookOpen className="w-12 h-12 mb-3 opacity-30" />
                <p className="font-bold text-sm text-slate-600 dark:text-slate-400">Select a paper from history to inspect</p>
                <p className="text-xs max-w-xs mt-1">
                  You can inspect the full objective and essay questions before restoring them into your live workspace.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


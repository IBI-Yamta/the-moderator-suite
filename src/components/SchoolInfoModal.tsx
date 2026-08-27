import React, { useState } from "react";
import { X, Building2, Save, RotateCcw } from "lucide-react";
import { ExamData } from "../types";
import { DEFAULT_SCHOOL_INFO } from "../utils/parser";

interface SchoolInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  examData: ExamData;
  onSave: (updated: Partial<ExamData>) => void;
}

export const SchoolInfoModal: React.FC<SchoolInfoModalProps> = ({
  isOpen,
  onClose,
  examData,
  onSave,
}) => {
  const [schoolName, setSchoolName] = useState(examData.schoolName);
  const [schoolMotto, setSchoolMotto] = useState(examData.schoolMotto);
  const [schoolAddress, setSchoolAddress] = useState(examData.schoolAddress);
  const [contactInfo, setContactInfo] = useState(examData.contactInfo);
  const [termSession, setTermSession] = useState(examData.termSession);
  const [subject, setSubject] = useState(examData.subject);
  const [classLevel, setClassLevel] = useState(examData.classLevel);
  const [timeAllowed, setTimeAllowed] = useState(examData.timeAllowed);
  const [fullMarks, setFullMarks] = useState(examData.fullMarks);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      schoolName,
      schoolMotto,
      schoolAddress,
      contactInfo: "",
      termSession,
      subject,
      classLevel,
      timeAllowed,
      fullMarks,
    });
    onClose();
  };

  const handleResetDefault = () => {
    setSchoolName(DEFAULT_SCHOOL_INFO.schoolName);
    setSchoolMotto(DEFAULT_SCHOOL_INFO.schoolMotto);
    setSchoolAddress(DEFAULT_SCHOOL_INFO.schoolAddress);
    setContactInfo("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">
              School Header & Examination Configuration
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 flex-1 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* School Name */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              School Name:
            </label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. AT-TARBIYYA COMMUNITY COLLEGE"
              required
            />
          </div>

          {/* School Motto */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              School Subtitle / Motto:
            </label>
            <input
              type="text"
              value={schoolMotto}
              onChange={(e) => setSchoolMotto(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. NURSERY, PRIMARY AND SECONDARY"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Address:
            </label>
            <input
              type="text"
              value={schoolAddress}
              onChange={(e) => setSchoolAddress(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. HOTORO, HABIBU GWARZO STREET, KANO, NIGERIA."
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
            {/* Term & Session */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Term & Academic Session:
              </label>
              <input
                type="text"
                value={termSession}
                onChange={(e) => setTermSession(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="FIRST TERM EXAMINATION 2026/2027 ACADEMIC SESSION"
                required
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Subject:
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 uppercase font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="GOVERNMENT"
                required
              />
            </div>

            {/* Class Level */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Class:
              </label>
              <input
                type="text"
                value={classLevel}
                onChange={(e) => setClassLevel(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 uppercase font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="SSS 2"
                required
              />
            </div>

            {/* Full Marks */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Full Marks:
              </label>
              <input
                type="text"
                value={fullMarks}
                onChange={(e) => setFullMarks(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="60"
                required
              />
            </div>

            {/* Time Allowed */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Time Allowed:
              </label>
              <input
                type="text"
                value={timeAllowed}
                onChange={(e) => setTimeAllowed(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="1½ HOURS"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetDefault}
              className="inline-flex items-center text-xs text-slate-500 hover:text-slate-800 transition"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset to At-Tarbiyya Defaults
            </button>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-sm transition"
            >
              <Save className="w-4 h-4 mr-1.5" />
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

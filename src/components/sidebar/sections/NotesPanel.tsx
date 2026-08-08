"use client";

import React, { useState, useEffect } from "react";
import { FileText, Save } from "lucide-react";

interface NotesPanelProps {
  initialNotes?: string;
  onSaveNotes: (notes: string) => void;
}

export function NotesPanel({ initialNotes = "", onSaveNotes }: NotesPanelProps) {
  const [notes, setNotes] = useState(initialNotes);

  useEffect(() => {
    setNotes(initialNotes || "");
  }, [initialNotes]);

  const handleSave = () => {
    onSaveNotes(notes);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <FileText size={15} className="text-[#C9A227]" />
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
          Admin Internal Notes
        </h4>
      </div>

      <div className="rounded-2xl bg-[#111113] border border-white/10 p-4 space-y-3 shadow-md">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add confidential admin notes regarding this subscription..."
          rows={3}
          className="w-full rounded-xl bg-[#09090b] border border-white/10 p-3 text-xs font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-hidden focus:border-[#C9A227]/50 resize-none transition-colors"
        />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C9A227] hover:bg-[#d9b237] text-black font-extrabold text-xs font-mono transition-all cursor-pointer shadow-md"
          >
            <Save size={14} />
            <span>Save Admin Note</span>
          </button>
        </div>
      </div>
    </div>
  );
}

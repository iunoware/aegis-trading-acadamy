"use client";

import React, { useState } from "react";
import { FileText, Save } from "lucide-react";

interface AdminNotesProps {
  initialNotes?: string;
  onSaveNotes: (notes: string) => void;
}

export function AdminNotes({ initialNotes = "", onSaveNotes }: AdminNotesProps) {
  const [notes, setNotes] = useState(initialNotes);

  const handleSave = () => {
    onSaveNotes(notes);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText size={15} className="text-[#C9A227]" />
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
            Admin Internal Notes
          </h4>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-[#C9A227]/15 border border-[#C9A227]/30 text-[#C9A227] hover:bg-[#C9A227]/25 hover:text-white transition-all cursor-pointer"
        >
          <Save size={13} />
          <span>Save Note</span>
        </button>
      </div>

      <textarea
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add private internal notes regarding this enrollment, payment reference, offline renewal, special requests..."
        className="w-full bg-[#09090b] border border-white/15 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all resize-none"
      />
    </div>
  );
}

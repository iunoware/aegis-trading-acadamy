"use client";

import React, { useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, Check, Edit2 } from "lucide-react";

export interface PlanFeature {
  id: string;
  text: string;
}

interface FeatureListProps {
  features: PlanFeature[];
  onChange: (features: PlanFeature[]) => void;
}

export function FeatureList({ features, onChange }: FeatureListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newFeatureText, setNewFeatureText] = useState("");

  const handleTextChange = (id: string, text: string) => {
    const updated = features.map((f) => (f.id === id ? { ...f, text } : f));
    onChange(updated);
  };

  const handleDelete = (id: string) => {
    const updated = features.filter((f) => f.id !== id);
    onChange(updated);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...features];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    onChange(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === features.length - 1) return;
    const updated = [...features];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    onChange(updated);
  };

  const handleAddFeature = () => {
    const textToAdd = newFeatureText.trim() || "New Course Feature";
    const newFeature: PlanFeature = {
      id: `feat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      text: textToAdd,
    };
    onChange([...features, newFeature]);
    setNewFeatureText("");
    setEditingId(newFeature.id);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
          <Check size={14} className="text-[#C9A227]" />
          Plan Features ({features.length})
        </label>
      </div>

      {/* List of Features */}
      <div className="space-y-2">
        {features.map((feature, idx) => (
          <div
            key={feature.id}
            className="group relative flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#09090b] border border-white/10 hover:border-[#C9A227]/30 transition-all duration-200"
          >
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <span className="w-5 h-5 rounded-full bg-[#C9A227]/15 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227] text-xs shrink-0">
                <Check size={12} strokeWidth={3} />
              </span>

              {editingId === feature.id ? (
                <input
                  type="text"
                  value={feature.text}
                  onChange={(e) => handleTextChange(feature.id, e.target.value)}
                  onBlur={() => setEditingId(null)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setEditingId(null);
                  }}
                  autoFocus
                  className="w-full bg-[#141416] border border-[#C9A227]/50 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
                />
              ) : (
                <span
                  onClick={() => setEditingId(feature.id)}
                  className="text-xs text-zinc-200 truncate cursor-pointer hover:text-white font-medium flex-1 py-0.5"
                  title="Click to edit"
                >
                  {feature.text}
                </span>
              )}
            </div>

            {/* Actions: Edit, Move Up, Move Down, Delete */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setEditingId(editingId === feature.id ? null : feature.id)}
                title="Edit Feature"
                className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 hover:border-[#C9A227]/40 hover:bg-[#C9A227]/10 text-zinc-400 hover:text-[#C9A227] flex items-center justify-center cursor-pointer transition-colors"
              >
                <Edit2 size={12} />
              </button>

              <button
                type="button"
                onClick={() => handleMoveUp(idx)}
                disabled={idx === 0}
                title="Move Up"
                className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-colors ${
                  idx === 0
                    ? "bg-white/2 border-white/5 text-zinc-700 cursor-not-allowed"
                    : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer"
                }`}
              >
                <ArrowUp size={12} />
              </button>

              <button
                type="button"
                onClick={() => handleMoveDown(idx)}
                disabled={idx === features.length - 1}
                title="Move Down"
                className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-colors ${
                  idx === features.length - 1
                    ? "bg-white/2 border-white/5 text-zinc-700 cursor-not-allowed"
                    : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer"
                }`}
              >
                <ArrowDown size={12} />
              </button>

              <button
                type="button"
                onClick={() => handleDelete(feature.id)}
                title="Delete Feature"
                className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 hover:border-red-500/50 hover:bg-red-500/20 text-red-400 flex items-center justify-center cursor-pointer transition-colors"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}

        {features.length === 0 && (
          <div className="p-4 rounded-xl bg-[#09090b] border border-dashed border-white/10 text-center text-xs text-zinc-500">
            No features added yet. Click &quot;Add Feature&quot; below.
          </div>
        )}
      </div>

      {/* Add New Feature Row */}
      <div className="flex items-center gap-2 pt-1">
        <input
          type="text"
          placeholder="Type new feature name..."
          value={newFeatureText}
          onChange={(e) => setNewFeatureText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAddFeature();
          }}
          className="flex-1 bg-[#09090b] border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all"
        />
        <button
          type="button"
          onClick={handleAddFeature}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#C9A227]/15 border border-[#C9A227]/40 text-[#C9A227] hover:bg-[#C9A227]/25 hover:text-white transition-all cursor-pointer shrink-0"
        >
          <Plus size={14} />
          <span>Add Feature</span>
        </button>
      </div>
    </div>
  );
}

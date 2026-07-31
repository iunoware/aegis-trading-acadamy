"use client";

import React, { useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  isDestructive = true,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-xs transition-opacity duration-300 animate-[fadeIn_0.2s_ease-out]"
        onClick={onClose}
      />

      {/* Dialog Box */}
      <div
        ref={dialogRef}
        className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/40 rounded-2xl shadow-xl overflow-hidden z-10 animate-[scaleUp_0.2s_cubic-bezier(0.16,1,0.3,1)]"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-desc"
      >
        <div className="p-6">
          <div className="flex gap-4 items-start">
            <div className={`p-3 rounded-xl shrink-0 ${isDestructive ? "bg-red-50 dark:bg-red-950/30 text-red-600" : "bg-blue-50 dark:bg-blue-950/30 text-blue-600"}`}>
              <AlertTriangle size={22} className="stroke-[2.5]" />
            </div>
            
            <div className="flex-1">
              <h3
                id="confirm-title"
                className="text-base font-extrabold text-gray-900 dark:text-gray-100"
              >
                {title}
              </h3>
              <p
                id="confirm-desc"
                className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400 font-medium"
              >
                {message}
              </p>
            </div>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800"
              aria-label="Close dialog"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-400 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-800 rounded-xl transition-all cursor-pointer"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-4.5 py-2.5 text-xs font-bold text-white rounded-xl transition-all shadow-xs cursor-pointer ${
                isDestructive
                  ? "bg-[#e31b23] hover:bg-[#ff2d35]"
                  : "bg-blue-600 hover:bg-blue-500"
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

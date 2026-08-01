"use client";

import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Award, X, Image as ImageIcon, Upload } from "lucide-react";
import { Certificate } from "./CertificatesGrid";
import { CertificatePreview } from "./CertificatePreview";

interface CertificateFormModalProps {
  isOpen: boolean;
  editingCertificate: Certificate | null;
  onClose: () => void;
  onSave: (certificate: Certificate) => void;
}

const PRESET_CERTIFICATE_IMAGES = [
  {
    name: "NISM / SEBI Certificate",
    url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80",
  },
  {
    name: "CMT Financial Charter",
    url: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80",
  },
  {
    name: "ISO Quality Excellence",
    url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80",
  },
  {
    name: "Options Scalping Accreditation",
    url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80",
  },
];

export function CertificateFormModal({
  isOpen,
  editingCertificate,
  onClose,
  onSave,
}: CertificateFormModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [status, setStatus] = useState<"Published" | "Hidden">("Published");

  useEffect(() => {
    if (editingCertificate) {
      setTitle(editingCertificate.title);
      setImageUrl(editingCertificate.imageUrl);
      setDisplayOrder(editingCertificate.displayOrder);
      setStatus(editingCertificate.status);
    } else {
      setTitle("");
      setImageUrl(PRESET_CERTIFICATE_IMAGES[0].url);
      setDisplayOrder(1);
      setStatus("Published");
    }
  }, [editingCertificate, isOpen]);

  useEffect(() => {
    if (isOpen && backdropRef.current && modalRef.current) {
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      );
      gsap.fromTo(
        modalRef.current,
        { scale: 0.96, opacity: 0, y: 15 },
        { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) return;

    const todayStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

    const savedItem: Certificate = {
      id: editingCertificate ? editingCertificate.id : `cert-${Date.now()}`,
      title: title.trim(),
      imageUrl: imageUrl.trim(),
      displayOrder: Number(displayOrder) || 1,
      status,
      createdAt: editingCertificate ? editingCertificate.createdAt : todayStr,
    };

    onSave(savedItem);
    onClose();
  };

  // Current Form Data for Live Preview
  const currentFormData: Partial<Certificate> = {
    title,
    imageUrl,
    displayOrder,
    status,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
      />

      {/* Modal Container */}
      <div
        ref={modalRef}
        className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl bg-[#09090b] border border-white/15 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-10 flex flex-col justify-between overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#C9A227]/15 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227]">
              <Award size={16} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white font-sans leading-none">
                {editingCertificate ? "Edit Certificate" : "Add Certificate"}
              </h3>
              <span className="text-[10px] font-mono text-zinc-400 mt-0.5 block">
                Website accreditation and achievement showcase management
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* 2-Column Layout: Form on Left, Live Preview on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-5">
          {/* Form Fields (7 Cols) */}
          <form id="certificate-form" onSubmit={handleSubmit} className="lg:col-span-7 space-y-4">
            {/* Certificate Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
                Certificate Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. NISM Series VIII Derivatives Certification"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#111113] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all"
              />
            </div>

            {/* Certificate Image URL / Presets */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
                Certificate Image URL / Upload UI *
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-1 bg-[#111113] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all"
                />
              </div>

              {/* Preset Image Options */}
              <div className="pt-1">
                <span className="text-[10px] font-mono text-zinc-500 block mb-1.5 uppercase">
                  Or select a preset high-resolution image template:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_CERTIFICATE_IMAGES.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setImageUrl(preset.url)}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                        imageUrl === preset.url
                          ? "bg-[#C9A227]/15 border-[#C9A227] text-white"
                          : "bg-[#111113] border-white/10 text-zinc-400 hover:text-white"
                      }`}
                    >
                      <ImageIcon size={14} className="text-[#C9A227] shrink-0" />
                      <span className="text-[11px] font-mono font-medium truncate">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Display Order & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
                  Display Order
                </label>
                <input
                  type="number"
                  min={1}
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full bg-[#111113] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "Published" | "Hidden")}
                  className="w-full bg-[#111113] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white font-medium focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all cursor-pointer"
                >
                  <option value="Published" className="bg-[#111113]">
                    Published (Visible on Website)
                  </option>
                  <option value="Hidden" className="bg-[#111113]">
                    Hidden (Archived)
                  </option>
                </select>
              </div>
            </div>
          </form>

          {/* Live Preview Container (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            <CertificatePreview certificate={currentFormData} />
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="certificate-form"
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-linear-to-r from-[#e6c55a] via-[#C9A227] to-[#8f6b12] text-black hover:brightness-110 shadow-lg transition-all cursor-pointer"
          >
            Save Certificate
          </button>
        </div>
      </div>
    </div>
  );
}

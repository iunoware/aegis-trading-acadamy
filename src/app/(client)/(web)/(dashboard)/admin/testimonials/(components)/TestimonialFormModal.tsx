/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { MessageSquareQuote, X, Star } from "lucide-react";
// import { Testimonial } from "./TestimonialsGrid";
import type { Testimonial } from "@/types/testimonial";
import { TestimonialPreview } from "./TestimonialPreview";

interface TestimonialFormModalProps {
  isOpen: boolean;
  editingTestimonial: Testimonial | null;
  onClose: () => void;
  onSave: (testimonial: Testimonial) => void;
}

export function TestimonialFormModal({
  isOpen,
  editingTestimonial,
  onClose,
  onSave,
}: TestimonialFormModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const [customerName, setCustomerName] = useState("");
  const [designation, setDesignation] = useState("");
  const [company, setCompany] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState("");
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [status, setStatus] = useState<"Published" | "Hidden">("Published");

  useEffect(() => {
    if (editingTestimonial) {
      setCustomerName(editingTestimonial.customerName);
      setDesignation(editingTestimonial.designation || "");
      setCompany(editingTestimonial.company || "");
      setAvatarUrl(editingTestimonial.avatarUrl || "");
      setRating(editingTestimonial.rating);
      setReviewText(editingTestimonial.reviewText);
      setDisplayOrder(editingTestimonial.displayOrder);
      setStatus(editingTestimonial.status);
    } else {
      setCustomerName("");
      setDesignation("");
      setCompany("");
      setAvatarUrl("");
      setRating(5);
      setReviewText("");
      setDisplayOrder(1);
      setStatus("Published");
    }
  }, [editingTestimonial, isOpen]);

  useEffect(() => {
    if (isOpen && backdropRef.current && modalRef.current) {
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" },
      );
      gsap.fromTo(
        modalRef.current,
        { scale: 0.96, opacity: 0, y: 15 },
        { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: "power2.out" },
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !reviewText) return;

    const todayStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

    const savedItem: Testimonial = {
      id: editingTestimonial ? editingTestimonial.id : `testi-${Date.now()}`,
      customerName: customerName.trim(),
      designation: designation.trim() || undefined,
      company: company.trim() || undefined,
      avatarUrl: avatarUrl.trim() || undefined,
      rating,
      reviewText: reviewText.trim(),
      displayOrder: Number(displayOrder) || 1,
      status,
      createdAt: editingTestimonial ? editingTestimonial.createdAt : todayStr,
    };

    onSave(savedItem);
    onClose();
  };

  // Preview live data
  const currentFormData: Partial<Testimonial> = {
    customerName,
    designation,
    company,
    avatarUrl,
    rating,
    reviewText,
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
              <MessageSquareQuote size={16} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white font-sans leading-none">
                {editingTestimonial ? "Edit Testimonial" : "Add New Testimonial"}
              </h3>
              <span className="text-[10px] font-mono text-zinc-400 mt-0.5 block">
                Public website customer review management
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

        {/* 2-Column Grid: Form on Left, Live Preview on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-5">
          {/* Form Fields (7 Cols) */}
          <form
            id="testimonial-form"
            onSubmit={handleSubmit}
            className="lg:col-span-7 space-y-4"
          >
            {/* Customer Name & Order */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-[#111113] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all"
                />
              </div>

              {/* <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
                  Display Order
                </label>
                <input
                  type="number"
                  min={1}
                  value={displayOrder}
                  onChange={(e) =>
                    setDisplayOrder(Math.max(1, Number(e.target.value) || 1))
                  }
                  className="w-full bg-[#111113] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all"
                />
              </div> */}
            </div>

            {/* Designation & Company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
                  Designation <span className="text-zinc-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Full-Time Trader"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full bg-[#111113] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
                  Company <span className="text-zinc-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Equity Alpha Labs"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-[#111113] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all"
                />
              </div>
            </div>

            {/* Photo URL & Rating */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
                  Customer Photo URL <span className="text-zinc-500">(Optional)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full bg-[#111113] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all"
                />
              </div> */}

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
                  Star Rating (1–5)
                </label>
                <div className="flex items-center gap-1.5 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <Star
                        size={20}
                        className={
                          star <= rating
                            ? "text-[#C9A227] fill-[#C9A227]"
                            : "text-zinc-600 fill-zinc-900"
                        }
                      />
                    </button>
                  ))}
                  <span className="text-xs font-mono font-bold text-[#C9A227] ml-2">
                    {rating} Star{rating > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
                Publication Status
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
                  Hidden (Draft / Archived)
                </option>
              </select>
            </div>

            {/* Testimonial Text */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
                Testimonial Text *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Write full customer review testimonial..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full bg-[#111113] border border-white/15 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all resize-none"
              />
            </div>
          </form>

          {/* Live Preview Container (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            <TestimonialPreview testimonial={currentFormData} />
          </div>
        </div>

        {/* Modal Action Buttons Footer */}
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
            form="testimonial-form"
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-linear-to-r from-[#e6c55a] via-[#C9A227] to-[#8f6b12] text-black hover:brightness-110 shadow-lg transition-all cursor-pointer"
          >
            Save Testimonial
          </button>
        </div>
      </div>
    </div>
  );
}

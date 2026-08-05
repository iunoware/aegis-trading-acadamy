/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import {
  Search,
  Filter,
  Star,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  // Building2,
  // User as UserIcon,
} from "lucide-react";

export interface Testimonial {
  id: string;
  customerName: string;
  designation?: string;
  company?: string;
  avatarUrl?: string;
  rating: number; // 1-5
  reviewText: string;
  status: "Published" | "Hidden";
  displayOrder: number;
  createdAt: string;
}

interface TestimonialsGridProps {
  testimonials: Testimonial[];
  onEdit: (testimonial: Testimonial) => void;
  onToggleStatus: (testimonialId: string) => void;
  onDelete: (testimonialId: string) => void;
}

export function TestimonialsGrid({
  testimonials,
  onEdit,
  onToggleStatus,
  onDelete,
}: TestimonialsGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOption, setFilterOption] = useState<string>("ALL");
  const gridRef = useRef<HTMLDivElement>(null);

  // GSAP animation on search/filter update
  useEffect(() => {
    if (gridRef.current) {
      gsap.fromTo(
        gridRef.current.children,
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          duration: 0.35,
          stagger: 0.06,
          ease: "power2.out",
        }
      );
    }
  }, [searchQuery, filterOption, testimonials]);

  // Filtering Logic
  const filteredTestimonials = testimonials
    .filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.customerName.toLowerCase().includes(q) ||
        (t.company && t.company.toLowerCase().includes(q)) ||
        t.reviewText.toLowerCase().includes(q);

      let matchesFilter = true;
      if (filterOption === "PUBLISHED") matchesFilter = t.status === "Published";
      else if (filterOption === "HIDDEN") matchesFilter = t.status === "Hidden";
      else if (filterOption === "FIVE_STARS") matchesFilter = t.rating === 5;
      else if (filterOption === "FOUR_STARS") matchesFilter = t.rating === 4;
      else if (filterOption === "RECENT") {
        matchesFilter = new Date(t.createdAt).getTime() > new Date("2026-07-01").getTime();
      }

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="space-y-6">
      {/* Search & Filters Bar */}
      <div className="p-4 rounded-2xl bg-[#111113]/90 backdrop-blur-xl border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-md">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="text"
            placeholder="Search by Customer Name, Company, or Review text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#09090b] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-1.5 bg-[#09090b] border border-white/15 rounded-xl px-3.5 py-2">
          <Filter size={13} className="text-[#C9A227]" />
          <select
            value={filterOption}
            onChange={(e) => setFilterOption(e.target.value)}
            className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer"
          >
            <option value="ALL" className="bg-[#111113]">All Testimonials</option>
            <option value="PUBLISHED" className="bg-[#111113]">Published Only</option>
            <option value="HIDDEN" className="bg-[#111113]">Hidden Only</option>
            <option value="FIVE_STARS" className="bg-[#111113]">5 Stars Only</option>
            <option value="FOUR_STARS" className="bg-[#111113]">4 Stars Only</option>
            <option value="RECENT" className="bg-[#111113]">Recently Added</option>
          </select>
        </div>
      </div>

      {/* Testimonials Grid (Desktop: 3 cols, Tablet: 2 cols, Mobile: 1 col) */}
      <div
        ref={gridRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredTestimonials.length > 0 ? (
          filteredTestimonials.map((testimonial) => (
            <TestimonialCardItem
              key={testimonial.id}
              testimonial={testimonial}
              onEdit={() => onEdit(testimonial)}
              onToggleStatus={() => onToggleStatus(testimonial.id)}
              onDelete={() => onDelete(testimonial.id)}
            />
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-zinc-500 font-mono text-xs rounded-2xl bg-[#111113]/40 border border-dashed border-white/10">
            No testimonials found matching your search and filter settings.
          </div>
        )}
      </div>
    </div>
  );
}

function TestimonialCardItem({
  testimonial,
  onEdit,
  onToggleStatus,
  onDelete,
}: {
  testimonial: Testimonial;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
}) {
  const initials = testimonial.customerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="group relative rounded-2xl bg-[#111113]/90 backdrop-blur-xl border border-white/10 p-5 flex flex-col justify-between hover:border-[#C9A227]/40 hover:bg-[#151518] transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
      <div>
        {/* Top Header: Order Badge & Status Badge */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-[#C9A227]/10 border border-[#C9A227]/30 text-[10px] font-mono font-bold text-[#C9A227]">
              Order #{testimonial.displayOrder}
            </span>
          </div>

          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              testimonial.status === "Published"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : "bg-zinc-500/15 text-zinc-400 border border-zinc-500/30"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                testimonial.status === "Published"
                  ? "bg-emerald-400 animate-pulse"
                  : "bg-zinc-500"
              }`}
            />
            {testimonial.status}
          </span>
        </div>

        {/* Customer Header */}
        <div className="flex items-center gap-3 mb-3">
          {testimonial.avatarUrl ? (
            <img
              src={testimonial.avatarUrl}
              alt={testimonial.customerName}
              className="w-10 h-10 rounded-full object-cover border border-[#C9A227]/40 shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#C9A227]/15 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227] font-bold text-xs shrink-0 shadow-inner">
              {initials}
            </div>
          )}

          <div className="overflow-hidden">
            <h4 className="text-sm font-extrabold text-white font-sans truncate leading-tight group-hover:text-[#C9A227] transition-colors">
              {testimonial.customerName}
            </h4>
            <div className="text-[11px] font-mono text-zinc-400 truncate mt-0.5">
              {testimonial.designation}
              {testimonial.designation && testimonial.company ? " • " : ""}
              {testimonial.company}
            </div>
          </div>
        </div>

        {/* Star Rating */}
        <div className="flex items-center gap-1 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={13}
              className={
                i < testimonial.rating
                  ? "text-[#C9A227] fill-[#C9A227]"
                  : "text-zinc-600 fill-zinc-800"
              }
            />
          ))}
          <span className="text-[11px] font-mono font-bold text-[#C9A227] ml-1">
            {testimonial.rating}.0
          </span>
        </div>

        {/* Review Text Preview */}
        <p className="text-xs text-zinc-300 leading-relaxed italic line-clamp-4 min-h-16 bg-[#09090b]/50 p-3 rounded-xl border border-white/5">
          &ldquo;{testimonial.reviewText}&rdquo;
        </p>
      </div>

      {/* Card Actions Footer */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
        <span className="text-[10px] font-mono text-zinc-500">
          Added {testimonial.createdAt}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleStatus}
            title={testimonial.status === "Published" ? "Hide Testimonial" : "Publish Testimonial"}
            className={`w-7 h-7 rounded-lg border flex items-center justify-center cursor-pointer transition-colors ${
              testimonial.status === "Published"
                ? "bg-white/5 border-white/10 hover:border-amber-500/40 text-zinc-400 hover:text-amber-400"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
            }`}
          >
            {testimonial.status === "Published" ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>

          <button
            type="button"
            onClick={onEdit}
            title="Edit Testimonial"
            className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 hover:border-sky-500/40 hover:bg-sky-500/10 text-zinc-400 hover:text-sky-400 flex items-center justify-center cursor-pointer transition-colors"
          >
            <Edit2 size={13} />
          </button>

          <button
            type="button"
            onClick={onDelete}
            title="Delete Testimonial"
            className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/50 hover:bg-rose-500/20 text-rose-400 flex items-center justify-center cursor-pointer transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

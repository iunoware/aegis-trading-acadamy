"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  Upload,
  Image as ImageIcon,
  X,
  Plus,
  Trash2,
  Edit2,
  GripVertical,
  Check,
  Video,
  Clock,
  Sparkles,
  DollarSign,
  IndianRupee,
  Layers,
  BookOpen,
  Eye,
  Award,
  Globe,
  Tag,
  User,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

// ============================================================================
// TYPES
// ============================================================================

export interface Lesson {
  id: string;
  title: string;
  videoUrl: string;
  duration: string;
  isPreview: boolean;
}

export interface CurriculumSection {
  id: string;
  title: string;
  lessons: Lesson[];
}

// ============================================================================
// 1. UPLOAD CARD COMPONENT (UI ONLY)
// ============================================================================
export function UploadCard({
  label,
  description,
  aspectRatio = "aspect-video",
  onFileSelect,
}: {
  label: string;
  description?: string;
  aspectRatio?: string;
  onFileSelect?: (file: File) => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      if (onFileSelect) onFileSelect(file);
      toast.success(`Selected file: ${file.name}`);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(null);
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
        {label}
      </span>

      <div
        onClick={() => fileInputRef.current?.click()}
        className={`relative w-full ${aspectRatio} rounded-2xl bg-[#09090b] border-2 border-dashed border-white/15 hover:border-[#C9A227]/50 transition-all duration-300 flex flex-col items-center justify-center p-4 cursor-pointer overflow-hidden group shadow-inner`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {previewUrl ? (
          <>
            <Image
              src={previewUrl}
              alt={label}
              fill
              className="object-cover rounded-xl"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2">
              <span className="text-xs font-mono text-white bg-black/80 px-3 py-1 rounded-full border border-white/20">
                {fileName}
              </span>
              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-semibold hover:bg-rose-500/30 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Remove</span>
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-4">
            <div className="w-11 h-11 rounded-2xl bg-[#C9A227]/10 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227] mb-3 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(201,162,39,0.15)]">
              <Upload size={20} />
            </div>
            <span className="text-xs font-bold text-white group-hover:text-[#C9A227] transition-colors">
              Click to upload {label.toLowerCase()}
            </span>
            <span className="text-[11px] text-zinc-500 font-mono mt-1">
              {description || "SVG, PNG, JPG or WEBP (Max 5MB)"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 2. BASIC INFORMATION COMPONENT
// ============================================================================
export function CourseBasicInfo({
  title,
  setTitle,
  slug,
  setSlug,
  shortDescription,
  setShortDescription,
  fullDescription,
  setFullDescription,
}: {
  title: string;
  setTitle: (val: string) => void;
  slug: string;
  setSlug: (val: string) => void;
  shortDescription: string;
  setShortDescription: (val: string) => void;
  fullDescription: string;
  setFullDescription: (val: string) => void;
}) {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setSlug(generatedSlug);
  };

  return (
    <div className="rounded-2xl bg-[#111113]/80 backdrop-blur-xl border border-white/10 p-5 sm:p-7 flex flex-col gap-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-2 pb-4 border-b border-white/10">
        <div className="w-8 h-8 rounded-xl bg-[#C9A227]/10 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227]">
          <BookOpen size={16} />
        </div>
        <div>
          <h3 className="text-base font-bold text-white font-sans">
            Section 1: Basic Information
          </h3>
          <p className="text-xs text-zinc-400">
            Primary course titles, media banners & descriptions.
          </p>
        </div>
      </div>

      {/* Upload Media Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <UploadCard
          label="Course Thumbnail"
          description="Dimensions: 800x500px (16:10 aspect ratio)"
          aspectRatio="aspect-[16/10]"
        />
        <UploadCard
          label="Course Banner / Cover"
          description="Dimensions: 1200x500px (Hero banner image)"
          aspectRatio="aspect-[16/10]"
        />
      </div>

      {/* Title & Slug */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
            Course Title <span className="text-[#C9A227]">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="e.g. Price Action & Institutional Order Flow Masterclass"
            className="w-full px-4 py-3 rounded-xl bg-[#09090b] border border-white/15 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
            Course Slug <span className="text-[#C9A227]">*</span>
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. price-action-institutional-order-flow"
            className="w-full px-4 py-3 rounded-xl bg-[#09090b] border border-white/15 text-xs font-mono text-[#C9A227] placeholder:text-zinc-600 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all"
          />
        </div>
      </div>

      {/* Short Description */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
          Short Summary / Tagline
        </label>
        <textarea
          rows={2}
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          placeholder="Concise overview of what students will master in this program..."
          className="w-full px-4 py-3 rounded-xl bg-[#09090b] border border-white/15 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all resize-none"
        />
      </div>

      {/* Full Description */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
          Full Curriculum Description
        </label>
        <textarea
          rows={5}
          value={fullDescription}
          onChange={(e) => setFullDescription(e.target.value)}
          placeholder="Comprehensive breakdown of market concepts, trading strategies, risk management protocols, and tools covered..."
          className="w-full px-4 py-3 rounded-xl bg-[#09090b] border border-white/15 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all resize-y"
        />
      </div>
    </div>
  );
}

// ============================================================================
// 3. COURSE DETAILS COMPONENT
// ============================================================================
export function CourseDetails({
  category,
  setCategory,
  mentor,
  setMentor,
  difficulty,
  setDifficulty,
  language,
  setLanguage,
  duration,
  setDuration,
  lessonCount,
}: {
  category: string;
  setCategory: (val: string) => void;
  mentor: string;
  setMentor: (val: string) => void;
  difficulty: string;
  setDifficulty: (val: string) => void;
  language: string;
  setLanguage: (val: string) => void;
  duration: string;
  setDuration: (val: string) => void;
  lessonCount: number;
}) {
  return (
    <div className="rounded-2xl bg-[#111113]/80 backdrop-blur-xl border border-white/10 p-5 sm:p-7 flex flex-col gap-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-2 pb-4 border-b border-white/10">
        <div className="w-8 h-8 rounded-xl bg-[#C9A227]/10 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227]">
          <Tag size={16} />
        </div>
        <div>
          <h3 className="text-base font-bold text-white font-sans">
            Section 2: Course Details
          </h3>
          <p className="text-xs text-zinc-400">
            Categorization, mentor assignment, difficulty & duration.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Category Dropdown */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#09090b] border border-white/15 text-sm text-white focus:outline-none focus:border-[#C9A227] transition-all cursor-pointer"
          >
            <option value="Options Trading">Options Trading</option>
            <option value="Price Action">Price Action & Order Flow</option>
            <option value="Equity Derivatives">Equity Derivatives</option>
            <option value="Futures & Scalping">Futures & Scalping</option>
            <option value="Crypto & Forex">Crypto & Forex</option>
          </select>
        </div>

        {/* Mentor Dropdown */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
            Lead Mentor
          </label>
          <select
            value={mentor}
            onChange={(e) => setMentor(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#09090b] border border-white/15 text-sm text-white focus:outline-none focus:border-[#C9A227] transition-all cursor-pointer"
          >
            <option value="Dr. Vikram Seth">Dr. Vikram Seth (Derivatives Lead)</option>
            <option value="Aarav Sharma">Aarav Sharma (Price Action Specialist)</option>
            <option value="Sneha Kapoor">Sneha Kapoor (Options Strategist)</option>
            <option value="Rajesh Verma">Rajesh Verma (Quantitative Analyst)</option>
          </select>
        </div>

        {/* Difficulty */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
            Difficulty Level
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#09090b] border border-white/15 text-sm text-white focus:outline-none focus:border-[#C9A227] transition-all cursor-pointer"
          >
            <option value="Beginner">Beginner (Foundations)</option>
            <option value="Intermediate">Intermediate (Trader)</option>
            <option value="Advanced">Advanced (Professional)</option>
            <option value="Institutional">Institutional (Pro / CMT)</option>
          </select>
        </div>

        {/* Language */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
            Instruction Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#09090b] border border-white/15 text-sm text-white focus:outline-none focus:border-[#C9A227] transition-all cursor-pointer"
          >
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Hinglish">Hinglish (Hindi + English)</option>
          </select>
        </div>

        {/* Total Duration */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
            Total Duration
          </label>
          <input
            type="text"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g. 14.5 Hours"
            className="w-full px-4 py-3 rounded-xl bg-[#09090b] border border-white/15 text-sm text-white focus:outline-none focus:border-[#C9A227] transition-all"
          />
        </div>

        {/* Number of Lessons (Read-only count) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
            Total Lessons Count
          </label>
          <div className="w-full px-4 py-3 rounded-xl bg-[#09090b]/60 border border-white/10 text-sm font-mono text-[#C9A227] font-bold flex items-center justify-between">
            <span>{lessonCount} Lessons</span>
            <span className="text-[11px] text-zinc-500 font-normal">Calculated from curriculum</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 4. COURSE PRICING COMPONENT
// ============================================================================
export function CoursePricing({
  regularPrice,
  setRegularPrice,
  discountPrice,
  setDiscountPrice,
  isFree,
  setIsFree,
  subscriptionRequired,
  setSubscriptionRequired,
}: {
  regularPrice: string;
  setRegularPrice: (val: string) => void;
  discountPrice: string;
  setDiscountPrice: (val: string) => void;
  isFree: boolean;
  setIsFree: (val: boolean) => void;
  subscriptionRequired: boolean;
  setSubscriptionRequired: (val: boolean) => void;
}) {
  return (
    <div className="rounded-2xl bg-[#111113]/80 backdrop-blur-xl border border-white/10 p-5 sm:p-7 flex flex-col gap-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#C9A227]/10 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227]">
            <IndianRupee size={16} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-sans">
              Section 3: Pricing & Access Control
            </h3>
            <p className="text-xs text-zinc-400">
              One-time purchase rates, discounts & pass access.
            </p>
          </div>
        </div>

        {/* Price Toggles */}
        <div className="flex items-center gap-4">
          <label className="inline-flex items-center gap-2 text-xs font-mono text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={isFree}
              onChange={(e) => setIsFree(e.target.checked)}
              className="w-4 h-4 accent-[#C9A227] rounded cursor-pointer"
            />
            <span>Free Course</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Regular Price */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
            Regular Price (INR)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-sm">
              ₹
            </span>
            <input
              type="number"
              disabled={isFree}
              value={isFree ? "0" : regularPrice}
              onChange={(e) => setRegularPrice(e.target.value)}
              placeholder="14999"
              className="w-full pl-8 pr-4 py-3 rounded-xl bg-[#09090b] border border-white/15 text-sm font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#C9A227] disabled:opacity-40 transition-all"
            />
          </div>
        </div>

        {/* Discount Price */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
            Offer / Discounted Price (INR)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C9A227] font-mono text-sm">
              ₹
            </span>
            <input
              type="number"
              disabled={isFree}
              value={isFree ? "0" : discountPrice}
              onChange={(e) => setDiscountPrice(e.target.value)}
              placeholder="9999"
              className="w-full pl-8 pr-4 py-3 rounded-xl bg-[#09090b] border border-white/15 text-sm font-mono text-[#C9A227] font-bold placeholder:text-zinc-600 focus:outline-none focus:border-[#C9A227] disabled:opacity-40 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Subscription Toggle Banner */}
      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-[#C9A227] shrink-0" size={20} />
          <div>
            <div className="text-xs font-bold text-white">
              Included in Pro Pass Subscriptions
            </div>
            <div className="text-[11px] text-zinc-400">
              Enable so active membership pass holders access this course automatically.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSubscriptionRequired(!subscriptionRequired)}
          className={`w-12 h-6 rounded-full transition-colors duration-200 relative p-1 cursor-pointer shrink-0 ${
            subscriptionRequired ? "bg-[#C9A227]" : "bg-white/10"
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-black shadow-md transition-transform duration-200 ${
              subscriptionRequired ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// 5. COURSE VISIBILITY & STATUS COMPONENT
// ============================================================================
export function CourseVisibility({
  status,
  setStatus,
}: {
  status: "Draft" | "Published" | "Featured" | "Coming Soon";
  setStatus: (val: "Draft" | "Published" | "Featured" | "Coming Soon") => void;
}) {
  const options: {
    id: "Draft" | "Published" | "Featured" | "Coming Soon";
    label: string;
    desc: string;
    badgeStyle: string;
  }[] = [
    {
      id: "Draft",
      label: "Draft",
      desc: "Hidden from student catalog. Only admins can preview.",
      badgeStyle: "border-zinc-700 text-zinc-400 bg-zinc-800/40",
    },
    {
      id: "Published",
      label: "Published",
      desc: "Live and accessible to enrolled students immediately.",
      badgeStyle: "border-[#C9A227]/40 text-[#C9A227] bg-[#C9A227]/10",
    },
    {
      id: "Featured",
      label: "Featured",
      desc: "Highlighted on top academy homepage & pricing pages.",
      badgeStyle: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
    },
    {
      id: "Coming Soon",
      label: "Coming Soon",
      desc: "Visible in catalog with teaser badge & waitlist button.",
      badgeStyle: "border-amber-500/40 text-amber-400 bg-amber-500/10",
    },
  ];

  return (
    <div className="rounded-2xl bg-[#111113]/80 backdrop-blur-xl border border-white/10 p-5 sm:p-7 flex flex-col gap-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-2 pb-4 border-b border-white/10">
        <div className="w-8 h-8 rounded-xl bg-[#C9A227]/10 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227]">
          <Eye size={16} />
        </div>
        <div>
          <h3 className="text-base font-bold text-white font-sans">
            Section 4: Catalog Visibility & Status
          </h3>
          <p className="text-xs text-zinc-400">
            Control publication state and featured highlights.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {options.map((opt) => {
          const isSelected = status === opt.id;
          return (
            <div
              key={opt.id}
              onClick={() => setStatus(opt.id)}
              className={`p-4 rounded-xl border flex flex-col justify-between gap-3 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "bg-[#C9A227]/15 border-[#C9A227] shadow-[0_0_20px_rgba(201,162,39,0.15)]"
                  : "bg-[#09090b] border-white/10 hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${opt.badgeStyle}`}>
                  {opt.label}
                </span>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    isSelected ? "border-[#C9A227] bg-[#C9A227]" : "border-white/30"
                  }`}
                >
                  {isSelected && <Check size={10} className="text-black stroke-[3]" />}
                </div>
              </div>
              <p className="text-xs text-zinc-400 font-normal leading-relaxed">
                {opt.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// 6. LEARNING OUTCOMES DYNAMIC COMPONENT
// ============================================================================
export function LearningOutcomes({
  outcomes,
  setOutcomes,
}: {
  outcomes: string[];
  setOutcomes: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const [newInput, setNewInput] = useState("");

  const handleAdd = () => {
    if (!newInput.trim()) return;
    setOutcomes((prev) => [...prev, newInput.trim()]);
    setNewInput("");
    toast.success("Added learning outcome");
  };

  const handleDelete = (index: number) => {
    setOutcomes((prev) => prev.filter((_, i) => i !== index));
    toast.info("Outcome removed");
  };

  return (
    <div className="rounded-2xl bg-[#111113]/80 backdrop-blur-xl border border-white/10 p-5 sm:p-7 flex flex-col gap-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-2 pb-4 border-b border-white/10">
        <div className="w-8 h-8 rounded-xl bg-[#C9A227]/10 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227]">
          <Award size={16} />
        </div>
        <div>
          <h3 className="text-base font-bold text-white font-sans">
            Section 5: Learning Outcomes
          </h3>
          <p className="text-xs text-zinc-400">
            Key skills & concepts students master upon course completion.
          </p>
        </div>
      </div>

      {/* Add Outcome Input Bar */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newInput}
          onChange={(e) => setNewInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder="e.g. Master institutional liquidity pools and order block identification..."
          className="flex-1 px-4 py-3 rounded-xl bg-[#09090b] border border-white/15 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#C9A227] transition-all"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="px-5 py-3 rounded-xl bg-[#C9A227] text-black font-bold text-xs hover:bg-[#e6c55a] transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md"
        >
          <Plus size={15} className="stroke-[3]" />
          <span>Add Outcome</span>
        </button>
      </div>

      {/* Dynamic Outcomes List */}
      <div className="flex flex-col gap-2.5">
        {outcomes.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition-all group"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
              <span className="w-6 h-6 rounded-lg bg-[#C9A227]/10 border border-[#C9A227]/30 text-[#C9A227] font-mono text-xs font-bold flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <span className="text-xs sm:text-sm text-zinc-200 font-medium leading-normal truncate">
                {item}
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleDelete(idx)}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-80 group-hover:opacity-100 cursor-pointer"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        {outcomes.length === 0 && (
          <div className="p-6 rounded-xl border border-dashed border-white/10 text-center text-xs text-zinc-500 font-mono">
            No learning outcomes added yet. Use the input bar above.
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 7. CURRICULUM BUILDER COMPONENT (100% LOCAL STATE)
// ============================================================================
export function CurriculumBuilder({
  sections,
  setSections,
}: {
  sections: CurriculumSection[];
  setSections: React.Dispatch<React.SetStateAction<CurriculumSection[]>>;
}) {
  const [newSectionTitle, setNewSectionTitle] = useState("");

  const handleAddSection = () => {
    if (!newSectionTitle.trim()) return;
    const newSec: CurriculumSection = {
      id: "sec-" + Date.now(),
      title: newSectionTitle.trim(),
      lessons: [],
    };
    setSections((prev) => [...prev, newSec]);
    setNewSectionTitle("");
    toast.success("Added curriculum module");
  };

  const handleDeleteSection = (secId: string) => {
    setSections((prev) => prev.filter((s) => s.id !== secId));
    toast.info("Module removed");
  };

  const handleAddLesson = (secId: string) => {
    const newLesson: Lesson = {
      id: "les-" + Date.now(),
      title: "New Lesson Title",
      videoUrl: "https://vimeo.com/sample-video",
      duration: "15m",
      isPreview: false,
    };
    setSections((prev) =>
      prev.map((sec) =>
        sec.id === secId ? { ...sec, lessons: [...sec.lessons, newLesson] } : sec
      )
    );
    toast.success("Added new lesson slot");
  };

  const handleDeleteLesson = (secId: string, lesId: string) => {
    setSections((prev) =>
      prev.map((sec) =>
        sec.id === secId
          ? { ...sec, lessons: sec.lessons.filter((l) => l.id !== lesId) }
          : sec
      )
    );
  };

  const handleUpdateLesson = (
    secId: string,
    lesId: string,
    field: keyof Lesson,
    value: any
  ) => {
    setSections((prev) =>
      prev.map((sec) =>
        sec.id === secId
          ? {
              ...sec,
              lessons: sec.lessons.map((l) =>
                l.id === lesId ? { ...l, [field]: value } : l
              ),
            }
          : sec
      )
    );
  };

  return (
    <div className="rounded-2xl bg-[#111113]/80 backdrop-blur-xl border border-white/10 p-5 sm:p-7 flex flex-col gap-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#C9A227]/10 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227]">
            <Layers size={16} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-sans">
              Curriculum & Lesson Builder
            </h3>
            <p className="text-xs text-zinc-400">
              Organize modules, video URLs & lesson preview permissions.
            </p>
          </div>
        </div>
      </div>

      {/* Add Module Input Bar */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newSectionTitle}
          onChange={(e) => setNewSectionTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddSection();
            }
          }}
          placeholder="e.g. Module 1: Market Structure & Institutional Liquidity"
          className="flex-1 px-4 py-3 rounded-xl bg-[#09090b] border border-white/15 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#C9A227] transition-all"
        />
        <button
          type="button"
          onClick={handleAddSection}
          className="px-5 py-3 rounded-xl bg-[#C9A227] text-black font-bold text-xs hover:bg-[#e6c55a] transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md"
        >
          <Plus size={15} className="stroke-[3]" />
          <span>Add Section</span>
        </button>
      </div>

      {/* Modules List */}
      <div className="flex flex-col gap-6">
        {sections.map((section, sIdx) => (
          <div
            key={section.id}
            className="rounded-xl bg-[#09090b] border border-white/10 p-4 sm:p-5 flex flex-col gap-4"
          >
            {/* Section Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-[#C9A227] px-2.5 py-1 rounded-md bg-[#C9A227]/10 border border-[#C9A227]/20">
                  SECTION {sIdx + 1}
                </span>
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSections((prev) =>
                      prev.map((s) => (s.id === section.id ? { ...s, title: val } : s))
                    );
                  }}
                  className="bg-transparent text-sm sm:text-base font-bold text-white focus:outline-none border-b border-transparent focus:border-[#C9A227] px-1 py-0.5"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAddLesson(section.id)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-[#C9A227]/20 text-[#C9A227] border border-white/10 hover:border-[#C9A227]/40 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Add Lesson</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteSection(section.id)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Lessons List Inside Section */}
            <div className="flex flex-col gap-3 pl-2 sm:pl-4">
              {section.lessons.map((lesson, lIdx) => (
                <div
                  key={lesson.id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#111113] border border-white/10 hover:border-[#C9A227]/30 transition-all"
                >
                  {/* Left: Drag Icon + Title Input */}
                  <div className="flex items-center gap-2.5 flex-1">
                    <GripVertical size={16} className="text-zinc-600 shrink-0 cursor-grab" />
                    <span className="text-xs font-mono text-zinc-500 shrink-0">
                      {sIdx + 1}.{lIdx + 1}
                    </span>
                    <input
                      type="text"
                      value={lesson.title}
                      onChange={(e) =>
                        handleUpdateLesson(section.id, lesson.id, "title", e.target.value)
                      }
                      className="bg-transparent text-xs sm:text-sm font-semibold text-white focus:outline-none border-b border-transparent focus:border-[#C9A227] w-full"
                    />
                  </div>

                  {/* Right: Video URL, Duration & Preview Toggle */}
                  <div className="flex items-center gap-3 flex-wrap md:flex-nowrap shrink-0">
                    {/* Video URL Input */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-xs">
                      <Video size={13} className="text-[#C9A227]" />
                      <input
                        type="text"
                        value={lesson.videoUrl}
                        onChange={(e) =>
                          handleUpdateLesson(section.id, lesson.id, "videoUrl", e.target.value)
                        }
                        placeholder="Video URL"
                        className="bg-transparent text-xs font-mono text-zinc-300 focus:outline-none w-32 sm:w-44"
                      />
                    </div>

                    {/* Duration Input */}
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/40 border border-white/10 text-xs">
                      <Clock size={12} className="text-zinc-400" />
                      <input
                        type="text"
                        value={lesson.duration}
                        onChange={(e) =>
                          handleUpdateLesson(section.id, lesson.id, "duration", e.target.value)
                        }
                        placeholder="15m"
                        className="bg-transparent text-xs font-mono text-white text-center w-12 focus:outline-none"
                      />
                    </div>

                    {/* Preview Toggle */}
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateLesson(section.id, lesson.id, "isPreview", !lesson.isPreview)
                      }
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold border cursor-pointer transition-colors ${
                        lesson.isPreview
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-white/5 text-zinc-400 border-white/10"
                      }`}
                    >
                      {lesson.isPreview ? "Free Preview ON" : "Locked"}
                    </button>

                    {/* Delete Lesson */}
                    <button
                      type="button"
                      onClick={() => handleDeleteLesson(section.id, lesson.id)}
                      className="p-1 rounded-lg text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {section.lessons.length === 0 && (
                <div className="p-4 rounded-xl border border-dashed border-white/10 text-center text-xs font-mono text-zinc-500">
                  No lessons added to this module yet. Click &quot;Add Lesson&quot; above.
                </div>
              )}
            </div>
          </div>
        ))}

        {sections.length === 0 && (
          <div className="p-8 rounded-xl border border-dashed border-white/10 text-center text-xs font-mono text-zinc-500">
            No curriculum sections added yet. Use the input bar above to add your first module.
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import {
  Search,
  Filter,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Award,
  Maximize2,
} from "lucide-react";
import { CertificateImageLightbox } from "./CertificateImageLightbox";

export interface Certificate {
  id: string;
  title: string;
  imageUrl: string;
  status: "Published" | "Hidden";
  displayOrder: number;
  createdAt: string;
}

interface CertificatesGridProps {
  certificates: Certificate[];
  onEdit: (certificate: Certificate) => void;
  onToggleStatus: (certificateId: string) => void;
  onDelete: (certificateId: string) => void;
}

export function CertificatesGrid({
  certificates,
  onEdit,
  onToggleStatus,
  onDelete,
}: CertificatesGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOption, setFilterOption] = useState<string>("ALL");
  const [previewingCertificate, setPreviewingCertificate] =
    useState<Certificate | null>(null);
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
        },
      );
    }
  }, [searchQuery, filterOption, certificates]);

  // Filtering Logic
  const filteredCertificates = certificates
    .filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || item.title.toLowerCase().includes(q);

      let matchesFilter = true;
      if (filterOption === "PUBLISHED")
        matchesFilter = item.status === "Published";
      else if (filterOption === "HIDDEN")
        matchesFilter = item.status === "Hidden";
      else if (filterOption === "RECENT") {
        matchesFilter =
          new Date(item.createdAt).getTime() > new Date("2026-07-01").getTime();
      }

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      {/* <div className="p-4 rounded-2xl bg-[#111113]/90 backdrop-blur-xl border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-md">
        Search Input
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="text"
            placeholder="Search certificates by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#09090b] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all"
          />
        </div>

        Filter Dropdown
        <div className="flex items-center gap-1.5 bg-[#09090b] border border-white/15 rounded-xl px-3.5 py-2">
          <Filter size={13} className="text-[#C9A227]" />
          <select
            value={filterOption}
            onChange={(e) => setFilterOption(e.target.value)}
            className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer"
          >
            <option value="ALL" className="bg-[#111113]">
              All Certificates
            </option>
            <option value="PUBLISHED" className="bg-[#111113]">
              Published Only
            </option>
            <option value="HIDDEN" className="bg-[#111113]">
              Hidden Only
            </option>
            <option value="RECENT" className="bg-[#111113]">
              Recently Added
            </option>
          </select>
        </div>
      </div> */}

      {/* Grid Showcase (Desktop: 3 cols, Tablet: 2 cols, Mobile: 1 col) */}
      <div
        ref={gridRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredCertificates.length > 0 ? (
          filteredCertificates.map((cert) => (
            <CertificateCardItem
              key={cert.id}
              certificate={cert}
              onImageClick={() => setPreviewingCertificate(cert)}
              onEdit={() => onEdit(cert)}
              onToggleStatus={() => onToggleStatus(cert.id)}
              onDelete={() => onDelete(cert.id)}
            />
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-zinc-500 font-mono text-xs rounded-2xl bg-[#111113]/40 border border-dashed border-white/10">
            No certificates found matching your search and filter criteria.
          </div>
        )}
      </div>

      {/* Image Lightbox Modal */}
      <CertificateImageLightbox
        certificate={previewingCertificate}
        onClose={() => setPreviewingCertificate(null)}
      />
    </div>
  );
}

function CertificateCardItem({
  certificate,
  onImageClick,
  onEdit,
  onToggleStatus,
  onDelete,
}: {
  certificate: Certificate;
  onImageClick: () => void;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group relative rounded-2xl bg-[#111113]/90 backdrop-blur-xl border border-white/10 p-5 flex flex-col justify-between hover:border-[#C9A227]/40 hover:bg-[#151518] transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden">
      <div>
        {/* Card Header: Order Badge & Status */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
          <span className="px-2 py-0.5 rounded-md bg-[#C9A227]/10 border border-[#C9A227]/30 text-[10px] font-mono font-bold text-[#C9A227]">
            Order #{certificate.displayOrder}
          </span>

          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              certificate.status === "Published"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : "bg-zinc-500/15 text-zinc-400 border border-zinc-500/30"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                certificate.status === "Published"
                  ? "bg-emerald-400 animate-pulse"
                  : "bg-zinc-500"
              }`}
            />
            {certificate.status}
          </span>
        </div>

        {/* Certificate Image Frame */}
        <div
          onClick={onImageClick}
          className="relative w-full h-44 rounded-xl bg-[#070709] border border-white/10 overflow-hidden cursor-pointer group/img mb-4 flex items-center justify-center"
        >
          <img
            src={certificate.imageUrl}
            alt={certificate.title}
            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
          />
          {/* Zoom Overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-mono text-xs font-semibold">
            <Maximize2 size={16} className="text-[#C9A227]" />
            <span>Click to View Full Size</span>
          </div>
        </div>

        {/* Certificate Title */}
        <h4 className="text-sm font-extrabold text-white font-sans tracking-tight leading-snug group-hover:text-[#C9A227] transition-colors min-h-[40px] line-clamp-2">
          {certificate.title}
        </h4>
      </div>

      {/* Card Actions Footer */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
        <span className="text-[10px] font-mono text-zinc-500">
          Added {certificate.createdAt}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleStatus}
            title={
              certificate.status === "Published"
                ? "Hide Certificate"
                : "Publish Certificate"
            }
            className={`w-7 h-7 rounded-lg border flex items-center justify-center cursor-pointer transition-colors ${
              certificate.status === "Published"
                ? "bg-white/5 border-white/10 hover:border-amber-500/40 text-zinc-400 hover:text-amber-400"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
            }`}
          >
            {certificate.status === "Published" ? (
              <EyeOff size={13} />
            ) : (
              <Eye size={13} />
            )}
          </button>

          <button
            type="button"
            onClick={onEdit}
            title="Edit Certificate"
            className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 hover:border-sky-500/40 hover:bg-sky-500/10 text-zinc-400 hover:text-sky-400 flex items-center justify-center cursor-pointer transition-colors"
          >
            <Edit2 size={13} />
          </button>

          <button
            type="button"
            onClick={onDelete}
            title="Delete Certificate"
            className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/50 hover:bg-rose-500/20 text-rose-400 flex items-center justify-center cursor-pointer transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

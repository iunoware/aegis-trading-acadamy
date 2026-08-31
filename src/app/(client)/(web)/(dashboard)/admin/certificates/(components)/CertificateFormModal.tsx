/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Award, ImageIcon, Loader2, Upload, X } from "lucide-react";

import { Certificate } from "./CertificatesGrid";
import { CertificatePreview } from "./CertificatePreview";

export interface CertificateFormValues {
  title: string;
  displayOrder: number;
  status: "Published" | "Hidden";
  image: File | null;
}

interface CertificateFormModalProps {
  isOpen: boolean;
  editingCertificate: Certificate | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (values: CertificateFormValues) => Promise<void>;
}

const MAX_IMAGE_SIZE = 50 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export function CertificateFormModal({
  isOpen,
  editingCertificate,
  isSaving,
  onClose,
  onSave,
}: CertificateFormModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [displayOrder, setDisplayOrder] = useState(1);
  const [status, setStatus] = useState<"Published" | "Hidden">("Published");

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    if (editingCertificate) {
      setTitle(editingCertificate.title);
      setDisplayOrder(editingCertificate.displayOrder);
      setStatus(editingCertificate.status);
      setSelectedImage(null);
      setPreviewImageUrl(editingCertificate.imageUrl);
      setImageError("");
    } else {
      setTitle("");
      setDisplayOrder(1);
      setStatus("Published");
      setSelectedImage(null);
      setPreviewImageUrl("");
      setImageError("");
    }
  }, [editingCertificate, isOpen]);

  useEffect(() => {
    if (!selectedImage) {
      return;
    }

    const objectUrl = URL.createObjectURL(selectedImage);

    setPreviewImageUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedImage]);

  useEffect(() => {
    if (isOpen && backdropRef.current && modalRef.current) {
      gsap.fromTo(
        backdropRef.current,
        {
          opacity: 0,
        },
        {
          opacity: 1,
          duration: 0.3,
          ease: "power2.out",
        },
      );

      gsap.fromTo(
        modalRef.current,
        {
          scale: 0.96,
          opacity: 0,
          y: 15,
        },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.35,
          ease: "power2.out",
        },
      );
    }
  }, [isOpen]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    setImageError("");

    if (!file) {
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError("Only JPG, PNG, WebP and AVIF images are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setImageError("The image must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    setSelectedImage(file);
  };

  const handleRemoveSelectedImage = () => {
    setSelectedImage(null);

    if (editingCertificate) {
      setPreviewImageUrl(editingCertificate.imageUrl);
    } else {
      setPreviewImageUrl("");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    if (!editingCertificate && !selectedImage) {
      setImageError("Please select a certificate image.");
      return;
    }

    await onSave({
      title: trimmedTitle,
      displayOrder,
      status,
      image: selectedImage,
    });
  };

  if (!isOpen) return null;

  const currentFormData: Partial<Certificate> = {
    title,
    imageUrl: previewImageUrl,
    displayOrder,
    status,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      <div
        ref={backdropRef}
        onClick={isSaving ? undefined : onClose}
        className="fixed inset-0 cursor-pointer bg-black/80 backdrop-blur-sm"
      />

      <div
        ref={modalRef}
        className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col justify-between overflow-y-auto rounded-2xl border border-white/15 bg-[#09090b] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.9)]"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#C9A227]/30 bg-[#C9A227]/15 text-[#C9A227]">
              <Award size={16} />
            </div>

            <div>
              <h3 className="text-base font-extrabold leading-none text-white">
                {editingCertificate ? "Edit Certificate" : "Add Certificate"}
              </h3>

              <span className="mt-0.5 block font-mono text-[10px] text-zinc-400">
                Website certificate showcase management
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-400 transition-colors hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        <div className="my-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <form
            id="certificate-form"
            onSubmit={handleSubmit}
            className="space-y-4 lg:col-span-7"
          >
            <div className="space-y-1.5">
              <label className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Certificate Title *
              </label>

              <input
                type="text"
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. NISM Series VIII Certification"
                disabled={isSaving}
                className="w-full rounded-xl border border-white/15 bg-[#111113] px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 transition-all focus:border-[#C9A227] focus:outline-none focus:ring-1 focus:ring-[#C9A227] disabled:opacity-60"
              />
            </div>

            <div className="space-y-2">
              <label className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Certificate Image {editingCertificate ? "" : "*"}
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={handleImageChange}
                disabled={isSaving}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSaving}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#C9A227]/40 bg-[#C9A227]/5 px-4 py-6 text-xs font-semibold text-[#C9A227] transition-colors hover:border-[#C9A227] hover:bg-[#C9A227]/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Upload size={18} />

                <span>
                  {selectedImage
                    ? "Choose a Different Image"
                    : editingCertificate
                      ? "Replace Certificate Image"
                      : "Upload Certificate Image"}
                </span>
              </button>

              <p className="font-mono text-[10px] text-zinc-500">
                JPG, PNG, WebP or AVIF. Maximum size: 5 MB.
              </p>

              {selectedImage && (
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#111113] px-3 py-2.5">
                  <div className="flex min-w-0 items-center gap-2">
                    <ImageIcon size={14} className="shrink-0 text-[#C9A227]" />

                    <span className="truncate text-xs text-zinc-300">
                      {selectedImage.name}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveSelectedImage}
                    disabled={isSaving}
                    className="ml-3 shrink-0 cursor-pointer text-[10px] font-semibold text-rose-400 hover:text-rose-300"
                  >
                    Remove
                  </button>
                </div>
              )}

              {imageError && <p className="text-xs text-rose-400">{imageError}</p>}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Display Order
                </label>

                <input
                  type="number"
                  min={0}
                  value={displayOrder}
                  onChange={(event) =>
                    setDisplayOrder(Math.max(0, Number(event.target.value) || 0))
                  }
                  disabled={isSaving}
                  className="w-full rounded-xl border border-white/15 bg-[#111113] px-3.5 py-2.5 font-mono text-xs font-bold text-white transition-all focus:border-[#C9A227] focus:outline-none focus:ring-1 focus:ring-[#C9A227] disabled:opacity-60"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Status
                </label>

                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as "Published" | "Hidden")
                  }
                  disabled={isSaving}
                  className="w-full cursor-pointer rounded-xl border border-white/15 bg-[#111113] px-3.5 py-2.5 text-xs font-medium text-white transition-all focus:border-[#C9A227] focus:outline-none focus:ring-1 focus:ring-[#C9A227] disabled:opacity-60"
                >
                  <option value="Published">Published (Visible on Website)</option>

                  <option value="Hidden">Hidden</option>
                </select>
              </div>
            </div>
          </form>

          <div className="flex flex-col justify-start lg:col-span-5">
            {previewImageUrl ? (
              <CertificatePreview certificate={currentFormData} />
            ) : (
              <div className="flex min-h-80 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#111113]/50 p-6 text-center">
                <div>
                  <ImageIcon size={28} className="mx-auto mb-3 text-zinc-600" />

                  <p className="text-xs text-zinc-500">
                    Select an image to see the certificate preview.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-zinc-300 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="certificate-form"
            disabled={isSaving}
            className="inline-flex min-w-36.25 cursor-pointer items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#e6c55a] via-[#C9A227] to-[#8f6b12] px-6 py-2.5 text-xs font-bold text-black shadow-lg transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Saving...
              </>
            ) : (
              "Save Certificate"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

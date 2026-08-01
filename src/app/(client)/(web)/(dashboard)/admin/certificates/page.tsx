"use client";

import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { toast } from "sonner";
import { CertificatesHeader } from "./(components)/CertificatesHeader";
import { CertificatesGrid, Certificate } from "./(components)/CertificatesGrid";
import { CertificateFormModal } from "./(components)/CertificateFormModal";

const INITIAL_CERTIFICATES: Certificate[] = [
  {
    id: "cert-1",
    title: "NISM Series VIII Equity Derivatives Certification",
    imageUrl:
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80",
    status: "Published",
    displayOrder: 1,
    createdAt: "15 Jan 2026",
  },
];

export default function CertificatesPage() {
  const [certificates, setCertificates] =
    useState<Certificate[]>(INITIAL_CERTIFICATES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCertificate, setEditingCertificate] =
    useState<Certificate | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  // GSAP Entrance Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (pageRef.current) {
        gsap.fromTo(
          pageRef.current.children,
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.1,
            ease: "power2.out",
          },
        );
      }
    }, pageRef);

    return () => ctx.revert();
  }, []);

  // Compute Metrics
  const totalCount = certificates.length;
  // const publishedCount = certificates.filter(
  //   (c) => c.status === "Published",
  // ).length;
  // const hiddenCount = certificates.filter((c) => c.status === "Hidden").length;

  // Handlers
  const handleOpenAddModal = () => {
    setEditingCertificate(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: Certificate) => {
    setEditingCertificate(item);
    setIsModalOpen(true);
  };

  const handleSaveCertificate = (savedItem: Certificate) => {
    if (editingCertificate) {
      setCertificates((prev) =>
        prev.map((c) => (c.id === savedItem.id ? savedItem : c)),
      );
      toast.success(`Certificate "${savedItem.title}" updated!`);
    } else {
      setCertificates((prev) => [savedItem, ...prev]);
      toast.success(`Certificate "${savedItem.title}" added!`);
    }
  };

  const handleToggleStatus = (certificateId: string) => {
    setCertificates((prev) =>
      prev.map((c) => {
        if (c.id === certificateId) {
          const newStatus = c.status === "Published" ? "Hidden" : "Published";
          toast.info(
            `Certificate "${c.title}" is now ${newStatus.toLowerCase()}.`,
          );
          return { ...c, status: newStatus };
        }
        return c;
      }),
    );
  };

  const handleDeleteCertificate = (certificateId: string) => {
    const itemToDelete = certificates.find((c) => c.id === certificateId);
    setCertificates((prev) => prev.filter((c) => c.id !== certificateId));
    toast.error(
      `Certificate "${itemToDelete?.title || "Certificate"}" deleted.`,
    );
  };

  return (
    <div
      ref={pageRef}
      aria-label="Certificates Management Page"
      className="w-full max-w-[1600px] mx-auto space-y-8 pb-12"
    >
      {/* 1. Header */}
      <CertificatesHeader
        totalCount={totalCount}
        onAddCertificate={handleOpenAddModal}
      />

      {/* 2. Overview KPI Cards (3 Cards) */}
      {/* <CertificatesOverviewCards
        totalCount={totalCount}
        publishedCount={publishedCount}
        hiddenCount={hiddenCount}
      /> */}

      {/* 3. Certificates Card Grid with Search & Filters */}
      <CertificatesGrid
        certificates={certificates}
        onEdit={handleOpenEditModal}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDeleteCertificate}
      />

      {/* 4. Add / Edit Certificate Modal with Live Preview */}
      <CertificateFormModal
        isOpen={isModalOpen}
        editingCertificate={editingCertificate}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCertificate(null);
        }}
        onSave={handleSaveCertificate}
      />
    </div>
  );
}

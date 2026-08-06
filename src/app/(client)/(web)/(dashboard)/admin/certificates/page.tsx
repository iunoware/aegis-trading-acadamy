/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import axios, { AxiosError } from "axios";
import { gsap } from "gsap";
import { toast } from "sonner";

import { CertificatesHeader } from "./(components)/CertificatesHeader";
import { Certificate, CertificatesGrid } from "./(components)/CertificatesGrid";
import {
  CertificateFormModal,
  CertificateFormValues,
} from "./(components)/CertificateFormModal";

interface ApiErrorResponse {
  message?: string;
}

function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message || fallbackMessage;
  }

  return fallbackMessage;
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);

  const pageRef = useRef<HTMLDivElement>(null);

  const fetchCertificates = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await axios.get<Certificate[]>("/api/certificates");

      setCertificates(response.data);
    } catch (error) {
      console.error("Failed to fetch certificates:", error);

      toast.error(getErrorMessage(error, "Failed to fetch certificates."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  useEffect(() => {
    const context = gsap.context(() => {
      if (!pageRef.current) return;

      gsap.fromTo(
        pageRef.current.children,
        {
          opacity: 0,
          y: 25,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.1,
          ease: "power2.out",
        },
      );
    }, pageRef);

    return () => context.revert();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCertificate(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (certificate: Certificate) => {
    setEditingCertificate(certificate);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSaving) return;

    setIsModalOpen(false);
    setEditingCertificate(null);
  };

  const handleSaveCertificate = async (values: CertificateFormValues) => {
    try {
      setIsSaving(true);

      const formData = new FormData();

      formData.append("title", values.title);
      formData.append("displayOrder", String(values.displayOrder));
      formData.append("status", values.status);

      if (values.image) {
        formData.append("image", values.image);
      }

      if (editingCertificate) {
        const response = await axios.patch<Certificate>(
          `/api/certificates/${editingCertificate.id}`,
          formData,
        );

        setCertificates((previousCertificates) =>
          previousCertificates.map((certificate) =>
            certificate.id === editingCertificate.id ? response.data : certificate,
          ),
        );

        toast.success(`Certificate "${response.data.title}" updated successfully.`);
      } else {
        const response = await axios.post<Certificate>("/api/certificates", formData);

        setCertificates((previousCertificates) => [
          response.data,
          ...previousCertificates,
        ]);

        toast.success(`Certificate "${response.data.title}" added successfully.`);
      }

      setIsModalOpen(false);
      setEditingCertificate(null);
    } catch (error) {
      console.error("Failed to save certificate:", error);

      toast.error(
        getErrorMessage(
          error,
          editingCertificate
            ? "Failed to update certificate."
            : "Failed to create certificate.",
        ),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (certificateId: string) => {
    const certificate = certificates.find((item) => item.id === certificateId);

    if (!certificate) return;

    const newStatus = certificate.status === "Published" ? "Hidden" : "Published";

    try {
      const formData = new FormData();

      formData.append("title", certificate.title);
      formData.append("displayOrder", String(certificate.displayOrder));
      formData.append("status", newStatus);

      const response = await axios.patch<Certificate>(
        `/api/certificates/${certificateId}`,
        formData,
      );

      setCertificates((previousCertificates) =>
        previousCertificates.map((item) =>
          item.id === certificateId ? response.data : item,
        ),
      );

      toast.success(`Certificate is now ${newStatus.toLowerCase()}.`);
    } catch (error) {
      console.error("Failed to update certificate status:", error);

      toast.error(getErrorMessage(error, "Failed to update certificate status."));
    }
  };

  const handleDeleteCertificate = async (certificateId: string) => {
    const certificate = certificates.find((item) => item.id === certificateId);

    if (!certificate) return;

    const shouldDelete = window.confirm(
      `Are you sure you want to permanently delete "${certificate.title}"?`,
    );

    if (!shouldDelete) return;

    try {
      await axios.delete(`/api/certificates/${certificateId}`);

      setCertificates((previousCertificates) =>
        previousCertificates.filter((item) => item.id !== certificateId),
      );

      toast.success(`Certificate "${certificate.title}" deleted permanently.`);
    } catch (error) {
      console.error("Failed to delete certificate:", error);

      toast.error(getErrorMessage(error, "Failed to delete certificate."));
    }
  };

  const sortedCertificates = [...certificates].sort(
    (firstCertificate, secondCertificate) =>
      firstCertificate.displayOrder - secondCertificate.displayOrder,
  );

  return (
    <div
      ref={pageRef}
      aria-label="Certificates Management Page"
      className="mx-auto w-full max-w-[1600px] space-y-8 pb-12"
    >
      <CertificatesHeader
        totalCount={certificates.length}
        onAddCertificate={handleOpenAddModal}
      />

      {isLoading ? (
        <div className="flex min-h-75 items-center justify-center rounded-2xl border border-white/10 bg-[#111113]/50">
          <div className="text-center">
            <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-white/20 border-t-[#C9A227]" />

            <p className="font-mono text-xs text-zinc-500">Loading certificates...</p>
          </div>
        </div>
      ) : (
        <CertificatesGrid
          certificates={sortedCertificates}
          onEdit={handleOpenEditModal}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDeleteCertificate}
        />
      )}

      <CertificateFormModal
        isOpen={isModalOpen}
        editingCertificate={editingCertificate}
        isSaving={isSaving}
        onClose={handleCloseModal}
        onSave={handleSaveCertificate}
      />
    </div>
  );
}

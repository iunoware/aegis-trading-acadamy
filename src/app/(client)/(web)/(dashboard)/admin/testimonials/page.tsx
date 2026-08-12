"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { toast } from "sonner";
import { TestimonialsHeader } from "./(components)/TestimonialsHeader";
import { TestimonialsOverviewCards } from "./(components)/TestimonialsOverviewCards";
import { TestimonialsGrid } from "./(components)/TestimonialsGrid";
import { TestimonialFormModal } from "./(components)/TestimonialFormModal";
import type { Testimonial } from "@/types/testimonial";

gsap.registerPlugin(useGSAP);

// const INITIAL_TESTIMONIALS: Testimonial[] = [
//   {
//     id: "testi-1",
//     customerName: "Aarav Sharma",
//     designation: "Full-Time Options Scalper",
//     company: "Equity Alpha Capital",
//     avatarUrl:
//       "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
//     rating: 5,
//     reviewText:
//       "Aegis Trading Academy completely transformed my risk management and order flow strategy. The mentorship and structure are unmatched in the Indian trading space!",
//     status: "Published",
//     displayOrder: 1,
//     createdAt: "15 Jan 2026",
//   },
//   {
//     id: "testi-2",
//     customerName: "Priya Patel",
//     designation: "Derivatives Trader",
//     company: "Vanguard Investments",
//     avatarUrl:
//       "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
//     rating: 5,
//     reviewText:
//       "The institutional order flow modules gave me clarity on market liquidity that no other platform ever explained properly. Highly recommended for serious traders.",
//     status: "Published",
//     displayOrder: 2,
//     createdAt: "10 Feb 2026",
//   },
//   {
//     id: "testi-3",
//     customerName: "Rohan Verma",
//     designation: "Swing Trader",
//     company: "Self-Employed",
//     avatarUrl:
//       "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
//     rating: 4,
//     reviewText:
//       "Fantastic breakdown of price action and delta scalping. The community Q&A sessions alone are worth every rupee.",
//     status: "Published",
//     displayOrder: 3,
//     createdAt: "05 Mar 2026",
//   },
//   {
//     id: "testi-4",
//     customerName: "Sneha Reddy",
//     designation: "NISM Certified Analyst",
//     company: "Reddy Financial Services",
//     avatarUrl:
//       "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
//     rating: 5,
//     reviewText:
//       "I passed my NISM Series VIII exam on the first attempt thanks to Aegis. The course layout and real market breakdown examples are top tier.",
//     status: "Published",
//     displayOrder: 4,
//     createdAt: "12 May 2026",
//   },
//   {
//     id: "testi-5",
//     customerName: "Vikram Malhotra",
//     designation: "Algo Developer",
//     company: "Quantitative Trading Systems",
//     avatarUrl:
//       "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
//     rating: 5,
//     reviewText:
//       "The risk management principles taught here prevented me from blowing up my capital during high-volatility event days. Indispensable education.",
//     status: "Published",
//     displayOrder: 5,
//     createdAt: "20 Jun 2026",
//   },
//   {
//     id: "testi-6",
//     customerName: "Ananya Iyer",
//     designation: "Part-Time Trader",
//     company: "Global Tech Solutions",
//     avatarUrl: "",
//     rating: 4,
//     reviewText:
//       "Clear, concise, and structured. Great curriculum for working professionals wanting to learn index option buying and selling.",
//     status: "Hidden",
//     displayOrder: 6,
//     createdAt: "25 Jul 2026",
//   },
// ];

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // fetching testimonials
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setIsLoading(true);

        const response = await axios.get<Testimonial[]>("/api/admin/testimonial");

        setTestimonials(response.data);
      } catch (error) {
        console.error("Failed to fetch testimonials:", error);
        toast.error("Failed to fetch testimonials");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // GSAP Entrance Animations
  useGSAP(
    () => {
      if (!pageRef.current) return;

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
    },
    { scope: pageRef },
  );

  // Compute Metrics
  const totalCount = testimonials.length;
  const publishedCount = testimonials.filter((t) => t.status === "Published").length;
  const hiddenCount = testimonials.filter((t) => t.status === "Hidden").length;

  // Handlers
  const handleOpenAddModal = () => {
    setEditingTestimonial(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: Testimonial) => {
    setEditingTestimonial(item);
    setIsModalOpen(true);
  };

  const handleSaveTestimonial = async (savedItem: Testimonial) => {
    try {
      if (editingTestimonial) {
        const response = await axios.patch<Testimonial>(
          `/api/admin/testimonial/${savedItem.id}`,
          savedItem,
        );

        setTestimonials((prev) =>
          prev.map((testimonial) =>
            testimonial.id === savedItem.id ? response.data : testimonial,
          ),
        );

        toast.success(`Testimonial from "${response.data.customerName}" updated!`);
      } else {
        const response = await axios.post<Testimonial>(
          "/api/admin/testimonial",
          savedItem,
        );

        setTestimonials((prev) => [response.data, ...prev]);

        toast.success(`Testimonial from "${response.data.customerName}" created!`);
      }
    } catch (error) {
      console.error("Failed to save testimonial:", error);
      toast.error("Failed to save testimonial");
    }
  };

  const handleToggleStatus = async (testimonialId: string) => {
    const testimonial = testimonials.find((item) => item.id === testimonialId);

    if (!testimonial) return;

    const newStatus = testimonial.status === "Published" ? "Hidden" : "Published";

    try {
      const response = await axios.patch<Testimonial>(
        `/api/admin/testimonial/${testimonialId}`,
        {
          status: newStatus,
        },
      );

      setTestimonials((prev) =>
        prev.map((item) => (item.id === testimonialId ? response.data : item)),
      );

      toast.success(
        `Testimonial from "${testimonial.customerName}" is now ${newStatus.toLowerCase()}.`,
      );
    } catch (error) {
      console.error("Failed to update testimonial status:", error);

      toast.error("Failed to update testimonial status");
    }
  };

  const handleDeleteTestimonial = (testimonialId: string) => {
    setDeleteId(testimonialId);
  };

  const confirmDeleteTestimonial = async () => {
    if (!deleteId) return;

    try {
      setIsDeleting(true);

      await axios.delete(`/api/admin/testimonial/${deleteId}`);

      setTestimonials((prev) =>
        prev.filter((testimonial) => testimonial.id !== deleteId),
      );

      toast.success("Testimonial deleted successfully");

      setDeleteId(null);
    } catch (error) {
      console.error("Failed to delete testimonial:", error);
      toast.error("Failed to delete testimonial");
    } finally {
      setIsDeleting(false);
    }
  };

  const testimonialToDelete = testimonials.find(
    (testimonial) => testimonial.id === deleteId,
  );

  return (
    <div
      ref={pageRef}
      aria-label="Testimonials Management Page"
      className="w-full max-w-[1600px] mx-auto space-y-8 pb-12"
    >
      {/* 1. Header */}
      <TestimonialsHeader totalCount={totalCount} onAddTestimonial={handleOpenAddModal} />

      {/* 2. Overview KPI Cards (3 Cards) */}
      <TestimonialsOverviewCards
        totalCount={totalCount}
        publishedCount={publishedCount}
        hiddenCount={hiddenCount}
      />

      {/* 3. Testimonials Card Grid with Search & Filters */}
      {isLoading ? (
        <div className="rounded-2xl border border-white/10 bg-[#111113] p-10 text-center text-sm text-zinc-400">
          Loading testimonials...
        </div>
      ) : (
        <TestimonialsGrid
          testimonials={testimonials}
          onEdit={handleOpenEditModal}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDeleteTestimonial}
        />
      )}

      {/* 4. Add / Edit Testimonial Modal with Live Preview */}
      <TestimonialFormModal
        isOpen={isModalOpen}
        editingTestimonial={editingTestimonial}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTestimonial(null);
        }}
        onSave={handleSaveTestimonial}
      />

      {deleteId && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close delete confirmation"
            onClick={() => {
              if (!isDeleting) {
                setDeleteId(null);
              }
            }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-[#111113] p-6 shadow-2xl">
            <div className="mb-5">
              <h3 className="text-lg font-bold text-white">Delete Testimonial?</h3>

              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                Are you sure you want to delete the testimonial from{" "}
                <span className="font-semibold text-white">
                  {testimonialToDelete?.customerName || "this customer"}
                </span>
                ?
              </p>

              <p className="mt-2 text-xs text-rose-400">
                This testimonial will be removed from the website.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteId(null)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-zinc-300 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteTestimonial}
                className="rounded-xl border border-rose-500/30 bg-rose-500/15 px-4 py-2.5 text-xs font-bold text-rose-400 transition-colors hover:bg-rose-500/25 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Testimonial"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

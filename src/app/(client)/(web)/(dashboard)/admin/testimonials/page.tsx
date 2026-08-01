"use client";

import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { toast } from "sonner";
import { TestimonialsHeader } from "./(components)/TestimonialsHeader";
import { TestimonialsOverviewCards } from "./(components)/TestimonialsOverviewCards";
import { TestimonialsGrid, Testimonial } from "./(components)/TestimonialsGrid";
import { TestimonialFormModal } from "./(components)/TestimonialFormModal";

const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: "testi-1",
    customerName: "Aarav Sharma",
    designation: "Full-Time Options Scalper",
    company: "Equity Alpha Capital",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    reviewText: "Aegis Trading Academy completely transformed my risk management and order flow strategy. The mentorship and structure are unmatched in the Indian trading space!",
    status: "Published",
    displayOrder: 1,
    createdAt: "15 Jan 2026",
  },
  {
    id: "testi-2",
    customerName: "Priya Patel",
    designation: "Derivatives Trader",
    company: "Vanguard Investments",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    reviewText: "The institutional order flow modules gave me clarity on market liquidity that no other platform ever explained properly. Highly recommended for serious traders.",
    status: "Published",
    displayOrder: 2,
    createdAt: "10 Feb 2026",
  },
  {
    id: "testi-3",
    customerName: "Rohan Verma",
    designation: "Swing Trader",
    company: "Self-Employed",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    rating: 4,
    reviewText: "Fantastic breakdown of price action and delta scalping. The community Q&A sessions alone are worth every rupee.",
    status: "Published",
    displayOrder: 3,
    createdAt: "05 Mar 2026",
  },
  {
    id: "testi-4",
    customerName: "Sneha Reddy",
    designation: "NISM Certified Analyst",
    company: "Reddy Financial Services",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    reviewText: "I passed my NISM Series VIII exam on the first attempt thanks to Aegis. The course layout and real market breakdown examples are top tier.",
    status: "Published",
    displayOrder: 4,
    createdAt: "12 May 2026",
  },
  {
    id: "testi-5",
    customerName: "Vikram Malhotra",
    designation: "Algo Developer",
    company: "Quantitative Trading Systems",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    reviewText: "The risk management principles taught here prevented me from blowing up my capital during high-volatility event days. Indispensable education.",
    status: "Published",
    displayOrder: 5,
    createdAt: "20 Jun 2026",
  },
  {
    id: "testi-6",
    customerName: "Ananya Iyer",
    designation: "Part-Time Trader",
    company: "Global Tech Solutions",
    avatarUrl: "",
    rating: 4,
    reviewText: "Clear, concise, and structured. Great curriculum for working professionals wanting to learn index option buying and selling.",
    status: "Hidden",
    displayOrder: 6,
    createdAt: "25 Jul 2026",
  },
];

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(INITIAL_TESTIMONIALS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
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
          }
        );
      }
    }, pageRef);

    return () => ctx.revert();
  }, []);

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

  const handleSaveTestimonial = (savedItem: Testimonial) => {
    if (editingTestimonial) {
      setTestimonials((prev) =>
        prev.map((t) => (t.id === savedItem.id ? savedItem : t))
      );
      toast.success(`Testimonial from "${savedItem.customerName}" updated!`);
    } else {
      setTestimonials((prev) => [savedItem, ...prev]);
      toast.success(`Testimonial from "${savedItem.customerName}" created!`);
    }
  };

  const handleToggleStatus = (testimonialId: string) => {
    setTestimonials((prev) =>
      prev.map((t) => {
        if (t.id === testimonialId) {
          const newStatus = t.status === "Published" ? "Hidden" : "Published";
          toast.info(
            `Testimonial from "${t.customerName}" is now ${newStatus.toLowerCase()}.`
          );
          return { ...t, status: newStatus };
        }
        return t;
      })
    );
  };

  const handleDeleteTestimonial = (testimonialId: string) => {
    const itemToDelete = testimonials.find((t) => t.id === testimonialId);
    setTestimonials((prev) => prev.filter((t) => t.id !== testimonialId));
    toast.error(`Testimonial from "${itemToDelete?.customerName || "Customer"}" deleted.`);
  };

  return (
    <div
      ref={pageRef}
      aria-label="Testimonials Management Page"
      className="w-full max-w-[1600px] mx-auto space-y-8 pb-12"
    >
      {/* 1. Header */}
      <TestimonialsHeader
        totalCount={totalCount}
        onAddTestimonial={handleOpenAddModal}
      />

      {/* 2. Overview KPI Cards (3 Cards) */}
      <TestimonialsOverviewCards
        totalCount={totalCount}
        publishedCount={publishedCount}
        hiddenCount={hiddenCount}
      />

      {/* 3. Testimonials Card Grid with Search & Filters */}
      <TestimonialsGrid
        testimonials={testimonials}
        onEdit={handleOpenEditModal}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDeleteTestimonial}
      />

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
    </div>
  );
}

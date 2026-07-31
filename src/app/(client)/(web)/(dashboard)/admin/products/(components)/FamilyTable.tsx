"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Eye,
  Edit2,
  Trash2,
  ArrowUpDown,
  HelpCircle,
  Save,
  X,
  ImageIcon,
} from "lucide-react";
import { useProducts, FamilyState } from "./ProductsContext";
import ConfirmDialog from "./ConfirmDialog";
import FamilyModal from "./FamilyModal";

interface FamilyTableProps {
  categoryId: string;
  onSelectFamily: (id: string) => void;
}

export default function FamilyTable({
  categoryId,
  onSelectFamily,
}: FamilyTableProps) {
  const { categories, families, products, deleteFamily } = useProducts();

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, active, draft
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, name-asc, name-desc

  // Modal / dialog states
  const [viewingFamily, setViewingFamily] = useState<FamilyState | null>(null);
  const [editingFamId, setEditingFamId] = useState<string | null>(null);
  const [deletingFam, setDeletingFam] = useState<FamilyState | null>(null);

  // Filter & Sort families belonging ONLY to this Category
  const processedFamilies = useMemo(() => {
    return families
      .filter((fam) => fam.categoryId === categoryId)
      .map((fam) => {
        const famProducts = products.filter((p) => p.familyId === fam.id);
        return {
          ...fam,
          productsCount: famProducts.length,
        };
      })
      .filter((fam) => {
        const matchesSearch =
          fam.name.toLowerCase().includes(search.toLowerCase()) ||
          fam.shortDescription.toLowerCase().includes(search.toLowerCase());

        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" && fam.active) ||
          (statusFilter === "draft" && !fam.active);

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "name-asc") return a.name.localeCompare(b.name);
        if (sortBy === "name-desc") return b.name.localeCompare(a.name);
        if (sortBy === "oldest")
          return (
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          );
        // default newest
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      });
  }, [families, products, categoryId, search, statusFilter, sortBy]);

  const handleDeleteConfirm = () => {
    if (deletingFam) {
      deleteFamily(deletingFam.id);
      setDeletingFam(null);
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/40 p-4.5 rounded-2xl shadow-xs">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search families..."
            className="w-full text-xs pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-850 border border-gray-100 dark:border-zinc-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#e31b23]/25 focus:border-[#e31b23] text-gray-900 dark:text-gray-100 transition-all font-semibold"
          />
        </div>

        {/* Filters & Sort */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-850 px-3.5 py-1.5 rounded-xl border border-gray-100 dark:border-zinc-800">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400 dark:text-gray-500">
              Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-0 text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-hidden focus:ring-0 cursor-pointer p-0"
            >
              <option value="all">All Status</option>
              <option value="active">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-850 px-3.5 py-1.5 rounded-xl border border-gray-100 dark:border-zinc-800">
            <ArrowUpDown size={12} className="text-gray-400" />
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400 dark:text-gray-500">
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-0 text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-hidden focus:ring-0 cursor-pointer p-0"
            >
              <option value="newest">Newest Updated</option>
              <option value="oldest">Oldest Updated</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table / Card Container */}
      {processedFamilies.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800/80 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[300px] shadow-xs">
          <HelpCircle
            className="text-gray-300 dark:text-zinc-700 mb-3"
            size={36}
          />
          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">
            No Families Created
          </h4>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-sm">
            {search || statusFilter !== "all"
              ? "Try adjusting your filters or search query to find product families."
              : "Click '+ New Family' at the top right to create a new product series under this category."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop/Tablet Table Layout */}
          <div className="hidden md:block w-full bg-white dark:bg-zinc-900 border border-gray-100/60 dark:border-zinc-800/40 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/40">
                    <th className="p-4.5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider w-20">
                      Thumbnail
                    </th>
                    <th className="p-4.5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Family Name
                    </th>
                    <th className="p-4.5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-center w-28">
                      Products Count
                    </th>
                    <th className="p-4.5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider w-24">
                      Status
                    </th>
                    <th className="p-4.5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider w-32">
                      Updated
                    </th>
                    <th className="p-4.5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-right w-32">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/60">
                  {processedFamilies.map((fam) => (
                    <tr
                      key={fam.id}
                      onClick={() => onSelectFamily(fam.id)}
                      className="cursor-pointer hover:bg-gray-50/30 dark:hover:bg-zinc-800/10 transition-colors group/row"
                    >
                      <td className="p-4.5">
                        <div className="relative w-12 h-12 rounded-xl border border-gray-100 dark:border-zinc-800 overflow-hidden bg-gray-50 dark:bg-zinc-800/60 flex items-center justify-center shrink-0">
                          {fam.thumbnail ? (
                            <img
                              src={fam.thumbnail}
                              alt={fam.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon size={20} className="text-gray-300" />
                          )}
                        </div>
                      </td>
                      <td className="p-4.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-gray-900 dark:text-gray-100 group-hover/row:text-[#e31b23] transition-colors">
                            {fam.name}
                          </span>
                          {fam.featured && (
                            <span className="inline-flex self-start text-[8px] bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 px-1 rounded-sm font-bold uppercase tracking-wider border border-amber-100/50 dark:border-amber-900/30 mt-0.5">
                              Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4.5 text-center">
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-zinc-800">
                          {fam.productsCount}
                        </span>
                      </td>
                      <td className="p-4.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold ${
                            fam.active
                              ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/30"
                              : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 border border-gray-200/50 dark:border-zinc-700/50"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${fam.active ? "bg-emerald-500" : "bg-gray-400"}`}
                          />
                          {fam.active ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="p-4.5">
                        <span className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold">
                          {new Date(fam.updatedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </td>
                      <td className="p-4.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingFamily(fam);
                            }}
                            className="p-1.5 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg text-gray-400 dark:text-gray-500 transition-all cursor-pointer"
                            title="View Details"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingFamId(fam.id);
                            }}
                            className="p-1.5 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-lg text-gray-400 dark:text-gray-500 transition-all cursor-pointer"
                            title="Edit Family"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingFam(fam);
                            }}
                            className="p-1.5 hover:text-[#e31b23] dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-gray-400 dark:text-gray-500 transition-all cursor-pointer"
                            title="Delete Family"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
            {processedFamilies.map((fam) => (
              <div
                key={fam.id}
                onClick={() => onSelectFamily(fam.id)}
                className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/60 rounded-2xl p-4.5 flex flex-col gap-3 shadow-xs hover:shadow-md hover:border-[#e31b23]/30 dark:hover:border-[#e31b23]/30 transition-all cursor-pointer select-none group"
              >
                <div className="flex gap-3.5 items-center">
                  <div className="relative w-12 h-12 rounded-xl border border-gray-100 dark:border-zinc-800 overflow-hidden bg-gray-50 dark:bg-zinc-800/60 flex items-center justify-center shrink-0">
                    {fam.thumbnail ? (
                      <img
                        src={fam.thumbnail}
                        alt={fam.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon size={20} className="text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 group-hover:text-[#e31b23] transition-colors truncate">
                      {fam.name}
                    </h4>
                    <span className="text-[9px] text-gray-400 font-semibold block mt-0.5">
                      Updated{" "}
                      {new Date(fam.updatedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed font-medium">
                  {fam.shortDescription || "No description provided."}
                </p>

                <div className="flex items-center justify-between border-t border-gray-50 dark:border-zinc-850/50 pt-3 mt-1">
                  <span className="text-[9px] font-extrabold bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-zinc-800 px-2.5 py-0.5 rounded-md">
                    {fam.productsCount} Products
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold ${
                      fam.active
                        ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/30"
                        : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 border border-gray-200/50 dark:border-zinc-700/50"
                    }`}
                  >
                    {fam.active ? "Published" : "Draft"}
                  </span>
                </div>

                {/* Mobile Actions */}
                <div className="flex items-center justify-end gap-1.5 border-t border-gray-50 dark:border-zinc-850/50 pt-2.5 mt-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewingFamily(fam);
                    }}
                    className="p-1.5 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg text-gray-400 dark:text-gray-500 transition-all cursor-pointer"
                    title="View Details"
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingFamId(fam.id);
                    }}
                    className="p-1.5 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-lg text-gray-400 dark:text-gray-500 transition-all cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingFam(fam);
                    }}
                    className="p-1.5 hover:text-[#e31b23] dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-gray-400 dark:text-gray-500 transition-all cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Family Edit Modal */}
      <FamilyModal
        isOpen={editingFamId !== null}
        onClose={() => setEditingFamId(null)}
        editId={editingFamId}
        prefilledCategoryId={categoryId}
      />

      {/* Family Deletion Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deletingFam !== null}
        onClose={() => setDeletingFam(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Family?"
        message={`Are you sure you want to delete the family "${deletingFam?.name}"? WARNING: This will also delete all product variants belonging to this family. This action cannot be undone.`}
        confirmText="Yes, Delete Family"
        isDestructive={true}
      />

      {/* View Family Details Modal (Drawer style) */}
      {viewingFamily && (
        <div className="fixed inset-0 z-9999 flex items-center justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setViewingFamily(null)}
          />

          {/* Slide-over Content */}
          <div className="relative w-full max-w-md h-full bg-white dark:bg-zinc-900 border-l border-gray-150 dark:border-zinc-800 shadow-2xl p-6.5 overflow-y-auto flex flex-col gap-6 animate-[slideInRight_0.25s_ease-out]">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-4">
              <h3 className="text-base font-extrabold text-gray-900 dark:text-gray-100">
                Family Details
              </h3>
              <button
                onClick={() => setViewingFamily(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col items-center gap-4 text-center mt-2">
              <div className="w-28 h-28 border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 rounded-2xl overflow-hidden shadow-xs">
                <img
                  src={viewingFamily.thumbnail}
                  alt={viewingFamily.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="text-lg font-extrabold text-gray-900 dark:text-gray-100">
                  {viewingFamily.name}
                </h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                  Slug: {viewingFamily.slug}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t border-b border-gray-100 dark:border-zinc-800 py-4 mt-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-gray-500">Parent Category:</span>
                <span className="text-gray-900 dark:text-gray-100 font-bold">
                  {categories.find((c) => c.id === viewingFamily.categoryId)
                    ?.name || "Unknown"}
                </span>
              </div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-gray-500">Publish Status:</span>
                <span
                  className={
                    viewingFamily.active
                      ? "text-emerald-600 font-bold"
                      : "text-gray-500 font-bold"
                  }
                >
                  {viewingFamily.active ? "Published" : "Draft"}
                </span>
              </div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-gray-500">Homepage Promo:</span>
                <span
                  className={
                    viewingFamily.featured
                      ? "text-amber-600 font-bold"
                      : "text-gray-500 font-bold"
                  }
                >
                  {viewingFamily.featured ? "Featured" : "Standard"}
                </span>
              </div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-gray-500">Products (Variants):</span>
                <span className="text-gray-900 dark:text-gray-100 font-bold">
                  {
                    products.filter((p) => p.familyId === viewingFamily.id)
                      .length
                  }{" "}
                  variants
                </span>
              </div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-gray-500">Last Updated:</span>
                <span className="text-gray-600 dark:text-gray-300 font-medium">
                  {new Date(viewingFamily.updatedAt).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Description / Specifications
              </span>
              <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-zinc-850/40 p-3 rounded-xl border border-gray-100 dark:border-zinc-800/30 font-medium">
                {viewingFamily.shortDescription || "No description provided."}
              </p>
            </div>

            <button
              onClick={() => {
                setEditingFamId(viewingFamily.id);
                setViewingFamily(null);
              }}
              className="mt-auto flex items-center justify-center gap-2 w-full py-3 text-xs font-bold text-white bg-[#e31b23] hover:bg-[#ff2d35] rounded-xl transition-all shadow-xs"
            >
              <Edit2 size={13} />
              <span>Edit Family</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useMemo } from "react";
import { Search, Eye, Edit2, Copy, Trash2, ArrowUpDown, HelpCircle, Check, X, Star, ImageIcon } from "lucide-react";
import { useProducts, ProductState } from "./ProductsContext";
import ConfirmDialog from "./ConfirmDialog";

interface ProductTableProps {
  familyId: string;
  onEditProduct: (id: string) => void;
}

export default function ProductTable({ familyId, onEditProduct }: ProductTableProps) {
  const { families, products, deleteProduct, duplicateProduct, updateProduct } = useProducts();

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, active, draft
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, name-asc, name-desc

  // Bulk Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Dialog state
  const [deletingProd, setDeletingProd] = useState<ProductState | null>(null);

  // Resolve familySlug and filter/sort products belonging ONLY to this Family
  const processedProducts = useMemo(() => {
    return products
      .filter((prod) => prod.familyId === familyId)
      .map((prod) => {
        const family = families.find((f) => f.id === prod.familyId);
        return {
          ...prod,
          familySlug: family ? family.slug : "",
        };
      })
      .filter((prod) => {
        const matchesSearch =
          prod.name.toLowerCase().includes(search.toLowerCase()) ||
          prod.shortDescription.toLowerCase().includes(search.toLowerCase());

        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" && prod.active) ||
          (statusFilter === "draft" && !prod.active);

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "name-asc") return a.name.localeCompare(b.name);
        if (sortBy === "name-desc") return b.name.localeCompare(a.name);
        if (sortBy === "oldest") return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        // default newest
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [products, families, familyId, search, statusFilter, sortBy]);

  // Handle master checkbox
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(processedProducts.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Handle single checkbox
  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  // Bulk actions
  const handleBulkPublish = (publish: boolean) => {
    selectedIds.forEach((id) => updateProduct(id, { active: publish }));
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.length} selected products?`)) {
      selectedIds.forEach((id) => deleteProduct(id));
      setSelectedIds([]);
    }
  };

  const handleDeleteConfirm = () => {
    if (deletingProd) {
      deleteProduct(deletingProd.id);
      setSelectedIds((prev) => prev.filter((id) => id !== deletingProd.id));
      setDeletingProd(null);
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/40 p-4.5 rounded-2xl shadow-xs">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full text-xs pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-850 border border-gray-100 dark:border-zinc-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#e31b23]/25 focus:border-[#e31b23] text-gray-900 dark:text-gray-100 transition-all font-semibold"
          />
        </div>

        {/* Filters & Sort */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-850 px-3.5 py-1.5 rounded-xl border border-gray-100 dark:border-zinc-800">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400 dark:text-gray-500">Status:</span>
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
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400 dark:text-gray-500">Sort:</span>
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
      {processedProducts.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800/80 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[300px] shadow-xs">
          <HelpCircle className="text-gray-300 dark:text-zinc-700 mb-3" size={36} />
          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">No Products Found</h4>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-sm">
            {search || statusFilter !== "all"
              ? "Try adjusting your filters or search query to find products."
              : "Click '+ Add Product' at the top right to start showcase content creation under this series."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop/Tablet Table Layout */}
          <div className="hidden md:block w-full bg-white dark:bg-zinc-900 border border-gray-100/60 dark:border-zinc-800/40 rounded-2xl overflow-hidden shadow-xs relative">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/40">
                    <th className="p-4.5 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === processedProducts.length && processedProducts.length > 0}
                        onChange={handleSelectAll}
                        className="accent-[#e31b23] h-4.5 w-4.5 cursor-pointer rounded-sm"
                      />
                    </th>
                    <th className="p-4.5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider w-20">Thumbnail</th>
                    <th className="p-4.5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Product Name</th>
                    <th className="p-4.5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider w-24">Status</th>
                    <th className="p-4.5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider w-24 text-center">Featured</th>
                    <th className="p-4.5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider w-32">Updated</th>
                    <th className="p-4.5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-right w-36">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/60">
                  {processedProducts.map((prod) => (
                    <tr
                      key={prod.id}
                      className={`hover:bg-gray-50/30 dark:hover:bg-zinc-800/10 transition-colors ${
                        selectedIds.includes(prod.id) ? "bg-red-50/10 dark:bg-[#e31b23]/5" : ""
                      }`}
                    >
                      <td className="p-4.5 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(prod.id)}
                          onChange={(e) => handleSelectOne(prod.id, e.target.checked)}
                          className="accent-[#e31b23] h-4.5 w-4.5 cursor-pointer rounded-sm"
                        />
                      </td>
                      <td className="p-4.5">
                        <div className="relative w-12 h-12 rounded-xl border border-gray-100 dark:border-zinc-800 overflow-hidden bg-gray-50 dark:bg-zinc-800/60 flex items-center justify-center shrink-0">
                          {prod.thumbnail ? (
                            <img src={prod.thumbnail} alt={prod.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon size={20} className="text-gray-300" />
                          )}
                        </div>
                      </td>
                      <td className="p-4.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-gray-900 dark:text-gray-100 hover:text-[#e31b23] cursor-pointer" onClick={() => onEditProduct(prod.id)}>
                            {prod.name}
                          </span>
                          <span className="text-[10px] text-gray-400 font-semibold truncate max-w-[200px]">
                            /{prod.slug}
                          </span>
                        </div>
                      </td>
                      <td className="p-4.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold ${
                            prod.active
                              ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/30"
                              : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 border border-gray-200/50 dark:border-zinc-700/50"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${prod.active ? "bg-emerald-500" : "bg-gray-400"}`} />
                          {prod.active ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="p-4.5 text-center">
                        <button
                          onClick={() => updateProduct(prod.id, { featured: !prod.featured })}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center ${
                            prod.featured
                              ? "text-amber-500 hover:text-amber-600 bg-amber-50 dark:bg-amber-950/20 border border-amber-100/50 dark:border-amber-900/30"
                              : "text-gray-300 dark:text-gray-700 hover:text-gray-400"
                          }`}
                          title={prod.featured ? "Featured Product" : "Mark as Featured"}
                        >
                          <Star size={15} className={prod.featured ? "fill-amber-500" : ""} />
                        </button>
                      </td>
                      <td className="p-4.5">
                        <span className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold">
                          {new Date(prod.updatedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </td>
                      <td className="p-4.5">
                        <div className="flex items-center justify-end gap-1">
                          {prod.familySlug && prod.slug && (
                            <a
                              href={`/products/${prod.familySlug}/${prod.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg text-gray-400 dark:text-gray-500 transition-all"
                              title="Preview Showcase"
                            >
                              <Eye size={15} />
                            </a>
                          )}
                          <button
                            onClick={() => onEditProduct(prod.id)}
                            className="p-1.5 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-lg text-gray-400 dark:text-gray-500 transition-all cursor-pointer"
                            title="Edit Product Content"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => duplicateProduct(prod.id)}
                            className="p-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-lg text-gray-400 dark:text-gray-500 transition-all cursor-pointer"
                            title="Duplicate Variant"
                          >
                            <Copy size={15} />
                          </button>
                          <button
                            onClick={() => setDeletingProd(prod)}
                            className="p-1.5 hover:text-[#e31b23] dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-gray-400 dark:text-gray-500 transition-all cursor-pointer"
                            title="Delete Product"
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
            {processedProducts.map((prod) => (
              <div
                key={prod.id}
                className={`bg-white dark:bg-zinc-900 border rounded-2xl p-4.5 flex flex-col gap-3 shadow-xs hover:shadow-md transition-all ${
                  selectedIds.includes(prod.id)
                    ? "border-[#e31b23]/40 bg-red-50/5 dark:bg-[#e31b23]/5"
                    : "border-gray-100 dark:border-zinc-800/60"
                }`}
              >
                <div className="flex gap-3.5 items-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(prod.id)}
                    onChange={(e) => handleSelectOne(prod.id, e.target.checked)}
                    className="accent-[#e31b23] h-4.5 w-4.5 cursor-pointer rounded-sm"
                  />
                  <div className="relative w-12 h-12 rounded-xl border border-gray-100 dark:border-zinc-800 overflow-hidden bg-gray-50 dark:bg-zinc-800/60 flex items-center justify-center shrink-0">
                    {prod.thumbnail ? (
                      <img src={prod.thumbnail} alt={prod.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon size={20} className="text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 hover:text-[#e31b23] transition-colors truncate" onClick={() => onEditProduct(prod.id)}>
                      {prod.name}
                    </h4>
                    <span className="text-[9px] text-gray-400 font-semibold block mt-0.5">
                      Updated {new Date(prod.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed font-medium">
                  {prod.shortDescription || "No description provided."}
                </p>

                <div className="flex items-center justify-between border-t border-gray-50 dark:border-zinc-850/50 pt-3 mt-1">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold ${
                      prod.active
                        ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/30"
                        : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 border border-gray-200/50 dark:border-zinc-700/50"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${prod.active ? "bg-emerald-500" : "bg-gray-400"}`} />
                    {prod.active ? "Published" : "Draft"}
                  </span>

                  <button
                    onClick={() => updateProduct(prod.id, { featured: !prod.featured })}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center ${
                      prod.featured
                        ? "text-amber-500 hover:text-amber-600 bg-amber-50 dark:bg-amber-950/20 border border-amber-100/50 dark:border-amber-900/30"
                        : "text-gray-300 dark:text-gray-700 hover:text-gray-400"
                    }`}
                    title={prod.featured ? "Featured Product" : "Mark as Featured"}
                  >
                    <Star size={14} className={prod.featured ? "fill-amber-500" : ""} />
                  </button>
                </div>

                {/* Mobile Actions */}
                <div className="flex items-center justify-end gap-1 border-t border-gray-50 dark:border-zinc-850/50 pt-2.5 mt-0.5">
                  {prod.familySlug && prod.slug && (
                    <a
                      href={`/products/${prod.familySlug}/${prod.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg text-gray-400 dark:text-gray-500 transition-all"
                      title="Preview"
                    >
                      <Eye size={14} />
                    </a>
                  )}
                  <button
                    onClick={() => onEditProduct(prod.id)}
                    className="p-1.5 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-lg text-gray-400 dark:text-gray-500 transition-all cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => duplicateProduct(prod.id)}
                    className="p-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-lg text-gray-400 dark:text-gray-500 transition-all cursor-pointer"
                    title="Duplicate"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={() => setDeletingProd(prod)}
                    className="p-1.5 hover:text-[#e31b23] dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-gray-400 dark:text-gray-500 transition-all cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Floating Bulk Actions Bar */}
          {selectedIds.length > 0 && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-5 z-9990 border border-gray-800 dark:border-gray-100 animate-[fadeInUp_0.25s_ease-out]">
              <div className="flex items-center gap-2 border-r border-gray-700 dark:border-gray-200 pr-5">
                <span className="inline-flex items-center justify-center bg-[#e31b23] text-white w-5 h-5 rounded-full text-[10px] font-black">
                  {selectedIds.length}
                </span>
                <span className="text-xs font-bold">Selected</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkPublish(true)}
                  className="px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white dark:bg-emerald-100 dark:hover:bg-emerald-200 dark:text-emerald-800 rounded-lg transition-colors cursor-pointer"
                >
                  Publish
                </button>
                <button
                  onClick={() => handleBulkPublish(false)}
                  className="px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider bg-gray-700 hover:bg-gray-600 text-white dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-800 rounded-lg transition-colors cursor-pointer"
                >
                  Draft
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider bg-red-700 hover:bg-red-600 text-white dark:bg-red-50 dark:hover:bg-red-100 dark:text-[#e31b23] rounded-lg transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>

              <button
                onClick={() => setSelectedIds([])}
                className="text-gray-400 hover:text-white dark:text-gray-500 dark:hover:text-gray-900 transition-colors p-1"
                aria-label="Clear selection"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Single deletion dialog confirmation */}
      <ConfirmDialog
        isOpen={deletingProd !== null}
        onClose={() => setDeletingProd(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Product?"
        message={`Are you sure you want to delete the product showcase item "${deletingProd?.name}"? This action cannot be undone.`}
        confirmText="Yes, Delete Product"
        isDestructive={true}
      />
    </div>
  );
}

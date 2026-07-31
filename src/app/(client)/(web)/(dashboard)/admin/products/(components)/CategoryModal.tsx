"use client";

import React, { useEffect, useState } from "react";
import { X, Save, Image as ImageIcon, Upload } from "lucide-react";
import { useProducts, CategoryState } from "./ProductsContext";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  editId?: string | null;
  onSaveCallback?: (createdCategory: CategoryState) => void;
}

export default function CategoryModal({
  isOpen,
  onClose,
  editId,
  onSaveCallback,
}: CategoryModalProps) {
  const { categories, addCategory, updateCategory } = useProducts();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("/images/security-cabin.png");
  const [active, setActive] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [badge, setBadge] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // If editId is provided, fill form with existing category data
  useEffect(() => {
    if (isOpen) {
      if (editId) {
        const cat = categories.find((c) => c.id === editId);
        if (cat) {
          setName(cat.name);
          setDescription(cat.description);
          setImage(cat.image);
          setActive(cat.active);
          setFeatured(cat.featured || false);
          setBadge(cat.badge || "");
        }
      } else {
        setName("");
        setDescription("");
        setImage("/images/security-cabin.png");
        setActive(true);
        setFeatured(false);
        setBadge("");
      }
    }
  }, [isOpen, editId, categories]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSaving) return;

    setIsSaving(true);
    try {
      if (editId) {
        await updateCategory(editId, {
          name,
          description,
          image,
          active,
          featured,
          badge: badge.trim() || "",
        });
        onClose();
      } else {
        const created = await addCategory({
          name,
          slug: "", // generated in context
          description,
          image,
          active,
          featured,
          badge: badge.trim() || "",
        });
        if (onSaveCallback) {
          onSaveCallback(created);
        }
        onClose();
      }
    } catch (err) {
      // Caught inside context action (errors show Sonner toast), so just catch here to allow corrections
      console.error("Failed to save category in modal:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-xs transition-opacity duration-300 animate-[fadeIn_0.2s_ease-out]"
        onClick={isSaving ? undefined : onClose}
      />

      {/* Modal Box */}
      <div
        className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/40 rounded-2xl shadow-xl overflow-hidden z-10 animate-[scaleUp_0.25s_cubic-bezier(0.16,1,0.3,1)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-gray-100/50 dark:border-zinc-800/30">
          <h3
            id="category-modal-title"
            className="text-base font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2"
          >
            <ImageIcon size={18} className="text-[#e31b23]" />
            {editId ? "Edit Category" : "New Category"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-40"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Category Name *
            </label>
            <input
              required
              disabled={isSaving}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Office Cabins"
              className="w-full text-sm px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-850 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#e31b23]/25 focus:border-[#e31b23] text-gray-900 dark:text-gray-100 transition-all font-medium disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Thumbnail Upload
            </label>
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-xl border border-gray-150 dark:border-zinc-800 overflow-hidden bg-gray-50 dark:bg-zinc-800/40 shrink-0 flex items-center justify-center">
                {image ? (
                  <img
                    src={image}
                    alt="Category Thumbnail"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon size={24} className="text-gray-300" />
                )}
              </div>
              <label className={`flex-1 border border-dashed border-gray-250 dark:border-zinc-800 rounded-xl p-3.5 flex flex-col items-center justify-center hover:border-[#e31b23] dark:hover:border-[#e31b23] transition-colors bg-gray-50 dark:bg-zinc-800/20 group ${isSaving ? "opacity-50 pointer-events-none" : "cursor-pointer"}`}>
                <Upload size={16} className="text-gray-400 group-hover:text-[#e31b23] mb-1" />
                <span className="text-[11px] text-gray-500 font-semibold group-hover:text-[#e31b23] transition-colors">
                  Upload file (PNG/JPG)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={isSaving}
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Short Description
            </label>
            <textarea
              rows={3}
              disabled={isSaving}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a brief description of the category..."
              className="w-full text-sm px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-850 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#e31b23]/25 focus:border-[#e31b23] text-gray-900 dark:text-gray-100 transition-all resize-none font-medium disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Publish Status
            </label>
            <div className="flex gap-4">
              <label className={`flex-1 flex items-center justify-between p-3.5 rounded-xl border border-gray-100 dark:border-zinc-855 bg-gray-50 dark:bg-zinc-800/20 select-none ${isSaving ? "opacity-50 pointer-events-none" : "cursor-pointer"}`}>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-900 dark:text-gray-100">Published</span>
                  <span className="text-[10px] text-gray-500">Visible on site</span>
                </div>
                <input
                  type="radio"
                  name="active"
                  disabled={isSaving}
                  checked={active}
                  onChange={() => setActive(true)}
                  className="accent-[#e31b23] h-4.5 w-4.5"
                />
              </label>
              <label className={`flex-1 flex items-center justify-between p-3.5 rounded-xl border border-gray-100 dark:border-zinc-855 bg-gray-50 dark:bg-zinc-800/20 select-none ${isSaving ? "opacity-50 pointer-events-none" : "cursor-pointer"}`}>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-900 dark:text-gray-100">Draft</span>
                  <span className="text-[10px] text-gray-500">Hidden from site</span>
                </div>
                <input
                  type="radio"
                  name="active"
                  disabled={isSaving}
                  checked={!active}
                  onChange={() => setActive(false)}
                  className="accent-[#e31b23] h-4.5 w-4.5"
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className={`flex items-center justify-between p-3.5 rounded-xl border border-gray-100 dark:border-zinc-855 bg-gray-50 dark:bg-zinc-800/20 select-none ${isSaving ? "opacity-50 pointer-events-none" : "cursor-pointer"}`}>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-900 dark:text-gray-100">Featured</span>
                <span className="text-[10px] text-gray-500">Show on Home</span>
              </div>
              <input
                type="checkbox"
                disabled={isSaving}
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="accent-[#e31b23] h-4.5 w-4.5 cursor-pointer rounded-sm"
              />
            </label>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Badge Label (Optional)
              </label>
              <input
                disabled={isSaving}
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. POPULAR, NEW"
                className="w-full text-sm px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-855 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#e31b23]/25 focus:border-[#e31b23] text-gray-900 dark:text-gray-100 transition-all font-semibold disabled:opacity-50"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 mt-4 border-t border-gray-100/50 dark:border-zinc-800/30 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4.5 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-800 rounded-xl transition-all cursor-pointer disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-[#e31b23] hover:bg-[#ff2d35] rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-70"
            >
              <Save size={14} />
              <span>{isSaving ? "Saving..." : editId ? "Update Category" : "Save Category"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

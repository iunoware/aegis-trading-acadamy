"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  ChevronDown,
  Plus,
  Trash2,
  Upload,
  FileText,
  Smartphone,
  Compass,
  Globe,
  Check,
  Eye,
  Trash,
  Edit3,
  ArrowLeft,
  ArrowRight,
  Star,
  HelpCircle,
  Save,
  X,
  Layers,
  LayoutDashboard,
  Sparkles,
  Boxes,
  DollarSign,
  Image as ImageIcon,
} from "lucide-react";
import { useProducts, ProductState, slugify } from "./ProductsContext";

interface ProductFormProps {
  editId?: string | null;
  categoryId: string;
  familyId: string;
  onCancel: () => void;
  onSave: () => void;
}

export default function ProductForm({
  editId,
  categoryId,
  familyId,
  onCancel,
  onSave,
}: ProductFormProps) {
  const { categories, families, products, addProduct, updateProduct } =
    useProducts();

  // Resolve parent names for badges
  const categoryName = useMemo(() => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.name : "Unknown Category";
  }, [categories, categoryId]);

  const familyName = useMemo(() => {
    const fam = families.find((f) => f.id === familyId);
    return fam ? fam.name : "Unknown Family Series";
  }, [families, familyId]);

  // Form Fields State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");

  // Gallery State
  const [coverImage, setCoverImage] = useState("/images/security-cabin.png");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  // Specs State
  const [specifications, setSpecifications] = useState<
    { parameter: string; value: string }[]
  >([]);

  // Dynamic Attributes State
  const [attributes, setAttributes] = useState<
    { label: string; value: string }[]
  >([]);

  // Features State (Chips)
  const [features, setFeatures] = useState<
    { title: string; description: string }[]
  >([]);
  const [newFeatureText, setNewFeatureText] = useState("");
  const [editingFeatureIndex, setEditingFeatureIndex] = useState<number | null>(
    null,
  );
  const [editingFeatureTitle, setEditingFeatureTitle] = useState("");
  const [editingFeatureDesc, setEditingFeatureDesc] = useState("");

  // Files State (Brochure and 3D Model)
  const [brochureName, setBrochureName] = useState("");
  const [model3dName, setModel3dName] = useState("");

  // CTA State
  const [ctaText, setCtaText] = useState("Enquire on WhatsApp");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  // SEO Accordion State
  const [isSeoExpanded, setIsSeoExpanded] = useState(false);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [ogImage, setOgImage] = useState("");

  // Publish Status State
  const [active, setActive] = useState(true);
  const [featured, setFeatured] = useState(false);

  // Pricing State
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState("");
  const [currency, setCurrency] = useState("AED");
  const [priceError, setPriceError] = useState("");

  // File Inputs Refs
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const brochureInputRef = useRef<HTMLInputElement>(null);
  const model3dInputRef = useRef<HTMLInputElement>(null);

  // 1. Load Initial Data if Editing
  useEffect(() => {
    if (editId) {
      const prod = products.find((p) => p.id === editId);
      if (prod) {
        setName(prod.name);
        setSlug(prod.slug);
        setIsSlugManuallyEdited(true);
        setShortDescription(prod.shortDescription);
        setDescription(prod.description);
        setCoverImage(prod.thumbnail);
        setGalleryImages(prod.images || []);
        setSpecifications(prod.specifications || []);
        setFeatures(prod.features || []);
        setAttributes(prod.attributes || []);
        setBrochureName(
          prod.brochure ? prod.brochure.split("/").pop() || "brochure.pdf" : "",
        );
        setModel3dName(
          prod.model3d ? prod.model3d.split("/").pop() || "model.glb" : "",
        );
        setCtaText(prod.ctaText || "Enquire on WhatsApp");
        setWhatsappNumber(prod.whatsappNumber || "");
        setMetaTitle(prod.metaTitle || "");
        setMetaDescription(prod.metaDescription || "");
        setKeywords(prod.keywords || "");
        setOgImage(prod.ogImage || "");
        setActive(prod.active);
        setFeatured(prod.featured);
        setOriginalPrice(
          prod.originalPrice ? prod.originalPrice.toString() : "",
        );
        setDiscountedPrice(
          prod.discountedPrice ? prod.discountedPrice.toString() : "",
        );
        setCurrency(prod.currency || "AED");
      }
    } else {
      // Set default values for New Product
      setName("");
      setSlug("");
      setIsSlugManuallyEdited(false);
      setShortDescription("");
      setDescription("");
      setCoverImage("/images/security-cabin.png");
      setGalleryImages([]);
      setAttributes([]);
      setSpecifications([
        { parameter: "Dimensions", value: "3.00m (L) x 6.00m (W) x 2.60m (H)" },
        { parameter: "Frame", value: "Structural Steel Frame, epoxy coated" },
      ]);
      setFeatures([
        {
          title: "Portable",
          description:
            "Relocatable cabin structure with built-in corner slots.",
        },
      ]);
      setBrochureName("");
      setModel3dName("");
      setCtaText("Enquire on WhatsApp");
      setWhatsappNumber("");
      setMetaTitle("");
      setMetaDescription("");
      setKeywords("");
      setOgImage("");
      setActive(true);
      setFeatured(false);
      setOriginalPrice("");
      setDiscountedPrice("");
      setCurrency("AED");
    }
  }, [editId, products]);

  // 2. Auto-generate Slug from Name if not manually edited
  useEffect(() => {
    if (!isSlugManuallyEdited) {
      setSlug(slugify(name));
    }
  }, [name, isSlugManuallyEdited]);

  // Pricing validation
  useEffect(() => {
    const orig = originalPrice ? parseFloat(originalPrice) : NaN;
    const disc = discountedPrice ? parseFloat(discountedPrice) : NaN;
    if (!isNaN(orig) && !isNaN(disc) && disc > orig) {
      setPriceError("Discounted price cannot be greater than original price.");
    } else {
      setPriceError("");
    }
  }, [originalPrice, discountedPrice]);

  // 3. File uploads simulation
  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setGalleryImages((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleBrochureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBrochureName(file.name);
    }
  };

  const handleModel3dUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setModel3dName(file.name);
    }
  };

  // 4. Specs manipulation
  const addSpecRow = () => {
    setSpecifications((prev) => [...prev, { parameter: "", value: "" }]);
  };

  const handleSpecChange = (
    index: number,
    field: "parameter" | "value",
    val: string,
  ) => {
    setSpecifications((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, [field]: val } : item,
      ),
    );
  };

  const removeSpecRow = (index: number) => {
    setSpecifications((prev) => prev.filter((_, idx) => idx !== index));
  };

  // 4b. Attributes manipulation
  const addAttributeRow = () => {
    setAttributes((prev) => [...prev, { label: "", value: "" }]);
  };

  const handleAttributeChange = (
    index: number,
    field: "label" | "value",
    val: string,
  ) => {
    setAttributes((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, [field]: val } : item,
      ),
    );
  };

  const removeAttributeRow = (index: number) => {
    setAttributes((prev) => prev.filter((_, idx) => idx !== index));
  };

  // 5. Features chips manipulation
  const addFeatureChip = () => {
    if (!newFeatureText.trim()) return;
    const exists = features.some(
      (f) => f.title.toLowerCase() === newFeatureText.trim().toLowerCase(),
    );
    if (exists) {
      alert("Feature chip already exists.");
      return;
    }
    setFeatures((prev) => [
      ...prev,
      {
        title: newFeatureText.trim(),
        description: `${newFeatureText.trim()} structure and engineering specifications.`,
      },
    ]);
    setNewFeatureText("");
  };

  const removeFeatureChip = (index: number) => {
    setFeatures((prev) => prev.filter((_, idx) => idx !== index));
    if (editingFeatureIndex === index) {
      setEditingFeatureIndex(null);
    }
  };

  const startEditFeature = (index: number) => {
    setEditingFeatureIndex(index);
    setEditingFeatureTitle(features[index].title);
    setEditingFeatureDesc(features[index].description);
  };

  const saveFeatureEdit = () => {
    if (editingFeatureIndex === null || !editingFeatureTitle.trim()) return;
    setFeatures((prev) =>
      prev.map((item, idx) =>
        idx === editingFeatureIndex
          ? {
              ...item,
              title: editingFeatureTitle.trim(),
              description: editingFeatureDesc.trim(),
            }
          : item,
      ),
    );
    setEditingFeatureIndex(null);
  };

  // 6. Form Submission
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    const orig = originalPrice ? parseFloat(originalPrice) : undefined;
    const disc = discountedPrice ? parseFloat(discountedPrice) : undefined;
    if (orig !== undefined && disc !== undefined && disc > orig) {
      alert("Discounted price cannot be greater than original price.");
      return;
    }

    let formattedPrice = "Price on Enquiry";
    if (disc !== undefined) {
      formattedPrice = `${currency} ${disc.toLocaleString()}`;
    } else if (orig !== undefined) {
      formattedPrice = `${currency} ${orig.toLocaleString()}`;
    }

    const cleanedAttributes = attributes
      .map((attr) => ({
        label: attr.label.trim(),
        value: attr.value.trim(),
      }))
      .filter((attr) => attr.label !== "" || attr.value !== "");

    for (const attr of cleanedAttributes) {
      if (attr.label === "") {
        alert("Attribute Label is required.");
        return;
      }
      if (attr.value === "") {
        alert("Attribute Value is required.");
        return;
      }
    }

    const payload = {
      familyId,
      name,
      slug,
      shortDescription,
      description,
      price: formattedPrice,
      brochure: brochureName ? `/brochures/${brochureName}` : "",
      model3d: model3dName ? `/3d-models/${model3dName}` : "",
      thumbnail: coverImage,
      images: galleryImages.length > 0 ? galleryImages : [coverImage],
      attributes: cleanedAttributes,
      specifications: specifications.map((s: any) => ({
        parameter: s.parameter || s.label,
        value: s.value,
      })),
      features: features.map((f: any) => ({
        title: f.title,
        description: f.description,
        icon: f.icon,
      })),
      active,
      featured,
      ctaText,
      whatsappNumber,
      metaTitle: metaTitle || `${name} | The Cabins`,
      metaDescription: metaDescription || shortDescription,
      keywords,
      ogImage: ogImage || coverImage,
      originalPrice: orig,
      discountedPrice: disc,
      currency: currency || "AED",
    };

    setIsSaving(true);
    try {
      if (editId) {
        await updateProduct(editId, payload);
      } else {
        await addProduct(payload);
      }
      onSave();
    } catch (err) {
      console.error("Failed to save product variant:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Image reorder helpers
  const moveImage = (index: number, direction: "left" | "right") => {
    if (direction === "left" && index === 0) return;
    if (direction === "right" && index === galleryImages.length - 1) return;

    const targetIndex = direction === "left" ? index - 1 : index + 1;
    const newImages = [...galleryImages];
    const temp = newImages[index];
    newImages[index] = newImages[targetIndex];
    newImages[targetIndex] = temp;
    setGalleryImages(newImages);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 w-full pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/40 p-5 rounded-2xl shadow-xs animate-[fadeIn_0.2s_ease-out]">
        <div>
          <h2 className="text-lg font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Boxes size={20} className="text-[#e31b23]" />
            {editId ? "Edit Showcase Product" : "New Showcase Product"}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
            Configure premium showcase content, specifications, brochures, and
            3D files.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4.5 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-850 border border-gray-250 dark:border-zinc-800 rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-[#e31b23] hover:bg-[#ff2d35] rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Save size={14} />
            <span>{editId ? "Update Product" : "Save Product"}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* SECTION 1: Basic Information */}
        <section className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/40 rounded-2xl p-6.5 shadow-xs flex flex-col gap-5">
          <h3 className="text-sm font-extrabold text-gray-900 dark:text-gray-100 pb-3 border-b border-gray-50 dark:border-zinc-850/50 flex items-center gap-2">
            <Sparkles size={16} className="text-blue-500" />
            1. Basic Information
          </h3>

          {/* Locked Category and Family badges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                Category
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 bg-gray-100/60 dark:bg-zinc-800/60 border border-gray-150 dark:border-zinc-800 rounded-xl text-gray-700 dark:text-gray-300 select-none">
                <LayoutDashboard size={14} className="text-gray-400" />
                <span className="text-xs font-extrabold">{categoryName}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                Family Series
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 bg-gray-100/60 dark:bg-zinc-800/60 border border-gray-150 dark:border-zinc-800 rounded-xl text-gray-700 dark:text-gray-300 select-none">
                <Layers size={14} className="text-gray-400" />
                <span className="text-xs font-extrabold">{familyName}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Product Variant Name *
              </label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Premium Cabin A"
                className="w-full text-sm px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-850 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#e31b23]/25 focus:border-[#e31b23] text-gray-900 dark:text-gray-100 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Slug (URL Extension) *
              </label>
              <input
                required
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlug(slugify(e.target.value));
                  setIsSlugManuallyEdited(true);
                }}
                placeholder="e.g. premium-cabin-a"
                className="w-full text-sm px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-850 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#e31b23]/25 focus:border-[#e31b23] text-gray-900 dark:text-gray-100 transition-all font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Short Description (Card summary)
            </label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="e.g. Luxury cabin featuring double glass panels and internal plumbing fixtures."
              className="w-full text-sm px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-850 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#e31b23]/25 focus:border-[#e31b23] text-gray-900 dark:text-gray-100 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Full Description (Product page body)
            </label>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide the complete architectural and engineering features, design specs, wall structures, cladding options..."
              className="w-full text-sm px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-850 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#e31b23]/25 focus:border-[#e31b23] text-gray-900 dark:text-gray-100 transition-all resize-none font-medium"
            />
          </div>
        </section>

        {/* SECTION: Product Highlights / Attributes */}
        <section className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/40 rounded-2xl p-6.5 shadow-xs flex flex-col gap-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-50 dark:border-zinc-850/50">
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Layers size={16} className="text-[#e31b23]" />
              Product Highlights / Attributes
            </h3>
            <button
              type="button"
              onClick={addAttributeRow}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#e31b23] hover:bg-[#ff2d35] rounded-lg transition-all shadow-xs cursor-pointer"
            >
              <Plus size={12} />
              <span>Add Attribute</span>
            </button>
          </div>

          {attributes.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 dark:bg-zinc-950/20 rounded-2xl border border-dashed border-gray-150 dark:border-zinc-800">
              <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold italic">
                No product attributes added.
              </p>
              <button
                type="button"
                onClick={addAttributeRow}
                className="mt-2 text-xs font-bold text-[#e31b23] hover:underline"
              >
                Add first row
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-12 gap-3.5 px-2">
                <span className="col-span-5 text-[10px] uppercase tracking-wider font-extrabold text-gray-400 dark:text-gray-500">
                  Label
                </span>
                <span className="col-span-6 text-[10px] uppercase tracking-wider font-extrabold text-gray-400 dark:text-gray-500">
                  Value
                </span>
                <span className="col-span-1"></span>
              </div>
              {attributes.map((attr, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-3 items-center animate-[fadeIn_0.2s_ease-out]"
                >
                  <div className="col-span-5">
                    <input
                      required
                      type="text"
                      value={attr.label}
                      onChange={(e) =>
                        handleAttributeChange(index, "label", e.target.value)
                      }
                      placeholder="e.g. Size"
                      className="w-full text-xs px-3 py-2 bg-gray-50 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800 rounded-xl focus:outline-hidden focus:border-[#e31b23] text-gray-900 dark:text-gray-100 transition-all font-semibold"
                    />
                  </div>
                  <div className="col-span-6">
                    <input
                      required
                      type="text"
                      value={attr.value}
                      onChange={(e) =>
                        handleAttributeChange(index, "value", e.target.value)
                      }
                      placeholder="e.g. Custom"
                      className="w-full text-xs px-3 py-2 bg-gray-50 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800 rounded-xl focus:outline-hidden focus:border-[#e31b23] text-gray-900 dark:text-gray-100 transition-all font-medium"
                    />
                  </div>
                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => removeAttributeRow(index)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-955/20 transition-all cursor-pointer"
                      title="Remove Row"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SECTION: Pricing Details */}
        <section className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/40 rounded-2xl p-6.5 shadow-xs flex flex-col gap-5">
          <h3 className="text-sm font-extrabold text-gray-900 dark:text-gray-100 pb-3 border-b border-gray-50 dark:border-zinc-850/50 flex items-center gap-2">
            <DollarSign size={16} className="text-amber-500" />
            2. Pricing Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-850 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#e31b23]/25 focus:border-[#e31b23] text-gray-900 dark:text-gray-100 transition-all font-semibold cursor-pointer"
              >
                <option value="AED">AED (United Arab Emirates Dirham)</option>
                <option value="USD">USD (United States Dollar)</option>
                <option value="SAR">SAR (Saudi Riyal)</option>
                <option value="QAR">QAR (Qatari Riyal)</option>
                <option value="OMR">OMR (Omani Rial)</option>
                <option value="BHD">BHD (Bahraini Dinar)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Original Price (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 select-none">
                  {currency}
                </span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="e.g. 12500"
                  className="w-full text-sm pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-850 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#e31b23]/25 focus:border-[#e31b23] text-gray-900 dark:text-gray-100 transition-all font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Discounted / Selling Price (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 select-none">
                  {currency}
                </span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={discountedPrice}
                  onChange={(e) => setDiscountedPrice(e.target.value)}
                  placeholder="e.g. 9500"
                  className={`w-full text-sm pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-800/50 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#e31b23]/25 focus:border-[#e31b23] text-gray-900 dark:text-gray-100 transition-all font-semibold ${
                    priceError
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-100 dark:border-zinc-855"
                  }`}
                />
              </div>
              {priceError && (
                <span className="text-[10px] text-red-500 font-bold mt-1 block">
                  {priceError}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* SECTION 3: Gallery */}
        <section className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/40 rounded-2xl p-6.5 shadow-xs flex flex-col gap-5">
          <h3 className="text-sm font-extrabold text-gray-900 dark:text-gray-100 pb-3 border-b border-gray-50 dark:border-zinc-850/50 flex items-center gap-2">
            <ImageIcon size={16} className="text-emerald-500" />
            3. Gallery Showcase
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Cover Image */}
            <div className="md:col-span-1 flex flex-col gap-2">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Cover Image
              </label>
              <div className="relative aspect-square rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden bg-gray-50 dark:bg-zinc-855/60 flex items-center justify-center">
                {coverImage ? (
                  <img
                    src={coverImage}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon size={32} className="text-gray-300" />
                )}
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold cursor-pointer"
                >
                  <Upload size={18} className="mr-1.5" />
                  Replace Cover
                </button>
                <input
                  type="file"
                  ref={coverInputRef}
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Gallery Images */}
            <div className="md:col-span-2 flex flex-col gap-2.5">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Gallery Images
              </label>

              <div className="grid grid-cols-3 gap-3">
                {galleryImages.map((img, index) => (
                  <div
                    key={index}
                    className="relative aspect-video rounded-xl border border-gray-100 dark:border-zinc-800 overflow-hidden bg-gray-50 dark:bg-zinc-850/40 group shadow-xs"
                  >
                    <img
                      src={img}
                      alt={`Gallery ${index}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Reordering & Delete Controls */}
                    <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => moveImage(index, "left")}
                        disabled={index === 0}
                        className="p-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg disabled:opacity-40 disabled:hover:bg-gray-800 cursor-pointer"
                        title="Move Left"
                      >
                        <ArrowLeft size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCoverImage(img)}
                        className="p-1.5 bg-gray-800 hover:bg-[#e31b23] text-white rounded-lg cursor-pointer"
                        title="Make Cover Image"
                      >
                        <Check size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setGalleryImages((prev) =>
                            prev.filter((_, idx) => idx !== index),
                          )
                        }
                        className="p-1.5 bg-gray-800 hover:bg-red-600 text-white rounded-lg cursor-pointer"
                        title="Remove Image"
                      >
                        <Trash size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(index, "right")}
                        disabled={index === galleryImages.length - 1}
                        className="p-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg disabled:opacity-40 disabled:hover:bg-gray-800 cursor-pointer"
                        title="Move Right"
                      >
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Upload Trigger */}
                <label className="aspect-video border-2 border-dashed border-gray-250 dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center hover:border-[#e31b23] dark:hover:border-[#e31b23] transition-colors cursor-pointer bg-gray-50 dark:bg-zinc-850/20 group">
                  <Plus
                    size={20}
                    className="text-gray-400 group-hover:text-[#e31b23] mb-1"
                  />
                  <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wider group-hover:text-[#e31b23]">
                    Add image
                  </span>
                  <input
                    type="file"
                    ref={galleryInputRef}
                    accept="image/*"
                    multiple
                    onChange={handleGalleryUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold mt-1">
                Tip: Hover over dynamic gallery cards to reorder slides, swap
                cover selection, or delete images.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 4: Specifications */}
        <section className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/40 rounded-2xl p-6.5 shadow-xs flex flex-col gap-5">
          <div className="flex justify-between items-center pb-3 border-b border-gray-50 dark:border-zinc-855/50">
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Compass size={16} className="text-[#e31b23]" />
              4. Specifications
            </h3>
            <button
              type="button"
              onClick={addSpecRow}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300 hover:text-white bg-white dark:bg-zinc-850 hover:bg-[#e31b23] border border-gray-200 dark:border-zinc-800 rounded-lg transition-colors cursor-pointer select-none"
            >
              <Plus size={12} className="stroke-[2.5]" />
              <span>Add Row</span>
            </button>
          </div>

          {specifications.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-gray-150 dark:border-zinc-800 rounded-xl bg-gray-50/50 dark:bg-zinc-900/10">
              <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold">
                No custom specifications added.
              </p>
              <button
                type="button"
                onClick={addSpecRow}
                className="mt-2 text-xs font-bold text-[#e31b23] hover:underline"
              >
                Add first row
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-12 gap-3.5 px-2">
                <span className="col-span-5 text-[10px] uppercase tracking-wider font-extrabold text-gray-400 dark:text-gray-500">
                  Specification Name
                </span>
                <span className="col-span-6 text-[10px] uppercase tracking-wider font-extrabold text-gray-400 dark:text-gray-500">
                  Value / Description
                </span>
                <span className="col-span-1"></span>
              </div>
              {specifications.map((spec, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-3 items-center"
                >
                  <div className="col-span-5">
                    <input
                      required
                      type="text"
                      value={spec.parameter}
                      onChange={(e) =>
                        handleSpecChange(index, "parameter", e.target.value)
                      }
                      placeholder="e.g. Insulation Core"
                      className="w-full text-xs px-3 py-2 bg-gray-50 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800 rounded-xl focus:outline-hidden focus:border-[#e31b23] text-gray-900 dark:text-gray-100 transition-all font-semibold"
                    />
                  </div>
                  <div className="col-span-6">
                    <input
                      required
                      type="text"
                      value={spec.value}
                      onChange={(e) =>
                        handleSpecChange(index, "value", e.target.value)
                      }
                      placeholder="e.g. 50mm polyurethane foam (PU)"
                      className="w-full text-xs px-3 py-2 bg-gray-50 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800 rounded-xl focus:outline-hidden focus:border-[#e31b23] text-gray-900 dark:text-gray-100 transition-all font-medium"
                    />
                  </div>
                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => removeSpecRow(index)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-955/20 transition-all cursor-pointer"
                      title="Remove Row"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SECTION 4: Features */}
        {/* <section className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/40 rounded-2xl p-6.5 shadow-xs flex flex-col gap-5">
          <h3 className="text-sm font-extrabold text-gray-900 dark:text-gray-100 pb-3 border-b border-gray-50 dark:border-zinc-850/50 flex items-center gap-2">
            <Sparkles size={16} className="text-purple-500" />
            5. Features & Selling Chips
          </h3>

          <div className="flex gap-2">
            <input
              type="text"
              value={newFeatureText}
              onChange={(e) => setNewFeatureText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addFeatureChip();
                }
              }}
              placeholder="e.g. Portable (Hit Enter to add)"
              className="flex-1 text-xs px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-850 rounded-xl focus:outline-hidden focus:border-[#e31b23] text-gray-900 dark:text-gray-100 font-semibold"
            />
            <button
              type="button"
              onClick={addFeatureChip}
              className="flex items-center gap-1.5 px-4.5 text-xs font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-zinc-855 hover:bg-gray-100 border border-gray-250 dark:border-zinc-850 rounded-xl transition-all cursor-pointer shadow-xs"
            >
              Add Chip
            </button>
          </div>

          
          <div className="flex flex-wrap gap-2 mt-2">
            {features.map((feat, index) => (
              <div
                key={index}
                className="bg-red-50 dark:bg-[#e31b23]/10 border border-red-100/60 dark:border-[#e31b23]/20 rounded-xl px-3 py-2 flex items-center gap-2.5 text-xs text-[#e31b23] dark:text-[#ff3840] font-bold group select-none hover:bg-red-100/30 dark:hover:bg-[#e31b23]/15 transition-all"
              >
                <span className="cursor-pointer" onClick={() => startEditFeature(index)} title="Click to edit details">
                  {feat.title}
                </span>
                
                
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => startEditFeature(index)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition-opacity p-0.5"
                    title="Edit feature details"
                  >
                    <Edit3 size={11} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFeatureChip(index)}
                    className="text-[#e31b23]/60 hover:text-[#e31b23] transition-colors p-0.5"
                    title="Remove Chip"
                  >
                    <X size={13} className="stroke-[2.5]" />
                  </button>
                </div>
              </div>
            ))}
            {features.length === 0 && (
              <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold italic">No feature chips added yet.</span>
            )}
          </div>

          
          {editingFeatureIndex !== null && (
            <div className="bg-gray-50 dark:bg-zinc-850/40 p-4 rounded-xl border border-gray-100 dark:border-zinc-805 flex flex-col gap-3.5 animate-[fadeIn_0.2s_ease-out]">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400 dark:text-gray-500">Edit Chip Info</span>
                <button type="button" onClick={() => setEditingFeatureIndex(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200">
                  <X size={14} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1">Chip Tag Title</label>
                  <input
                    type="text"
                    value={editingFeatureTitle}
                    onChange={(e) => setEditingFeatureTitle(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-gray-900 dark:text-gray-100 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1">Selling Pitch Description</label>
                  <input
                    type="text"
                    value={editingFeatureDesc}
                    onChange={(e) => setEditingFeatureDesc(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-gray-900 dark:text-gray-100 font-medium"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setEditingFeatureIndex(null)}
                  className="px-3 py-1.5 text-[10px] font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveFeatureEdit}
                  className="px-3.5 py-1.5 text-[10px] font-bold text-white bg-[#e31b23] hover:bg-[#ff2d35] rounded-lg shadow-xs"
                >
                  Apply Changes
                </button>
              </div>
            </div>
          )}
        </section> */}

        {/* SECTION 5 & 6: 3D Model & Brochure PDF */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SECTION 6: 3D Model */}
          <section className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/40 rounded-2xl p-6.5 shadow-xs flex flex-col gap-4.5">
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-gray-100 pb-3 border-b border-gray-55 dark:border-zinc-850/50 flex items-center gap-2">
              <Smartphone size={16} className="text-blue-500" />
              5. Interactive 3D Model
            </h3>

            <div className="flex flex-col gap-3">
              {model3dName ? (
                <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-zinc-855/30 rounded-xl border border-gray-100 dark:border-zinc-800/60">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-blue-50 dark:bg-blue-955/20 text-blue-600 rounded-lg shrink-0">
                      <Compass size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate max-w-[150px]">
                        {model3dName}
                      </span>
                      <span className="text-[9px] text-gray-400 font-semibold">
                        GLB 3D Container (Simulated)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => model3dInputRef.current?.click()}
                      className="text-[10px] font-extrabold uppercase tracking-wider text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors cursor-pointer px-2 py-1"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={() => setModel3dName("")}
                      className="text-[10px] font-extrabold uppercase tracking-wider text-red-600 transition-colors cursor-pointer px-2 py-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => model3dInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-250 dark:border-zinc-800 hover:border-blue-500 rounded-xl p-6.5 flex flex-col items-center justify-center transition-colors cursor-pointer bg-gray-50 dark:bg-zinc-850/10 group"
                >
                  <Compass
                    size={24}
                    className="text-gray-400 group-hover:text-blue-500 mb-2 transition-colors"
                  />
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 group-hover:text-blue-500 transition-colors">
                    Select .glb File
                  </span>
                  <span className="text-[10px] text-gray-400 font-semibold mt-1">
                    Ready for future canvas previews
                  </span>
                </div>
              )}
              <input
                type="file"
                ref={model3dInputRef}
                accept=".glb"
                onChange={handleModel3dUpload}
                className="hidden"
              />
            </div>
          </section>

          {/* SECTION 7: Brochure */}
          <section className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/40 rounded-2xl p-6.5 shadow-xs flex flex-col gap-4.5">
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-gray-100 pb-3 border-b border-gray-50 dark:border-zinc-855/50 flex items-center gap-2">
              <FileText size={16} className="text-amber-500" />
              6. Brochure PDF
            </h3>

            <div className="flex flex-col gap-3">
              {brochureName ? (
                <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-zinc-855/30 rounded-xl border border-gray-100 dark:border-zinc-800/60">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-amber-50 dark:bg-amber-955/20 text-amber-600 rounded-lg shrink-0">
                      <FileText size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate max-w-[150px]">
                        {brochureName}
                      </span>
                      <span className="text-[9px] text-gray-400 font-semibold">
                        Document PDF (Simulated)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => brochureInputRef.current?.click()}
                      className="text-[10px] font-extrabold uppercase tracking-wider text-gray-600 dark:text-gray-300 hover:text-amber-600 transition-colors cursor-pointer px-2 py-1"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={() => setBrochureName("")}
                      className="text-[10px] font-extrabold uppercase tracking-wider text-red-600 transition-colors cursor-pointer px-2 py-1"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => brochureInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-250 dark:border-zinc-800 hover:border-amber-500 rounded-xl p-6.5 flex flex-col items-center justify-center transition-colors cursor-pointer bg-gray-50 dark:bg-zinc-850/10 group"
                >
                  <FileText
                    size={24}
                    className="text-gray-400 group-hover:text-amber-500 mb-2 transition-colors"
                  />
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 group-hover:text-amber-500 transition-colors">
                    Select Brochure PDF
                  </span>
                  <span className="text-[10px] text-gray-400 font-semibold mt-1">
                    Available for client downloads
                  </span>
                </div>
              )}
              <input
                type="file"
                ref={brochureInputRef}
                accept=".pdf"
                onChange={handleBrochureUpload}
                className="hidden"
              />
            </div>
          </section>
        </div>

        {/* SECTION 8: CTA */}
        <section className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/40 rounded-2xl p-6.5 shadow-xs flex flex-col gap-5">
          <h3 className="text-sm font-extrabold text-gray-900 dark:text-gray-100 pb-3 border-b border-gray-50 dark:border-zinc-850/50 flex items-center gap-2">
            <Smartphone size={16} className="text-emerald-500" />
            7. WhatsApp Action CTA Overrides
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                CTA Button Text
              </label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="e.g. Enquire on WhatsApp"
                className="w-full text-sm px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-855 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#e31b23]/25 focus:border-[#e31b23] text-gray-900 dark:text-gray-100 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center justify-between">
                <span>WhatsApp Relocation (Override)</span>
                <span className="text-[10px] text-gray-400 font-normal">
                  Default: Company Phone
                </span>
              </label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="e.g. +971526856240"
                className="w-full text-sm px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-855 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#e31b23]/25 focus:border-[#e31b23] text-gray-900 dark:text-gray-100 transition-all font-semibold"
              />
            </div>
          </div>
        </section>

        {/* SECTION 9: SEO (accordion) */}
        <section className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/40 rounded-2xl overflow-hidden shadow-xs flex flex-col">
          {/* Accordion Header */}
          <button
            type="button"
            onClick={() => setIsSeoExpanded(!isSeoExpanded)}
            className="flex items-center justify-between px-6.5 py-4.5 hover:bg-gray-50/50 dark:hover:bg-zinc-800/20 transition-colors w-full cursor-pointer text-left focus:outline-hidden"
          >
            <span className="text-sm font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Globe size={16} className="text-indigo-500" />
              8. Search Engine Optimization (SEO)
            </span>
            <ChevronDown
              size={18}
              className={`text-gray-400 transition-transform duration-300 ${isSeoExpanded ? "rotate-180" : ""}`}
            />
          </button>

          {/* Accordion Content */}
          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              isSeoExpanded
                ? "max-h-[500px] border-t border-gray-50 dark:border-zinc-850/50"
                : "max-h-0"
            }`}
          >
            <div className="p-6.5 flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="e.g. Standard Security Cabin | Insulated Booths | The Cabins"
                    className="w-full text-sm px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-855 rounded-xl focus:outline-hidden focus:border-[#e31b23] text-gray-900 dark:text-gray-100 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Keywords (comma separated)
                  </label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="e.g. security cabin, watchman booth, portable gatehouse, Dubai"
                    className="w-full text-sm px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-855 rounded-xl focus:outline-hidden focus:border-[#e31b23] text-gray-900 dark:text-gray-100 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Meta Description
                  </label>
                  <textarea
                    rows={3}
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="Provide a search snippet meta description..."
                    className="w-full text-sm px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-855 rounded-xl focus:outline-hidden focus:border-[#e31b23] text-gray-900 dark:text-gray-100 resize-none font-medium"
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    OG Social Card Image (Link)
                  </label>
                  <input
                    type="text"
                    value={ogImage}
                    onChange={(e) => setOgImage(e.target.value)}
                    placeholder="URL to custom OG card"
                    className="w-full text-sm px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-855 rounded-xl focus:outline-hidden focus:border-[#e31b23] text-gray-900 dark:text-gray-100 font-medium"
                  />
                  <span className="text-[9px] text-gray-400 font-semibold mt-1 block">
                    Defaults to Cover Image if left empty
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 10: Publish & Feature */}
        <section className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/40 rounded-2xl p-6.5 shadow-xs flex flex-col gap-5">
          <h3 className="text-sm font-extrabold text-gray-900 dark:text-gray-100 pb-3 border-b border-gray-55 dark:border-zinc-855/50 flex items-center gap-2">
            <Compass size={16} className="text-amber-500" />
            9. Publish Status
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4.5">
            {/* Publish Radio */}
            <label className="flex items-center justify-between p-3.5 rounded-xl border border-gray-150 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-855/20 cursor-pointer select-none">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                  Publish Immediately
                </span>
                <span className="text-[10px] text-gray-400">
                  Available to customers
                </span>
              </div>
              <input
                type="radio"
                name="prod-active"
                checked={active}
                onChange={() => setActive(true)}
                className="accent-[#e31b23] h-4.5 w-4.5 cursor-pointer"
              />
            </label>

            {/* Draft Radio */}
            <label className="flex items-center justify-between p-3.5 rounded-xl border border-gray-150 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-855/20 cursor-pointer select-none">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                  Save as Draft
                </span>
                <span className="text-[10px] text-gray-400">
                  Hidden from storefront
                </span>
              </div>
              <input
                type="radio"
                name="prod-active"
                checked={!active}
                onChange={() => setActive(false)}
                className="accent-[#e31b23] h-4.5 w-4.5 cursor-pointer"
              />
            </label>

            {/* Featured Showcase Switch */}
            <label className="flex items-center justify-between p-3.5 rounded-xl border border-gray-150 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-855/20 cursor-pointer select-none">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1">
                  Featured Product
                  <Star size={13} className="text-amber-500 fill-amber-500" />
                </span>
                <span className="text-[10px] text-gray-400">
                  Add to Homepage banner
                </span>
              </div>
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="accent-[#e31b23] h-4.5 w-4.5 cursor-pointer"
              />
            </label>
          </div>
        </section>

        {/* Action Bar (Sticky footer) */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 dark:border-zinc-800 pt-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="px-6 py-3 text-xs font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 border border-gray-250 dark:border-zinc-800 rounded-xl transition-all cursor-pointer select-none disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-1.5 px-7 py-3 text-xs font-bold text-white bg-[#e31b23] hover:bg-[#ff2d35] rounded-xl transition-all shadow-xs cursor-pointer select-none disabled:opacity-75"
          >
            <Save size={14} />
            <span>
              {isSaving
                ? "Saving..."
                : editId
                  ? "Update Product"
                  : "Save Product Variant"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}

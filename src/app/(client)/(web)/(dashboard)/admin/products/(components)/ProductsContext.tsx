"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
// import { productFamilies } from "@/src/data/products";
import { toast } from "sonner";

// Helper for slug generation
export const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

// Type Definitions conforming to database structure
export interface CategoryState {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  active: boolean; // true = Published, false = Draft
  featured?: boolean;
  badge?: string;
  updatedAt: string;
  familiesCount: number;
  productsCount: number;
}

export interface FamilyState {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  shortDescription: string;
  thumbnail: string;
  active: boolean;
  featured: boolean;
  popular: boolean;
  updatedAt: string;
}

export interface ProductFeature {
  title: string;
  description: string;
  icon?: string;
}

export interface ProductSpecification {
  parameter: string;
  value: string;
}

export interface ProductState {
  id: string;
  familyId: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: string;
  brochure: string;
  model3d: string;
  thumbnail: string;
  images: string[];
  specifications: ProductSpecification[];
  features: ProductFeature[];
  active: boolean;
  featured: boolean;
  updatedAt: string;
  // Overrides & Extra metadata
  ctaText?: string;
  whatsappNumber?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  ogImage?: string;
  // Pricing
  originalPrice?: number;
  discountedPrice?: number;
  currency?: string;
  attributes?: { label: string; value: string }[];
}

interface ProductsContextType {
  categories: CategoryState[];
  families: FamilyState[];
  products: ProductState[];
  isLoading: boolean;
  loadCategories: (
    search?: string,
    status?: string,
    sortBy?: string,
  ) => Promise<void>;
  loadFamilies: (categoryId?: string) => Promise<void>;
  loadProducts: (familyId?: string) => Promise<void>;
  // Category Actions
  addCategory: (
    category: Omit<
      CategoryState,
      "id" | "updatedAt" | "familiesCount" | "productsCount"
    >,
  ) => Promise<CategoryState>;
  updateCategory: (
    id: string,
    category: Partial<CategoryState>,
  ) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  // Family Actions
  addFamily: (
    family: Omit<FamilyState, "id" | "updatedAt">,
  ) => Promise<FamilyState>;
  updateFamily: (id: string, family: Partial<FamilyState>) => Promise<void>;
  deleteFamily: (id: string) => Promise<void>;
  // Product Actions
  addProduct: (
    product: Omit<ProductState, "id" | "updatedAt">,
  ) => Promise<ProductState>;
  updateProduct: (id: string, product: Partial<ProductState>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  duplicateProduct: (id: string) => Promise<void>;
  // Reset helper
  resetData: () => void;
}

const ProductsContext = createContext<ProductsContextType | undefined>(
  undefined,
);

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductsProvider");
  }
  return context;
}

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<CategoryState[]>([]);
  const [families, setFamilies] = useState<FamilyState[]>([]);
  const [products, setProducts] = useState<ProductState[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch categories from live backend
  const loadCategories = async (
    search = "",
    status = "all",
    sortBy = "newest",
  ) => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({ search, status, sortBy }).toString();
      const res = await fetch(`/api/admin/product-categories?${query}`);

      if (!res.ok) {
        throw new Error(`Error ${res.status}`);
      }

      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories:", err);
      toast.error("Failed to load categories from the server.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch product families from live backend
  const loadFamilies = async (categoryId = "") => {
    try {
      const query = categoryId ? `?categoryId=${categoryId}` : "";
      const res = await fetch(`/api/admin/product-families${query}`);
      if (!res.ok) {
        throw new Error(`Error ${res.status}`);
      }
      const data = await res.json();
      setFamilies(data);
    } catch (err) {
      console.error("Failed to load families:", err);
      toast.error("Failed to load families from the server.");
    }
  };

  // Fetch product variants from live backend
  const loadProducts = async (familyId = "") => {
    try {
      const query = familyId ? `?familyId=${familyId}` : "";
      const res = await fetch(`/api/admin/product-variants${query}`);
      if (!res.ok) {
        throw new Error(`Error ${res.status}`);
      }
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Failed to load products:", err);
      toast.error("Failed to load products from the server.");
    }
  };

  // Initialize and load backend data on mount
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([loadCategories(), loadFamilies(), loadProducts()]);
      setIsLoading(false);
    };
    init();
  }, []);

  // CATEGORY ACTIONS
  const addCategory = async (
    category: Omit<
      CategoryState,
      "id" | "updatedAt" | "familiesCount" | "productsCount"
    >,
  ) => {
    try {
      const res = await fetch("/api/admin/product-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(category),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error (${res.status})`);
      }

      const newCat = await res.json();
      setCategories((prev) => [newCat, ...prev]);
      toast.success("Category created successfully.");
      return newCat;
    } catch (err: any) {
      console.error("Failed to create category:", err);
      toast.error(err.message || "Failed to create category.");
      throw err;
    }
  };

  const updateCategory = async (
    id: string,
    category: Partial<CategoryState>,
  ) => {
    try {
      const res = await fetch(`/api/admin/product-categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(category),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error (${res.status})`);
      }

      const updatedCat = await res.json();
      setCategories((prev) =>
        prev.map((cat) => (cat.id === id ? updatedCat : cat)),
      );
      toast.success("Category updated successfully.");
    } catch (err: any) {
      console.error("Failed to update category:", err);
      toast.error(err.message || "Failed to update category.");
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/product-categories/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error (${res.status})`);
      }

      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      toast.success("Category deleted successfully.");
    } catch (err: any) {
      console.error("Failed to delete category:", err);
      toast.error(err.message || "Failed to delete category.");
      throw err;
    }
  };

  // FAMILY ACTIONS
  const addFamily = async (family: Omit<FamilyState, "id" | "updatedAt">) => {
    try {
      const res = await fetch("/api/admin/product-families", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(family),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error (${res.status})`);
      }

      const newFam = await res.json();
      setFamilies((prev) => [...prev, newFam]);
      toast.success("Family series created successfully.");
      return newFam;
    } catch (err: any) {
      console.error("Failed to create family:", err);
      toast.error(err.message || "Failed to create family series.");
      throw err;
    }
  };

  const updateFamily = async (id: string, family: Partial<FamilyState>) => {
    try {
      const res = await fetch(`/api/admin/product-families/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(family),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error (${res.status})`);
      }

      const updatedFam = await res.json();
      setFamilies((prev) =>
        prev.map((fam) => (fam.id === id ? updatedFam : fam)),
      );
      toast.success("Family series updated successfully.");
    } catch (err: any) {
      console.error("Failed to update family:", err);
      toast.error(err.message || "Failed to update family series.");
      throw err;
    }
  };

  const deleteFamily = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/product-families/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error (${res.status})`);
      }

      setFamilies((prev) => prev.filter((fam) => fam.id !== id));
      toast.success("Family series deleted successfully.");
    } catch (err: any) {
      console.error("Failed to delete family:", err);
      toast.error(err.message || "Failed to delete family series.");
      throw err;
    }
  };

  // PRODUCT ACTIONS
  const addProduct = async (
    product: Omit<ProductState, "id" | "updatedAt">,
  ) => {
    try {
      const res = await fetch("/api/admin/product-variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error (${res.status})`);
      }

      const newProd = await res.json();
      setProducts((prev) => [...prev, newProd]);
      toast.success("Product variant created successfully.");
      return newProd;
    } catch (err: any) {
      console.error("Failed to create product:", err);
      toast.error(err.message || "Failed to create product variant.");
      throw err;
    }
  };

  const updateProduct = async (id: string, product: Partial<ProductState>) => {
    try {
      const res = await fetch(`/api/admin/product-variants/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error (${res.status})`);
      }

      const updatedProd = await res.json();
      setProducts((prev) =>
        prev.map((prod) => (prod.id === id ? updatedProd : prod)),
      );
      toast.success("Product variant updated successfully.");
    } catch (err: any) {
      console.error("Failed to update product:", err);
      toast.error(err.message || "Failed to update product variant.");
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/product-variants/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error (${res.status})`);
      }

      setProducts((prev) => prev.filter((prod) => prod.id !== id));
      toast.success("Product variant deleted successfully.");
    } catch (err: any) {
      console.error("Failed to delete product:", err);
      toast.error(err.message || "Failed to delete product variant.");
      throw err;
    }
  };

  const duplicateProduct = async (id: string) => {
    try {
      const source = products.find((prod) => prod.id === id);
      if (!source) return;

      const dupName = `${source.name} (Copy)`;
      const dupSlug = `${source.slug}-copy`;

      // Fetch details of source variant to include specification arrays
      const detailRes = await fetch(`/api/admin/product-variants/${id}`);
      if (!detailRes.ok)
        throw new Error("Failed to load details for duplication");
      const details = await detailRes.json();

      const dupPayload = {
        ...details,
        name: dupName,
        slug: dupSlug,
        images: details.images?.map((i: any) => i.imageUrl || i) || [],
        features:
          details.features?.map((f: any) => ({
            title: f.title,
            description: f.description,
            icon: f.icon,
          })) || [],
        specifications:
          details.specifications?.map((s: any) => ({
            parameter: s.parameter,
            value: s.value,
          })) || [],
        applications:
          details.applications?.map((a: any) => ({
            title: a.title,
            icon: a.icon,
          })) || [],
        faqs:
          details.faqs?.map((f: any) => ({
            question: f.question,
            answer: f.answer,
          })) || [],
      };

      delete dupPayload.id;
      delete dupPayload.updatedAt;

      await addProduct(dupPayload);
    } catch (err: any) {
      console.error("Failed to duplicate product:", err);
      toast.error(err.message || "Failed to duplicate product.");
    }
  };

  // Reset to default
  const resetData = () => {
    window.location.reload();
  };

  return (
    <ProductsContext.Provider
      value={{
        categories,
        families,
        products,
        isLoading,
        loadCategories,
        loadFamilies,
        loadProducts,
        addCategory,
        updateCategory,
        deleteCategory,
        addFamily,
        updateFamily,
        deleteFamily,
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        resetData,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

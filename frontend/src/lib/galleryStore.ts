"use client";

import { useState, useEffect } from "react";

export interface GalleryItem {
  id: string;
  type: "image" | "video";
  title: string;
  category: "gaming" | "cultural" | "technical" | "general" | "pro-show";
  url: string;
  thumbnailUrl?: string;
  date: string;
  featured: boolean;
}

export function normalizeMediaPath(rawPath: string): string {
  if (!rawPath) return "";
  let clean = rawPath.trim();

  // If YouTube URL, convert to embed URL or keep
  if (clean.includes("youtube.com/watch?v=")) {
    const videoId = clean.split("v=")[1]?.split("&")[0];
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  } else if (clean.includes("youtu.be/")) {
    const videoId = clean.split("youtu.be/")[1]?.split("?")[0];
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  }

  // If data URL, blob URL or http/https, return directly
  if (
    clean.startsWith("data:") ||
    clean.startsWith("blob:") ||
    clean.startsWith("http://") ||
    clean.startsWith("https://")
  ) {
    return clean;
  }

  // Convert Windows backslashes \ to /
  clean = clean.replace(/\\/g, "/");

  // Strip file:// prefix
  if (clean.startsWith("file:///")) {
    clean = clean.slice(7);
  } else if (clean.startsWith("file://")) {
    clean = clean.slice(6);
  }

  // If path contains /public/, extract relative web path after /public
  if (clean.toLowerCase().includes("/public/")) {
    const publicIdx = clean.toLowerCase().indexOf("/public/");
    clean = clean.slice(publicIdx + "/public".length);
  }

  // Ensure leading slash for relative paths (e.g. "MARVEL/Video Project 4.mp4" -> "/MARVEL/Video Project 4.mp4")
  if (!clean.startsWith("/") && !/^[a-zA-Z]:\//.test(clean)) {
    clean = `/${clean}`;
  }

  return clean;
}

export const DEFAULT_GALLERY: GalleryItem[] = [
  {
    id: "gal-1",
    type: "video",
    category: "pro-show",
    title: "MacFiesta Official Cinematic Teaser",
    url: "/MARVEL/Video Project 4.mp4",
    thumbnailUrl: "/MARVEL/3025924746959430.jpg",
    date: "2026-08-24",
    featured: true,
  },
  {
    id: "gal-2",
    type: "image",
    category: "cultural",
    title: "Marvel Multiverse Night Showcase",
    url: "/MARVEL/658651514296997716.png",
    date: "2026-08-24",
    featured: true,
  },
  {
    id: "gal-3",
    type: "image",
    category: "technical",
    title: "Stark Innovation Labs & Hackathon",
    url: "/MARVEL/In a city that never sleeps, I find my….png",
    date: "2026-08-24",
    featured: true,
  },
  {
    id: "gal-4",
    type: "video",
    category: "gaming",
    title: "Thor Arena Tournament Highlights",
    url: "/MARVEL/Video Project 6.mp4",
    thumbnailUrl: "/MARVEL/4081455907815375.png",
    date: "2026-08-24",
    featured: true,
  },
];

let galleryListeners: Array<() => void> = [];
let syncChannel: BroadcastChannel | null = null;

if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  try {
    syncChannel = new BroadcastChannel("macfiesta_gallery_sync");
    syncChannel.onmessage = () => {
      galleryListeners.forEach((l) => l());
    };
  } catch { }
}

function notifyGalleryListeners() {
  galleryListeners.forEach((l) => l());
  if (syncChannel) {
    try {
      syncChannel.postMessage("updated");
    } catch { }
  }
}

export function getGalleryItems(): GalleryItem[] {
  if (typeof window === "undefined") return DEFAULT_GALLERY;
  try {
    const saved = localStorage.getItem("macfiesta_gallery_items");
    return saved ? JSON.parse(saved) : DEFAULT_GALLERY;
  } catch {
    return DEFAULT_GALLERY;
  }
}

export function saveGalleryItems(items: GalleryItem[]): void {
  const normalized = items.map((i) => ({
    ...i,
    url: normalizeMediaPath(i.url),
    thumbnailUrl: i.thumbnailUrl ? normalizeMediaPath(i.thumbnailUrl) : undefined,
  }));
  try {
    localStorage.setItem("macfiesta_gallery_items", JSON.stringify(normalized));
  } catch { }
  notifyGalleryListeners();
}

export function addGalleryItem(item: Omit<GalleryItem, "id" | "date">): GalleryItem {
  const current = getGalleryItems();
  const newItem: GalleryItem = {
    ...item,
    url: normalizeMediaPath(item.url),
    thumbnailUrl: item.thumbnailUrl ? normalizeMediaPath(item.thumbnailUrl) : undefined,
    id: `gal-${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
  };
  saveGalleryItems([newItem, ...current]);
  return newItem;
}

export function updateGalleryItem(updatedItem: GalleryItem): void {
  const current = getGalleryItems();
  const updated = current.map((i) =>
    i.id === updatedItem.id
      ? {
          ...updatedItem,
          url: normalizeMediaPath(updatedItem.url),
          thumbnailUrl: updatedItem.thumbnailUrl ? normalizeMediaPath(updatedItem.thumbnailUrl) : undefined,
        }
      : i
  );
  saveGalleryItems(updated);
}

export function deleteGalleryItem(id: string): void {
  const current = getGalleryItems();
  const updated = current.filter((i) => i.id !== id);
  saveGalleryItems(updated);
}


export function useGalleryItems() {
  const [items, setItems] = useState<GalleryItem[]>(DEFAULT_GALLERY);

  const refresh = () => {
    setItems(getGalleryItems());
  };

  useEffect(() => {
    refresh();

    const handleUpdate = () => refresh();
    galleryListeners.push(handleUpdate);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "macfiesta_gallery_items") {
        refresh();
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorage);
    }

    return () => {
      galleryListeners = galleryListeners.filter((l) => l !== handleUpdate);
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", handleStorage);
      }
    };
  }, []);

  return {
    items,
    refresh,
    addItem: addGalleryItem,
    updateItem: updateGalleryItem,
    deleteItem: deleteGalleryItem,
    saveItems: saveGalleryItems,
  };

}

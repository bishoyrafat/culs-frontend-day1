// Business logic — calls data.js, manages localStorage state.
// No DOM access.

import { loadJSON } from "./data.js"

export async function fetchHerbList() {
  return loadJSON("data/herbs.json")
}

export async function fetchHerb(id) {
  // Only plain ids like "basil" become file names.
  if (!/^[a-z-]+$/.test(id)) {
    throw Object.assign(new Error(`Not a herb id: ${id}`), { status: 404 })
  }
  return loadJSON(`data/${id}.json`)
}

// --- Favourites ---

export function getFavourites() {
  try {
    const stored = JSON.parse(localStorage.getItem("favourites") || "[]")
    // Filter out any null / undefined values that may have been stored by
    // a previous bug, and re-save immediately so the storage stays clean.
    const clean = Array.isArray(stored) ? stored.filter((id) => typeof id === "string" && id) : []
    if (clean.length !== stored.length) saveFavourites(clean)
    return clean
  } catch {
    return []
  }
}

function saveFavourites(ids) {
  try {
    localStorage.setItem("favourites", JSON.stringify(ids))
  } catch {
    // localStorage may be blocked in some environments; silently ignore.
  }
}

export function isFavourite(id) {
  return getFavourites().includes(id)
}

export function toggleFavourite(id) {
  if (typeof id !== "string" || !id) return false
  const favs = getFavourites()
  const index = favs.indexOf(id)
  if (index === -1) {
    favs.push(id)
  } else {
    favs.splice(index, 1)
  }
  saveFavourites(favs)
  return favs.includes(id)
}

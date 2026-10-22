// Entry point — wires data, services and render together.
// Owns DOM references, event listeners and page-level logic.

import { problem } from "./js/data.js"
import { fetchHerbList, fetchHerb, getFavourites, isFavourite, toggleFavourite } from "./js/services.js"
import { element, card, herbDetails, backLink, favItem } from "./js/render.js"

// --- DOM references ---

const list = document.querySelector("#herbs-list")
const count = document.querySelector(".count")
const searchInput = document.querySelector("#search")
const noResults = document.querySelector(".no-results")
const herbPage = document.querySelector("#herb-page")
const favBtn = document.querySelector("#fav-btn")
const favCount = document.querySelector("#fav-count")
const favDialog = document.querySelector("#fav-dialog")
const favList = document.querySelector("#fav-list")
const favEmpty = document.querySelector(".fav-empty")
const favClose = document.querySelector("#fav-close")
const homeSections = [...document.querySelectorAll("main > section")]
  .filter((section) => section !== herbPage)
const siteTitle = document.title

// --- Favourites count badge ---

function updateFavCount() {
  const n = getFavourites().length
  favCount.textContent = n
  favCount.hidden = n === 0
}

// Update the star on a card after it is toggled from the dialog.
function updateStarOnCard(id, pressed) {
  const star = list.querySelector(`[data-herb-id="${id}"] .star`)
  if (star) {
    star.setAttribute("aria-pressed", String(pressed))
    star.setAttribute("aria-label", pressed
      ? `Remove ${id} from favourites`
      : `Add ${id} to favourites`)
  }
}

// --- Herb list ---

function filterCards(term) {
  const query = term.trim().toLowerCase()
  const cards = list.querySelectorAll(".card")
  let visible = 0

  cards.forEach((c) => {
    const match = !query || c.textContent.toLowerCase().includes(query)
    c.hidden = !match
    if (match) visible++
  })

  noResults.hidden = visible > 0
}

function onStar(herb, star) {
  const nowFav = toggleFavourite(herb.id)
  star.setAttribute("aria-pressed", String(nowFav))
  star.setAttribute("aria-label", nowFav
    ? `Remove ${herb.name} from favourites`
    : `Add ${herb.name} to favourites`)
  updateFavCount()
}

async function showHerbs() {
  try {
    const herbs = await fetchHerbList()
    list.replaceChildren(...herbs.map((h) => card(h, { starred: isFavourite(h.id), onStar })))
    count.textContent = `${herbs.length} herbs grow here.`
  } catch (error) {
    count.textContent = problem(error, "The list of herbs is missing.")
  }
}

// --- Single herb page ---

function showView(herbView) {
  herbPage.hidden = !herbView
  homeSections.forEach((section) => { section.hidden = herbView })
}

async function showHerb(id) {
  try {
    const herb = await fetchHerb(id)
    herbPage.replaceChildren(...herbDetails(herb))
    document.title = `${herb.name} | ${siteTitle}`
  } catch (error) {
    const heading = element("h1", "", "Herb not found")
    heading.tabIndex = -1
    herbPage.replaceChildren(
      heading,
      element("p", "", problem(error, `We don't grow "${id}" here.`)),
      backLink(),
    )
    document.title = `Herb not found | ${siteTitle}`
  }
}

async function route() {
  const id = decodeURIComponent(location.hash.slice(1))
  const target = id ? document.getElementById(id) : null

  if (!id || target) {
    showView(false)
    document.title = siteTitle
    target?.scrollIntoView()
    return
  }

  showView(true)
  herbPage.replaceChildren(element("p", "", "Loading…"))
  await showHerb(id)
  herbPage.querySelector("h1")?.focus()
  window.scrollTo(0, 0)
}

// --- Favourites dialog ---

function onRemove(herb, li) {
  toggleFavourite(herb.id)
  updateStarOnCard(herb.id, false)
  updateFavCount()
  li.remove()
  favEmpty.hidden = favList.children.length > 0
}

async function openFavourites() {
  const ids = getFavourites()
  favEmpty.hidden = ids.length > 0
  favList.replaceChildren()

  if (ids.length > 0) {
    const herbs = await Promise.all(
      ids.map((id) =>
        fetchHerb(id).catch(() => ({ id, name: id, latin: "", use: "Data unavailable." }))
      )
    )
    favList.replaceChildren(...herbs.map((h) => favItem(h, { onRemove })))
  }

  favDialog.showModal()
}

// --- Event wiring ---

searchInput.addEventListener("input", () => filterCards(searchInput.value))

favBtn.addEventListener("click", openFavourites)
favClose.addEventListener("click", () => favDialog.close())
favDialog.addEventListener("click", (e) => {
  if (e.target === favDialog) favDialog.close()
})
window.addEventListener("hashchange", route)

// --- Boot ---

showHerbs()
route()
updateFavCount()

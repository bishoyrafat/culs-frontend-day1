# GROUP MEMBERS
- Aziz Bishoy Raafat Fares
- Soliman Ahmed

---

# The Little Herb Garden

A single-page web application that lets you browse, read about, search and favourite herbs from the kitchen garden.

Built for the **Frontend Development** course (Days 1–3) at CULS Prague.

---

## What you need

- a GitHub account
- Git
- an editor
- a browser (Firefox recommended)
- [Node.js](https://nodejs.org/) (the LTS version), which brings `npx`

---

## Get your copy

1. **Fork** this repository to your GitHub account.
2. **Clone your fork**, not this repository:

   ```sh
   git clone https://github.com/<your-name>/culs-frontend-day1.git
   cd culs-frontend-day1
   ```

---

## Run it

Start a local web server in the project folder:

```sh
npx serve
```

The first time, `npx` asks whether to install `serve`. Answer `y`.

Then open the address it prints, usually <http://localhost:3000>.  
Stop the server with `Ctrl+C`.

> Do not open `index.html` by double-clicking it. A `file://` page is not the Web — `fetch()` will not work.

---

## Features

| Feature | How it works |
| ------- | ------------ |
| **Herb cards** | `data/herbs.json` is loaded with `fetch()` on startup; one card per herb |
| **Herb detail page** | `#basil` in the URL loads `data/basil.json` and builds the page with JavaScript — no extra HTML file |
| **Search** | Filters cards live on every keystroke; no page reload |
| **Favourites** | Star any herb to save it; persisted in `localStorage` so it survives a refresh |
| **Favourites popup** | The ⭐ Favourites button in the nav opens a `<dialog>` listing saved herbs |
| **Error handling** | Unknown herbs, missing files and a missing server each show a readable message |
| **Keyboard accessible** | Every card name and star button is reachable and usable with the keyboard alone |

---

## Project structure

```text
index.html      the only HTML page
style.css       all styles
app.js          entry point — wires modules together, owns DOM references and events

js/
├── data.js     raw HTTP: loadJSON(), problem()
├── services.js business logic: fetchHerbList(), fetchHerb(), favourites (localStorage)
└── render.js   pure DOM building: card(), herbDetails(), favItem(), …

data/
├── herbs.json  list of all herbs shown on the home page
├── basil.json
├── chamomile.json
└── …           one file per herb

images/
├── logo.svg
└── garden.svg
```

### Module dependencies

```
data.js      →  (nothing — no imports)
services.js  →  data.js
render.js    →  (nothing — receives callbacks instead of importing)
app.js       →  data.js · services.js · render.js
```

`render.js` is kept completely isolated: it receives data and callbacks as arguments and never calls `fetch()` or `localStorage` itself.

---

## How the page works

`index.html` is the only page. The fragment (`#`) in the URL decides what is shown:

| URL | What happens |
| --- | ------------ |
| `/` or `/#herbs` | home page with all herb cards |
| `/#basil` | herb detail page, loaded from `data/basil.json` |
| `/#visit`, `/#about` | scrolls to that section on the home page |

The `route()` function in `app.js` runs on every `hashchange` event and on load. It checks whether the fragment matches a section ID on the page; if not, it treats it as a herb ID and calls `fetchHerb()`.

---

## The data format

`data/herbs.json` — the list shown on the home page:

```json
[
  {
    "id": "basil",
    "name": "Basil",
    "latin": "Ocimum basilicum",
    "use": "Tomatoes, pesto and anything summery.",
    "life": "annual"
  }
]
```

`data/<id>.json` — the detail page for one herb, e.g. `data/basil.json`:

```json
{
  "name": "Basil",
  "latin": "Ocimum basilicum",
  "use": "Tomatoes, pesto and anything summery.",
  "life": "annual",
  "about": "An aromatic herb with soft, glossy leaves. It loves warmth and sun."
}
```

| field   | meaning |
| ------- | ------- |
| `id`    | lowercase letters and hyphens only; used as the file name and the `#` in the URL |
| `name`  | common name |
| `latin` | botanical name |
| `use`   | one-sentence description of what it is good for |
| `life`  | `annual` or `perennial` |
| `about` | longer description shown on the herb's detail page |

**To add a herb:** add an entry to `data/herbs.json` and create `data/<id>.json` with the same `id`.

---

## Application state

| State | Where it lives | Notes |
| ----- | -------------- | ----- |
| Current view (home / herb) | URL fragment (`location.hash`) | Shareable and survives reload |
| Herb list | Fetched from `data/herbs.json` on load | Re-fetched on hard reload |
| Favourites | `localStorage` key `"favourites"` (array of ids) | Survives reload; gracefully ignored if blocked |
| Search term | DOM input value | Cleared on reload |

---

## Network communication

The app uses `fetch()` for all data. It never sends data to a server — all requests are GET requests for local JSON files.

| Request | When |
| ------- | ---- |
| `data/herbs.json` | on page load |
| `data/<id>.json` | when navigating to `#<id>` or opening the Favourites dialog |

If a request fails the app shows a human-readable message rather than leaving the page empty.

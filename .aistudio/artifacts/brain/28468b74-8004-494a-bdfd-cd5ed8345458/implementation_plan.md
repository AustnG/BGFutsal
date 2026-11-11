# Client-Side Hash Routing & Direct Page URLs

Provide each top-level section of the BGFutsal League application with its own shareable URL (`/#/home`, `/#/seasons`, `/#/about`, `/#/rules`) that works seamlessly with GitHub Pages static hosting, browser back/forward navigation, and direct bookmarking.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed in Phase 1:
> - **URL Format**: Hash-based routing (`https://your-site.com/#/seasons`) chosen over path-based routing. This guarantees 100% reliability on GitHub Pages without requiring server rewrites or 404 redirect hacks.
> - **URL Scope**: Clean top-level pages (`/#/home`, `/#/seasons`, `/#/about`, `/#/rules`). Deep query params are omitted to keep shared links short, human-friendly, and simple to text or paste.

---

### 1. Overview & Core Concept

- **What It Does**: Synchronizes the app's `activeTab` state with the browser's URL hash (`window.location.hash`). When someone clicks a navigation tab, the URL updates instantly. When someone navigates via browser Back or Forward buttons, or clicks a shared direct link like `https://austin-greer.github.io/bgfutsal/#/seasons`, the site automatically opens directly into the Seasons Hub.
- **Target Audience**: League organizers, team captains, and players who want to bookmark or share direct links to standings, fixtures, league rules, or the home page.
- **Key Value**: Direct linkability without disrupting existing GitHub Pages hosting or breaking any existing table state or data sync.

---

### 2. User Experience & Navigation Flow

- **Direct URL Loading**:
  - Visiting root URL (`/` or `/#/` or `/#/home`) opens the **Home View**.
  - Visiting `/#/seasons` directly opens the **Seasons Hub** (standings, schedule, bracket).
  - Visiting `/#/about` directly opens the **About Page** (venue, court details, history).
  - Visiting `/#/rules` directly opens the **Rules & FAQs Page**.
  - Any unrecognized hash gracefully defaults to `/#/home`.
- **Top Bar & Footer Integration**:
  - Top navigation links (`Home`, `Seasons`, `About`, `Rules & FAQs`) and mobile navigation bar items update the browser hash on click.
  - Footer navigation links and home shortcuts (e.g. "Open Seasons Hub →") update the hash to keep address bar and view perfectly in sync.
- **Browser History & Back/Forward Support**:
  - Clicking tabs pushes or replaces history state cleanly using standard `window.location.hash` and a `hashchange` event listener.
  - Users can press their browser's Back and Forward buttons to navigate between visited sections naturally.
- **Visual Continuity**:
  - The navbar active underline and mobile tab indicators highlight the active route instantaneously with zero flicker or reload delay.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Hash-Based URLs (`/#/seasons`) vs. Path-Based URLs (`/seasons`)**:
  - *Chosen Approach*: Hash routing (`window.location.hash`).
  - *Why*: GitHub Pages is a static web server without URL rewriting. Path-based routing requires a complex `404.html` redirect script that causes an awkward flash on page load. Hash routing is 100% native, instant, and guaranteed never to trigger 404 errors on GitHub Pages.
  - *Alternatives Considered*: HTML5 pushState with a custom `404.html` fallback. Rejected because it introduces external redirect scripts and can fail if repository base paths change.
- **Decision 2: Lightweight Native Hook vs. Heavy External Router Package**:
  - *Chosen Approach*: Clean, zero-dependency browser hash listener integrated into the existing `activeTab` state.
  - *Why*: The application has exactly 4 well-defined views (`home`, `seasonHub`, `about`, `rules`). A native hook (`window.addEventListener('hashchange', ...)`) is lightweight, fast, adds zero bundle bloat, and avoids complex router boilerplate.

---

### 4. Technical Architecture & Navigation Strategy

```
┌────────────────────────────────────────────────────────┐
│                   Browser Address Bar                  │
│       https://austin-greer.github.io/bgfutsal/#/seasons │
└───────────────────────────┬────────────────────────────┘
                            │
               window.location.hash ('#/seasons')
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                   App Component State                  │
│            • Reads hash on initial mount               │
│            • Listens to 'hashchange' events            │
│            • Synchronizes `activeTab` ('seasonHub')    │
│            • Updates hash on tab select / navigate     │
└─────────────┬──────────────────────────┬───────────────┘
              │                          │
              ▼                          ▼
┌───────────────────────────┐  ┌─────────────────────────┐
│     Navbar & Footer       │  │   Active View Component │
│ Active Tab Highlight Sync │  │   (Home / Seasons /     │
│   • Home (/#/home)        │  │    About / Rules)       │
│   • Seasons (/#/seasons)  │  │                         │
│   • About (/#/about)      │  │                         │
│   • Rules (/#/rules)      │  │                         │
└───────────────────────────┘  └─────────────────────────┘
```

#### Route Mapping Contract
| Route Hash | MainNavTab | Component Rendered | Default View |
| :--- | :--- | :--- | :--- |
| `#/home` or `#/` | `'home'` | `<HomeView />` | Spotlight, Standings preview, Latest News |
| `#/seasons` | `'seasonHub'` | `<SeasonHubView />` | Standings, Schedule, Playoff bracket, Honors |
| `#/about` | `'about'` | `<AboutView />` | Arena facility, league structure, contacts |
| `#/rules` | `'rules'` | `<RulesFaqView />` | Handbook, 4-second clock, fouls, FAQs |

#### Implementation Steps
1. **Initialize Active Tab from URL Hash**:
   Read `window.location.hash` during initial state initialization (`#/seasons` -> `'seasonHub'`).
2. **Listen to Browser `hashchange`**:
   Add a `useEffect` in `App.tsx` listening to `window.addEventListener('hashchange', ...)` so browser Back/Forward buttons switch the active view.
3. **Synchronize Tab Clicks to Hash**:
   When `handleSelectTab(tab)` is invoked in `Navbar` or via in-page navigation links, update `window.location.hash` (e.g. `window.location.hash = '/seasons'`).
4. **Verification**:
   Verify direct loading of `/#/seasons`, `/#/about`, `/#/rules`, `/#/home`, browser Back/Forward buttons, and ensure zero TypeScript or build issues.

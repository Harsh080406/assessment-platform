# Master UI Refinement Prompt — AuraPath (Pathfinder)

Based on a full walkthrough of the live build (Home, The 4 Quests, Parent vs You). This is written to be handed to a designer/developer or pasted into an AI dev tool as a refinement brief.

---

## 1. What's Working — Keep This

- Clean card grid structure (Pillars, Quest cards, Testimonial cards) — good bones, just needs polish
- The "Quest" step-based framing (Quest 01–04 with progress dots) is a strong, memorable concept for Gen Z/Alpha
- Comparison layout on "Parent vs You" (myth vs. reality) is a genuinely good format for this audience
- Sticky bottom-right "Assessment · 20 mins · Free" mini-CTA is a smart persistent nudge

---

## 2. Core Problems to Fix

**A. Stock photography breaks the "professional-minimalist" direction.**
The hero uses a generic stock photo of smiling students at a laptop. It reads as a generic ed-tech template, undercuts the "precision cognitive profiling" positioning, and doesn't match the abstract/geometric visual language the rest of the brand wants. → Replace with an abstract animated gradient-mesh or geometric illustration (see Section 4).

**B. Color palette has drifted bright/saturated and inconsistent.**
Currently: saturated periwinkle-to-pink gradient text, plus jarring pure-black full-width sections dropped between white sections (hero close, stats bar, "Start Quest" CTA, footer). This creates a choppy, high-contrast rhythm that feels more "marketing template" than calm and premium. → Move to the muted, desaturated palette below and cut the number of full-black blocks down to one per page, max.

**C. Typography is shouting.**
Nearly every headline is bold, all-caps, and oversized ("STOP GUESSING YOUR POTENTIAL," "THE 4 QUESTS TO CLARITY," "SOUND FAMILIAR?"). All-caps-everywhere removes hierarchy — when everything shouts, nothing stands out, and it reads aggressive rather than confident. → Reserve all-caps for short labels/eyebrows/tags only; headlines should use normal sentence or title case at a large size for impact instead.

**D. Inconsistent visual "voice" between sections.**
The homepage alternates between light lavender cards, black bands with neon-ish stat numbers, a scrolling marquee ticker (dated pattern, feels like a 2015 SaaS landing page), and testimonial cards — each section looks like it was designed separately. → Establish one consistent card style, one consistent section-background rhythm, and drop the marquee ticker in favor of a static or gently-animated stat strip.

**E. "Parent vs You" page mixes tones.**
Red X-badges / green check-badges plus a solid black comparison card feels like a combative "battle card" infographic style, which clashes with the calm, evidence-based positioning ("objective cognitive evidence"). → Soften to a muted rose/sage badge system on light cards instead of black-vs-white contrast blocks.

---

## 3. Refined Color Palette (apply site-wide)

Replace the current periwinkle/pink/black combination with the muted, light system below:

**Base**
- Background: `#FBFBF9`
- Surface/cards: `#FFFFFF`
- Border: `#EDEBE7`
- Text primary: `#2B2B2E`
- Text secondary: `#8A8A85`

**Primary accent — Faded Periwinkle** `#A9B4E8` (was the bright `#7B7FE8`-style purple) — buttons, active tab, progress dots
**Secondary accent — Sage Mist** `#A9D8C6` — success/validated states, "verified" badges
**Caution — Warm Sand** `#E8C08C` — used for "myth/legacy advice" badges instead of red
**Error/contrast (sparingly)** — Dusty Rose `#E3A0A0` instead of the harsh bright red X-badge currently used

**Dark sections** (use once per page maximum, e.g. only the final CTA band): `#17171A` background, `#EDEDEB` text, accents shift to `#7C89CC` / `#7FBFA7` so they read softly against dark rather than glowing.

Drop the pink-gradient text treatment entirely — gradient text on a headline reads busy; use solid periwinkle for the emphasized phrase instead (e.g., "Calibrate Your Trajectory" in solid `#8E9BDD`, not a purple-to-pink gradient).

---

## 4. Hero Section Redesign

- Remove the stock photo of students entirely.
- Replace with a **soft animated gradient-mesh background** (periwinkle → sage, heavily blurred, low opacity) OR a custom abstract illustration of a compass/pathway motif (ties to the existing compass logo) rendered in flat line-art, single-tint style.
- Headline: drop to title case, one bold weight, no gradient — e.g. "Stop guessing your potential. **Calibrate your trajectory.**" with only the second sentence in the accent color, not full caps.
- Keep the two-button CTA pattern (primary filled + secondary outline "Watch Video") — this part works well.
- Move the 10K+ / 500+ / 50+ stat row into a lighter, card-based strip rather than plain text directly on the photo (won't be needed once photo is removed, but keep it as a clean standalone stat bar with subtle dividers).

---

## 5. Section-by-Section Fixes

**Stat/marquee ticker (scrolling black bar)**
Remove the auto-scrolling marquee — it's a dated pattern and adds visual noise. Replace with a static, evenly-spaced row of 3–4 key differentiators on a light or single muted-tone background, optionally with a very slow fade-in per item on scroll instead of continuous horizontal scroll.

**Pillar cards / Quest cards**
Good structure — just apply the new palette: swap the icon-badge backgrounds to soft periwinkle/sage tints instead of the current lavender, unify the top accent bar color (currently mixes purple and green inconsistently — assign accent colors deliberately, e.g., periwinkle for "process" pillars, sage for "trust/privacy" pillars).

**Black stats/CTA bands ("48,290+ Students Guided," "Start Quest 01 Today")**
Keep at most one dark band per page for contrast — recommend keeping it only at the final bottom CTA before the footer. Convert the mid-page black stat band into a light card-grid section instead, consistent with the rest of the page.

**Testimonial cards ("Sound Familiar?")**
Solid section, just restyle borders/shadows to match the softer palette — replace the small purple top-accent bar with a thin sage or periwinkle line only on hover, not static, to reduce visual noise at rest.

**Parent vs You — comparison cards**
- Replace red "✕ Legacy Advice" badge with a muted warm-sand badge, softer icon (no harsh X)
- Replace the solid black "2026+ Validated Reality" card with a white/light card that uses a sage-tinted left border or header strip instead of full black-fill — keeps the comparison legible without the combative red/black contrast
- Keep the three-tab selector (Default Trap / Salary Fallacy / Marks Dogma) — good pattern, just restyle the active-tab fill to the new periwinkle tone

**Footer**
Currently pure black with white text — fine as the one dark anchor of the page, but tone the black down to the dark-mode neutral (`#17171A`) rather than true black (`#000000`) for consistency with the rest of the softened palette.

---

## 6. Typography Rules Going Forward

- Headlines: Title Case or sentence case, one consistent weight (Semibold, not Black/900), large size for impact — not all-caps
- Reserve ALL-CAPS strictly for: eyebrow labels ("PILLAR 01," "QUEST 01," "REAL DILEMMAS") and button micro-labels — nowhere else
- Body copy: keep as-is, it's legible and appropriately sized
- Stat numbers ("48,290+", "99.4%"): fine to keep bold and large, but switch color from bright white-on-black to the new dark-neutral-on-light or sage/periwinkle accent so they don't feel like a separate "loud" module

---

## 7. Motion / Micro-interactions to Add

- Hero background: slow drifting gradient mesh (60–90s loop) instead of a static photo
- Stat strip: soft fade/count-up on scroll-into-view (replace the marquee scroll)
- Quest progress dots: smooth fill transition between steps (1/4 → 2/4, etc.)
- Cards: subtle lift (2–4px translateY + soft shadow increase) on hover, not the current flat state
- Comparison cards on Parent vs You: gentle cross-fade when switching between the three tabs (Default Trap / Salary Fallacy / Marks Dogma) instead of an instant swap

---

## 8. One-Line Master Prompt (for AI design/dev tools)

> "Refine this psychometric assessment website (AuraPath) by removing the stock-photo hero and pink-gradient headline text, replacing them with a soft periwinkle-to-sage animated gradient-mesh background and solid-color title-case headlines; desaturate the entire palette to a muted near-white base (#FBFBF9) with dusty periwinkle (#A9B4E8) and sage (#A9D8C6) accents; eliminate the scrolling marquee ticker and reduce full-black sections to a single dark CTA band per page using a softened near-black (#17171A) instead of pure black; restyle the 'Parent vs You' comparison cards to use warm-sand and sage badges instead of red/black battle-card contrast; and keep all-caps typography limited to short eyebrow labels only, with headlines in a single confident weight and title case instead of shouting all-caps."

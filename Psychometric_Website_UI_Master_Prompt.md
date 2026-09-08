# Master UI Design Prompt — Psychometric Assessment Website

Use this as a single brief for a designer, or paste it into an AI design/dev tool (Figma AI, v0, Claude, etc.) to generate the interface.

---

## 1. Design Direction (one paragraph to lead with)

Design a **professional-minimalist, trust-first web app** for an online psychometric assessment platform, styled to feel credible to institutions (IDEX, clients, evaluators) while feeling calm, modern, and non-intimidating to Gen Z and Gen Alpha test-takers. Think "clinical clarity meets soft digital calm" — closer to Headspace, Notion, and Linear than to a corporate HR portal. No clutter, no stock-photo corporate feel, generous whitespace, soft depth instead of hard shadows, and motion that feels alive but never distracting during a test.

---

## 2. Color Palette (light, muted, low-saturation — balanced for both generations)

A **very light neutral base** with **desaturated, powdery accents** — nothing neon or high-chroma. The goal is a soft, airy, "paper and mist" feel rather than a bold branded look. Colors should feel almost pastel, closer to washed watercolor than solid app-icon colors.

**Base / Neutrals**
- Background (light mode): `#FBFBF9` (near-white, warm paper tone)
- Surface / cards: `#FFFFFF`
- Border / dividers: `#EDEBE7`
- Text primary: `#2B2B2E` (soft charcoal, not pure black)
- Text secondary: `#8A8A85`

**Primary Accent — "Faded Periwinkle"**
- `#A9B4E8` (buttons, active states, progress bars) — muted, dusty blue-violet, not saturated indigo
- Hover/pressed: `#8E9BDD` (slightly deeper, still soft)
- Tint (backgrounds, chips): `#F1F3FC`

**Secondary Accent — "Sage Mist"**
- `#A9D8C6` (success states, completed steps, positive indicators) — muted sage-mint, not bright teal
- Tint: `#F0F8F4`

**Alert / Caution (used very sparingly, still muted)**
- Warm sand `#E8C08C` for warnings (e.g., "time remaining")
- Dusty rose `#E3A0A0` for errors only — never a harsh red

**Dark mode variant**
- Background: `#17171A`, Surface: `#1F1F23`, Border: `#2C2C30`, Text primary: `#EDEDEB`, accents shift slightly deeper (`#7C89CC` periwinkle, `#7FBFA7` sage) so they don't glow against dark backgrounds.

Rule of thumb: **92–94% neutral, 5% primary accent, 1–2% secondary/alert.** Every accent color should look like it could be washed out in direct sunlight — soft enough to sit next to institutional/report content without competing for attention, but still distinct enough to guide the eye for younger users.

---

## 3. Typography

- Headings: **Satoshi** or **General Sans** (geometric, friendly, currently popular with Gen Z/Alpha design trends) — Semibold/Bold
- Body: **Inter** or **Manrope** — Regular/Medium, 16px base, 1.6 line-height for readability during long test screens
- Numerals for scores/timers: tabular/monospaced variant (e.g., Inter Tight) so digits don't jitter during countdowns

---

## 4. Background Treatment

- **No stock photography.** Use a subtle **animated gradient mesh** (periwinkle → sage, very low saturation, heavily blurred so it reads almost as texture rather than color) fixed to the top-left or full viewport behind a frosted-glass (`backdrop-blur`) surface layer — this is the current "premium SaaS" look Gen Z/Alpha associate with quality apps (Linear, Arc, Raycast style), just faded down instead of vibrant.
- Landing/marketing pages: soft blurred geometric shapes (circles/blobs) at low opacity (10–15%) drifting very slowly (60–90s loop, barely perceptible) — adds life without distracting or looking "bright."
- Test-taking screens: **flat, static, distraction-free background** (plain `#FBFBF9`) — no gradients or motion here, since focus is critical during the actual psychometric test.
- Dashboard/admin: light dot-grid or graph-paper texture at 3–4% opacity for a "data tool" feel.

---

## 5. Motion & Micro-interactions

Keep animation **functional, not decorative**, especially since this is an assessment tool:

- Page transitions: 200–250ms ease-out fade + 8px slide — fast, not bouncy
- Buttons: subtle scale (0.98) on press, color shift on hover, no heavy shadows
- Progress bar during test: smooth fill animation as each question completes; a small animated checkmark or pulse on submit
- Report-ready notification: gentle toast slide-in with a soft sage glow, not a jarring popup
- Loading states: skeleton screens (shimmer), never spinners alone
- Micro-celebration on test completion: a brief (under 1s), tasteful checkmark or soft particle animation in muted sage — small enough to feel rewarding, not gimmicky or "gamey"
- Respect `prefers-reduced-motion` throughout

---

## 6. Layout & Components by Page

**Landing / Marketing**
- Hero: bold headline, one-line subtext, single primary CTA ("Start Assessment"), animated gradient background
- Trust row: client/partner logos or credibility markers in muted greyscale
- 3-step "How it works" section with numbered icon cards (Register → Take Test → Get Report)

**Registration/Login**
- Centered card, max-width 420px, on the animated background
- Passwordless-friendly (OTP/email link) — lowers friction for younger users

**Test-Taking Screen**
- Minimal chrome: progress bar top, question centered, large tap targets, no sidebar clutter
- One question per screen (not long scrolling forms) — proven better completion rates with Gen Z/Alpha attention spans
- Autosave indicator ("Saved" with mint checkmark) for reassurance

**User Dashboard**
- Card-based status: "Submitted," "Under Review," "Report Ready" with soft periwinkle/sage status chips
- Report download as a prominent card with a soft shadow, not a plain link

**Admin Dashboard**
- Data-dense but organized: table view with filters, status tags, inline evaluation panel
- Sidebar navigation, dot-grid background, monospaced numerals for scores/IDs

---

## 7. Iconography & Imagery

- Line icons, 1.5px stroke, rounded caps (Phosphor Icons or Lucide) — consistent with the friendly-minimal tone
- No literal "brain" or "psychology" clichés (no lightbulbs-in-heads, no stethoscopes) — use abstract geometric motifs (dots, waveforms, layered circles) to represent "assessment" and "insight"
- Illustrations if used: flat, single-color-tint (periwinkle or sage monochrome), not full-color cartoon style

---

## 8. Accessibility & Trust Signals

- WCAG AA contrast minimum throughout (verify indigo-on-white and text colors)
- Visible focus states (2px periwinkle outline, darkened slightly for contrast) for keyboard navigation — important since this is a formal assessment tool
- Explicit "Your responses are encrypted and confidential" microcopy near test start and submission, styled as a quiet trust badge, not a scary legal wall of text

---

## 9. One-line Prompt Summary (for AI design tools)

> "Design a minimalist psychometric assessment web app with a near-white paper-toned base (#FBFBF9), a muted dusty periwinkle primary accent (#A9B4E8), a soft sage-mint secondary accent (#A9D8C6), Satoshi/Inter typography, faint low-opacity animated gradient-mesh backgrounds on marketing pages, flat distraction-free backgrounds during the actual test, gentle micro-interactions (fades, progress fills, soft sage success states), card-based dashboards, and a calm, washed-out, Linear/Notion/Headspace-inspired aesthetic that appeals to both Gen Z and Gen Alpha without ever feeling bright, neon, or corporate-grey."

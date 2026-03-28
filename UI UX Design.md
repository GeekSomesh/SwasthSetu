# Swasth Setu: UI/UX & Design System Guidelines

## 1. Design Philosophy
The platform must convey **Trust, Professionalism, and Speed**. Healthcare software often looks outdated and cluttered. Swasth Setu will feel closer to a modern fintech or premium enterprise SaaS application—clean, fast, and highly legible.

## 2. Color Palette (Top-Notch Grading)
- **Primary Brand (Trust & Health):** Deep Teal / Slate Blue.
  - `Primary-600`: `#0f766e` (Buttons, Active States)
  - `Primary-900`: `#134e4a` (Brand Logo, Dark accents)
- **Backgrounds (Clean & Crisp):**
  - `Bg-Base`: `#f8fafc` (The main application background - highly soothing light gray)
  - `Bg-Surface`: `#ffffff` (Card backgrounds, making content pop)
- **Text & Hierarchy:**
  - `Text-High`: `#0f172a` (Headlines, Patient Names)
  - `Text-Medium`: `#475569` (Subtitles, Metadata, Timestamps)
- **Tags & Badges (Crucial for Timeline):**
  - **Prescriptions:** Soft indigo background (`#e0e7ff`) with dark indigo text.
  - **Lab Reports:** Soft emerald background (`#d1fae5`) with dark emerald text.
  - **Scans/X-Rays:** Soft amber background (`#fef3c7`) with dark amber text.

## 3. Typography
- **Primary Font:** **Inter** or **Plus Jakarta Sans**. Both are highly legible, modern geometric sans-serifs that look instantly premium on screens.
- Avoid using pure black (`#000000`) for text; use dense grays (`#0f172a`) to reduce eye strain for doctors looking at screens all day.

## 4. Core Components & Interactions

### A. The "Patient Timeline" (The most important UI piece)
- **Layout:** A vertical feed (similar to modern social or project management feeds, but clinical).
- **The Record Card:** 
  - Each item is a white card with subtle shadows (`box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1)`).
  - Top row: Large category badge (e.g., 💊 Prescription), Date (Right aligned).
  - Middle: Source Tags 🏥 `City Clinic` • 👨‍⚕️ `Dr. Gupta`.
  - Bottom: A thumbnail of the document and a **"View Full Document"** button.
- **Interaction:** Clicking "View Full Document" does NOT open a new tab. It opens a sleek, fast **Slider/Drawer** from the right side of the screen with a built-in PDF/Image viewer, allowing the doctor to quickly glance and close.

### B. Filter Bar
- A beautiful, pill-shaped horizontal scrolling bar at the top of the timeline.
- Micro-interaction: When a filter (e.g., "Lab Reports") is clicked, it highlights smoothly, and the timeline transitions using Framer Motion (fade slide up) to show the new filtered set.

### C. Consent Flow (Receptionist UI)
- To avoid making auth feel chore-like, use a clean Apple-style OTP input box.
- Include a 60-second animated progress ring for "Resend OTP".
- Use toast notifications (e.g., Sonner or React Hot Toast) sliding in from the bottom right to confirm "Consent Granted Successfully".

## 5. Spacing & Grids
- Use a strict **8-point grid system**. Elements are spaced out by 8, 16, 24, or 32 pixels. 
- High whitespace (padding) is mandatory. It prevents cognitive overload for doctors.

## 6. Accessibility & Dark Mode
- Ensure all text contrasts meet AAA standards.
- Prepare a sophisticated purely dark mode (e.g., `#020617` base) for radiologists or doctors working night shifts, turning UI surfaces to deep slate instead of blinding white.

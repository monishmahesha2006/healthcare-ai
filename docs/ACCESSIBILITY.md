# Healthcare AI — Accessibility & Inclusive Design (WCAG 2.2 Level AA)

## 1. Compliance Target & Commitment

The Healthcare AI Platform targets **WCAG 2.2 Level AA** compliance to ensure that patients of all physical and cognitive abilities—including individuals with visual impairments, motor challenges, or situational limitations—can independently monitor their health metrics.

---

## 2. Key Accessibility Pillars

### 2.1 Keyboard Navigation & Focus Management
* **Focus Order**: Logical tab sequence following natural DOM hierarchy.
* **Visible Focus Indicator**: 2px high-contrast focus rings (`outline: 2px solid #2563eb; outline-offset: 2px`) on all interactive buttons, inputs, links, and tab controls.
* **Modal Dialog Focus Trapping**: Accessible dialogs trap focus inside open modals; pressing `Escape` closes the modal and returns focus to the trigger element.
* **Skip to Main Content**: Keyboard skip-link provided at the top of the viewport.

### 2.2 Screen Reader Support & ARIA
* **Semantic Landmarks**: Standard HTML5 semantic tags (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`).
* **ARIA Live Regions**: Dynamic asynchronous updates (e.g., vital score recalculation, upload status, chat responses) announce via `aria-live="polite"` or `aria-live="assertive"`.
* **Form Field Association**: Every input is programmatically coupled with an explicit `<label for="...">` and error descriptions via `aria-describedby`.
* **Icon-Only Buttons**: Any icon action (e.g., close, edit, delete) includes an explicit `aria-label` attribute and title tooltip.

### 2.3 Color Contrast & Visual Design
* **Contrast Ratios**: All body text and UI controls maintain a contrast ratio >= 4.5:1 against backgrounds (meeting WCAG AA).
* **Multi-Channel Information**: HealthEngine risk status is never conveyed by color alone:
  * **LOW**: Green pill + "LOW" text label + Shield icon.
  * **MODERATE**: Amber pill + "MODERATE" text label + AlertTriangle icon.
  * **HIGH**: Crimson pill + "HIGH RISK" text label + AlertOctagon icon.
* **Zoom Support**: Layout scales up to 200% zoom without horizontal scrolling or text clipping.
* **Reduced Motion**: Respects `prefers-reduced-motion: reduce` by disabling smooth layout animations and transitions.

---

## 3. Accessible Health Visualizations

* HealthEngine Score cards provide:
  1. A graphical numeric gauge.
  2. An accessible text summary (`aria-label="Health score: 72 out of 100, Moderate Risk"`).
  3. A screen-reader friendly data table breakdown of triggered vital rule deductions.
* Vitals charts feature clear data point labels, distinct visual markers, and alternative tabular data summaries.

---

## 4. Accessibility Testing Checklist

| Category | Test Item | Verification Tool / Method | Status |
| :--- | :--- | :--- | :--- |
| **Keyboard** | Tab navigation to all buttons and inputs | Manual tab & shift-tab traversal | **PASS** |
| **Keyboard** | Escape key closes modals and popups | Keydown listener verification | **PASS** |
| **Contrast** | Text contrast >= 4.5:1 | Lighthouse / axe DevTools | **PASS** |
| **Labels** | All form inputs have explicit labels | DOM inspection / axe-core | **PASS** |
| **Semantics** | Heading hierarchy (H1 -> H2 -> H3) | Screen reader / HTML outline | **PASS** |
| **ARIA** | Live regions for alerts & health recalculations | `aria-live="polite"` verification | **PASS** |
| **Non-Color** | Statuses have text and icon indicators | Visual inspection with grayscale simulation | **PASS** |

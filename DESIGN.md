# Mountain Valley Lumber: Design System

Reference feel: Airbnb (warm, generous, photography-first, friendly radii), adapted to a rugged, local, small-town lumber yard. Nothing proprietary was copied.

## Brand positioning
- **Who:** Homeowners, families, and builders in and around Saguache, Colorado's San Luis Valley.
- **Promise:** Lumber and wooden homes from people down the road, plus a clear first step when you don't know where to start.
- **Personality:** Grounded · Honest · Warm

## Voice
Plain, direct, and neighborly. Short sentences with no corporate jargon. Talk about the customer's land, home, and project instead of "solutions". Never claim something John hasn't confirmed.

## Colors
| Token | Hex | Use |
|---|---|---|
| `--night` | `#13244A` | Dark sections, headings, footer (deepened from the logo blue) |
| `--blue` | `#2448A8` | Logo blue, focus rings |
| `--tan` | `#D9AD7C` | Light wood tan: eyebrows and focus rings on dark sections |
| `--brown` | `#7A4A2A` | Primary CTA, eyebrows on light (white text 7.4:1) |
| `--brown-dark` | `#5A341C` | CTA hover, text links |
| `--cream` | `#F7F2EA` | Page canvas |
| `--sawdust` | `#EBDDC8` | Alternate section surface |
| `--ink` | `#1B2130` | Body text |
| `--muted` | `#555B66` | Secondary text (AA on cream) |
| `--line` | `#DCCBB2` | Hairlines, borders |

Palette rule: navy blue + wood brown. No orange, no yellow.

## Typography
- Display: **Fraunces** (Google Fonts), weight 600, optical sizing on, tight tracking (-0.02em) at large sizes.
- Body/UI: **Public Sans**, 400 / 600.
- Scale: h1 clamp(2.4rem → 4.4rem), h2 clamp(1.9rem → 2.9rem), h3 1.3rem, body 1.0625rem / 1.6, small 0.875rem.
- Eyebrow labels: Public Sans 600, 0.8rem, uppercase, 0.12em tracking, brown (tan on dark sections).

## Shape & spacing
- Radii: 6px inputs, 10px buttons, 18px cards/images, full for pills.
- Section padding: clamp(4rem → 7.5rem) vertical. Content max width 1180px. 16px minimum side gutter on mobile.
- Shadows: one soft shadow for raised cards only (`0 18px 40px -24px rgba(31,58,46,.35)`).

## Components
- **Primary button:** brown fill, white text, 10px radius, min-height 48px.
- **Secondary button:** transparent with a 1.5px current-color border.
- **Header:** cream, sticky, with a phone link always visible on desktop.
- **Mobile action bar:** sticky bottom bar with two equal buttons (Call / Book a free call), honoring the safe-area inset.
- **Project frame:** 18px radius image, caption below with the challenge and the result.
- **Review:** large Fraunces quote, name below, no fake star ratings.

## Imagery
Real photos of the business's own builds and yard only (`/images`). Every photo has a large and a small (`-sm`) version for srcset. The logo (`images/logo.png`) is used as supplied, on its own blue tile.

## Motion
All scroll effects run from one requestAnimationFrame loop in `main.js` and are turned off under `prefers-reduced-motion`:
- Hero: photo slowly zooms and drifts; the text fades and lifts as you scroll away.
- Statement: words light up one by one as the paragraph passes through the viewport.
- Story (desktop): the image column stays pinned and crossfades between four photos as each step scrolls past. On mobile, each step has its own photo inline.
- Gallery (desktop): pinned and scrolled sideways by vertical scrolling. On mobile, it's a native swipe carousel with scroll-snap.
- Process: the connecting line fills and each step lights up as it's reached.
- Header: transparent over the hero, hides on scroll down, returns on scroll up.
- Live "Open now / Closed" status computed in America/Denver time.

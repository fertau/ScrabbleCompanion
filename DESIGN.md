# Design System — Scrabble Companion

## Product Context
- **What this is:** Spanish Scrabble word validation PWA
- **Who it's for:** Friends and family at game night
- **Space/industry:** Board game companion tools, word games
- **Project type:** Single-purpose utility app (mobile-first)

## Aesthetic Direction
- **Direction:** Cool Minimal with warm material accent
- **Decoration level:** Minimal — the Scrabble tiles are the only decorative element
- **Mood:** Clean, sharp, confident. Like a well-made modern tool with one warm, physical detail. The white background is the canvas. The wood-textured tiles are the soul.
- **Key principle:** The tiles carry all the personality. Everything else steps back.

## Typography
- **Display/Hero:** Source Sans 3 700 — clean geometric, modern utility feel
- **Body:** Source Sans 3 400/500 — consistent family, excellent readability
- **UI/Labels:** Source Sans 3 600 — same family for cohesion
- **Data/Tables:** Source Sans 3 (tabular-nums) — numbers align properly
- **Code:** JetBrains Mono
- **Loading:** Google Fonts `https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600;700&display=swap`
- **Scale:** 12px / 14px / 16px (base) / 20px / 24px / 32px / 40px

## Color
- **Approach:** Restrained — one accent family (gold/wood), semantic colors, neutral everything else
- **Background:** #FFFFFF (pure white)
- **Surface:** #F8F8F8 (result cards, input backgrounds)
- **Border:** #E0E0E0 (light gray, subtle separation)
- **Text primary:** #2C2C2C (charcoal, not pure black)
- **Text secondary:** #888888 (muted for supporting text)
- **Text tertiary:** #BBBBBB (footer, hints)
- **Tiles:** Light wood gradient — base #D4B87A to #C4A668, with subtle wood grain texture via CSS
- **Tile text:** #5C4A2E (warm dark brown, readable on wood)
- **Accent (buttons):** #2C2C2C (charcoal — buttons are confident, not flashy)
- **Valid:** #2E7D32 (green) with background #E8F5E9
- **Invalid:** #C62828 (red) with background #FFEBEE
- **RAE verified:** #1976D2 (blue) with background #E3F2FD

## Tile Design
- **Background:** CSS linear-gradient mimicking light wood: `linear-gradient(145deg, #D4B87A 0%, #C9A96A 50%, #BEAA6A 100%)`
- **Optional grain:** Subtle CSS noise or grain overlay for wood texture
- **Text:** #5C4A2E, bold, centered
- **Point value:** Small subscript, bottom-right, same color but lighter
- **Border radius:** 4px (slightly rounded, like real tiles)
- **Shadow:** `inset 0 -2px 0 rgba(0,0,0,0.1)` (subtle depth, like a physical tile)
- **Size:** 38px x 38px (result tiles), 34px x 34px (header tiles)

## Spacing
- **Base unit:** 8px
- **Density:** Comfortable — generous whitespace, this is a single-purpose tool
- **Scale:** 2xs(2px) xs(4px) sm(8px) md(16px) lg(24px) xl(32px) 2xl(48px) 3xl(64px)

## Layout
- **Approach:** Grid-disciplined, centered, focused
- **Max content width:** 480px (mobile-first utility)
- **Grid:** Single column, centered
- **Border radius:** sm:4px (tiles, small elements), md:8px (cards, inputs), lg:12px (main containers)

## Motion
- **Approach:** Minimal-functional
- **Transitions:** 150ms ease-out on interactive elements
- **Result appear:** Subtle fade-in, 200ms
- **Tile display:** Staggered entrance, 50ms delay per tile
- **Easing:** enter(ease-out) exit(ease-in) move(ease-in-out)
- **Duration:** micro(50-100ms) short(150-250ms) medium(250-400ms)

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-06 | Initial design system created | Created by /design-consultation. User chose Cool Minimal (B) with lighter wood-textured tiles. Premium game accessory feel, light and sophisticated. |
| 2026-04-06 | Light theme instead of dark | User explicitly requested "not dark, clear and sophisticated" |
| 2026-04-06 | Wood-textured tiles as sole decoration | Tiles carry personality, everything else is clean utility |

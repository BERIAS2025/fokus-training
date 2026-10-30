# Handover design project

_Started 2026-10-30 15:57 UTC_

---

## User

Please read the handover.md and start to design

## Assistant

_[tool: list_files]_

_[tool: read_file]_

I'll start with the core: the 7 screens in light mode, plus Start and a game in dark mode. Game levels 1/8, all Pflege states, the therapist view, and the full design system come in later passes.

_[tool: update_todos]_

_[tool: dc_write]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: ready_for_verification]_

I've built the first pass in **Fokus-Training Bildschirme.dc.html**: all 7 screens in light mode, plus Start and the game screen in dark mode. It's out for a final check now.

- **What's on the screens:**
  - The orange anchor bar is on the left of every one of Conny's screens, with an arrow that nudges inward.
  - On Start there's a big "Los" button and the 6 game symbols. Played games get a check, and the next game in today's plan is marked.
  - The game screen shows "Sterne suchen" at level 4. The star positions are random on every load, with at least as many stars on the left as on the right.
  - The Pause screen has a circle with "Atmen" that grows and shrinks.
  - The result screen shows 4 of 5 flowers and "Bravissima!".
  - Both tiredness checks use three faces that differ in shape, not just colour.
- **Extra screen 2b:** after "müde", Conny can choose "Kurz" (a shorter session) or "Genug" (sunset symbol). The brief asks for this choice but doesn't list it as its own screen.
- **Screen 7 (care area):** this is the "Bereit für schwerer" (ready for harder) state. It has the 8-step level stairs with checks, a flag on the last level, the green up arrow, 7 history bars and a "Letzte Stufe" button that restores the last level.
- **Two settings you can switch:** the anchor (on/off) and "Links-Hilfe", which makes stars on the left bigger.

**Things to check:**
- The brief asks for a 24 mm anchor, which would be about 130 dp wide. I used 112 dp to leave more room for the game.
- The way into the care area (a gear held for 3 seconds) sits small in the top right of Start.

**Still to come:** all 6 games at level 1 and level 8, the other two recommendation states (stay, easier), the therapist history view, the full design system with 30+ symbols, and the motion notes.

## User

Found issues — fixing…

## Assistant

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: ready_for_verification]_

_[tool: dc_write]_

_[tool: show_html]_

_[tool: update_todos]_

_[tool: ready_for_verification]_

I fixed the cut-off bottom row in the care area (screen 7), and I added **Fokus-Training Spiele.dc.html**. It shows all 6 games at level 1 and level 8, side by side. It's out for a check now.

- **Random layouts:** the targets land in new places on every load. There are at least as many on the left as on the right, and level 1 puts most of them on the left.
- **Level 1 vs level 8:** level 1 has big targets, the yellow guide line in "Sterne suchen", bigger left targets and clearly different distractors. Level 8 is denser, with smaller targets and look-alike distractors: sun shapes with only 4 rays, or hollow ones.
- **"Folge merken":** each colour field also carries its own shape, so the colour is never the only cue.
- **Colours beyond the four in the brief:** level 8 needs 6 fields, so I added purple, teal and brown. Please confirm these are acceptable.

Still to come: the other two recommendation states in the care area, the therapist history view, and the design system with motion notes.

## User

Found issues — fixing…

## Assistant

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: ready_for_verification]_

I fixed the three problems in the games file, and it's out for another check.

- **Missing targets:** "Sterne suchen" level 1 showed only 2 of 4 stars, and "Paare finden" level 1 was likely missing cards too. Both now always show every target. If the spacing gets tight, the app still places the target in the most open spot instead of leaving it out.
- **Guide line:** the yellow guide line in "Sterne suchen" level 1 now runs at the average height of the stars.
- **Cards off the edge:** in "Paare finden" level 8, the bottom row of cards no longer runs past the screen edge.
- **Console error:** I filled in values that were missing for some elements, which was the likely cause. Whether the error is gone will show in the check.

Still to come: the other two recommendation states in the care area, the therapist history view, and the design system with motion notes.

## User

Found issues — fixing…

## Assistant

_[tool: dc_js_str_replace]_

_[tool: ready_for_verification]_

I fixed "Paare finden" at level 8. It's out for another check.

- **Missing card:** all 20 cards now appear, so every card has a partner. The board now has a few extra spaces, and the one hidden by the pause button simply stays empty.
- **Overlapping cards:** the cards are slightly smaller (112 × 124 dp) and move around less, so they no longer overlap.

Still to come: the other two recommendation states in the care area, the therapist history view, and the design system with motion notes.

## User

We just need the ability to start each game seperatly as well. There is the full sequence which is nice, but also, every game being able to select seperatly to play the favariot one.

## Assistant

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

I added screen **1b, "Einzelspiel gewählt"** (single game chosen). It's out for a check now.

- **Two ways to start:**
  - "Los" on Start plays the full daily plan.
  - Tapping one of the 6 game symbols opens 1b, where Conny plays only that game.
- **What 1b shows:** the chosen game's symbol, big and with a blue frame, next to a large "Los" button. The home button sits centered at the bottom. The example uses "Paare finden".
- **After the game:** she goes straight to the result screen and then back to Start.

I also updated the caption on Start to explain both paths.


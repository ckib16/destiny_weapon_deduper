# D3 Deduper TODO

## UI Flow (Phase 4)
- Show condensed weapon cards by default on "Your Weapons" page (image + Copies / Owned perks / Possible perks / Completion).
- On weapon click, switch to a focused view that shows only the selected weapon’s punch-card matrix and hides all other weapons.

## Perk Matrix Columns
- Fix column order to: Intrinsic Traits, Barrel, Magazine, Left Trait, Right Trait, Origin Trait.
- Remove the Kill Tracker/Memento column from the punch-card display.

## Perk Deduping
- Remove duplicate perks in columns 2–6 (treat enhanced perks as canonical and hide non-enhanced duplicates).

### Condensed view cards
Consider these stats
- Copies
- "completion bar" that tracks "desired perks" vs "owned perks" (will be 100% if have all desired perks)
- would need concept of user-selected "desired perks" that live in state and don't go away; maybe even exported in some format for safety

### Detailed / Punch-card UI view
- [x] Demote "intrinsic trait" column to a new "Additional Details" section
  - Columns 1 - 5 are now
    - Barrel (or synonyms)
    - Magazine (or synonyms)
    - Left Traits
    - Right Traits
    - Origin Traits
- [x] New "Additional Details" section with these 2 items:
  - [x] Add "Intrinsic Trait" (Example "High-Impact Frame")
  - [x] Add "Masterwork" (Example "Masterwork: Range")
- [x] When hover over any Trait that Bungie provides a description for, show pop up text description from Bungie (example: hovering over "Attrition Orbs" trait shows "Dealing sustained power creates an Orb of Power")
- [x] Fix designation of which perks are owned
  - Currently: app shows which the aggregation of perks **currently selected** right now on weapon, not an aggregation of **all perks that exist on a weapon**

## Backlog
- [ ] Fix Masterwork section of "Notes" (shows "None detected")
- [ ] Origin Traits > Aisha's Care > 3 origini traits onwed, only "Alacrity" is highlishted

## Future versions
- [ ] Idea of "Farming mode" and "Dedupe to God Roll mode"
  - Farming mode: current mode, shows composite of all earned traits as you farm
  - Dedupe mode: pick your god roll options, app compares your god roll options to inventory, highlights weapon instances that haave your god roll, allows you to lock/unlock instances of weapon (lock god roll, unlock all other rolls)
- Streamer Picks ("Give me my opinion" mode)
  - curated list of god rolls from Streamers, Light.gg, Blueberry.gg, other soruces

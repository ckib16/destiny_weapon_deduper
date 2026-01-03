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
- [x] Fix Masterwork section of "Notes" (shows "None detected")
- [x] Origin Traits > Aisha's Care > 3 origin traits owned, only "Alacrity" is highlighted

## Future versions
- [ ] Idea of "Farming mode" and "Dedupe to God Roll mode"
  - Farming mode: current mode, shows composite of all earned traits as you farm
  - Dedupe mode: pick your god roll options, app compares your god roll options to inventory, highlights weapon instances that haave your god roll, allows you to lock/unlock instances of weapon (lock god roll, unlock all other rolls)
    - God Roll features:
      - User can pick desired perks for each column with "and/or" logic
        - Constraints for max amount of and/or options per column should default to Tier 5 limits (2 options for 1st 2 columns, 3 options for left and right trait columns, origin trait options depend on the exact weapon)
      - Show percentage chance of getting each god roll given your requirements and tier level you expect to drop at (example: Tier 5 as default)
        - Example: "you selected 2 perks for column 1, 2 perks for column 2, 2 perks for column 3, 2 perks for column 4, 2 perks for column 5, 2 perks for origin traits. Given that you expect to drop at Tier 5, you have a 10% chance of getting this god roll."
        - Need vocabulary to differentiate between "and" and "or" logic. Goal is to show that you have better odds if you are less choosy with 2 perks using "or" logic rather than **requiring** 2 perks with "and" logic.
- Streamer Picks ("Give me my opinion" mode)
  - curated list of god rolls from Streamers, Light.gg, Blueberry.gg, other soruces

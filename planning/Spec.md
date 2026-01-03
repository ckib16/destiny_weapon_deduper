# D3 Deduper Specification

## Goal / Use case
1. User has a large collection of Destiny 2 weapons
2. User wants to just play Destiny 2 now, and worry about inventory management later
3. User would like an app on a "second screen" to help them see progress towards acquiring their personal "god roll" weapon while they play
4. After playing, User wants help deduplicating their weapon rolls to save vault space while keeping the god roll they want

## Bungie Weapon Information
- Assume all weapons are Tier 5 for simplicity now
    - [ ] Consider fleshing out non-tiered weapons in future
- Bungie Tier 5 weapon characterstics source (aside from API): https://www.bungie.net/7/en/News/Article/dev_insights_weapon_gear_tier
- Tier 5 weapon characterstics we want to track in our app
    - "Weapon Components" (Barrel, Magazine, Rail, Bolt, etc)
        - Column 1: 2 traits max
        - Column 2: 2 traits max
    - "Weapon Traits" (also called "Perks")
        - Column 3: 3 traits max
        - Column 4: 3 traits max
    - Other Traits
        - Origin Trait: Depends on weapon type, max should be the max origin traits that can possibly drop for that weapon type
        - Masterwork (in "Notes" section)
- Weapon characterstics we don't want to track in our app
    - Mod socket slot (counterbalance mod, backup mag mod, etc.)
    - Ornament slot (purely cosmetic)
    - Shader slot (purely cosmetic)
    - Kill tracker slot (track kills in PVE vs PVP etc)
- Basic vs Enhanced Traits
    - Assume all traits are enhanced now that tier 5 weapons are raining down from the heavens
    - Will readress if Bungie changes standard drops
    - Do not distinguish in our app
    - [ ] Make sure tooltip shows the definition from the Enhanced trait, not the Basic trait
    - [ ] Make sure tooltip shows the icon from the Enhanced trait, not the Basic trait


## Modes
### Farming mode
User: "I just want to play Destiny 2 and collect loot, don't ask me questions right now. Just show me which perks I have collected on this new weapon I'm farming forI'll muck around in my inventory later when I'm ready to make decisions."

### "Dedupe" mode (Deduplication)
User: "I want to tidy up my inventory. I know what "god rolls" I want to keep, show me which weapons I can dismantle and which I should keep."

## UI
### Inventory view
Show all weapons, with identical weapons grouped together
- Example: 5 copies of "Anonymous Autumn" legendary primary sidearms only show 1 card, with a count of 5
- Stats to show on card:
    - Copies
    - Perks Owned Across All Copies
        - Owned Perks / Possible Perks
        - Shown as a horizontal bar, filled in with percentage of owned perks, and the text of owned / possible perks shown over top
- TODO
    - [ ] Filters similar to https://d2foundry.gg/
        - Weapon Type, Frame, Trait, Energy, Ammo, Slot, Rarity, Source, Season, Foundry, RPM, Craftable

### Dedupe view
Workflow
- User clicks a weapon in the inventory view
- Brought to new view showing detailed / punchcard UI

#### Punchcard UI
- Already implemented
- Shows typical Destiny 2 "weapon perks grid" similar to DIM, Foundry.gg, Light.gg etc.
- ![alt text](punchcard_ui.png)

#### "Coverage"??? UI
Idea only
- [ ] need new name for "Coverage"; idea is you want more granular view over what weapon instances are contributing to each Punchcard trait being highlighted / filled in / covered

Workflow
- User clicks on "Coverage" button
- Punchcard UI maps perks contained in each individual instance of weapon to a color section of the particular trait row
    - Example: 5 copies of "Anonymous Autumn" legendary primary sidearms 
    - Of the 5 copies, only 2 contain the trait "Lone Wolf"
    - User clicks "Coverage" button
    - UI changes
        - Punchcard UI changes the color of the "Lone Wolf" trait row to now show 2 color sections; each color section maps to the copy / instance of the weapon that contains that perk in the "Instances" section of the UI
        - "Instances" section shows matching color highlights to the trait row in Punchcard UI
        - SO with "Coverage" enabled, the user can see which copies of the weapon contain which perks. In this case, the user can see that 2 copies contain the "Lone Wolf" perk, and 3 copies do not. And the Punchcard UI shows "Lone Wolf" trait row split with 2 colors (lets say red and blue), with the appropriate weapon instance also highlighted in red or blue
        - If the user hovers over the blue section of the "Lone Wolf" trait row in Punchcard UI, the user can see the name of the weapon instance that contains that perk "pulsing"
        - Likewise, if the user hovers over the blue highlighted weapon instance in the "Instances" section, the user can see the name of the trait row that contains that perk "pulsing"
        - Note: I am not 100% decided on the "multiple color sections" idea for trait rows mapping to weapon instances. I think it is a good idea, but I am definitley open to other ideas
            - The key concept: 
                - User hovers over an individual trait in the Punchcard UI section, and can see which instances of the weapon contain the perk they are hovering over
                - User hovers over an individual instance of the weapon in the Instances section, and can see which traits are contained in that instance in the Punchcard UI section

#### "God Roll" UI
Probably do this after the granular view of "Coverage" is implemented

Workflow
- User clicks "Pick my god roll perks" button
- New "god roll" section appears beneath the Punchcard UI section
- So layout would probably be:
    - "Weapon Details" section
        - Punchcard UI section
        - Notes section
        - Instances section
    - "God Roll" section (optional, if user creates a "God Roll" profile)
        - God Roll profile 1 (each saved god roll called a "profile"?)
        - God Roll profile 2
        - God Roll profile 3, etc
- God Roll profile mechanics:
    - User clicks "Create God Roll Profile" button
    - User can create a god roll profile by selecting perks from a new copy of the Punchcard UI
    - For each column, user can use "and / or" logic to select which perks they want to keep
    - Maximum traits per column should follow the Bungie API limit for Tier 5 weapons (see "Bungie Weapon Information" section above for limits)
- God Roll profile should be saved to local storage
- User should be able to Create, Edit, and Delete God Roll profiles

### Future goals
- Notifications when God Roll profile is reached
    - User can enable / disable notifications
    - User can set notification threshold (e.g. 50%, 75%, 100%)
- "God Roll" percentage chance section
    - Should show percentage chance of acquireing your selected god roll given a single Tier 5 weapon drop
    - Example: "you selected 2 perks for column 1 using "and" logic, 2 perks for column 2 using "or" logic, 2 perks for column 3 using "and" logic, 2 perks for column 4 using "or" logic, 2 perks for column 5 using "and" logic, 2 perks for origin traits using "or" logic. Given that you expect to drop at Tier 5, you have a 10% chance of getting this god roll."
    - Need vocabulary to differentiate between "and" and "or" logic. Goal is to show that you have better odds if you are less choosy with 2 perks using "or" logic rather than **requiring** 2 perks with "and" logic.
- Streamer Picks ("Give me my opinion" list)
  - curated list of god roll profilesfrom Streamers, Light.gg, Blueberry.gg, other soruces already populated in app for user to select from

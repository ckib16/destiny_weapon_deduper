export interface MockPerk {
    id: string
    name: string
    colIndex: number
    description?: string
}

export interface MockInstance {
    id: string
    name: string
    power: number
    perks: string[] // List of perk IDs
}

// Full perk pool for "Anonymous Autumn" (Tier 5 simulation)
export const ALL_PERKS: MockPerk[] = [
    // Column 0: Barrels (9 options)
    { id: 'b-fullbore', name: 'Full Bore', colIndex: 0 },
    { id: 'b-corkscrew', name: 'Corkscrew Rifling', colIndex: 0 },
    { id: 'b-arrowhead', name: 'Arrowhead Brake', colIndex: 0 },
    { id: 'b-chambered', name: 'Chambered Compensator', colIndex: 0 },
    { id: 'b-extended', name: 'Extended Barrel', colIndex: 0 },
    { id: 'b-fluted', name: 'Fluted Barrel', colIndex: 0 },
    { id: 'b-hammer', name: 'Hammer-Forged Rifling', colIndex: 0 },
    { id: 'b-polygonal', name: 'Polygonal Rifling', colIndex: 0 },
    { id: 'b-smallbore', name: 'Smallbore', colIndex: 0 },

    // Column 1: Magazines (8 options)
    { id: 'm-ricochet', name: 'Ricochet Rounds', colIndex: 1 },
    { id: 'm-extended', name: 'Extended Mag', colIndex: 1 },
    { id: 'm-alloy', name: 'Alloy Mag', colIndex: 1 },
    { id: 'm-appended', name: 'Appended Mag', colIndex: 1 },
    { id: 'm-armor', name: 'Armor-Piercing Rounds', colIndex: 1 },
    { id: 'm-highcal', name: 'High-Caliber Rounds', colIndex: 1 },
    { id: 'm-flared', name: 'Flared Magwell', colIndex: 1 },
    { id: 'm-light', name: 'Light Mag', colIndex: 1 },

    // Column 2: Trait 1 (7 options)
    { id: 't1-rangefinder', name: 'Rangefinder', colIndex: 2 },
    { id: 't1-threat', name: 'Threat Detector', colIndex: 2 },
    { id: 't1-hipfire', name: 'Hip-Fire Grip', colIndex: 2 },
    { id: 't1-moving', name: 'Moving Target', colIndex: 2 },
    { id: 't1-outlaw', name: 'Outlaw', colIndex: 2 },
    { id: 't1-pulse', name: 'Pulse Monitor', colIndex: 2 },
    { id: 't1-zen', name: 'Zen Moment', colIndex: 2 },

    // Column 3: Trait 2 (7 options)
    { id: 't2-killclip', name: 'Kill Clip', colIndex: 3 },
    { id: 't2-frenzy', name: 'Frenzy', colIndex: 3 },
    { id: 't2-headstone', name: 'Headstone', colIndex: 3 },
    { id: 't2-vorpal', name: 'Vorpal Weapon', colIndex: 3 },
    { id: 't2-adagio', name: 'Adagio', colIndex: 3 },
    { id: 't2-harmony', name: 'Harmony', colIndex: 3 },
    { id: 't2-thresh', name: 'Thresh', colIndex: 3 },

    // Column 4: Origin Traits (3 options)
    { id: 'o-onequiet', name: 'One Quiet Moment', colIndex: 4 },
    { id: 'o-suros', name: 'Suros Synergy', colIndex: 4 },
    { id: 'o-alacrity', name: 'Alacrity', colIndex: 4 },

    // Column 5: Masterworks (5 options)
    { id: 'mw-range', name: 'Range MW', colIndex: 5 },
    { id: 'mw-stability', name: 'Stability MW', colIndex: 5 },
    { id: 'mw-handling', name: 'Handling MW', colIndex: 5 },
    { id: 'mw-reload', name: 'Reload MW', colIndex: 5 },
    { id: 'mw-charge', name: 'Charge Time MW', colIndex: 5 }, // Just for fun/variety
]

// Mock Instances with full rows (6 perks each)
export const MOCK_INSTANCES: MockInstance[] = [
    {
        id: 'inst-1',
        name: 'Roll 1',
        power: 1810,
        perks: ['b-fullbore', 'm-ricochet', 't1-rangefinder', 't2-killclip', 'o-onequiet', 'mw-range']
    },
    {
        id: 'inst-2',
        name: 'Roll 2',
        power: 1809,
        perks: ['b-corkscrew', 'm-extended', 't1-threat', 't2-frenzy', 'o-suros', 'mw-stability']
    },
    {
        id: 'inst-3',
        name: 'Roll 3',
        power: 1805,
        perks: ['b-fullbore', 'm-alloy', 't1-rangefinder', 't2-headstone', 'o-onequiet', 'mw-handling']
    },
    {
        id: 'inst-4',
        name: 'Roll 4',
        power: 1800,
        perks: ['b-arrowhead', 'm-ricochet', 't1-hipfire', 't2-frenzy', 'o-suros', 'mw-reload']
    },
    {
        id: 'inst-5',
        name: 'Roll 5',
        power: 1810,
        perks: ['b-smallbore', 'm-flared', 't1-moving', 't2-killclip', 'o-alacrity', 'mw-range']
    },
    {
        id: 'inst-6',
        name: 'Roll 6',
        power: 1808,
        perks: ['b-fluted', 'm-light', 't1-zen', 't2-vorpal', 'o-onequiet', 'mw-stability']
    },
    {
        id: 'inst-7',
        name: 'Roll 7',
        power: 1802,
        perks: ['b-hammer', 'm-highcal', 't1-outlaw', 't2-adagio', 'o-suros', 'mw-handling']
    },
]

export const COLUMN_HEADERS = [
    'Barrel', 'Magazine', 'Trait 1', 'Trait 2', 'Origin', 'Masterwork'
]

export const INSTANCE_COLORS: Record<string, string> = {
    'inst-1': '#EF4444', // Red 500
    'inst-2': '#F59E0B', // Amber 500
    'inst-3': '#10B981', // Emerald 500
    'inst-4': '#3B82F6', // Blue 500
    'inst-5': '#8B5CF6', // Violet 500
    'inst-6': '#EC4899', // Pink 500
    'inst-7': '#14B8A6', // Teal 500
}

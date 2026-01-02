import type { WeaponInstance } from './weapon-instance'
import type { Perk } from './perk'

export interface DedupedWeapon {
  weaponHash: number
  weaponName: string
  weaponIcon: string

  // Merged perk data
  perkMatrix: PerkColumn[]

  // Contributing instances
  instances: WeaponInstance[]

  // Metadata
  totalPerksOwned: number
  totalPerksPossible: number
  completionPercentage: number
}

export interface PerkColumn {
  columnIndex: number
  columnName: string // "Barrel", "Magazine", "Trait 1", "Trait 2", "Origin", "Masterwork"
  availablePerks: Perk[] // All possible perks
  ownedPerks: Set<number> // Perk hashes player owns
}

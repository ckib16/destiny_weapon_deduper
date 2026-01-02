import type { DestinyProfileResponse, InventoryItem } from '@/api/inventory'
import type { WeaponInstance } from '@/models/weapon-instance'
import { WEAPON_BUCKET_HASHES, TierType, ItemType } from '@/utils/constants'
import { manifestService } from './manifest-service'

/**
 * Parse weapons from Destiny profile response
 */
export class WeaponParser {
  /**
   * Extract all weapon instances from profile
   */
  parseWeapons(profile: DestinyProfileResponse): WeaponInstance[] {
    const weapons: WeaponInstance[] = []
    const allItems: InventoryItem[] = []

    // Collect items from vault (profile inventory)
    if (profile.profileInventory?.data?.items) {
      console.log(`[Parser] Vault items: ${profile.profileInventory.data.items.length}`)
      allItems.push(...profile.profileInventory.data.items)
    }

    // Collect items from character inventories
    if (profile.characterInventories?.data) {
      for (const characterId in profile.characterInventories.data) {
        const characterInventory = profile.characterInventories.data[characterId]
        if (characterInventory.items) {
          console.log(`[Parser] Character ${characterId} inventory: ${characterInventory.items.length}`)
          allItems.push(...characterInventory.items)
        }
      }
    }

    // Collect items from character equipment
    if (profile.characterEquipment?.data) {
      for (const characterId in profile.characterEquipment.data) {
        const characterEquipment = profile.characterEquipment.data[characterId]
        if (characterEquipment.items) {
          console.log(`[Parser] Character ${characterId} equipment: ${characterEquipment.items.length}`)
          allItems.push(...characterEquipment.items)
        }
      }
    }

    console.log(`[Parser] Total items collected: ${allItems.length}`)

    let weaponBucketCount = 0
    let hasInstanceIdCount = 0
    let hasDefinitionCount = 0
    let legendaryExoticCount = 0
    let actualWeaponCount = 0

    // Filter and parse weapons
    for (const item of allItems) {
      // Check if item is in a weapon bucket
      const isWeapon = Object.values(WEAPON_BUCKET_HASHES).includes(item.bucketHash)

      if (!isWeapon || !item.itemInstanceId) {
        continue
      }
      weaponBucketCount++

      if (!item.itemInstanceId) {
        continue
      }
      hasInstanceIdCount++

      // Get weapon definition to check if it's legendary
      const weaponDef = manifestService.getInventoryItem(item.itemHash)

      if (!weaponDef) {
        console.warn(`No definition found for weapon hash ${item.itemHash}`)
        continue
      }
      hasDefinitionCount++

      // Filter for legendary weapons (and exotic for testing)
      if (weaponDef.tierType !== TierType.Superior && weaponDef.tierType !== TierType.Exotic) {
        continue
      }
      legendaryExoticCount++

      // Only include actual weapons
      if (weaponDef.itemType !== ItemType.Weapon) {
        continue
      }
      actualWeaponCount++

      // Get socket data for this instance
      const socketData = profile.itemComponents?.sockets?.data?.[item.itemInstanceId]

      if (!socketData || !socketData.sockets) {
        console.warn(`No socket data for weapon instance ${item.itemInstanceId}`)
        continue
      }

      // Create weapon instance
      const weaponInstance: WeaponInstance = {
        itemInstanceId: item.itemInstanceId,
        itemHash: item.itemHash,
        sockets: {
          sockets: socketData.sockets.map(socket => ({
            plugHash: socket.plugHash || 0,
            isEnabled: socket.isEnabled
          }))
        }
      }

      weapons.push(weaponInstance)
    }

    console.log(`[Parser] Filter results:`)
    console.log(`  - In weapon buckets: ${weaponBucketCount}`)
    console.log(`  - Has instance ID: ${hasInstanceIdCount}`)
    console.log(`  - Has definition: ${hasDefinitionCount}`)
    console.log(`  - Is legendary/exotic: ${legendaryExoticCount}`)
    console.log(`  - Is actual weapon: ${actualWeaponCount}`)
    console.log(`  - Final weapons parsed: ${weapons.length}`)

    return weapons
  }

  /**
   * Group weapons by hash (for deduplication)
   */
  groupWeaponsByHash(weapons: WeaponInstance[]): Map<number, WeaponInstance[]> {
    const grouped = new Map<number, WeaponInstance[]>()

    for (const weapon of weapons) {
      if (!grouped.has(weapon.itemHash)) {
        grouped.set(weapon.itemHash, [])
      }
      grouped.get(weapon.itemHash)!.push(weapon)
    }

    return grouped
  }

  /**
   * Get weapon name from hash
   */
  getWeaponName(itemHash: number): string {
    const weaponDef = manifestService.getInventoryItem(itemHash)
    return weaponDef?.displayProperties?.name || `Unknown Weapon (${itemHash})`
  }

  /**
   * Get weapon icon from hash
   */
  getWeaponIcon(itemHash: number): string {
    const weaponDef = manifestService.getInventoryItem(itemHash)
    return weaponDef?.displayProperties?.icon || ''
  }

  /**
   * Get weapon type display name (e.g., "Hand Cannon", "Auto Rifle")
   */
  getWeaponType(itemHash: number): string {
    const weaponDef = manifestService.getInventoryItem(itemHash)
    return weaponDef?.itemTypeDisplayName || 'Weapon'
  }
}

export const weaponParser = new WeaponParser()

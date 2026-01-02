import { BUNGIE_API_BASE, DestinyComponentType } from '@/utils/constants'
import type { BungieResponse } from './types'

/**
 * Profile response from Bungie API
 */
export interface DestinyProfileResponse {
  profile?: {
    data: {
      userInfo: {
        membershipType: number
        membershipId: string
        displayName: string
      }
      dateLastPlayed: string
      versionsOwned: number
      characterIds: string[]
    }
  }
  profileInventory?: {
    data: {
      items: InventoryItem[]
    }
  }
  characterInventories?: {
    data: Record<string, {
      items: InventoryItem[]
    }>
  }
  characterEquipment?: {
    data: Record<string, {
      items: InventoryItem[]
    }>
  }
  itemComponents?: {
    instances?: {
      data: Record<string, ItemInstance>
    }
    sockets?: {
      data: Record<string, ItemSockets>
    }
    stats?: {
      data: Record<string, ItemStats>
    }
    perks?: {
      data: Record<string, ItemPerks>
    }
  }
}

export interface InventoryItem {
  itemHash: number
  itemInstanceId?: string
  quantity: number
  bindStatus: number
  location: number
  bucketHash: number
  transferStatus: number
  lockable: boolean
  state: number
  dismantlePermission: number
  isWrapper: boolean
}

export interface ItemInstance {
  damageType: number
  damageTypeHash?: number
  primaryStat?: {
    statHash: number
    value: number
  }
  itemLevel: number
  quality: number
  isEquipped: boolean
  canEquip: boolean
  equipRequiredLevel: number
  unlockHashesRequiredToEquip: number[]
  cannotEquipReason: number
  energy?: {
    energyTypeHash: number
    energyType: number
    energyCapacity: number
    energyUsed: number
    energyUnused: number
  }
}

export interface ItemSockets {
  sockets: Socket[]
}

export interface Socket {
  plugHash?: number
  isEnabled: boolean
  isVisible: boolean
  enableFailIndexes?: number[]
}

export interface ItemStats {
  stats: Record<number, {
    statHash: number
    value: number
  }>
}

export interface ItemPerks {
  perks: Array<{
    perkHash: number
    iconPath: string
    isActive: boolean
    visible: boolean
  }>
}

export class InventoryAPI {
  private readonly API_KEY: string

  constructor() {
    this.API_KEY = import.meta.env.VITE_BUNGIE_API_KEY || ''
  }

  /**
   * Fetch user's Destiny 2 profile with inventory data
   */
  async getProfile(
    membershipType: number,
    membershipId: string,
    accessToken: string
  ): Promise<DestinyProfileResponse> {
    // Request specific components we need
    const components = [
      DestinyComponentType.Profiles,
      DestinyComponentType.ProfileInventories,
      DestinyComponentType.Characters,
      DestinyComponentType.CharacterInventories,
      DestinyComponentType.CharacterEquipment,
      DestinyComponentType.ItemInstances,
      DestinyComponentType.ItemSockets,
      DestinyComponentType.ItemStats,
      DestinyComponentType.ItemPerks,
    ].join(',')

    const url = `${BUNGIE_API_BASE}/Destiny2/${membershipType}/Profile/${membershipId}/?components=${components}`

    const response = await fetch(url, {
      headers: {
        'X-API-Key': this.API_KEY,
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.statusText}`)
    }

    const data: BungieResponse<DestinyProfileResponse> = await response.json()

    if (data.ErrorCode !== 1) {
      throw new Error(data.Message || 'Failed to fetch profile')
    }

    return data.Response
  }

  /**
   * Get user's Destiny memberships (to find their primary membership)
   */
  async getMemberships(accessToken: string): Promise<DestinyMembership[]> {
    const url = `${BUNGIE_API_BASE}/User/GetMembershipsForCurrentUser/`

    const response = await fetch(url, {
      headers: {
        'X-API-Key': this.API_KEY,
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch memberships: ${response.statusText}`)
    }

    const data: BungieResponse<{
      destinyMemberships: DestinyMembership[]
      primaryMembershipId: string
    }> = await response.json()

    if (data.ErrorCode !== 1) {
      throw new Error(data.Message || 'Failed to fetch memberships')
    }

    return data.Response.destinyMemberships
  }
}

export interface DestinyMembership {
  membershipType: number
  membershipId: string
  displayName: string
  bungieGlobalDisplayName: string
  bungieGlobalDisplayNameCode: number
  crossSaveOverride: number
  applicableMembershipTypes: number[]
  isPublic: boolean
  membershipState: number
}

export const inventoryAPI = new InventoryAPI()

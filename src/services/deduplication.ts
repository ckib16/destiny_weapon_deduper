import { manifestService } from './manifest-service'
import { weaponParser } from './weapon-parser'
import { SOCKET_CATEGORY_INTRINSIC_TRAITS, SOCKET_CATEGORY_WEAPON_PERKS } from '@/utils/constants'
import type { DedupedWeapon, PerkColumn } from '@/models/deduped-weapon'
import type { WeaponInstance } from '@/models/weapon-instance'
import type { Perk } from '@/models/perk'

interface DestinySocketTypeDefinition {
  displayProperties?: {
    name?: string
  }
}

interface DestinySocketCategoryDefinition {
  displayProperties?: {
    name?: string
  }
}

interface SocketEntry {
  socketTypeHash: number
  singleInitialItemHash?: number
  reusablePlugSetHash?: number
  randomizedPlugSetHash?: number
}

const PERK_CATEGORY_HASHES = new Set<number>([
  SOCKET_CATEGORY_WEAPON_PERKS,
  SOCKET_CATEGORY_INTRINSIC_TRAITS
])

function getSocketCategoryName(categoryHash: number): string | null {
  const categoryDef = manifestService.getDefinition<DestinySocketCategoryDefinition>(
    'DestinySocketCategoryDefinition',
    categoryHash
  )
  return categoryDef?.displayProperties?.name || null
}

function getSocketTypeName(socketTypeHash: number, fallback: string): string {
  const socketTypeDef = manifestService.getDefinition<DestinySocketTypeDefinition>(
    'DestinySocketTypeDefinition',
    socketTypeHash
  )
  return socketTypeDef?.displayProperties?.name || fallback
}

function getPlugItemHashes(socketEntry: SocketEntry): number[] {
  const hashes = new Set<number>()

  if (socketEntry.singleInitialItemHash) {
    hashes.add(socketEntry.singleInitialItemHash)
  }

  const plugSetHashes = [
    socketEntry.reusablePlugSetHash,
    socketEntry.randomizedPlugSetHash
  ].filter((hash): hash is number => typeof hash === 'number' && hash > 0)

  for (const plugSetHash of plugSetHashes) {
    const plugSet = manifestService.getPlugSet(plugSetHash)
    if (!plugSet) continue

    for (const plugItem of plugSet.reusablePlugItems) {
      hashes.add(plugItem.plugItemHash)
    }
  }

  return Array.from(hashes)
}

function buildPerkColumn(
  socketEntry: SocketEntry,
  socketIndex: number,
  instances: WeaponInstance[],
  fallbackName: string
): PerkColumn | null {
  const plugItemHashes = getPlugItemHashes(socketEntry)
  if (plugItemHashes.length === 0) return null

  const ownedPerks = new Set<number>()

  for (const instance of instances) {
    const socket = instance.sockets.sockets[socketIndex]
    if (socket?.plugHash) {
      ownedPerks.add(socket.plugHash)
    }
  }

  const availablePerks: Perk[] = plugItemHashes.map((hash) => {
    const perkDef = manifestService.getInventoryItem(hash)
    return {
      hash,
      name: perkDef?.displayProperties?.name || `Unknown Perk (${hash})`,
      description: perkDef?.displayProperties?.description || '',
      icon: perkDef?.displayProperties?.icon || '',
      isOwned: ownedPerks.has(hash)
    }
  })

  return {
    columnIndex: socketIndex,
    columnName: getSocketTypeName(socketEntry.socketTypeHash, fallbackName),
    availablePerks,
    ownedPerks
  }
}

function buildPerkMatrix(
  weaponHash: number,
  instances: WeaponInstance[]
): PerkColumn[] {
  const weaponDef = manifestService.getInventoryItem(weaponHash)
  const socketData = weaponDef?.sockets

  if (!socketData?.socketEntries?.length || !socketData.socketCategories?.length) {
    return []
  }

  const socketEntries = socketData.socketEntries as SocketEntry[]
  const socketIndexes: number[] = []
  const seenIndexes = new Set<number>()

  for (const category of socketData.socketCategories) {
    if (!PERK_CATEGORY_HASHES.has(category.socketCategoryHash)) continue

    for (const index of category.socketIndexes) {
      if (seenIndexes.has(index)) continue
      seenIndexes.add(index)
      socketIndexes.push(index)
    }
  }

  const perkColumns: PerkColumn[] = []

  for (const socketIndex of socketIndexes) {
    const socketEntry = socketEntries[socketIndex]
    if (!socketEntry) continue

    const categoryName = socketData.socketCategories.find((cat) =>
      cat.socketIndexes.includes(socketIndex)
    )?.socketCategoryHash

    const fallbackName = categoryName
      ? getSocketCategoryName(categoryName) || `Perk Column ${socketIndex + 1}`
      : `Perk Column ${socketIndex + 1}`

    const column = buildPerkColumn(
      socketEntry,
      socketIndex,
      instances,
      fallbackName
    )

    if (column) {
      perkColumns.push(column)
    }
  }

  return perkColumns
}

function countOwnedPerks(columns: PerkColumn[]): number {
  let count = 0
  for (const column of columns) {
    for (const perk of column.availablePerks) {
      if (perk.isOwned) count += 1
    }
  }
  return count
}

function countPossiblePerks(columns: PerkColumn[]): number {
  return columns.reduce((sum, column) => sum + column.availablePerks.length, 0)
}

export function buildDedupedWeapon(
  weaponHash: number,
  instances: WeaponInstance[]
): DedupedWeapon {
  const perkMatrix = buildPerkMatrix(weaponHash, instances)
  const totalPerksOwned = countOwnedPerks(perkMatrix)
  const totalPerksPossible = countPossiblePerks(perkMatrix)
  const completionPercentage = totalPerksPossible > 0
    ? Math.round((totalPerksOwned / totalPerksPossible) * 100)
    : 0

  return {
    weaponHash,
    weaponName: weaponParser.getWeaponName(weaponHash),
    weaponIcon: weaponParser.getWeaponIcon(weaponHash),
    perkMatrix,
    instances,
    totalPerksOwned,
    totalPerksPossible,
    completionPercentage
  }
}


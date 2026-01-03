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

type ColumnKind = 'intrinsic' | 'barrel' | 'magazine' | 'trait' | 'origin' | 'other'

const BARREL_TYPE_NAMES = new Set([
  'barrel',
  'rail',
  'scope',
  'sight',
  'bowstring'
])

const MAGAZINE_TYPE_NAMES = new Set([
  'magazine',
  'battery',
  'bolt',
  'bolts',
  'arrow',
  'ammunition'
])

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

function normalizePerkName(name: string): string {
  return name.replace(/^enhanced\s+/i, '').trim().toLowerCase()
}

function isEnhancedPerkName(name: string): boolean {
  return /^enhanced\s+/i.test(name)
}

function isTrackerColumn(
  socketTypeName: string,
  categoryName: string | null,
  perkNames: string[],
  perkTypeNames: string[]
): boolean {
  const combined = `${socketTypeName} ${categoryName || ''}`.toLowerCase()
  if (combined.includes('tracker') || combined.includes('memento')) return true

  if (perkTypeNames.some((name) => {
    const lower = name.toLowerCase()
    return lower.includes('tracker') || lower.includes('memento')
  })) {
    return true
  }

  if (perkNames.length === 0) return false
  return perkNames.every((name) => {
    const lower = name.toLowerCase()
    return lower.includes('tracker') || lower.includes('memento')
  })
}

function getColumnKind(
  socketTypeName: string,
  categoryName: string | null,
  perkTypeNames: string[]
): ColumnKind {
  const typeName = socketTypeName.toLowerCase()
  const category = (categoryName || '').toLowerCase()
  const perkTypes = perkTypeNames.map((name) => name.toLowerCase())

  if (perkTypes.some((name) => name.includes('intrinsic'))) return 'intrinsic'
  if (perkTypes.some((name) => name.includes('origin'))) return 'origin'
  if (perkTypes.some((name) => BARREL_TYPE_NAMES.has(name))) return 'barrel'
  if (perkTypes.some((name) => MAGAZINE_TYPE_NAMES.has(name))) return 'magazine'
  if (perkTypes.some((name) => name.includes('barrel'))) return 'barrel'
  if (perkTypes.some((name) => name.includes('magazine'))) return 'magazine'
  if (perkTypes.some((name) => name.includes('trait') || name.includes('perk'))) return 'trait'

  if (category.includes('intrinsic')) return 'intrinsic'
  if (typeName.includes('intrinsic')) return 'intrinsic'
  if (typeName.includes('barrel')) return 'barrel'
  if (typeName.includes('magazine')) return 'magazine'
  if (typeName.includes('origin')) return 'origin'
  if (typeName.includes('trait') || typeName.includes('perk')) return 'trait'
  if (category.includes('weapon perks')) return 'trait'

  return 'other'
}

function getPlugItemTypeNames(plugItemHashes: number[]): string[] {
  const typeNames = new Set<string>()

  for (const hash of plugItemHashes) {
    const perkDef = manifestService.getInventoryItem(hash)
    const typeName = perkDef?.itemTypeDisplayName
    if (typeName) {
      typeNames.add(typeName)
    }
  }

  return Array.from(typeNames)
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
  plugItemHashes: number[],
  socketIndex: number,
  instances: WeaponInstance[],
  fallbackName: string
): PerkColumn | null {
  if (plugItemHashes.length === 0) return null

  const ownedPerks = new Set<number>()

  for (const instance of instances) {
    const socket = instance.sockets.sockets[socketIndex]
    if (socket?.plugHash) {
      ownedPerks.add(socket.plugHash)
    }
  }

  const perkGroups = new Map<string, { hash: number; name: string }[]>()

  for (const hash of plugItemHashes) {
    const perkDef = manifestService.getInventoryItem(hash)
    const perkName = perkDef?.displayProperties?.name || `Unknown Perk (${hash})`
    const normalized = normalizePerkName(perkName)

    if (!perkGroups.has(normalized)) {
      perkGroups.set(normalized, [])
    }
    perkGroups.get(normalized)!.push({ hash, name: perkName })
  }

  const availablePerks: Perk[] = []

  for (const variants of perkGroups.values()) {
    const enhancedVariant = variants.find((variant) => isEnhancedPerkName(variant.name))
    const chosen = enhancedVariant || variants[0]
    const perkDef = manifestService.getInventoryItem(chosen.hash)
    const isOwned = variants.some((variant) => ownedPerks.has(variant.hash))

    availablePerks.push({
      hash: chosen.hash,
      name: perkDef?.displayProperties?.name || `Unknown Perk (${chosen.hash})`,
      description: perkDef?.displayProperties?.description || '',
      icon: perkDef?.displayProperties?.icon || '',
      isOwned
    })
  }

  availablePerks.sort((a, b) => a.name.localeCompare(b.name))

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

  const columnCandidates: Array<{
    socketIndex: number
    socketEntry: SocketEntry
    socketTypeName: string
    categoryName: string | null
    kind: ColumnKind
    plugItemHashes: number[]
    perkTypeNames: string[]
  }> = []

  for (const socketIndex of socketIndexes) {
    const socketEntry = socketEntries[socketIndex]
    if (!socketEntry) continue

    const categoryHash = socketData.socketCategories.find((cat) =>
      cat.socketIndexes.includes(socketIndex)
    )?.socketCategoryHash

    const categoryName = categoryHash ? getSocketCategoryName(categoryHash) : null
    const socketTypeName = getSocketTypeName(
      socketEntry.socketTypeHash,
      `Perk Column ${socketIndex + 1}`
    )
    const plugItemHashes = getPlugItemHashes(socketEntry)
    const perkTypeNames = getPlugItemTypeNames(plugItemHashes)
    const kind = getColumnKind(socketTypeName, categoryName, perkTypeNames)

    columnCandidates.push({
      socketIndex,
      socketEntry,
      socketTypeName,
      categoryName,
      kind,
      plugItemHashes,
      perkTypeNames
    })
  }

  columnCandidates.sort((a, b) => a.socketIndex - b.socketIndex)

  const columnsByKind: Record<ColumnKind, typeof columnCandidates> = {
    intrinsic: [],
    barrel: [],
    magazine: [],
    trait: [],
    origin: [],
    other: []
  }

  for (const candidate of columnCandidates) {
    columnsByKind[candidate.kind].push(candidate)
  }

  const orderedColumns: Array<{
    label: string
    candidate: typeof columnCandidates[number]
  }> = []

  const intrinsic = columnsByKind.intrinsic[0]
  if (intrinsic) {
    orderedColumns.push({ label: 'Intrinsic Traits', candidate: intrinsic })
  }

  const barrel = columnsByKind.barrel[0]
  if (barrel) {
    orderedColumns.push({ label: 'Barrel', candidate: barrel })
  }

  const magazine = columnsByKind.magazine[0]
  if (magazine) {
    orderedColumns.push({ label: 'Magazine', candidate: magazine })
  }

  const traitColumns = columnsByKind.trait.slice(0, 2)
  if (traitColumns[0]) {
    orderedColumns.push({ label: 'Left Trait', candidate: traitColumns[0] })
  }
  if (traitColumns[1]) {
    orderedColumns.push({ label: 'Right Trait', candidate: traitColumns[1] })
  }

  const origin = columnsByKind.origin[0]
  if (origin) {
    orderedColumns.push({ label: 'Origin Trait', candidate: origin })
  }

  const perkColumns: PerkColumn[] = []

  for (const { label, candidate } of orderedColumns) {
    const column = buildPerkColumn(
      candidate.socketEntry,
      candidate.plugItemHashes,
      candidate.socketIndex,
      instances,
      label
    )

    if (!column) continue

    const perkNames = column.availablePerks.map((perk) => perk.name)
    if (isTrackerColumn(
      candidate.socketTypeName,
      candidate.categoryName,
      perkNames,
      candidate.perkTypeNames
    )) {
      continue
    }

    column.columnName = label
    perkColumns.push(column)
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

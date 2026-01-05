<template>
  <div class="space-y-6 text-gray-200">
    <div class="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
      <div class="space-y-1">
        <h3 class="text-xl font-bold text-white">Coverage Visualization</h3>
        <p class="text-sm text-gray-400">
          {{ visualMode === 'overview' ? 'Weapon details and perk collection progress' : 'Hover over perks or instances to see the relationship' }}
        </p>
      </div>
      
      <div class="flex items-center gap-4">
        <label class="flex items-center gap-2 cursor-pointer">
          <span class="text-sm font-medium">Visualization Mode:</span>
          <select
            v-model="visualMode"
            class="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="overview">Overview</option>
            <option value="simple">Simple Highlight</option>
            <option value="segmented">Segmented Bars</option>
          </select>
        </label>
      </div>
    </div>

    <!-- Overview Mode Content -->
    <div v-if="visualMode === 'overview'" class="rounded-xl border border-gray-700 bg-gray-800 p-5 shadow-sm">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="flex items-start gap-4 min-w-0">
          <img
            v-if="weapon.weaponIcon"
            :src="`https://www.bungie.net${weapon.weaponIcon}`"
            :alt="weapon.weaponName"
            class="h-14 w-14 rounded"
          />
          <div class="min-w-0">
            <h3 class="text-xl font-semibold truncate">{{ weapon.weaponName }}</h3>
            <p class="text-xs text-gray-500">Hash: {{ weapon.weaponHash }}</p>
          </div>
        </div>

        <div class="flex items-center gap-6 text-sm text-gray-300">
          <div class="text-center">
            <p class="text-lg font-semibold text-blue-300">{{ weapon.instances.length }}</p>
            <p class="text-xs text-gray-500">Copies</p>
          </div>
          <div class="text-center">
            <p class="text-lg font-semibold text-green-300">{{ weapon.totalPerksOwned }}</p>
            <p class="text-xs text-gray-500">Owned perks</p>
          </div>
          <div class="text-center">
            <p class="text-lg font-semibold text-gray-200">{{ weapon.totalPerksPossible }}</p>
            <p class="text-xs text-gray-500">Possible perks</p>
          </div>
          <div class="text-center">
            <p class="text-lg font-semibold text-purple-300">{{ weapon.completionPercentage }}%</p>
            <p class="text-xs text-gray-500">Completion</p>
          </div>
        </div>
      </div>

      <div class="mt-5">
        <WeaponMatrix :columns="weapon.perkMatrix" />
      </div>

      <div class="mt-4 rounded-lg border border-gray-700 bg-gray-900/40 p-3">
        <h4 class="text-xs font-semibold uppercase tracking-wide text-gray-400">Notes</h4>
        <div class="mt-2 space-y-2 text-sm">
          <div>
            <p class="text-xs text-gray-500">Intrinsic Trait</p>
            <div v-if="weapon.intrinsicPerks.length" class="mt-1 flex flex-wrap gap-2">
              <span
                v-for="perk in weapon.intrinsicPerks"
                :key="perk.hash"
                class="inline-flex items-center gap-2 rounded border border-gray-700 bg-gray-900/60 px-2 py-1 text-xs text-gray-200"
              >
                <img
                  v-if="perk.icon"
                  :src="`https://www.bungie.net${perk.icon}`"
                  :alt="perk.name"
                  class="h-4 w-4 rounded"
                />
                <span>{{ perk.name }}</span>
              </span>
            </div>
            <p v-else class="mt-1 text-xs text-gray-500">None detected</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Masterwork</p>
            <div v-if="weapon.masterworkPerks.length" class="mt-1 flex flex-wrap gap-2">
              <span
                v-for="perk in weapon.masterworkPerks"
                :key="perk.hash"
                class="inline-flex items-center gap-2 rounded border border-gray-700 bg-gray-900/60 px-2 py-1 text-xs text-gray-200"
              >
                <img
                  v-if="perk.icon"
                  :src="`https://www.bungie.net${perk.icon}`"
                  :alt="perk.name"
                  class="h-4 w-4 rounded"
                />
                <span>{{ perk.name }}</span>
              </span>
            </div>
            <p v-else class="mt-1 text-xs text-gray-500">None detected</p>
          </div>
        </div>
      </div>

      <div class="mt-4">
        <InstanceList :instances="weapon.instances" />
      </div>
    </div>

    <!-- Coverage Modes (Simple & Segmented) -->
    <div v-else class="grid grid-cols-1 xl:grid-cols-3 gap-8">
      
      <!-- Left: Perk Matrix (Punch Card) -->
      <div class="xl:col-span-2 space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="font-bold text-lg">Perk Matrix</h4>
          <span class="text-xs uppercase tracking-wider text-gray-500">{{ weapon.weaponName }}</span>
        </div>

        <div class="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
          <!-- Column Headers -->
          <div 
            class="grid gap-px bg-gray-800 border-b border-gray-700" 
            :style="{ gridTemplateColumns: `repeat(${matrixColumns.length}, minmax(0, 1fr))` }"
          >
            <div 
              v-for="col in matrixColumns" 
              :key="col.columnIndex"
              class="p-2 text-[10px] uppercase font-bold text-center text-gray-400 tracking-wider truncate"
            >
              {{ col.columnName }}
            </div>
          </div>

          <!-- Matrix Content -->
          <div class="flex">
            <div 
              v-for="column in matrixColumns" 
              :key="column.columnIndex"
              class="flex-1 border-r border-gray-800 last:border-r-0"
            >
              <div 
                v-for="perk in column.availablePerks" 
                :key="perk.hash"
                class="relative h-10 border-b border-gray-800 last:border-b-0 cursor-pointer group transition-colors duration-200"
                :class="getPerkClasses(perk)"
                @mouseenter="hoveredPerkHash = perk.hash"
                @mouseleave="hoveredPerkHash = null"
              >
                <!-- Simple Highlight Background -->
                <div 
                  v-if="visualMode === 'simple' && isPerkHighlighted(perk.hash)"
                  class="absolute inset-0 bg-blue-500/20"
                ></div>

                <!-- Segmented Bars Background -->
                <div v-if="visualMode === 'segmented'" class="absolute inset-0 flex h-full w-full opacity-30">
                  <div 
                    v-for="instanceId in getInstancesWithPerk(perk.hash, column.columnIndex)"
                    :key="instanceId"
                    class="h-full flex-grow"
                    :style="{ backgroundColor: getInstanceColor(instanceId) }"
                  ></div>
                </div>

                <!-- Hover Overlay for Segmented -->
                <div 
                  v-if="visualMode === 'segmented' && hoveredInstanceId && doesInstanceHavePerk(hoveredInstanceId, perk.hash, column.columnIndex)"
                  class="absolute inset-0 bg-white/10 border-2 border-white/50"
                ></div>
                
                <!-- Content -->
                <div class="relative z-10 flex items-center h-full px-2 gap-1.5 overflow-hidden">
                   <img
                    v-if="perk.icon"
                    :src="`https://www.bungie.net${perk.icon}`"
                    class="w-5 h-5 rounded flex-shrink-0"
                  />
                  <div v-else class="w-5 h-5 rounded bg-gray-700 flex-shrink-0"></div>
                  <span class="text-[10px] font-medium truncate select-none leading-tight">{{ perk.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Instances List -->
      <div class="space-y-4">
        <h4 class="font-bold text-lg">Instances ({{ weapon.instances.length }})</h4>
        
        <div class="space-y-2">
          <div 
            v-for="(instance, index) in weapon.instances" 
            :key="instance.itemInstanceId"
            class="p-3 rounded-lg border transition-all duration-200 cursor-pointer"
            :class="getInstanceClasses(instance.itemInstanceId)"
            :style="getInstanceStyle(instance.itemInstanceId)"
            @mouseenter="hoveredInstanceId = instance.itemInstanceId"
            @mouseleave="hoveredInstanceId = null"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="font-bold text-sm">Roll {{ index + 1 }}</span>
              <!-- Power level isn't in WeaponInstance currently, omitted -->
            </div>
            
            <!-- Full Perk Matrix Tags for Instance -->
            <div class="flex flex-wrap gap-1 min-w-0">
               <template v-for="col in matrixColumns" :key="col.columnIndex">
                  <span 
                    v-for="perkHash in getPerksForInstanceInColumn(instance, col.columnIndex)" 
                    :key="perkHash"
                    class="text-[9px] px-1 py-0.5 bg-black/20 rounded text-gray-400 truncate text-center"
                    :class="{ 
                      'text-white bg-white/20 font-bold ring-1 ring-white/30': hoveredPerkHash && hoveredPerkHash === perkHash,
                      'text-gray-300': !hoveredPerkHash
                    }"
                    :title="getPerkName(perkHash)"
                  >
                    {{ getPerkName(perkHash) }}
                  </span>
               </template>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { DedupedWeapon } from '@/models/deduped-weapon'
import type { WeaponInstance } from '@/models/weapon-instance'
import type { Perk } from '@/models/perk'
import WeaponMatrix from './WeaponMatrix.vue'
import InstanceList from './InstanceList.vue'

const props = defineProps<{
  weapon: DedupedWeapon
}>()

const visualMode = ref<'overview' | 'simple' | 'segmented'>('overview')
const hoveredPerkHash = ref<number | null>(null)
const hoveredInstanceId = ref<string | null>(null)

const matrixColumns = computed(() => props.weapon.perkMatrix)

// --- Color Palette ---
const PALETTE = [
  '#EF4444', '#F97316', '#F59E0B', '#10B981', '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#F43F5E',
  '#84CC16', '#22C55E', '#14B8A6', '#0EA5E9', '#64748B'
]
const getInstanceColor = (instId: string) => {
  const idx = props.weapon.instances.findIndex(i => i.itemInstanceId === instId)
  if (idx === -1) return '#6B7280'
  return PALETTE[idx % PALETTE.length]
}

// --- Logic Helpers ---

// Check if an instance has a specific perk (by hash) in a specific column index
const doesInstanceHavePerk = (instId: string, perkHash: number, colIndex: number): boolean => {
  const instance = props.weapon.instances.find(i => i.itemInstanceId === instId)
  if (!instance) return false

  // Check active plug
  if (instance.sockets.sockets[colIndex]?.plugHash === perkHash) return true
  
  // Check reusable plugs (selectable options)
  const reusables = instance.socketPlugsByIndex?.[colIndex]
  if (reusables && reusables.includes(perkHash)) return true

  return false
}

const getInstancesWithPerk = (perkHash: number, colIndex: number): string[] => {
  return props.weapon.instances
    .filter(inst => doesInstanceHavePerk(inst.itemInstanceId, perkHash, colIndex))
    .map(inst => inst.itemInstanceId)
}

const getPerksForInstanceInColumn = (instance: WeaponInstance, colIndex: number): number[] => {
   const perks = new Set<number>()
   // Active
   const active = instance.sockets.sockets[colIndex]?.plugHash
   if (active) perks.add(active)
   
   // Selectable
   const reusables = instance.socketPlugsByIndex?.[colIndex]
   if (reusables) reusables.forEach(p => perks.add(p))
   
   return Array.from(perks)
}

// Name lookup helper
const perkNameCache = new Map<number, string>()
const getPerkName = (hash: number) => {
  if (perkNameCache.has(hash)) return perkNameCache.get(hash)
  
  // Search in matrix
  for (const col of props.weapon.perkMatrix) {
    const p = col.availablePerks.find(p => p.hash === hash)
    if (p) {
        perkNameCache.set(hash, p.name)
        return p.name
    }
  }
  return 'Unknown'
}


// --- Styling ---

const isPerkHighlighted = (perkHash: number) => {
  if (hoveredPerkHash.value === perkHash) return true
  if (hoveredInstanceId.value) {
    // We need to find which column this perk belongs to for accurate checking
    // But for visual highlight, just checking if instance has it ANYWHERE is likely okay, 
    // or we scan columns.
    
    // Optimized: We know the column in the template loop, but here we don't.
    // Let's iterate columns map or find it.
    for (const col of matrixColumns.value) {
       if (doesInstanceHavePerk(hoveredInstanceId.value, perkHash, col.columnIndex)) return true
    }
  }
  return false
}

const getPerkClasses = (perk: Perk) => {
  if (visualMode.value === 'simple') {
    if (hoveredPerkHash.value === perk.hash) return 'bg-blue-600/30'
    if (isPerkHighlighted(perk.hash)) return 'bg-blue-600/10'
    return 'bg-gray-800'
  }
  return 'bg-gray-800'
}

const getInstanceClasses = (instId: string) => {
  const base = 'bg-gray-800 border-gray-700'
  
  if (visualMode.value === 'simple') {
    if (hoveredInstanceId.value === instId) return 'bg-blue-900 border-blue-500 ring-1 ring-blue-500'
    
    // Highlight if hovered perk is on this instance
    if (hoveredPerkHash.value) {
       let hasPerk = false
       for (const col of matrixColumns.value) {
          if (doesInstanceHavePerk(instId, hoveredPerkHash.value, col.columnIndex)) {
            hasPerk = true
            break
          }
       }
       if (hasPerk) return 'bg-blue-900/50 border-blue-500/50'
       // Dim others
       return 'opacity-50'
    }

    if (hoveredInstanceId.value && hoveredInstanceId.value !== instId) {
       return 'opacity-50'
    }

    return base
  }
  
  // Segmented mode
  if (hoveredInstanceId.value === instId) {
    return 'ring-2 ring-white border-transparent'
  }
  
  if (hoveredPerkHash.value) {
      let hasPerk = false
       for (const col of matrixColumns.value) {
          if (doesInstanceHavePerk(instId, hoveredPerkHash.value, col.columnIndex)) {
            hasPerk = true
            break
          }
       }
     if (hasPerk) return 'brightness-110 ring-1 ring-white/50'
     return 'opacity-40 grayscale-[0.5]'
  }

  if (hoveredInstanceId.value && hoveredInstanceId.value !== instId) {
       return 'opacity-40 grayscale-[0.5]'
  }

  return base
}

const getInstanceStyle = (instId: string) => {
  if (visualMode.value === 'segmented') {
    const color = getInstanceColor(instId)
    return {
      borderLeftWidth: '4px',
      borderLeftColor: color
    }
  }
  return {}
}

</script>

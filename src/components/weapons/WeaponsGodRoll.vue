<template>
  <div class="space-y-6 text-gray-200">
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
      
      <!-- Left: Selection Grid -->
      <div class="xl:col-span-2 space-y-4">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <h4 class="font-bold text-lg">God Roll Selector</h4>
          
          <div class="flex items-center gap-4">
             <!-- Legend -->
            <div class="flex items-center gap-3 text-xs bg-gray-800/50 px-3 py-1.5 rounded-full border border-gray-700/50">
              <span class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                <span class="text-gray-300">Optional Perk (Click)</span>
              </span>
              <span class="w-px h-3 bg-gray-600"></span>
              <span class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-orange-500"></span>
                <span class="text-gray-300">Required Perk (Shift+Click)</span>
              </span>
            </div>
             <button 
                @click="clearSelection"
                class="text-xs px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors text-gray-400 hover:text-white"
              >
                Clear Perks
              </button>
          </div>
        </div>

        <div class="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden relative">
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
                class="relative h-10 border-b border-gray-800 last:border-b-0 cursor-pointer group select-none"
                :class="getSelectionClasses(perk.hash)"
                @click="toggleSelection(perk.hash, $event)"
              >
                 <!-- Owned Indicator (Subtle stripe or dot) -->
                 <div v-if="perk.isOwned" class="absolute left-0 top-0 bottom-0 w-0.5 bg-green-500/30"></div>

                <!-- Content -->
                <div class="relative z-10 flex items-center h-full px-2 gap-1.5 overflow-hidden">
                   <img
                    v-if="perk.icon"
                    :src="`https://www.bungie.net${perk.icon}`"
                    class="w-5 h-5 rounded flex-shrink-0"
                  />
                  <div v-else class="w-5 h-5 rounded bg-gray-700 flex-shrink-0"></div>
                  <span class="text-[10px] font-medium truncate leading-tight">{{ perk.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Inline Save / Update Form -->
        <div v-if="hasSelection" class="bg-gray-800/80 rounded-lg border border-gray-700 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
           <div class="flex items-center gap-3">
              <div class="flex-1">
                 <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    {{ currentProfileId ? 'Update Profile' : 'Save As God Roll' }}
                 </label>
                 <input 
                    v-model="profileNameInput"
                    type="text" 
                    placeholder="e.g. PvP God Roll"
                    class="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600"
                    @keyup.enter="saveProfile(false)"
                 />
              </div>
              <div class="flex items-end gap-2 h-full pt-5">
                 <button 
                    @click="saveProfile(false)"
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-medium transition-colors"
                    :disabled="!profileNameInput.trim()"
                 >
                    {{ currentProfileId ? 'Save Changes' : 'Save God Roll' }}
                 </button>
                 
                 <button 
                    v-if="currentProfileId"
                    @click="saveProfile(true)"
                    class="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded text-sm font-medium transition-colors border border-green-600"
                    :disabled="!profileNameInput.trim()"
                 >
                    Save as New God Roll
                 </button>
              </div>
           </div>
        </div>
        
        <!-- Saved Profiles List -->
        <div v-if="savedProfiles.length > 0" class="space-y-3 pt-4 border-t border-gray-700/50">
           <h4 class="font-bold text-sm text-gray-400 uppercase tracking-wider">Saved God Rolls</h4>
           <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div 
                 v-for="profile in savedProfiles" 
                 :key="profile.id"
                 class="group bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-lg p-3 transition-colors cursor-pointer relative"
                 :class="{ 'ring-2 ring-blue-500/50 border-blue-500/50 bg-blue-900/10': currentProfileId === profile.id }"
                 @click="loadProfile(profile)"
              >
                 <div class="flex justify-between items-start">
                    <div class="min-w-0">
                       <h5 class="font-bold text-sm text-gray-200 truncate flex items-center gap-2">
                          {{ profile.name }}
                          <span v-if="currentProfileId === profile.id" class="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                       </h5>
                       <p class="text-[10px] text-gray-500 mt-1 truncate">
                          {{ Object.keys(profile.selection).length }} perks selected
                       </p>
                    </div>

                    <!-- Actions -->
                    <div class="flex items-center gap-2 ml-2" @click.stop>
                       <template v-if="profile.showDeleteConfirm">
                          <span class="text-[10px] text-red-400 font-bold">Sure?</span>
                          <button 
                             @click="deleteProfile(profile.id)"
                             class="text-xs px-2 py-0.5 bg-red-900/50 hover:bg-red-900 text-red-200 border border-red-800 rounded"
                          >
                             Yes
                          </button>
                          <button 
                             @click="profile.showDeleteConfirm = false"
                             class="text-xs px-2 py-0.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
                          >
                             Cancel
                          </button>
                       </template>
                       <template v-else>
                          <button 
                             @click="profile.showDeleteConfirm = true"
                             class="p-1 text-gray-500 hover:text-red-400 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                             title="Delete Profile"
                          >
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                             </svg>
                          </button>
                       </template>
                    </div>
                 </div>
              </div>
           </div>
        </div>

      </div>

      <!-- Right: Matches List -->
      <div class="space-y-4">
        <h4 class="font-bold text-lg">Your Owned Rolls</h4>
        <div class="space-y-2">
          <div 
            v-for="(instance, index) in weapon.instances" 
            :key="instance.itemInstanceId"
            class="p-3 rounded-lg border transition-all duration-200"
            :class="getMatchClasses(instance.itemInstanceId)"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="font-bold text-sm">Roll {{ index + 1 }}</span>
              <span 
                v-if="isMatch(instance.itemInstanceId)"
                class="text-[10px] font-bold px-1.5 py-0.5 bg-green-900 text-green-300 rounded uppercase tracking-wide"
              >
                Match
              </span>
            </div>
            
             <!-- Full Perk Matrix Tags for Instance -->
            <div class="flex flex-wrap gap-1 min-w-0">
               <template v-for="col in matrixColumns" :key="col.columnIndex">
                  <span 
                    v-for="perkHash in getPerksForInstanceInColumn(instance, col.columnIndex)" 
                    :key="perkHash"
                    class="text-[9px] px-1 py-0.5 rounded truncate text-center transition-colors"
                    :class="getPerkTagClass(perkHash)"
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
import { ref, computed, onMounted, watch } from 'vue'
import type { DedupedWeapon, PerkColumn } from '@/models/deduped-weapon'
import type { WeaponInstance } from '@/models/weapon-instance'

const props = defineProps<{
  weapon: DedupedWeapon
}>()

const matrixColumns = computed(() => props.weapon.perkMatrix)

// --- Selection State ---
type SelectionType = 'OR' | 'AND'
const selection = ref<Record<number, SelectionType>>({}) // Keyed by hash (number)

const hasSelection = computed(() => Object.keys(selection.value).length > 0)

const toggleSelection = (perkHash: number, event: MouseEvent) => {
  const current = selection.value[perkHash]
  
  if (current) {
    if (event.shiftKey) {
        if (current === 'OR') selection.value[perkHash] = 'AND'
        else delete selection.value[perkHash]
    } else {
        delete selection.value[perkHash]
    }
  } else {
    // New selection
    selection.value[perkHash] = event.shiftKey ? 'AND' : 'OR'
  }
}

const clearSelection = () => {
  selection.value = {}
  currentProfileId.value = null
  profileNameInput.value = ''
}

// --- Matching Logic ---

const doesInstanceHavePerk = (instance: WeaponInstance, perkHash: number, colIndex: number): boolean => {
  // Check active plug
  if (instance.sockets.sockets[colIndex]?.plugHash === perkHash) return true
  
  // Check reusable plugs (selectable options)
  const reusables = instance.socketPlugsByIndex?.[colIndex]
  if (reusables && reusables.includes(perkHash)) return true

  return false
}

const isMatch = (instId: string) => {
  if (!hasSelection.value) return false
  
  const instance = props.weapon.instances.find(i => i.itemInstanceId === instId)
  if (!instance) return false

  // Iterate columns and check logic
  // Logic: 
  // For each column that has selections:
  //   - If ANY 'AND' selection exists in this column:
  //       - Instance MUST have ALL of the 'AND' perks in this column?
  //       - Actually, typical God Roll logic is usually per-column.
  //       - Standard: 
  //         - "OR": Match if instance has ANY of the OR perks.
  //         - "AND": Match if instance has THIS specific perk.
  //   - Conflict: If a column has both AND and OR?
  //     - Usually "AND" implies strict requirement. "OR" implies options.
  //     - Valid logic: (Has P1_AND AND Has P2_AND ...) AND (Has P3_OR OR Has P4_OR ...)
  
  // Let's implement robust Logic per column:
  // Column Match = (All ANDs present) && (If ORs exist, at least one OR present)
  // Overall Match = All Columns Match
  
  for (const col of matrixColumns.value) {
    const colPerks = col.availablePerks.map(p => p.hash)
    const selectedInCol = colPerks.filter(h => selection.value[h])
    
    if (selectedInCol.length === 0) continue // No criteria for this column, verify next

    // Check ANDs
    const ands = selectedInCol.filter(h => selection.value[h] === 'AND')
    for (const h of ands) {
       if (!doesInstanceHavePerk(instance, h, col.columnIndex)) return false
    }

    // Check ORs
    const ors = selectedInCol.filter(h => selection.value[h] === 'OR')
    if (ors.length > 0) {
       const hasAnyOr = ors.some(h => doesInstanceHavePerk(instance, h, col.columnIndex))
       if (!hasAnyOr) return false
    }
  }

  return true
}

// --- Persistence ---

interface SavedProfile {
  id: string
  name: string
  selection: Record<number, SelectionType>
  showDeleteConfirm?: boolean // UI state
}

const savedProfiles = ref<SavedProfile[]>([])
const currentProfileId = ref<string | null>(null)
const profileNameInput = ref('')

const STORAGE_KEY = computed(() => `d3_godroll_${props.weapon.weaponHash}`)

const loadProfilesFromStorage = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY.value)
        if (raw) savedProfiles.value = JSON.parse(raw)
    } catch (e) {
        console.error("Failed to load profiles", e)
    }
}

const saveProfilesToStorage = () => {
    localStorage.setItem(STORAGE_KEY.value, JSON.stringify(savedProfiles.value))
}

const saveProfile = (saveCopy: boolean) => {
    if (!profileNameInput.value) return 

    if (currentProfileId.value && !saveCopy) {
        // Update existing
        const idx = savedProfiles.value.findIndex(p => p.id === currentProfileId.value)
        if (idx !== -1) {
            savedProfiles.value[idx].selection = { ...selection.value }
            savedProfiles.value[idx].name = profileNameInput.value
        }
    } else {
        // Create new
        const newId = crypto.randomUUID()
        savedProfiles.value.push({
            id: newId,
            name: profileNameInput.value,
            selection: { ...selection.value }
        })
        currentProfileId.value = newId
    }
    
    saveProfilesToStorage()
}

const loadProfile = (profile: SavedProfile) => {
    selection.value = { ...profile.selection }
    currentProfileId.value = profile.id
    profileNameInput.value = profile.name
}

const deleteProfile = (id: string) => {
    savedProfiles.value = savedProfiles.value.filter(p => p.id !== id)
    saveProfilesToStorage()
    if (currentProfileId.value === id) {
        clearSelection()
    }
}

// Load on mount/weapon change
onMounted(loadProfilesFromStorage)
watch(() => props.weapon.weaponHash, () => {
    loadProfilesFromStorage()
    clearSelection()
})


// --- Helpers ---

const getPerksForInstanceInColumn = (instance: WeaponInstance, colIndex: number): number[] => {
   const perks = new Set<number>()
   const active = instance.sockets.sockets[colIndex]?.plugHash
   if (active) perks.add(active)
   const reusables = instance.socketPlugsByIndex?.[colIndex]
   if (reusables) reusables.forEach(p => perks.add(p))
   return Array.from(perks)
}

const perkNameCache = new Map<number, string>()
const getPerkName = (hash: number) => {
  if (perkNameCache.has(hash)) return perkNameCache.get(hash)
  for (const col of props.weapon.perkMatrix) {
    const p = col.availablePerks.find(p => p.hash === hash)
    if (p) {
        perkNameCache.set(hash, p.name)
        return p.name
    }
  }
  return 'Unknown'
}

// --- Styles ---

const getSelectionClasses = (perkHash: number) => {
  const type = selection.value[perkHash]
  if (type === 'OR') return 'bg-blue-600/30 border-blue-500/50'
  if (type === 'AND') return 'bg-orange-600/30 border-orange-500/50'
  return 'bg-gray-800 hover:bg-gray-700'
}

const getMatchClasses = (instId: string) => {
  if (!hasSelection.value) return 'bg-gray-800 border-gray-700'
  return isMatch(instId) 
    ? 'bg-green-900/20 border-green-500/50 ring-1 ring-green-500/30' 
    : 'bg-gray-800 border-gray-700 opacity-50'
}

const getPerkTagClass = (perkHash: number) => {
    const type = selection.value[perkHash]
    if (type === 'OR') return 'bg-blue-900/50 text-blue-200 border border-blue-500/30'
    if (type === 'AND') return 'bg-orange-900/50 text-orange-200 border border-orange-500/30'
    return 'bg-black/20 text-gray-400'
}

</script>

<template>
  <div class="space-y-6 text-gray-200">
    <!-- Header Controls -->
    <div class="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
      <div class="space-y-1">
        <h3 class="text-xl font-bold text-white">God Roll Builder Prototype</h3>
        <p class="text-sm text-gray-400">Define your target, see what matches.</p>
      </div>
      
      <div class="flex items-center gap-4">
        <div class="text-xs text-gray-500 bg-gray-900 px-3 py-1.5 rounded border border-gray-700">
          <span class="text-blue-400 font-bold">Click</span> = Acceptable (OR) <span class="mx-2">|</span> 
          <span class="text-orange-400 font-bold">Shift+Click</span> = Required (AND)
        </div>
        <button class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm font-semibold transition-colors">
          Save Profile
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Left: Builder Matrix -->
      <div class="lg:col-span-2 space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="font-bold text-lg">Target Definition</h4>
          <span class="text-xs uppercase tracking-wider text-gray-500">Anonymous Autumn</span>
        </div>

        <div class="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
          <div class="grid grid-cols-4 gap-px bg-gray-800 border-b border-gray-700">
            <div class="p-2 text-xs font-medium text-center text-gray-400">Barrel</div>
            <div class="p-2 text-xs font-medium text-center text-gray-400">Magazine</div>
            <div class="p-2 text-xs font-medium text-center text-gray-400">Trait 1</div>
            <div class="p-2 text-xs font-medium text-center text-gray-400">Trait 2</div>
          </div>

          <div class="flex">
            <div 
              v-for="(column, colIndex) in matrixColumns" 
              :key="colIndex"
              class="flex-1 border-r border-gray-800 last:border-r-0"
            >
              <div 
                v-for="perk in column.perks" 
                :key="perk.id"
                class="relative h-12 border-b border-gray-800 last:border-b-0 cursor-pointer group transition-colors duration-200"
                :class="getSelectionClass(perk.id)"
                @click.exact="toggleSelection(perk.id, 'OR')"
                @click.shift.prevent="toggleSelection(perk.id, 'AND')"
              >
                <!-- Selection Indicators -->
                <div v-if="selection[perk.id] === 'AND'" class="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>
                <div v-if="selection[perk.id] === 'OR'" class="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>

                <div class="relative z-10 flex items-center h-full px-3 gap-2">
                  <div class="w-6 h-6 rounded bg-gray-700 flex-shrink-0"></div> <!-- Icon -->
                  <span class="text-xs font-medium truncate select-none">{{ perk.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="bg-gray-800/50 p-4 rounded text-sm text-gray-400 border border-gray-700/50">
          <p><strong>Logic Explainer:</strong></p>
          <ul class="list-disc ml-5 mt-1 space-y-1">
            <li><span class="text-blue-400">Blue (OR)</span>: Any defined perk in this column is a "hit".</li>
            <li><span class="text-orange-400">Orange (AND)</span>: The weapon MUST have this specific perk available in this column. (Hard constraint).</li>
          </ul>
        </div>
      </div>

      <!-- Right: Matches -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="font-bold text-lg">Matches</h4>
          <span class="text-xs font-mono bg-gray-800 px-2 py-1 rounded">{{ matchCount }} / {{ instances.length }}</span>
        </div>
        
        <div class="space-y-2">
          <div 
            v-for="instance in instances" 
            :key="instance.id"
            class="p-3 rounded-lg border transition-all duration-200"
            :class="getMatchClass(instance)"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="font-bold text-sm">{{ instance.name }}</span>
              <span 
                class="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase"
                :class="isMatch(instance) ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-500'"
              >
                {{ isMatch(instance) ? 'Match' : 'Miss' }}
              </span>
            </div>
            
            <div class="flex gap-1 flex-wrap opacity-80">
              <span 
                v-for="perkName in getInstancePerkNames(instance)" 
                :key="perkName"
                class="text-[10px] px-1.5 py-0.5 rounded"
                :class="getPerkMatchClass(perkName)"
              >
                {{ perkName }}
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// --- Types & Data (Reusing specific simple set for this proto) ---

type SelectionType = 'OR' | 'AND' | null

interface MockPerk {
  id: string
  name: string
  colIndex: number
}

// Storing selection state: { [perkId]: 'OR' | 'AND' }
const selection = ref<Record<string, SelectionType>>({})

// --- Mock Data (Same as Coverage for consistency) ---
const instances = [
  { id: 'inst-1', name: 'Roll A (PvP)', perks: ['b-fullbore', 'm-ricochet', 't1-rangefinder', 't2-killclip'] },
  { id: 'inst-2', name: 'Roll B (PvE)', perks: ['b-corkscrew', 'm-extended', 't1-threat', 't2-frenzy'] },
  { id: 'inst-3', name: 'Roll C (Mid)', perks: ['b-fullbore', 'm-alloy', 't1-rangefinder', 't2-headstone'] },
  { id: 'inst-4', name: 'Roll D (Trash)', perks: ['b-arrowhead', 'm-ricochet', 't1-hipfire', 't2-frenzy'] },
  { id: 'inst-5', name: 'Roll E (Range)', perks: ['b-fullbore', 'm-ricochet', 't1-moving', 't2-killclip'] },
]

// Build Matrix Columns (Standardized for display)
const allPerks: MockPerk[] = [
  // Barrels (Col 0)
  { id: 'b-fullbore', name: 'Full Bore', colIndex: 0 },
  { id: 'b-corkscrew', name: 'Corkscrew Rifling', colIndex: 0 },
  { id: 'b-arrowhead', name: 'Arrowhead Brake', colIndex: 0 },
  // Mags (Col 1)
  { id: 'm-ricochet', name: 'Ricochet Rounds', colIndex: 1 },
  { id: 'm-extended', name: 'Extended Mag', colIndex: 1 },
  { id: 'm-alloy', name: 'Alloy Mag', colIndex: 1 },
  // Trait 1 (Col 2)
  { id: 't1-rangefinder', name: 'Rangefinder', colIndex: 2 },
  { id: 't1-threat', name: 'Threat Detector', colIndex: 2 },
  { id: 't1-hipfire', name: 'Hip-Fire Grip', colIndex: 2 },
  { id: 't1-moving', name: 'Moving Target', colIndex: 2 },
  // Trait 2 (Col 3)
  { id: 't2-killclip', name: 'Kill Clip', colIndex: 3 },
  { id: 't2-frenzy', name: 'Frenzy', colIndex: 3 },
  { id: 't2-headstone', name: 'Headstone', colIndex: 3 },
]

const matrixColumns = [
  { perks: allPerks.filter(p => p.colIndex === 0) },
  { perks: allPerks.filter(p => p.colIndex === 1) },
  { perks: allPerks.filter(p => p.colIndex === 2) },
  { perks: allPerks.filter(p => p.colIndex === 3) },
]

// --- Logic ---

const toggleSelection = (perkId: string, type: 'OR' | 'AND') => {
  const current = selection.value[perkId]
  if (current === type) {
    delete selection.value[perkId] // toggle off
  } else {
    selection.value[perkId] = type // set new mode
  }
}

const getSelectionClass = (perkId: string) => {
  const type = selection.value[perkId]
  if (type === 'OR') return 'bg-blue-900/30 border-blue-900/50 hover:bg-blue-900/50'
  if (type === 'AND') return 'bg-orange-900/30 border-orange-900/50 hover:bg-orange-900/50'
  return 'hover:bg-gray-800'
}

// Logic:
// 1. Group selections by column.
// 2. Checks each instance against the column constraints.
//    - If specific 'AND' perks are selected in a column, the instance MUST have one of them (actually, AND implies "must include", but usually for a single socket, AND/OR are functionally similar unless we have multiple perk options per column on the weapon. For this prototype, let's treat "AND" as "Must Match" and "OR" as "Acceptable Match" is distinct only conceptually?
//    - Wait, spec says: "you have better odds if you are less choosy with 2 perks using 'or' logic rather than requiring 2 perks with 'and' logic".
//    - This implies "AND" = Instance has Perk A AND Perk B (requires dual columns or fixed + random support).
//    - Data-wise, our mock instances only have 1 active perk per column (simplified). 
//    - So for this prototype, let's interpret:
//      - If a column has ANY selections:
//        - The instance MUST have at least one of the selected perks to pass that column.
//        - (Since we only Mock 1 perk per column, logic is simple).

const isMatch = (instance: any) => {
  // Check each column
  for (let col = 0; col < 4; col++) {
    const colPerks = matrixColumns[col].perks.map(p => p.id)
    const activeSelections = colPerks.filter(pid => selection.value[pid])
    
    // If no preference for this column, matches everything
    if (activeSelections.length === 0) continue

    // Does the instance have one of these perks?
    const instanceHasSelection = activeSelections.some(selId => instance.perks.includes(selId))
    if (!instanceHasSelection) return false
  }
  return true
}

const matchCount = computed(() => instances.filter(i => isMatch(i)).length)

// --- Helpers ---

const getPerkNameById = (id: string) => allPerks.find(p => p.id === id)?.name || id
const getInstancePerkNames = (instance: any) => instance.perks.map(getPerkNameById)

const getMatchClass = (instance: any) => {
  if (isMatch(instance)) return 'bg-green-900/20 border-green-700/50'
  return 'bg-gray-800 border-gray-700 opacity-50'
}

const getPerkMatchClass = (name: string) => {
  // Reverse lookup name to ID
  const perk = allPerks.find(p => p.name === name)
  if (perk && selection.value[perk.id]) {
    return selection.value[perk.id] === 'AND' ? 'bg-orange-700 text-white' : 'bg-blue-700 text-white'
  }
  return 'bg-black/30 text-gray-400'
}

</script>

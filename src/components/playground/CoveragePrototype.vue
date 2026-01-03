<template>
  <div class="space-y-6 text-gray-200">
    <div class="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
      <div class="space-y-1">
        <h3 class="text-xl font-bold text-white">Coverage Visualization Prototype</h3>
        <p class="text-sm text-gray-400">Hover over perks or instances to see the relationship</p>
      </div>
      
      <div class="flex items-center gap-4">
        <label class="flex items-center gap-2 cursor-pointer">
          <span class="text-sm font-medium">Visualization Mode:</span>
          <select 
            v-model="visualMode"
            class="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="simple">Simple Highlight</option>
            <option value="segmented">Segmented Bars</option>
          </select>
        </label>
      </div>
    </div>

    <!-- Main Grid Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Left: Perk Matrix (Punch Card) -->
      <div class="lg:col-span-2 space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="font-bold text-lg">Perk Matrix</h4>
          <span class="text-xs uppercase tracking-wider text-gray-500">Anonymous Autumn</span>
        </div>

        <div class="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
          <!-- Column Headers -->
          <div class="grid grid-cols-4 gap-px bg-gray-800 border-b border-gray-700">
            <div class="p-2 text-xs font-medium text-center text-gray-400">Barrel</div>
            <div class="p-2 text-xs font-medium text-center text-gray-400">Magazine</div>
            <div class="p-2 text-xs font-medium text-center text-gray-400">Trait 1</div>
            <div class="p-2 text-xs font-medium text-center text-gray-400">Trait 2</div>
          </div>

          <!-- Matrix Content -->
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
                :class="getPerkClasses(perk)"
                @mouseenter="hoveredPerkId = perk.id"
                @mouseleave="hoveredPerkId = null"
              >
                <!-- Simple Highlight Background -->
                <div 
                  v-if="visualMode === 'simple' && isPerkHighlighted(perk)"
                  class="absolute inset-0 bg-blue-500/20"
                ></div>

                <!-- Segmented Bars Background -->
                <div v-if="visualMode === 'segmented'" class="absolute inset-0 flex h-full w-full opacity-30">
                  <div 
                    v-for="instanceId in perk.instanceIds"
                    :key="instanceId"
                    class="h-full flex-grow"
                    :style="{ backgroundColor: getInstanceColor(instanceId) }"
                  ></div>
                </div>

                <!-- Hover Overlay for Segmented -->
                <div 
                  v-if="visualMode === 'segmented' && hoveredInstanceId && perk.instanceIds.includes(hoveredInstanceId)"
                  class="absolute inset-0 bg-white/10 border-2 border-white/50"
                ></div>
                
                <!-- Content -->
                <div class="relative z-10 flex items-center h-full px-3 gap-2">
                  <!-- Fake Icon -->
                  <div class="w-6 h-6 rounded bg-gray-700 flex-shrink-0"></div>
                  <span class="text-xs font-medium truncate select-none">{{ perk.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Instances List -->
      <div class="space-y-4">
        <h4 class="font-bold text-lg">Instances ({{ instances.length }})</h4>
        
        <div class="space-y-2">
          <div 
            v-for="instance in instances" 
            :key="instance.id"
            class="p-3 rounded-lg border transition-all duration-200 cursor-pointer"
            :class="getInstanceClasses(instance)"
            :style="getInstanceStyle(instance)"
            @mouseenter="hoveredInstanceId = instance.id"
            @mouseleave="hoveredInstanceId = null"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="font-bold text-sm">{{ instance.name }}</span>
              <span class="text-xs px-1.5 py-0.5 rounded bg-black/30 font-mono">{{ instance.power }}</span>
            </div>
            
            <div class="flex gap-1 flex-wrap">
              <span 
                v-for="perkName in getInstancePerkNames(instance)" 
                :key="perkName"
                class="text-[10px] px-1.5 py-0.5 bg-black/20 rounded text-gray-300"
                :class="{ 'text-white bg-white/20 font-bold': hoveredPerkId && instanceHasPerk(instance, hoveredPerkId) && getPerkNameById(hoveredPerkId) === perkName }"
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
import { ref } from 'vue'

const visualMode = ref<'simple' | 'segmented'>('simple')
const hoveredPerkId = ref<string | null>(null)
const hoveredInstanceId = ref<string | null>(null)

// --- Mock Data ---

const INSTANCE_COLORS: Record<string, string> = {
  'inst-1': '#EF4444', // Red 500
  'inst-2': '#F59E0B', // Amber 500
  'inst-3': '#10B981', // Emerald 500
  'inst-4': '#3B82F6', // Blue 500
  'inst-5': '#8B5CF6', // Violet 500
}

interface MockInstance {
  id: string
  name: string
  power: number
  perks: string[] // List of perk IDs
}

const instances: MockInstance[] = [
  { id: 'inst-1', name: 'Roll A (PvP)', power: 1810, perks: ['b-fullbore', 'm-ricochet', 't1-rangefinder', 't2-killclip'] },
  { id: 'inst-2', name: 'Roll B (PvE)', power: 1809, perks: ['b-corkscrew', 'm-extended', 't1-threat', 't2-frenzy'] },
  { id: 'inst-3', name: 'Roll C (Mid)', power: 1805, perks: ['b-fullbore', 'm-alloy', 't1-rangefinder', 't2-headstone'] },
  { id: 'inst-4', name: 'Roll D (Trash)', power: 1800, perks: ['b-arrowhead', 'm-ricochet', 't1-hipfire', 't2-frenzy'] },
  { id: 'inst-5', name: 'Roll E (Range)', power: 1810, perks: ['b-fullbore', 'm-ricochet', 't1-moving', 't2-killclip'] },
]

interface MockPerk {
  id: string
  name: string
  colIndex: number
  instanceIds: string[]
}

// Automatically build perk index from instances
const allPerksMap = new Map<string, MockPerk>()

const addPerk = (id: string, name: string, colIndex: number, instId: string) => {
  if (!allPerksMap.has(id)) {
    allPerksMap.set(id, { id, name, colIndex, instanceIds: [] })
  }
  allPerksMap.get(id)!.instanceIds.push(instId)
}

// Helper to hydrate perks
instances.forEach(inst => {
  // Mapping simplistic IDs to Names for demo
  const getName = (id: string) => {
    const parts = id.split('-')
    const cap = parts[1].charAt(0).toUpperCase() + parts[1].slice(1)
    return cap
  }
  
  // Hardcoded index assumptions for demo
  addPerk(inst.perks[0], getName(inst.perks[0]), 0, inst.id) // Barrel
  addPerk(inst.perks[1], getName(inst.perks[1]), 1, inst.id) // Mag
  addPerk(inst.perks[2], getName(inst.perks[2]), 2, inst.id) // Trait 1
  addPerk(inst.perks[3], getName(inst.perks[3]), 3, inst.id) // Trait 2
})

const matrixColumns = [
  { perks: Array.from(allPerksMap.values()).filter(p => p.colIndex === 0) },
  { perks: Array.from(allPerksMap.values()).filter(p => p.colIndex === 1) },
  { perks: Array.from(allPerksMap.values()).filter(p => p.colIndex === 2) },
  { perks: Array.from(allPerksMap.values()).filter(p => p.colIndex === 3) },
]

// --- Helpers ---

const getPerkNameById = (id: string) => allPerksMap.get(id)?.name || id

const getInstanceColor = (instId: string) => INSTANCE_COLORS[instId] || '#6B7280'

const instanceHasPerk = (inst: MockInstance, perkId: string) => inst.perks.includes(perkId)

const getInstancePerkNames = (inst: MockInstance) => inst.perks.map(pid => getPerkNameById(pid))

// --- Dynamic Styling Classes ---

const isPerkHighlighted = (perk: MockPerk) => {
  if (hoveredPerkId.value === perk.id) return true
  if (hoveredInstanceId.value && perk.instanceIds.includes(hoveredInstanceId.value)) return true
  return false
}

const getPerkClasses = (perk: MockPerk) => {
  if (visualMode.value === 'simple') {
    if (hoveredPerkId.value === perk.id) return 'bg-blue-600/30'
    if (isPerkHighlighted(perk)) return 'bg-blue-600/10'
    return 'bg-gray-800'
  }
  
  // Segmented mode
  return 'bg-gray-800'
}

const getInstanceClasses = (instance: MockInstance) => {
  const base = 'bg-gray-800 border-gray-700'
  
  if (visualMode.value === 'simple') {
    if (hoveredInstanceId.value === instance.id) return 'bg-blue-900 border-blue-500 ring-1 ring-blue-500'
    
    // If hovering a perk that this instance has
    if (hoveredPerkId.value && instanceHasPerk(instance, hoveredPerkId.value)) {
      return 'bg-blue-900/50 border-blue-500/50'
    }
    
    // Dim others if something is hovered
    if (hoveredPerkId.value || hoveredInstanceId.value) {
      return 'opacity-50'
    }
    
    return base
  }
  
  // Segmented mode styles
  if (hoveredInstanceId.value === instance.id) {
    return 'ring-2 ring-white border-transparent'
  }
  
  // If hovering a perk and this instance has it
  if (hoveredPerkId.value && instanceHasPerk(instance, hoveredPerkId.value)) {
    return 'brightness-110 ring-1 ring-white/50'
  }
  
    // Dim others if something is hovered
  if (hoveredPerkId.value || hoveredInstanceId.value) {
      return 'opacity-40 grayscale-[0.5]'
  }

  return base
}

const getInstanceStyle = (instance: MockInstance) => {
  if (visualMode.value === 'segmented') {
    const color = getInstanceColor(instance.id)
    return {
      borderLeftWidth: '4px',
      borderLeftColor: color
    }
  }
  return {}
}
</script>

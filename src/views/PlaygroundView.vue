<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold">Playground</h1>
      <div class="flex gap-4">
        <button
          v-for="mode in modes"
          :key="mode.id"
          @click="currentMode = mode.id"
          class="px-4 py-2 rounded transition-colors"
          :class="[
            currentMode === mode.id
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          ]"
        >
          {{ mode.label }}
        </button>
      </div>
    </div>

    <div class="bg-gray-900 rounded-lg p-6 min-h-[600px] border border-gray-800">
      <component :is="activeComponent" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import CoveragePrototype from '@/components/playground/CoveragePrototype.vue'
import GodRollPrototype from '@/components/playground/GodRollPrototype.vue'

const modes = [
  { id: 'coverage', label: 'Coverage Prototype', component: CoveragePrototype },
  { id: 'godroll', label: 'God Roll Builder', component: GodRollPrototype }
]

const currentMode = ref('coverage')

const activeComponent = computed(() => {
  return modes.find(m => m.id === currentMode.value)?.component
})
</script>

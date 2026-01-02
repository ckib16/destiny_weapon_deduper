<template>
  <div class="space-y-4">
    <!-- Search bar -->
    <div class="mb-6">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search weapons..."
        class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
      />
    </div>

    <!-- Weapon count -->
    <div class="mb-4 text-gray-400 text-sm">
      Found {{ filteredWeapons.length }} unique weapons
      <span v-if="searchQuery">(filtered from {{ props.weapons.length }} total)</span>
    </div>

    <!-- Weapon grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="weapon in filteredWeapons"
        :key="weapon.weaponHash"
        class="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition cursor-pointer"
      >
        <!-- Weapon header with icon -->
        <div class="flex items-start gap-3 mb-3">
          <img
            v-if="weapon.weaponIcon"
            :src="`https://www.bungie.net${weapon.weaponIcon}`"
            :alt="weapon.weaponName"
            class="w-12 h-12 rounded"
          />
          <div class="flex-1 min-w-0">
            <h3 class="text-lg font-semibold truncate">{{ weapon.weaponName }}</h3>
            <p class="text-xs text-gray-500">Hash: {{ weapon.weaponHash }}</p>
          </div>
        </div>

        <!-- Weapon stats -->
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-gray-400">Copies owned:</span>
            <span class="font-semibold">{{ weapon.instances.length }}</span>
          </div>

          <!-- Completion percentage (placeholder for Phase 4) -->
          <div v-if="weapon.completionPercentage > 0" class="flex justify-between text-sm">
            <span class="text-gray-400">Collection:</span>
            <span class="font-semibold text-green-400">{{ weapon.completionPercentage }}%</span>
          </div>

          <!-- Instance details -->
          <details class="mt-2">
            <summary class="text-xs text-blue-400 cursor-pointer hover:text-blue-300">
              View instances ({{ weapon.instances.length }})
            </summary>
            <div class="mt-2 space-y-1 pl-2 border-l-2 border-gray-700">
              <div
                v-for="(instance, idx) in weapon.instances"
                :key="instance.itemInstanceId"
                class="text-xs text-gray-500"
              >
                Instance {{ idx + 1 }}: {{ instance.itemInstanceId.slice(0, 16) }}...
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="filteredWeapons.length === 0" class="text-center py-12 text-gray-500">
      <p v-if="searchQuery">No weapons found matching "{{ searchQuery }}"</p>
      <p v-else>No weapons to display</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { DedupedWeapon } from '@/models/deduped-weapon'

const props = defineProps<{
  weapons: DedupedWeapon[]
}>()

const searchQuery = ref('')

const filteredWeapons = computed(() => {
  if (!searchQuery.value) return props.weapons

  const query = searchQuery.value.toLowerCase()
  return props.weapons.filter(weapon =>
    weapon.weaponName.toLowerCase().includes(query)
  )
})
</script>

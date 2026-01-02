<template>
  <div class="space-y-4">
    <div class="mb-6">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search weapons..."
        class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
      />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="weapon in filteredWeapons"
        :key="weapon.weaponHash"
        class="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition"
      >
        <h3 class="text-lg font-semibold">{{ weapon.weaponName }}</h3>
        <p class="text-sm text-gray-400">{{ weapon.instances.length }} copies</p>
        <p class="text-sm text-green-400">{{ weapon.completionPercentage }}% complete</p>
      </div>
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

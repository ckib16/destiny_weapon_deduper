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

    <!-- Weapon list -->
    <div class="space-y-6">
      <WeaponCard
        v-for="weapon in filteredWeapons"
        :key="weapon.weaponHash"
        :weapon="weapon"
      />
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
import WeaponCard from './WeaponCard.vue'

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

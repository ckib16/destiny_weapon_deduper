<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">Your Weapons</h1>

    <!-- Debug info -->
    <div class="mb-4 p-4 bg-gray-800 rounded text-xs space-y-2">
      <p>Auth: {{ authStore.isAuthenticated ? 'Yes' : 'No' }}</p>
      <p>Memberships loaded: {{ authStore.destinyMemberships.length }}</p>
      <p>Selected: {{ authStore.selectedMembership?.displayName || 'None' }}</p>
      <button
        @click="authStore.loadDestinyMemberships()"
        class="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-xs"
      >
        Manually Load Memberships (check console)
      </button>
    </div>

    <div v-if="weaponsStore.loading" class="text-center py-12">
      <LoadingSpinner />
      <p class="mt-4 text-gray-400">Loading your arsenal...</p>
    </div>

    <ErrorMessage v-else-if="weaponsStore.error" :message="weaponsStore.error" />

    <div v-else-if="weaponsStore.weapons.length === 0" class="text-center py-12">
      <p class="text-gray-400">No weapons found. This could mean:</p>
      <ul class="mt-4 text-sm text-gray-500">
        <li>You haven't loaded your inventory yet</li>
        <li>There was an error fetching your data</li>
      </ul>
      <button
        @click="loadWeapons"
        class="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
      >
        Load Weapons
      </button>
    </div>

    <WeaponList v-else :weapons="weaponsStore.weapons" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useWeaponsStore } from '@/stores/weapons'
import { useAuthStore } from '@/stores/auth'
import WeaponList from '@/components/weapons/WeaponList.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ErrorMessage from '@/components/common/ErrorMessage.vue'

const weaponsStore = useWeaponsStore()
const authStore = useAuthStore()

const loadWeapons = async () => {
  // Ensure memberships are loaded first
  if (authStore.destinyMemberships.length === 0) {
    console.log('Loading Destiny memberships...')
    await authStore.loadDestinyMemberships()
  }

  // Now load weapons
  await weaponsStore.loadWeapons()
}

onMounted(() => {
  if (weaponsStore.weapons.length === 0) {
    loadWeapons()
  }
})
</script>

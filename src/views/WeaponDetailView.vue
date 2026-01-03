<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold">Weapon Details</h1>
      <RouterLink
        to="/weapons"
        class="text-sm text-blue-400 hover:text-blue-300"
      >
        ← Back to all weapons
      </RouterLink>
    </div>

    <div v-if="weaponsStore.loading" class="text-center py-12">
      <LoadingSpinner />
      <p class="mt-4 text-gray-400">Loading your arsenal...</p>
    </div>

    <ErrorMessage v-else-if="weaponsStore.error" :message="weaponsStore.error" />

    <div v-else-if="!selectedWeapon" class="text-center py-12 text-gray-500">
      <p>Weapon not found. Try returning to the list.</p>
    </div>

    <div v-else>
      <WeaponCard :weapon="selectedWeapon" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useWeaponsStore } from '@/stores/weapons'
import { useAuthStore } from '@/stores/auth'
import WeaponCard from '@/components/weapons/WeaponCard.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ErrorMessage from '@/components/common/ErrorMessage.vue'

const route = useRoute()
const weaponsStore = useWeaponsStore()
const authStore = useAuthStore()

const weaponHash = computed(() => {
  const raw = route.params.weaponHash
  return typeof raw === 'string' ? Number(raw) : Array.isArray(raw) ? Number(raw[0]) : NaN
})

const selectedWeapon = computed(() => {
  if (!Number.isFinite(weaponHash.value)) return null
  return weaponsStore.weapons.find(weapon => weapon.weaponHash === weaponHash.value) || null
})

const loadWeapons = async () => {
  if (authStore.destinyMemberships.length === 0) {
    await authStore.loadDestinyMemberships()
  }
  await weaponsStore.loadWeapons()
}

onMounted(() => {
  if (weaponsStore.weapons.length === 0) {
    loadWeapons()
  }
})
</script>

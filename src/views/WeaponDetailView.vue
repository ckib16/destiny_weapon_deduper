<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <!-- Weapon Icon + Name (or fallback title) -->
      <div class="flex items-center gap-4">
        <template v-if="selectedWeapon">
          <img
            v-if="selectedWeapon.weaponIcon"
            :src="`https://www.bungie.net${selectedWeapon.weaponIcon}`"
            :alt="selectedWeapon.weaponName"
            class="h-14 w-14 rounded"
          />
          <div>
            <h1 class="text-2xl font-bold">{{ selectedWeapon.weaponName }}</h1>
            <p class="text-xs text-gray-500">{{ selectedWeapon.instances.length }} copies</p>
          </div>
        </template>
        <h1 v-else class="text-3xl font-bold">Weapon Details</h1>
      </div>
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
      <!-- Tabs -->
      <div class="mb-6 border-b border-gray-800">
        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors"
            :class="[
              activeTab === tab.id
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-700'
            ]"
          >
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div v-if="activeTab === 'coverage'">
        <WeaponsCoverage :weapon="selectedWeapon" />
      </div>

      <div v-else-if="activeTab === 'godroll'">
        <WeaponsGodRoll :weapon="selectedWeapon" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useWeaponsStore } from '@/stores/weapons'
import { useAuthStore } from '@/stores/auth'
import WeaponsCoverage from '@/components/weapons/WeaponsCoverage.vue'
import WeaponsGodRoll from '@/components/weapons/WeaponsGodRoll.vue'
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

// Tab State
const activeTab = ref<'coverage' | 'godroll'>('coverage')

const tabs = [
  { id: 'coverage', label: 'Perk Coverage' },
  { id: 'godroll', label: 'Set your God Roll' }
] as const

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

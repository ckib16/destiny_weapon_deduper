<template>
  <WeaponDetailLayout
    :weapon="selectedWeapon"
    :loading="weaponsStore.loading"
    :error="weaponsStore.error"
    back-label="Back to all weapons"
    loading-message="Loading your arsenal..."
    @back="router.push('/weapons')"
  />
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWeaponsStore } from '@/stores/weapons'
import { useAuthStore } from '@/stores/auth'
import WeaponDetailLayout from '@/components/weapons/WeaponDetailLayout.vue'

const route = useRoute()
const router = useRouter()
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

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { DedupedWeapon } from '@/models/deduped-weapon'

export const useWeaponsStore = defineStore('weapons', () => {
  // State
  const weapons = ref<DedupedWeapon[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  async function loadWeapons() {
    loading.value = true
    error.value = null

    try {
      // TODO: Implement actual weapon loading logic
      // 1. Fetch inventory from Bungie API
      // 2. Parse weapon instances
      // 3. Deduplicate weapons
      // 4. Store results

      // Placeholder - simulate loading
      await new Promise(resolve => setTimeout(resolve, 1000))

      // For now, just set empty array
      weapons.value = []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load weapons'
      console.error('Failed to load weapons:', err)
    } finally {
      loading.value = false
    }
  }

  function clearWeapons() {
    weapons.value = []
    error.value = null
  }

  return {
    weapons,
    loading,
    error,
    loadWeapons,
    clearWeapons
  }
})

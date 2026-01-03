<template>
  <RouterLink
    :to="`/weapons/${weapon.weaponHash}`"
    class="block rounded-xl border border-gray-700 bg-gray-800 p-4 transition hover:border-blue-500"
  >
    <div class="flex items-start gap-3">
      <img
        v-if="weapon.weaponIcon"
        :src="`https://www.bungie.net${weapon.weaponIcon}`"
        :alt="weapon.weaponName"
        class="h-12 w-12 rounded"
      />
      <div class="min-w-0 flex-1">
        <h3 class="text-lg font-semibold truncate">{{ weapon.weaponName }}</h3>
        <p class="text-xs text-gray-500">Hash: {{ weapon.weaponHash }}</p>
      </div>
    </div>

    <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
      <div class="flex items-center justify-between rounded-lg bg-gray-900/40 px-3 py-2">
        <span class="text-gray-400">Copies</span>
        <span class="font-semibold text-blue-300">{{ weapon.instances.length }}</span>
      </div>
      <div class="flex items-center justify-between rounded-lg bg-gray-900/40 px-3 py-2">
        <span class="text-gray-400">Owned perks</span>
        <span class="font-semibold text-green-300">{{ weapon.totalPerksOwned }}</span>
      </div>
      <div class="flex items-center justify-between rounded-lg bg-gray-900/40 px-3 py-2">
        <span class="text-gray-400">Possible perks</span>
        <span class="font-semibold text-gray-200">{{ weapon.totalPerksPossible }}</span>
      </div>
      <div class="flex items-center justify-between rounded-lg bg-gray-900/40 px-3 py-2">
        <span class="text-gray-400">Completion</span>
        <span class="font-semibold text-purple-300">{{ weapon.completionPercentage }}%</span>
      </div>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { DedupedWeapon } from '@/models/deduped-weapon'

defineProps<{
  weapon: DedupedWeapon
}>()
</script>

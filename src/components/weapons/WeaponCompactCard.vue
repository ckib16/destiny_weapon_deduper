<template>
  <RouterLink
    :to="`/weapons/${weapon.weaponHash}`"
    class="block rounded-xl border border-gray-700 bg-gray-800 p-4 transition hover:border-blue-500"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-start gap-3 min-w-0">
        <img
          v-if="weapon.weaponIcon"
          :src="`https://www.bungie.net${weapon.weaponIcon}`"
          :alt="weapon.weaponName"
          class="h-12 w-12 rounded"
        />
        <div class="min-w-0">
          <h3 class="text-lg font-semibold truncate">{{ weapon.weaponName }}</h3>
          <p class="text-xs text-gray-500">Hash: {{ weapon.weaponHash }}</p>
        </div>
      </div>
      <div class="text-right flex-shrink-0">
        <p class="text-lg font-semibold text-blue-300">{{ weapon.instances.length }}</p>
        <p class="text-[10px] text-gray-500 uppercase">Copies</p>
      </div>
    </div>

    <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
      <div class="flex items-center justify-between rounded-lg bg-gray-900/40 px-3 py-2">
        <span class="text-gray-400">Perks Possible</span>
        <span class="font-semibold text-gray-200">{{ weapon.totalPerksPossible }}</span>
      </div>
      <div class="flex items-center justify-between rounded-lg bg-gray-900/40 px-3 py-2">
        <span class="text-gray-400">Perks Owned</span>
        <span class="font-semibold text-green-300">{{ weapon.totalPerksOwned }}</span>
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

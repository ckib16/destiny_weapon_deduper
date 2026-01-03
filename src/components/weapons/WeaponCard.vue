<template>
  <div class="rounded-xl border border-gray-700 bg-gray-800 p-5 shadow-sm">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div class="flex items-start gap-4 min-w-0">
        <img
          v-if="weapon.weaponIcon"
          :src="`https://www.bungie.net${weapon.weaponIcon}`"
          :alt="weapon.weaponName"
          class="h-14 w-14 rounded"
        />
        <div class="min-w-0">
          <h3 class="text-xl font-semibold truncate">{{ weapon.weaponName }}</h3>
          <p class="text-xs text-gray-500">Hash: {{ weapon.weaponHash }}</p>
        </div>
      </div>

      <div class="flex items-center gap-6 text-sm text-gray-300">
        <div class="text-center">
          <p class="text-lg font-semibold text-blue-300">{{ weapon.instances.length }}</p>
          <p class="text-xs text-gray-500">Copies</p>
        </div>
        <div class="text-center">
          <p class="text-lg font-semibold text-green-300">{{ weapon.totalPerksOwned }}</p>
          <p class="text-xs text-gray-500">Owned perks</p>
        </div>
        <div class="text-center">
          <p class="text-lg font-semibold text-gray-200">{{ weapon.totalPerksPossible }}</p>
          <p class="text-xs text-gray-500">Possible perks</p>
        </div>
        <div class="text-center">
          <p class="text-lg font-semibold text-purple-300">{{ weapon.completionPercentage }}%</p>
          <p class="text-xs text-gray-500">Completion</p>
        </div>
      </div>
    </div>

    <div class="mt-5">
      <WeaponMatrix :columns="weapon.perkMatrix" />
    </div>

    <div class="mt-4">
      <InstanceList :instances="weapon.instances" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DedupedWeapon } from '@/models/deduped-weapon'
import WeaponMatrix from './WeaponMatrix.vue'
import InstanceList from './InstanceList.vue'

defineProps<{
  weapon: DedupedWeapon
}>()
</script>

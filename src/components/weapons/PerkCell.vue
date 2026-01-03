<template>
  <div class="group relative">
    <div
      class="flex items-center gap-2 rounded border px-2 py-1 text-xs"
      :class="perk.isOwned ? 'border-green-500/70 bg-green-900/40 text-green-100' : 'border-gray-700 bg-gray-900/40 text-gray-400'"
      tabindex="0"
      role="button"
      :aria-label="perkTooltip"
    >
      <img
        v-if="perk.icon"
        :src="`https://www.bungie.net${perk.icon}`"
        :alt="perk.name"
        class="h-5 w-5 rounded"
      />
      <div v-else class="h-5 w-5 rounded bg-gray-700"></div>
      <span class="truncate">{{ perk.name || 'Unknown Perk' }}</span>
    </div>
    <div
      class="pointer-events-none absolute left-0 top-full z-10 mt-2 w-56 rounded border border-gray-700 bg-gray-900 p-2 text-xs text-gray-200 opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100"
    >
      <p class="font-semibold text-gray-100">{{ perk.name || 'Unknown Perk' }}</p>
      <p class="mt-1 text-gray-400">{{ perk.description || 'No description available.' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Perk } from '@/models/perk'

const props = defineProps<{
  perk: Perk
}>()

const perkTooltip = `${props.perk.name}: ${props.perk.description || 'No description available.'}`
</script>

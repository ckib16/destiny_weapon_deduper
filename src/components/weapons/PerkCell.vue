<template>
  <div
    class="relative flex items-center gap-2 rounded border px-2 py-1 text-xs"
    :class="perk.isOwned ? 'border-green-500/70 bg-green-900/40 text-green-100' : 'border-gray-700 bg-gray-900/40 text-gray-400'"
    :title="perkTooltip"
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
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Perk } from '@/models/perk'

const props = defineProps<{
  perk: Perk
}>()

const perkTooltip = computed(() => {
  if (!props.perk.description) return props.perk.name
  return `${props.perk.name}: ${props.perk.description}`
})
</script>

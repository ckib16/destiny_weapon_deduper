<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <template v-if="weapon">
          <img
            v-if="weapon.weaponIcon"
            :src="`https://www.bungie.net${weapon.weaponIcon}`"
            :alt="weapon.weaponName"
            class="h-14 w-14 rounded"
          />
          <div>
            <h1 class="text-2xl font-bold">{{ weapon.weaponName }}</h1>
            <p class="text-xs text-gray-500">
              {{ weapon.instances.length }} copies<span v-if="subtitle"> {{ subtitle }}</span>
            </p>
          </div>
        </template>
        <h1 v-else class="text-3xl font-bold">{{ fallbackTitle }}</h1>
      </div>
      <button
        v-if="weapon"
        @click="$emit('back')"
        class="text-sm text-blue-400 hover:text-blue-300"
      >
        &larr; {{ backLabel }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <LoadingSpinner />
      <p class="mt-4 text-gray-400">{{ loadingMessage }}</p>
      <slot name="loading-extra"></slot>
    </div>

    <!-- Error State -->
    <ErrorMessage v-else-if="error" :message="error" />

    <!-- Not Found State -->
    <div v-else-if="!weapon" class="text-center py-12 text-gray-500">
      <p>{{ notFoundMessage }}</p>
    </div>

    <!-- Weapon Content -->
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
        <WeaponsCoverage :weapon="weapon" />
      </div>

      <div v-else-if="activeTab === 'godroll'">
        <WeaponsGodRoll :weapon="weapon" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import WeaponsCoverage from '@/components/weapons/WeaponsCoverage.vue'
import WeaponsGodRoll from '@/components/weapons/WeaponsGodRoll.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ErrorMessage from '@/components/common/ErrorMessage.vue'
import type { DedupedWeapon } from '@/models/deduped-weapon'

interface Props {
  weapon: DedupedWeapon | null
  loading?: boolean
  error?: string | null
  backLabel?: string
  subtitle?: string
  fallbackTitle?: string
  loadingMessage?: string
  notFoundMessage?: string
}

withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
  backLabel: 'Back to all weapons',
  subtitle: '',
  fallbackTitle: 'Weapon Details',
  loadingMessage: 'Loading...',
  notFoundMessage: 'Weapon not found. Try returning to the list.'
})

defineEmits<{
  back: []
}>()

const activeTab = ref<'coverage' | 'godroll'>('coverage')

const tabs = [
  { id: 'coverage', label: 'Perk Coverage' },
  { id: 'godroll', label: 'Set your God Roll' }
] as const
</script>

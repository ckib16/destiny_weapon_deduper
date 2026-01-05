<template>
  <div v-if="picks.length > 0 || isAdminMode" class="space-y-3">
    <!-- Collapsible Header -->
    <button
      @click="isExpanded = !isExpanded"
      class="w-full flex items-center justify-between p-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg border border-gray-700/50 transition-colors group"
    >
      <div class="flex items-center gap-2">
        <h4 class="font-bold text-lg text-gray-200">Community Picks</h4>
        <span
          v-if="picks.length > 0"
          class="text-xs px-2 py-0.5 rounded-full bg-purple-900/50 text-purple-300 border border-purple-700/50"
        >
          {{ picks.length }}
        </span>
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 text-gray-400 transition-transform duration-200"
        :class="{ 'rotate-180': isExpanded }"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Collapsible Content -->
    <div v-show="isExpanded" class="animate-in fade-in slide-in-from-top-2 duration-200">
      <!-- Admin Mode: Two Column Layout -->
      <div :class="isAdminMode ? 'grid grid-cols-1 lg:grid-cols-3 gap-4' : ''">
        <!-- Left Column: Picks List -->
        <div :class="isAdminMode ? 'lg:col-span-2' : ''" class="space-y-3">
          <!-- Loading State -->
          <div v-if="loading" class="p-4 bg-gray-800/50 rounded-lg border border-gray-700 text-center">
            <span class="text-gray-400 text-sm">Loading community picks...</span>
          </div>

          <!-- Empty State (only show in admin mode) -->
          <div v-else-if="picks.length === 0 && isAdminMode" class="p-4 bg-gray-800/50 rounded-lg border border-gray-700 text-center">
            <span class="text-gray-400 text-sm">No community picks for this weapon yet.</span>
          </div>

          <!-- Pick Cards -->
          <div
            v-for="pick in picks"
            :key="pick.id"
            class="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-3"
          >
        <!-- Header: Name + Tags + Source -->
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-2 flex-wrap min-w-0">
            <h5 class="font-bold text-sm text-gray-200">{{ pick.name }}</h5>
            <span
              class="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide"
              :class="getCategoryClasses(pick.category)"
            >
              {{ pick.category }}
            </span>
            <span class="text-xs text-gray-500">by {{ pick.streamer.name }}</span>
          </div>
          <a
            v-if="pick.sourceUrl"
            :href="pick.sourceUrl"
            target="_blank"
            class="flex-shrink-0 text-gray-400 hover:text-blue-400 transition-colors"
            title="View source"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        <!-- Notes -->
        <p v-if="pick.notes" class="text-xs text-gray-400 italic">{{ pick.notes }}</p>

        <!-- Selected Perks Preview -->
        <div class="flex flex-wrap gap-1">
          <span
            v-for="(type, hash) in pick.selection"
            :key="hash"
            class="text-[9px] px-1.5 py-0.5 rounded"
            :class="getPerkPreviewClass(type)"
          >
            {{ getPerkName(Number(hash)) }}
          </span>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-between pt-2 border-t border-gray-700/50">
          <button
            @click="emit('saveToMyRolls', pick)"
            class="text-xs px-3 py-1.5 rounded bg-green-700 hover:bg-green-600 text-white border border-green-600 transition-colors"
          >
            Save to my God Rolls
          </button>

          <!-- Admin Actions -->
          <div v-if="isAdminMode" class="flex items-center gap-2">
            <button
              @click="editPick(pick)"
              class="text-xs px-2 py-1 rounded bg-blue-900/50 hover:bg-blue-900 text-blue-200 border border-blue-800 transition-colors"
            >
              Edit
            </button>
            <button
              @click="confirmDelete(pick.id)"
              class="text-xs px-2 py-1 rounded bg-red-900/50 hover:bg-red-900 text-red-200 border border-red-800 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

          <!-- Admin: Add New Button -->
          <button
            v-if="isAdminMode"
            @click="showAddForm = true"
            class="w-full p-3 border-2 border-dashed border-gray-600 hover:border-gray-500 rounded-lg text-gray-400 hover:text-gray-300 transition-colors"
          >
            + Add Community Pick
          </button>
        </div>

        <!-- Right Column: Admin Instructions (only in admin mode) -->
        <div v-if="isAdminMode" class="space-y-3">
          <div class="bg-amber-900/20 border border-amber-700/50 rounded-lg p-4">
            <h5 class="font-bold text-sm text-amber-300 mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Admin Mode
            </h5>
            <div class="space-y-3 text-xs text-gray-300">
              <p class="font-semibold text-amber-200">How to add a Community Pick:</p>
              <ol class="list-decimal list-inside space-y-1.5 text-gray-400">
                <li>Select perks in <span class="text-white">God Roll Creator</span> below</li>
                <li>Click <span class="text-white">+ Add Community Pick</span></li>
                <li>Fill form &amp; click <span class="text-white">Copy from God Roll Creator</span></li>
                <li>Click <span class="text-white">Add Pick</span> (JSON copied to clipboard)</li>
                <li>Paste into <code class="bg-gray-800 px-1 rounded">data/community-picks.json</code></li>
                <li>Commit &amp; push to repo</li>
              </ol>
              <div class="mt-3 pt-3 border-t border-amber-700/30">
                <p class="text-amber-400/80 text-[10px] uppercase tracking-wider font-bold">Warning</p>
                <p class="text-gray-500 mt-1">Changes are temporary until committed. Refreshing the page will lose unsaved picks.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Admin: Add/Edit Form Modal -->
      <div
        v-if="showAddForm"
        class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        @click.self="closeForm"
      >
        <div class="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-4">
          <h3 class="font-bold text-lg text-gray-200">
            {{ editingPick ? 'Edit' : 'Add' }} Community Pick
          </h3>

          <!-- Name -->
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Name</label>
            <input
              v-model="formData.name"
              type="text"
              placeholder="e.g. Aztecross PvP Roll"
              class="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Category -->
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Category</label>
            <select
              v-model="formData.category"
              class="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="PVE">PVE</option>
              <option value="PVP">PVP</option>
              <option value="ALL">ALL</option>
            </select>
          </div>

          <!-- Streamer -->
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Streamer Name</label>
            <input
              v-model="formData.streamerName"
              type="text"
              placeholder="e.g. Aztecross"
              class="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Source URL -->
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Source URL (optional)</label>
            <input
              v-model="formData.sourceUrl"
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              class="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Notes -->
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Notes (optional)</label>
            <textarea
              v-model="formData.notes"
              rows="2"
              placeholder="Brief description of this roll..."
              class="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <!-- Perk Selection Info -->
          <div class="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
            <p class="text-xs text-gray-400 mb-2">
              <strong class="text-gray-300">Perk Selection:</strong> Use the God Roll Creator below to select perks, then copy the selection here.
            </p>
            <div class="flex flex-wrap gap-1 mb-2">
              <span
                v-for="(type, hash) in formData.selection"
                :key="hash"
                class="text-[9px] px-1.5 py-0.5 rounded"
                :class="getPerkPreviewClass(type)"
              >
                {{ getPerkName(Number(hash)) }}
              </span>
              <span v-if="Object.keys(formData.selection).length === 0" class="text-xs text-gray-500 italic">
                No perks selected
              </span>
            </div>
            <button
              @click="copyCurrentSelection"
              class="text-xs px-2 py-1 rounded bg-purple-900/50 hover:bg-purple-900 text-purple-200 border border-purple-800 transition-colors"
            >
              Copy from God Roll Creator
            </button>
          </div>

          <!-- Actions -->
          <div class="flex justify-between pt-2 border-t border-gray-700">
            <button
              @click="exportJson"
              class="text-xs px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600 transition-colors"
            >
              Export JSON
            </button>
            <div class="flex gap-2">
              <button
                @click="closeForm"
                class="text-xs px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                @click="saveForm"
                class="text-xs px-3 py-1.5 rounded bg-green-700 hover:bg-green-600 text-white border border-green-600 transition-colors"
              >
                {{ editingPick ? 'Update' : 'Add' }} Pick
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div
        v-if="deleteConfirmId"
        class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        @click.self="deleteConfirmId = null"
      >
        <div class="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-sm space-y-4">
          <h3 class="font-bold text-lg text-gray-200">Delete Community Pick?</h3>
          <p class="text-sm text-gray-400">This action cannot be undone. You'll need to re-add this pick manually.</p>
          <div class="flex justify-end gap-2">
            <button
              @click="deleteConfirmId = null"
              class="text-xs px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              @click="deletePick"
              class="text-xs px-3 py-1.5 rounded bg-red-700 hover:bg-red-600 text-white border border-red-600 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { DedupedWeapon } from '@/models/deduped-weapon'
import type { CommunityPick, SelectionType } from '@/models/community-pick'
import { communityPicksService } from '@/services/community-picks-service'

const props = defineProps<{
  weapon: DedupedWeapon
  currentSelection?: Record<number, SelectionType>
}>()

const emit = defineEmits<{
  saveToMyRolls: [pick: CommunityPick]
}>()

const route = useRoute()

// --- State ---
const isExpanded = ref(true)
const loading = ref(true)
const picks = ref<CommunityPick[]>([])

// Admin state
const isAdminMode = computed(() => route.query.admin === 'true')
const showAddForm = ref(false)
const editingPick = ref<CommunityPick | null>(null)
const deleteConfirmId = ref<string | null>(null)

// Form data
const formData = ref({
  name: '',
  category: 'PVE' as 'PVE' | 'PVP' | 'ALL',
  streamerName: '',
  sourceUrl: '',
  notes: '',
  selection: {} as Record<number, SelectionType>
})

// --- Load picks ---
const loadPicks = async () => {
  loading.value = true
  try {
    picks.value = await communityPicksService.getPicksForWeapon(props.weapon.weaponHash)
  } catch (error) {
    console.error('Failed to load community picks:', error)
    picks.value = []
  } finally {
    loading.value = false
  }
}

onMounted(loadPicks)
watch(() => props.weapon.weaponHash, loadPicks)

// --- Helpers ---
const perkNameCache = new Map<number, string>()
const getPerkName = (hash: number): string => {
  if (perkNameCache.has(hash)) return perkNameCache.get(hash)!
  for (const col of props.weapon.perkMatrix) {
    const p = col.availablePerks.find(p => p.hash === hash)
    if (p) {
      perkNameCache.set(hash, p.name)
      return p.name
    }
  }
  return `Perk ${hash}`
}

const getCategoryClasses = (category: string) => {
  switch (category) {
    case 'PVP': return 'bg-red-900/50 text-red-300 border border-red-700/50'
    case 'PVE': return 'bg-blue-900/50 text-blue-300 border border-blue-700/50'
    default: return 'bg-purple-900/50 text-purple-300 border border-purple-700/50'
  }
}

const getPerkPreviewClass = (type: SelectionType) => {
  if (type === 'OR') return 'bg-blue-900/50 text-blue-200 border border-blue-500/30'
  return 'bg-orange-900/50 text-orange-200 border border-orange-500/30'
}

// --- Admin functions ---
const editPick = (pick: CommunityPick) => {
  editingPick.value = pick
  formData.value = {
    name: pick.name,
    category: pick.category,
    streamerName: pick.streamer.name,
    sourceUrl: pick.sourceUrl || '',
    notes: pick.notes || '',
    selection: { ...pick.selection }
  }
  showAddForm.value = true
}

const confirmDelete = (id: string) => {
  deleteConfirmId.value = id
}

const deletePick = () => {
  if (!deleteConfirmId.value) return

  // Remove from local state (actual deletion requires updating the JSON file)
  picks.value = picks.value.filter(p => p.id !== deleteConfirmId.value)
  deleteConfirmId.value = null

  // Show export prompt
  exportAllPicks()
}

const closeForm = () => {
  showAddForm.value = false
  editingPick.value = null
  formData.value = {
    name: '',
    category: 'PVE',
    streamerName: '',
    sourceUrl: '',
    notes: '',
    selection: {}
  }
}

const copyCurrentSelection = () => {
  if (props.currentSelection) {
    formData.value.selection = { ...props.currentSelection }
  }
}

const saveForm = () => {
  const newPick: CommunityPick = {
    id: editingPick.value?.id || crypto.randomUUID(),
    name: formData.value.name,
    weaponHash: props.weapon.weaponHash,
    category: formData.value.category,
    streamer: { name: formData.value.streamerName },
    sourceUrl: formData.value.sourceUrl || undefined,
    notes: formData.value.notes || undefined,
    selection: { ...formData.value.selection },
    createdAt: editingPick.value?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  if (editingPick.value) {
    // Update existing
    const idx = picks.value.findIndex(p => p.id === editingPick.value!.id)
    if (idx !== -1) picks.value[idx] = newPick
  } else {
    // Add new
    picks.value.push(newPick)
  }

  closeForm()
  exportAllPicks()
}

const exportJson = () => {
  const pick: CommunityPick = {
    id: editingPick.value?.id || crypto.randomUUID(),
    name: formData.value.name,
    weaponHash: props.weapon.weaponHash,
    category: formData.value.category,
    streamer: { name: formData.value.streamerName },
    sourceUrl: formData.value.sourceUrl || undefined,
    notes: formData.value.notes || undefined,
    selection: { ...formData.value.selection },
    createdAt: editingPick.value?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  const json = JSON.stringify(pick, null, 2)
  navigator.clipboard.writeText(json)
  alert('Pick JSON copied to clipboard!')
}

const exportAllPicks = () => {
  const allPicks = {
    version: '1.0',
    lastUpdated: new Date().toISOString(),
    picks: picks.value
  }

  const json = JSON.stringify(allPicks, null, 2)
  navigator.clipboard.writeText(json)
  alert('Full community-picks.json copied to clipboard!\n\nPaste this into data/community-picks.json and commit.')
}
</script>

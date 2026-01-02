<template>
  <div>
    <button
      v-if="!authStore.isAuthenticated"
      @click="login"
      class="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
    >
      Login with Bungie
    </button>

    <div v-else class="text-center">
      <p class="text-green-400 mb-4">
        Welcome, {{ authStore.user?.displayName || 'Guardian' }}!
      </p>
      <RouterLink
        to="/weapons"
        class="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl inline-block"
      >
        View Your Weapons
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const login = () => {
  authStore.initiateLogin()
}
</script>

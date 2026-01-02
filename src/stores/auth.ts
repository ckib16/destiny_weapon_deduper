import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { bungieAuth } from '@/api/auth'
import { inventoryAPI, type DestinyMembership } from '@/api/inventory'
import type { BungieOAuthTokens, BungieUser } from '@/api/types'

interface StoredTokens {
  accessToken: string
  expiresAt: number
  membershipId: string
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const accessToken = ref<string | null>(null)
  const expiresAt = ref<number | null>(null)
  const membershipId = ref<string | null>(null)
  const user = ref<BungieUser | null>(null)
  const destinyMemberships = ref<DestinyMembership[]>([])
  const selectedMembership = ref<DestinyMembership | null>(null)

  // Computed
  const isAuthenticated = computed(() => {
    if (!accessToken.value || !expiresAt.value) {
      return false
    }
    // Check if token is expired
    return !bungieAuth.isTokenExpired(expiresAt.value)
  })

  // Actions
  function initializeFromStorage() {
    const storedTokens = localStorage.getItem('bungie_tokens')
    if (!storedTokens) return

    try {
      const tokens: StoredTokens = JSON.parse(storedTokens)

      // Check if token is still valid
      if (!bungieAuth.isTokenExpired(tokens.expiresAt)) {
        accessToken.value = tokens.accessToken
        expiresAt.value = tokens.expiresAt
        membershipId.value = tokens.membershipId
      } else {
        // Token expired, clear storage
        clearAuth()
      }
    } catch (err) {
      console.error('Failed to parse stored tokens:', err)
      clearAuth()
    }
  }

  function setTokens(tokens: BungieOAuthTokens) {
    accessToken.value = tokens.access_token
    expiresAt.value = Date.now() + (tokens.expires_in * 1000)
    membershipId.value = tokens.membership_id

    // Persist to localStorage
    const storedTokens: StoredTokens = {
      accessToken: accessToken.value,
      expiresAt: expiresAt.value,
      membershipId: membershipId.value
    }

    localStorage.setItem('bungie_tokens', JSON.stringify(storedTokens))
  }

  async function setUser(userData: BungieUser) {
    user.value = userData
    localStorage.setItem('bungie_user', JSON.stringify(userData))
  }

  async function loadUser() {
    // Try to load from storage first
    const storedUser = localStorage.getItem('bungie_user')
    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser)
        return
      } catch (err) {
        console.error('Failed to parse stored user:', err)
      }
    }

    // If not in storage or invalid, fetch from API
    if (accessToken.value) {
      try {
        const userData = await bungieAuth.getCurrentUser(accessToken.value)
        await setUser(userData)
      } catch (err) {
        console.error('Failed to fetch user data:', err)
      }
    }
  }

  async function loadDestinyMemberships() {
    // Try to load from storage first
    const storedMemberships = localStorage.getItem('destiny_memberships')
    if (storedMemberships) {
      try {
        const memberships = JSON.parse(storedMemberships)
        destinyMemberships.value = memberships
        // Select first membership by default
        if (memberships.length > 0 && !selectedMembership.value) {
          selectedMembership.value = memberships[0]
        }
        return
      } catch (err) {
        console.error('Failed to parse stored memberships:', err)
      }
    }

    // If not in storage or invalid, fetch from API
    if (accessToken.value) {
      try {
        const memberships = await inventoryAPI.getMemberships(accessToken.value)
        destinyMemberships.value = memberships
        localStorage.setItem('destiny_memberships', JSON.stringify(memberships))

        // Select first membership by default (usually the cross-save primary)
        if (memberships.length > 0) {
          selectedMembership.value = memberships[0]
        }
      } catch (err) {
        console.error('Failed to fetch Destiny memberships:', err)
      }
    }
  }

  function clearAuth() {
    accessToken.value = null
    expiresAt.value = null
    membershipId.value = null
    user.value = null
    destinyMemberships.value = []
    selectedMembership.value = null
    localStorage.removeItem('bungie_tokens')
    localStorage.removeItem('bungie_user')
    localStorage.removeItem('destiny_memberships')
  }

  function initiateLogin() {
    bungieAuth.initiateLogin()
  }

  async function handleCallback(code: string, state: string) {
    try {
      const tokens = await bungieAuth.handleCallback(code, state)
      setTokens(tokens)
      await loadUser()
      await loadDestinyMemberships()
    } catch (err) {
      clearAuth()
      throw err
    }
  }

  // Initialize on store creation
  initializeFromStorage()
  if (isAuthenticated.value && !user.value) {
    loadUser()
  }
  if (isAuthenticated.value && destinyMemberships.value.length === 0) {
    loadDestinyMemberships()
  }

  return {
    accessToken,
    expiresAt,
    membershipId,
    user,
    destinyMemberships,
    selectedMembership,
    isAuthenticated,
    setTokens,
    setUser,
    loadUser,
    loadDestinyMemberships,
    clearAuth,
    initiateLogin,
    handleCallback
  }
})

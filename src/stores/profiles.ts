import { defineStore } from 'pinia'
import { ref } from 'vue'
import { profilesAPI } from '@/services/api'

export const useProfilesStore = defineStore('profiles', () => {
  const profile = ref<Record<string, any> | null>(null)
  const items = ref<Record<string, unknown>[]>([]) // optional: keep for admin lists
  const loading = ref(false)
  const lastParams = ref<Record<string, unknown>>({})

  /**
   * Fetch current logged-in user profile
   */
  async function fetchCurrentProfile() {
    loading.value = true
    try {
      const response = await profilesAPI.get()
      profile.value = response.data
      return profile.value
    } finally {
      loading.value = false
    }
  }

  /**
   * Update owner profile
   */
  async function updateOwner(data: Record<string, unknown>) {
    if (!profile.value?.owner?.id) return

    await profilesAPI.updateOwner(profile.value.owner.id, data)
    await fetchCurrentProfile()
  }

  /**
   * Optional: Admin list functions
   */
  async function fetchList(params: Record<string, unknown> = {}) {
    lastParams.value = { ...params }
    loading.value = true
    try {
      const response = await profilesAPI.list(params)

      const data =
        response.data as
          | { results?: Record<string, unknown>[] }
          | Record<string, unknown>[]

      items.value = Array.isArray(data) ? data : (data.results ?? [])
    } finally {
      loading.value = false
    }
  }

  async function createItem(data: Record<string, unknown>) {
    await profilesAPI.create(data)
    await fetchList(lastParams.value)
  }

  async function updateItem(id: string | number, data: Record<string, unknown>) {
    await profilesAPI.update(id, data)
    await fetchList(lastParams.value)
  }

  async function deleteItem(id: string | number) {
    await profilesAPI.delete(id)
    await fetchList(lastParams.value)
  }

  return {
    profile,
    items,
    loading,
    fetchCurrentProfile,
    updateOwner,
    fetchList,
    createItem,
    updateItem,
    deleteItem,
  }
})

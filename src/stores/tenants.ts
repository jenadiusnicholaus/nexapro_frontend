import { defineStore } from 'pinia'
import { ref } from 'vue'
import { tenantsAPI } from '@/services/api'

export const useTenantsStore = defineStore('tenants', () => {
  const items = ref<Record<string, unknown>[]>([])
  const loading = ref(false)
  const lastParams = ref<Record<string, unknown>>({})

  async function fetchList(params: Record<string, unknown> = {}) {
    lastParams.value = { ...params }
    loading.value = true
    try {
      const response = await tenantsAPI.list(params)
      const data = response.data as { results?: Record<string, unknown>[] } | Record<string, unknown>[]
      items.value = Array.isArray(data) ? data : (data.results ?? [])
    } finally {
      loading.value = false
    }
  }

  async function createItem(data: Record<string, unknown>) {
    await tenantsAPI.create(data)
    await fetchList(lastParams.value)
  }

  async function updateItem(id: string | number, data: Record<string, unknown>) {
    await tenantsAPI.update(id, data)
    await fetchList(lastParams.value)
  }

  async function deleteItem(id: string | number) {
    await tenantsAPI.delete(id)
    await fetchList(lastParams.value)
  }

  return { items, loading, fetchList, createItem, updateItem, deleteItem }
})

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { tenanciesAPI } from '@/services/api'

export const useTenanciesStore = defineStore('tenancies', () => {
  const items = ref<Record<string, unknown>[]>([])
  const loading = ref(false)
  const lastParams = ref<Record<string, unknown>>({})

  async function fetchList(params: Record<string, unknown> = {}) {
    lastParams.value = { ...params }
    loading.value = true
    try {
      const response = await tenanciesAPI.list(params)
      const data = response.data as { results?: Record<string, unknown>[] } | Record<string, unknown>[]
      items.value = Array.isArray(data) ? data : (data.results ?? [])
    } finally {
      loading.value = false
    }
  }

  async function createItem(data: Record<string, unknown>) {
    await tenanciesAPI.create(data)
    await fetchList(lastParams.value)
  }

  async function moveOut(id: string | number, moveOutDate: string) {
    await tenanciesAPI.moveOut(id, moveOutDate)
    await fetchList(lastParams.value)
  }

  async function deleteItem(id: string | number) {
    await tenanciesAPI.delete(id)
    await fetchList(lastParams.value)
  }

  return { items, loading, fetchList, createItem, moveOut, deleteItem }
})

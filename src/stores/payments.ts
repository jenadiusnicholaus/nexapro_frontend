import { defineStore } from 'pinia'
import { ref } from 'vue'
import { paymentsAPI } from '@/services/api'

export const usePaymentsStore = defineStore('payments', () => {
  const items = ref<Record<string, unknown>[]>([])
  const loading = ref(false)
  const lastParams = ref<Record<string, unknown>>({})

  async function fetchList(params: Record<string, unknown> = {}) {
    lastParams.value = { ...params }
    loading.value = true
    try {
      const response = await paymentsAPI.list(params)
      const data = response.data as { results?: Record<string, unknown>[] } | Record<string, unknown>[]
      items.value = Array.isArray(data) ? data : (data.results ?? [])
    } finally {
      loading.value = false
    }
  }

  async function createItem(data: Record<string, unknown>) {
    await paymentsAPI.create(data)
    await fetchList(lastParams.value)
  }

  return { items, loading, fetchList, createItem }
})

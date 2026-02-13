import { defineStore } from 'pinia'
import { ref } from 'vue'
import { billingAPI } from '@/services/api'

export const useBillsStore = defineStore('bills', () => {
  const items = ref<Record<string, unknown>[]>([])
  const loading = ref(false)
  const lastParams = ref<Record<string, unknown>>({})

  async function fetchList(params: Record<string, unknown> = {}) {
    lastParams.value = { ...params }
    loading.value = true
    try {
      const response = await billingAPI.list(params)
      const data = response.data as { results?: Record<string, unknown>[] } | Record<string, unknown>[]
      items.value = Array.isArray(data) ? data : (data.results ?? [])
    } finally {
      loading.value = false
    }
  }

  async function generate(billingPeriod: string, dueDay: number) {
    const response = await billingAPI.generate(billingPeriod, dueDay)
    await fetchList(lastParams.value)
    return response
  }

  async function markOverdue() {
    await billingAPI.markOverdue()
    await fetchList(lastParams.value)
  }

  return { items, loading, fetchList, generate, markOverdue }
})

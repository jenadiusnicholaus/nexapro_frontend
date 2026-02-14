import { defineStore } from "pinia";
import { ref } from "vue";
import { billingAPI } from "@/services/api";

export const useBillsStore = defineStore("bills", () => {
  const items = ref<Record<string, unknown>[]>([]);
  const loading = ref(false);
  const lastParams = ref<Record<string, unknown>>({});

  async function fetchList(params: Record<string, unknown> = {}) {
    lastParams.value = { ...params };
    loading.value = true;
    try {
      const response = await billingAPI.list(params);
      const data = response.data as
        | { results?: Record<string, unknown>[] }
        | Record<string, unknown>[];
      items.value = Array.isArray(data) ? data : (data.results ?? []);
    } finally {
      loading.value = false;
    }
  }

  async function generate(billingPeriod: string, dueDay: number) {
    const response = await billingAPI.generate(billingPeriod, dueDay);
    // Ensure we refresh with current filters by using the last known params
    // If no params were stored, fetch without filters to get the full list
    const refreshParams =
      Object.keys(lastParams.value).length > 0 ? lastParams.value : {};
    await fetchList(refreshParams);
    return response;
  }

  async function markOverdue() {
    await billingAPI.markOverdue();
    const refreshParams =
      Object.keys(lastParams.value).length > 0 ? lastParams.value : {};
    await fetchList(refreshParams);
  }

  return { items, loading, fetchList, generate, markOverdue };
});

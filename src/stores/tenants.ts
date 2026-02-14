import { defineStore } from "pinia";
import { ref } from "vue";
import { tenantsAPI } from "@/services/api";

export const useTenantsStore = defineStore("tenants", () => {
  const items = ref<Record<string, unknown>[]>([]);
  const loading = ref(false);
  const lastParams = ref<Record<string, unknown>>({});

  async function fetchList(params: Record<string, unknown> = {}) {
    lastParams.value = { ...params };
    loading.value = true;
    try {
      const response = await tenantsAPI.list(params);
      const data = response.data as
        | { results?: Record<string, unknown>[] }
        | Record<string, unknown>[];
      items.value = Array.isArray(data) ? data : (data.results ?? []);
    } finally {
      loading.value = false;
    }
  }

  async function createItem(data: Record<string, unknown>) {
    await tenantsAPI.create(data);
    // Ensure we refresh with current filters by using the last known params
    // If no params were stored, fetch without filters to get the full list
    const refreshParams =
      Object.keys(lastParams.value).length > 0 ? lastParams.value : {};
    await fetchList(refreshParams);
  }

  async function updateItem(
    id: string | number,
    data: Record<string, unknown>,
  ) {
    await tenantsAPI.update(id, data);
    const refreshParams =
      Object.keys(lastParams.value).length > 0 ? lastParams.value : {};
    await fetchList(refreshParams);
  }

  async function deleteItem(id: string | number) {
    await tenantsAPI.delete(id);
    const refreshParams =
      Object.keys(lastParams.value).length > 0 ? lastParams.value : {};
    await fetchList(refreshParams);
  }

  return { items, loading, fetchList, createItem, updateItem, deleteItem };
});

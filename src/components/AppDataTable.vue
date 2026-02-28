<template>
  <VaDataTable
    :items="items"
    :columns="columns"
    :loading="loading"
    striped
    hoverable
    class="app-data-table premium-table"
    v-bind="tableAttrs"
  >
    <!-- Custom Loading Overlay -->
    <template #loading>
      <div class="table-loading-overlay">
        <VaLoadingIndicator size="large" color="primary" />
      </div>
    </template>
    <template
      v-for="name in slotNames"
      :key="name"
      #[name]="slotData"
    >
      <slot
        :name="name"
        v-bind="slotData || {}"
      />
    </template>
  </VaDataTable>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

withDefaults(
  defineProps<{
    items: any[]
    columns: { key: string; label?: string; sortable?: boolean; width?: number }[]
    loading?: boolean
    /** Extra props to pass to VaDataTable */
    tableAttrs?: Record<string, unknown>
  }>(),
  { loading: false, tableAttrs: () => ({}) },
)

const slots = useSlots()
const slotNames = computed(() => Object.keys(slots))
</script>

<style scoped>
.app-data-table {
  width: 100%;
  --va-data-table-thead-background: var(--va-background-element);
  --va-data-table-grid-tr-border: 1px solid var(--va-background-border);
  background: transparent !important;
}

.premium-table :deep(.va-data-table__table) {
  border-collapse: separate;
  border-spacing: 0 0.5rem;
  background: transparent !important;
}

.premium-table :deep(.va-data-table__table thead tr) {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 12px;
}

.premium-table :deep(.va-data-table__table thead th) {
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  font-weight: 700;
  color: var(--va-text-secondary);
  padding: 1.25rem 1rem;
  border-bottom: 2px solid var(--va-primary);
}

.premium-table :deep(.va-data-table__table tbody tr) {
  background: var(--va-background-card-primary) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.premium-table :deep(.va-data-table__table tbody tr:hover) {
  background: var(--va-background-element) !important;
  transform: scale(1.002) translateY(-1px);
  box-shadow: var(--va-shadow);
}

.premium-table :deep(.va-data-table__table td) {
  padding: 1rem;
  color: var(--va-text-primary);
  font-size: 0.9rem;
  border-top: 1px solid var(--va-background-border);
  border-bottom: 1px solid var(--va-background-border);
}

.table-loading-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  background: var(--va-background-primary);
  opacity: 0.8;
  backdrop-filter: blur(4px);
  border-radius: 12px;
}

/* Pagination Styling */
.premium-table :deep(.va-pagination) {
  margin-top: 1.5rem;
  justify-content: flex-end;
}

.premium-table :deep(.va-pagination__item--active) {
  background: linear-gradient(135deg, #22c55e, #10b981) !important;
  box-shadow: 0 0 15px rgba(34, 197, 94, 0.4);
}
</style>

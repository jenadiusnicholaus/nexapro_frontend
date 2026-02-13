<template>
  <VaDataTable
    :items="items"
    :columns="columns"
    :loading="loading"
    striped
    hoverable
    class="app-data-table"
    v-bind="tableAttrs"
  >
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
    items: unknown[]
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
}
.app-data-table :deep(.va-data-table) {
  --va-data-table-border: 1px solid rgba(0, 0, 0, 0.06);
}
</style>

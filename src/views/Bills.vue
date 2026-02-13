<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">Bills</h1>
      <div class="header-actions">
        <VaButton preset="secondary" @click="showGenerateModal = true">
          Generate Bills
        </VaButton>
        <VaButton @click="markOverdue">Mark Overdue</VaButton>
      </div>
    </div>

    <VaCard>
      <VaCardContent>
        <div class="filters mb-4">
          <VaInput
            v-model="searchQuery"
            placeholder="Search bills..."
            class="mr-2"
            style="max-width: 300px"
          >
            <template #prependInner>
              <VaIcon name="search" />
            </template>
          </VaInput>
          <VaSelect
            v-model="filterStatus"
            :options="statusOptions"
            placeholder="Filter by status"
            style="max-width: 200px"
          />
          <VaInput
            v-model="filterPeriod"
            placeholder="Billing Period (YYYY-MM)"
            style="max-width: 200px"
          />
        </div>

        <AppDataTable
          :items="billsStore.items"
          :columns="columns"
          :loading="billsStore.loading"
        >
          <template #cell(status)="{ rowData }">
            <VaChip :color="getStatusColor(rowData.status)">
              {{ rowData.status }}
            </VaChip>
          </template>
          <template #cell(amount)="{ rowData }">
            ${{ Number(rowData.amount || 0).toFixed(2) }}
          </template>
          <template #cell(balance)="{ rowData }">
            ${{ Number(rowData.balance || 0).toFixed(2) }}
          </template>
        </AppDataTable>
      </VaCardContent>
    </VaCard>

    <!-- Generate Bills Modal -->
    <VaModal v-model="showGenerateModal" title="Generate Monthly Bills" hide-default-actions size="medium">
      <VaForm ref="generateForm" @submit.prevent="generateBills">
        <VaInput
          v-model="generateData.billing_period"
          label="Billing Period (YYYY-MM)"
          placeholder="2026-03"
          :rules="[validators.required]"
          class="mb-4"
        />
        <VaInput
          v-model="generateData.due_day"
          label="Due Day (1-28)"
          type="number"
          min="1"
          max="28"
          :rules="[validators.required]"
          class="mb-4"
        />
        <div class="modal-actions">
          <VaButton preset="secondary" @click="showGenerateModal = false">
            Cancel
          </VaButton>
          <VaButton type="submit" :loading="generating">Generate</VaButton>
        </div>
      </VaForm>
    </VaModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import AppDataTable from '@/components/AppDataTable.vue'
import { useAppToast } from '@/composables/useAppToast'
import { useBillsStore } from '@/stores'
import { validators } from '@/utils/validators'

const { success, error } = useAppToast()
const billsStore = useBillsStore()

const generating = ref(false)
const showGenerateModal = ref(false)
const searchQuery = ref('')
const filterStatus = ref('')
const filterPeriod = ref('')
const generateForm = ref<{ validate: () => Promise<boolean> } | null>(null)

const statusOptions = ['unpaid', 'paid', 'partially_paid', 'overdue']

const generateData = ref({
  billing_period: '',
  due_day: 5,
})

const columns = [
  { key: 'tenant_name', label: 'Tenant', sortable: true },
  { key: 'unit_number', label: 'Unit', sortable: true },
  { key: 'property_name', label: 'Property', sortable: true },
  { key: 'billing_period', label: 'Period', sortable: true },
  { key: 'amount', label: 'Amount', sortable: true },
  { key: 'due_date', label: 'Due Date', sortable: true },
  { key: 'balance', label: 'Balance', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
]

const getStatusColor = (status: unknown) => {
  const colors: Record<string, string> = {
    unpaid: 'warning',
    paid: 'success',
    partially_paid: 'info',
    overdue: 'danger',
  }
  return colors[String(status)] || 'secondary'
}

const loadBills = () => {
  const params: Record<string, unknown> = {}
  if (searchQuery.value) params.search = searchQuery.value
  if (filterStatus.value) params.status = filterStatus.value
  if (filterPeriod.value) params.billing_period = filterPeriod.value
  return billsStore.fetchList(params)
}

const generateBills = async () => {
  const isValid = await generateForm.value?.validate()
  if (!isValid) return

  generating.value = true
  try {
    const response = await billsStore.generate(
      generateData.value.billing_period,
      generateData.value.due_day
    )
    const data = response.data as { created: number; skipped: number }
    success(`Generated ${data.created} bills, skipped ${data.skipped}`)
    showGenerateModal.value = false
    generateData.value = { billing_period: '', due_day: 5 }
  } catch (err) {
    console.error('Error generating bills:', err)
    error('Failed to generate bills')
  } finally {
    generating.value = false
  }
}

const markOverdue = async () => {
  if (!confirm('Mark all unpaid bills past due date as overdue?')) return

  try {
    await billsStore.markOverdue()
    success('Bills marked as overdue')
  } catch (err) {
    console.error('Error marking overdue:', err)
    error('Failed to mark bills as overdue')
  }
}

onMounted(() => {
  loadBills().catch((err) => console.error('Error loading bills:', err))
})

let filterDebounce: ReturnType<typeof setTimeout> | null = null
watch([searchQuery, filterStatus, filterPeriod], () => {
  if (filterDebounce) clearTimeout(filterDebounce)
  filterDebounce = setTimeout(() => {
    loadBills().catch((err) => console.error('Error loading bills:', err))
    filterDebounce = null
  }, 300)
})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  margin: 0;
  color: var(--va-primary);
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}
</style>

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

        <VaDataTable
          :items="bills"
          :columns="columns"
          :loading="loading"
        >
          <template #cell(status)="{ rowData }">
            <VaChip :color="getStatusColor(rowData.status)">
              {{ rowData.status }}
            </VaChip>
          </template>
          <template #cell(amount)="{ rowData }">
            ${{ parseFloat(rowData.amount || 0).toFixed(2) }}
          </template>
          <template #cell(balance)="{ rowData }">
            ${{ parseFloat(rowData.balance || 0).toFixed(2) }}
          </template>
        </VaDataTable>
      </VaCardContent>
    </VaCard>

    <!-- Generate Bills Modal -->
    <VaModal v-model="showGenerateModal" title="Generate Monthly Bills">
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

<script setup>
import { ref, onMounted } from 'vue'
import { billingAPI } from '@/services/api'
import { validators } from '@/utils/validators'

const loading = ref(false)
const generating = ref(false)
const bills = ref([])
const showGenerateModal = ref(false)
const searchQuery = ref('')
const filterStatus = ref('')
const filterPeriod = ref('')
const generateForm = ref(null)

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

const getStatusColor = (status) => {
  const colors = {
    unpaid: 'warning',
    paid: 'success',
    partially_paid: 'info',
    overdue: 'danger',
  }
  return colors[status] || 'secondary'
}

const loadBills = async () => {
  loading.value = true
  try {
    const params = {}
    if (searchQuery.value) params.search = searchQuery.value
    if (filterStatus.value) params.status = filterStatus.value
    if (filterPeriod.value) params.billing_period = filterPeriod.value

    const response = await billingAPI.list(params)
    bills.value = response.data.results || response.data
  } catch (error) {
    console.error('Error loading bills:', error)
  } finally {
    loading.value = false
  }
}

const generateBills = async () => {
  const isValid = await generateForm.value?.validate()
  if (!isValid) return

  generating.value = true
  try {
    const response = await billingAPI.generate(
      generateData.value.billing_period,
      generateData.value.due_day
    )
    alert(`Generated ${response.data.created} bills, skipped ${response.data.skipped}`)
    showGenerateModal.value = false
    generateData.value = { billing_period: '', due_day: 5 }
    loadBills()
  } catch (error) {
    console.error('Error generating bills:', error)
  } finally {
    generating.value = false
  }
}

const markOverdue = async () => {
  if (!confirm('Mark all unpaid bills past due date as overdue?')) return

  try {
    await billingAPI.markOverdue()
    loadBills()
  } catch (error) {
    console.error('Error marking overdue:', error)
  }
}

onMounted(() => {
  loadBills()
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

<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">Payments</h1>
      <VaButton @click="showModal = true">Record Payment</VaButton>
    </div>

    <VaCard>
      <VaCardContent>
        <div class="filters mb-4">
          <VaInput
            v-model="searchQuery"
            placeholder="Search payments..."
            class="mr-2"
            style="max-width: 300px"
          >
            <template #prependInner>
              <VaIcon name="search" />
            </template>
          </VaInput>
          <VaSelect
            v-model="filterMethod"
            :options="paymentMethods"
            placeholder="Filter by method"
            style="max-width: 200px"
          />
        </div>

        <AppDataTable
          :items="paymentsStore.items"
          :columns="columns"
          :loading="paymentsStore.loading"
        >
          <template #cell(amount_paid)="{ rowData }">
            ${{ Number(rowData.amount_paid || 0).toFixed(2) }}
          </template>
        </AppDataTable>
      </VaCardContent>
    </VaCard>

    <!-- Add Payment Modal -->
    <VaModal v-model="showModal" title="Record Payment" hide-default-actions size="medium">
      <VaForm ref="paymentForm" @submit.prevent="savePayment">
        <VaSelect
          v-model="formData.bill"
          label="Bill"
          :options="billOptions"
          :rules="[validators.required]"
          class="mb-4"
        />
        <VaSelect
          v-model="formData.tenancy"
          label="Tenancy"
          :options="tenancyOptions"
          :rules="[validators.required]"
          class="mb-4"
        />
        <VaInput
          v-model="formData.amount_paid"
          label="Amount Paid"
          type="number"
          :rules="[validators.required]"
          class="mb-4"
        />
        <VaInput
          v-model="formData.payment_date"
          label="Payment Date"
          type="date"
          :rules="[validators.required]"
          class="mb-4"
        />
        <VaSelect
          v-model="formData.payment_method"
          label="Payment Method"
          :options="paymentMethods"
          :rules="[validators.required]"
          class="mb-4"
        />
        <VaInput
          v-model="formData.reference_number"
          label="Reference Number"
          class="mb-4"
        />
        <VaTextarea
          v-model="formData.notes"
          label="Notes"
          class="mb-4"
        />
        <div class="modal-actions">
          <VaButton preset="secondary" @click="closeModal">Cancel</VaButton>
          <VaButton type="submit" :loading="saving">Save</VaButton>
        </div>
      </VaForm>
    </VaModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import AppDataTable from '@/components/AppDataTable.vue'
import { useAppToast } from '@/composables/useAppToast'
import { usePaymentsStore } from '@/stores'
import { billingAPI, tenanciesAPI } from '@/services/api'
import { buildPayload } from '@/utils/apiPayload'
import { validators } from '@/utils/validators'

const { success, error } = useAppToast()
const paymentsStore = usePaymentsStore()

const saving = ref(false)
const bills = ref<Record<string, unknown>[]>([])
const tenancies = ref<Record<string, unknown>[]>([])
const showModal = ref(false)
const searchQuery = ref('')
const filterMethod = ref('')
const paymentForm = ref<{ validate: () => Promise<boolean> } | null>(null)

const paymentMethods = ['cash', 'bank', 'mobile_money', 'cheque', 'other']

const formData = ref({
  bill: null,
  tenancy: null,
  amount_paid: '',
  payment_date: '',
  payment_method: 'cash',
  reference_number: '',
  notes: '',
})

const columns = [
  { key: 'tenant_name', label: 'Tenant', sortable: true },
  { key: 'bill_period', label: 'Bill Period', sortable: true },
  { key: 'amount_paid', label: 'Amount', sortable: true },
  { key: 'payment_date', label: 'Payment Date', sortable: true },
  { key: 'payment_method', label: 'Method', sortable: true },
  { key: 'reference_number', label: 'Reference' },
]

const billOptions = computed(() =>
  bills.value
    .filter((b) => b.status !== 'paid')
    .map((b) => ({
      value: b.id,
      text: `${b.tenant_name} - ${b.billing_period} - $${b.amount}`,
    }))
)

const tenancyOptions = computed(() =>
  tenancies.value
    .filter((t) => t.status === 'active')
    .map((t) => ({
      value: t.id,
      text: `${t.tenant_name} - ${t.unit_number}`,
    }))
)

const loadPayments = () => {
  const params: Record<string, unknown> = { ordering: '-created_at' }
  if (searchQuery.value) params.search = searchQuery.value
  if (filterMethod.value) params.payment_method = filterMethod.value
  return paymentsStore.fetchList(params)
}

const loadBills = async () => {
  try {
    const response = await billingAPI.list({ status: 'unpaid' })
    const data = response.data as { results?: Record<string, unknown>[] }
    bills.value = data.results ?? []
  } catch (err) {
    console.error('Error loading bills:', err)
  }
}

const loadTenancies = async () => {
  try {
    const response = await tenanciesAPI.list({ status: 'active' })
    const data = response.data as { results?: Record<string, unknown>[] }
    tenancies.value = data.results ?? []
  } catch (err) {
    console.error('Error loading tenancies:', err)
  }
}

const savePayment = async () => {
  const isValid = await paymentForm.value?.validate()
  if (!isValid) return

  const payload = buildPayload(formData.value, ['bill', 'tenancy'])
  saving.value = true
  try {
    await paymentsStore.createItem(payload)
    closeModal()
    success('Payment recorded')
    await loadBills()
  } catch (err) {
    console.error('Error saving payment:', err)
    error('Failed to record payment')
  } finally {
    saving.value = false
  }
}

const closeModal = () => {
  showModal.value = false
  formData.value = {
    bill: null,
    tenancy: null,
    amount_paid: '',
    payment_date: '',
    payment_method: 'cash',
    reference_number: '',
    notes: '',
  }
}

onMounted(() => {
  loadPayments().catch((err) => console.error('Error loading payments:', err))
  loadBills()
  loadTenancies()
})

let filterDebounce: ReturnType<typeof setTimeout> | null = null
watch([searchQuery, filterMethod], () => {
  if (filterDebounce) clearTimeout(filterDebounce)
  filterDebounce = setTimeout(() => {
    loadPayments().catch((err) => console.error('Error loading payments:', err))
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

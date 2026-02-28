<template>
  <div class="payments-page">
    <div class="page-header-premium">
      <div class="header-content">
        <h1 class="premium-title">Payments</h1>
        <p class="premium-subtitle">Track and record financial transactions</p>
      </div>
      <VaButton 
        size="large" 
        class="premium-add-btn"
        icon="add"
        @click="showModal = true"
      >
        Record Payment
      </VaButton>
    </div>

    <div class="stats-mini-grid mb-6">
      <div class="stat-card-glass">
        <div class="stat-icon-wrap emerald">
          <VaIcon name="payments" size="24px" />
        </div>
        <div class="stat-info">
          <span class="stat-label">Total Transactions</span>
          <span class="stat-value">{{ paymentsStore.items.length }}</span>
        </div>
      </div>
    </div>

    <VaCard class="premium-card">
      <VaCardContent>
        <div class="filters-premium mb-6">
          <div class="search-wrap">
            <VaInput
              v-model="searchQuery"
              placeholder="Search payments..."
              class="premium-input-search"
              background="rgba(255,255,255,0.03)"
            >
              <template #prependInner>
                <VaIcon name="search" color="#22c55e" />
              </template>
            </VaInput>
          </div>
          <div class="select-wrap">
            <VaSelect
              v-model="filterMethod"
              :options="paymentMethods"
              placeholder="All Methods"
              class="premium-select"
              background="rgba(255,255,255,0.03)"
            />
          </div>
        </div>

        <AppDataTable
          :items="paymentsStore.items"
          :columns="columns"
          :loading="paymentsStore.loading"
        >
          <template #cell(tenant_name)="{ rowData }">
            <div class="tenant-cell">
              <span class="tenant-name">{{ rowData.tenant_name }}</span>
              <span class="bill-info">Period: {{ rowData.bill_period }}</span>
            </div>
          </template>

          <template #cell(amount_paid)="{ rowData }">
            <span class="amount-cell-premium">
              ${{ Number(rowData.amount_paid || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
            </span>
          </template>

          <template #cell(payment_method)="{ rowData }">
            <div class="method-cell">
              <VaIcon :name="getMethodIcon(rowData.payment_method)" size="small" class="mr-2" />
              <span class="capitalize">{{ rowData.payment_method.replace('_', ' ') }}</span>
            </div>
          </template>

          <template #cell(reference_number)="{ rowData }">
            <code class="ref-code">{{ rowData.reference_number || 'N/A' }}</code>
          </template>
        </AppDataTable>
      </VaCardContent>
    </VaCard>

    <!-- Add Payment Modal Premium -->
    <VaModal v-model="showModal" title="Record Payment" hide-default-actions size="medium" class="premium-modal">
      <div class="modal-inner">
        <VaForm ref="paymentForm" @submit.prevent="savePayment" class="premium-form">
          <VaSelect
            v-model="formData.bill"
            label="Bill"
            :options="billOptions"
            :rules="[validators.required]"
            class="mb-4"
            background="rgba(255,255,255,0.03)"
          />
          <VaSelect
            v-model="formData.tenancy"
            label="Tenancy"
            :options="tenancyOptions"
            :rules="[validators.required]"
            class="mb-4"
            background="rgba(255,255,255,0.03)"
          />
          <div class="form-grid">
            <VaInput
              v-model="formData.amount_paid"
              label="Amount Paid"
              type="number"
              :rules="[validators.required]"
              class="mb-4"
              background="rgba(255,255,255,0.03)"
            />
            <VaInput
              v-model="formData.payment_date"
              label="Payment Date"
              type="date"
              :rules="[validators.required]"
              class="mb-4"
              background="rgba(255,255,255,0.03)"
            />
          </div>
          <div class="form-grid">
            <VaSelect
              v-model="formData.payment_method"
              label="Payment Method"
              :options="paymentMethods"
              :rules="[validators.required]"
              class="mb-4"
              background="rgba(255,255,255,0.03)"
            />
            <VaInput
              v-model="formData.reference_number"
              label="Reference Number"
              class="mb-4"
              background="rgba(255,255,255,0.03)"
            />
          </div>
          <VaTextarea
            v-model="formData.notes"
            label="Notes"
            class="mb-4"
            background="rgba(255,255,255,0.03)"
          />
          <div class="modal-footer">
            <VaButton preset="secondary" @click="closeModal" class="cancel-btn">Cancel</VaButton>
            <VaButton type="submit" :loading="saving" class="save-btn-premium">Confirm Payment</VaButton>
          </div>
        </VaForm>
      </div>
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
  { key: 'tenant_name', label: 'Tenant & Period', sortable: true },
  { key: 'amount_paid', label: 'Amount', sortable: true },
  { key: 'payment_date', label: 'Date', sortable: true },
  { key: 'payment_method', label: 'Method', sortable: true },
  { key: 'reference_number', label: 'Reference' },
]

const getMethodIcon = (method: string) => {
  const icons: Record<string, string> = {
    cash: 'account_balance_wallet',
    bank: 'account_balance',
    mobile_money: 'smartphone',
    cheque: 'receipt_long',
    other: 'more_horiz',
  }
  return icons[method] || 'payments'
}

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

let filterDebounce: ReturnType<typeof setTimeout> | null = null;
watch([searchQuery, filterMethod], () => {
  if (filterDebounce) clearTimeout(filterDebounce);
  filterDebounce = setTimeout(() => {
    loadPayments().catch((err) => console.error('Error loading payments:', err));
    filterDebounce = null;
  }, 300);
});
</script>

<style scoped>
.payments-page {
  padding: 1.5rem;
  min-height: calc(100vh - 4rem);
}

.page-header-premium {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2.5rem;
}

.premium-title {
  font-size: 2.25rem;
  font-weight: 800;
  color: var(--va-text-primary);
  margin: 0;
  letter-spacing: -0.02em;
}

.premium-subtitle {
  color: var(--va-text-secondary);
  font-size: 1rem;
  margin: 0.25rem 0 0;
}

.premium-add-btn {
  background: linear-gradient(135deg, #22c55e, #10b981) !important;
  color: white !important;
  font-weight: 700 !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3) !important;
  transition: all 0.3s ease !important;
}

.premium-add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(34, 197, 94, 0.4) !important;
}

/* Stats */
.stats-mini-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card-glass {
  background: var(--va-background-card-primary);
  backdrop-filter: blur(10px);
  border: 1px solid var(--va-background-border);
  padding: 1.25rem;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon-wrap.emerald {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  color: var(--va-text-secondary);
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--va-text-primary);
}

/* Premium Card & Filters */
.premium-card {
  background: var(--va-background-card-primary) !important;
  backdrop-filter: blur(20px) !important;
  border: 1px solid var(--va-background-border) !important;
  border-radius: 20px !important;
}

.filters-premium {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.search-wrap {
  flex: 1;
  min-width: 300px;
}

.select-wrap {
  width: 200px;
}

.premium-input-search :deep(.va-input-wrapper),
.premium-select :deep(.va-input-wrapper) {
  border-radius: 12px !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

/* Cell Styles */
.tenant-cell {
  display: flex;
  flex-direction: column;
}

.tenant-name {
  font-weight: 700;
  color: #f1f5f9;
}

.bill-info {
  font-size: 0.75rem;
  color: #64748b;
}

.amount-cell-premium {
  font-weight: 700;
  color: #22c55e;
  font-size: 1.05rem;
}

.method-cell {
  display: flex;
  align-items: center;
  color: #94a3b8;
}

.ref-code {
  background: rgba(255, 255, 255, 0.05);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  color: #38bdf8;
  font-family: 'Inter', monospace;
  font-size: 0.85rem;
}

/* Modal Premium */
.premium-modal {
  --va-modal-background: var(--va-background-primary);
  --va-modal-border-radius: 24px;
}

.modal-inner {
  padding: 1.5rem 0.5rem;
}

.premium-form :deep(.va-input-wrapper) {
  border-radius: 12px !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.save-btn-premium {
  background: linear-gradient(135deg, #22c55e, #10b981) !important;
  border-radius: 10px !important;
  font-weight: 700 !important;
}

.cancel-btn {
  border-radius: 10px !important;
}

.mr-2 { margin-right: 0.5rem; }
.capitalize { text-transform: capitalize; }

@media (max-width: 768px) {
  .page-header-premium {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>

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

        <VaDataTable
          :items="payments"
          :columns="columns"
          :loading="loading"
        >
          <template #cell(amount_paid)="{ rowData }">
            ${{ parseFloat(rowData.amount_paid || 0).toFixed(2) }}
          </template>
        </VaDataTable>
      </VaCardContent>
    </VaCard>

    <!-- Add Payment Modal -->
    <VaModal v-model="showModal" title="Record Payment">
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

<script setup>
import { ref, onMounted, computed } from 'vue'
import { paymentsAPI, billingAPI, tenanciesAPI } from '@/services/api'
import { validators } from '@/utils/validators'

const loading = ref(false)
const saving = ref(false)
const payments = ref([])
const bills = ref([])
const tenancies = ref([])
const showModal = ref(false)
const searchQuery = ref('')
const filterMethod = ref('')
const paymentForm = ref(null)

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

const loadPayments = async () => {
  loading.value = true
  try {
    const params = { ordering: '-created_at' }
    if (searchQuery.value) params.search = searchQuery.value
    if (filterMethod.value) params.payment_method = filterMethod.value

    const response = await paymentsAPI.list(params)
    payments.value = response.data.results || response.data
  } catch (error) {
    console.error('Error loading payments:', error)
  } finally {
    loading.value = false
  }
}

const loadBills = async () => {
  try {
    const response = await billingAPI.list({ status: 'unpaid' })
    bills.value = response.data.results || response.data
  } catch (error) {
    console.error('Error loading bills:', error)
  }
}

const loadTenancies = async () => {
  try {
    const response = await tenanciesAPI.list({ status: 'active' })
    tenancies.value = response.data.results || response.data
  } catch (error) {
    console.error('Error loading tenancies:', error)
  }
}

const savePayment = async () => {
  const isValid = await paymentForm.value?.validate()
  if (!isValid) return

  saving.value = true
  try {
    await paymentsAPI.create(formData.value)
    closeModal()
    loadPayments()
    loadBills() // Refresh bills to update status
  } catch (error) {
    console.error('Error saving payment:', error)
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
  loadPayments()
  loadBills()
  loadTenancies()
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

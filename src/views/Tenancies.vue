<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">Tenancies</h1>
      <VaButton @click="showMoveInModal = true">Move-In Tenant</VaButton>
    </div>

    <VaCard>
      <VaCardContent>
        <div class="filters mb-4">
          <VaInput
            v-model="searchQuery"
            placeholder="Search tenancies..."
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
        </div>

        <VaDataTable
          :items="tenancies"
          :columns="columns"
          :loading="loading"
        >
          <template #cell(status)="{ rowData }">
            <VaChip :color="getStatusColor(rowData.status)">
              {{ rowData.status }}
            </VaChip>
          </template>
          <template #cell(actions)="{ rowData }">
            <VaButton
              v-if="rowData.status === 'active'"
              preset="plain"
              icon="exit_to_app"
              size="small"
              color="warning"
              @click="openMoveOutModal(rowData)"
            >
              Move Out
            </VaButton>
          </template>
        </VaDataTable>
      </VaCardContent>
    </VaCard>

    <!-- Move-In Modal -->
    <VaModal v-model="showMoveInModal" title="Move-In Tenant">
      <VaForm ref="moveInForm" @submit.prevent="saveMoveIn">
        <VaSelect
          v-model="moveInData.tenant"
          label="Tenant"
          :options="tenantOptions"
          :rules="[validators.required]"
          class="mb-4"
        />
        <VaSelect
          v-model="moveInData.unit"
          label="Unit"
          :options="unitOptions"
          :rules="[validators.required]"
          class="mb-4"
        />
        <VaInput
          v-model="moveInData.move_in_date"
          label="Move-In Date"
          type="date"
          :rules="[validators.required]"
          class="mb-4"
        />
        <VaInput
          v-model="moveInData.rent_amount"
          label="Rent Amount"
          type="number"
          :rules="[validators.required]"
          class="mb-4"
        />
        <VaInput
          v-model="moveInData.deposit_amount"
          label="Deposit Amount"
          type="number"
          :rules="[validators.required]"
          class="mb-4"
        />
        <VaInput
          v-model="moveInData.contract_start"
          label="Contract Start Date"
          type="date"
          :rules="[validators.required]"
          class="mb-4"
        />
        <VaInput
          v-model="moveInData.contract_end"
          label="Contract End Date"
          type="date"
          class="mb-4"
        />
        <div class="modal-actions">
          <VaButton preset="secondary" @click="closeMoveInModal">Cancel</VaButton>
          <VaButton type="submit" :loading="saving">Save</VaButton>
        </div>
      </VaForm>
    </VaModal>

    <!-- Move-Out Modal -->
    <VaModal v-model="moveOutModalOpen" title="Move-Out Tenant">
      <VaForm ref="moveOutForm" @submit.prevent="saveMoveOut">
        <VaInput
          v-model="moveOutDate"
          label="Move-Out Date"
          type="date"
          :rules="[validators.required]"
          class="mb-4"
        />
        <div class="modal-actions">
          <VaButton preset="secondary" @click="closeMoveOutModal">Cancel</VaButton>
          <VaButton type="submit" :loading="saving">Confirm Move-Out</VaButton>
        </div>
      </VaForm>
    </VaModal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { tenanciesAPI, tenantsAPI, unitsAPI } from '@/services/api'
import { validators } from '@/utils/validators'

const loading = ref(false)
const saving = ref(false)
const tenancies = ref([])
const tenants = ref([])
const units = ref([])
const showMoveInModal = ref(false)
const moveOutModalOpen = ref(false)
const editingTenancyId = ref(null)
const searchQuery = ref('')
const filterStatus = ref('')
const moveInForm = ref(null)
const moveOutForm = ref(null)
const moveOutDate = ref('')

const statusOptions = ['active', 'completed', 'terminated']

const moveInData = ref({
  tenant: null,
  unit: null,
  move_in_date: '',
  rent_amount: '',
  deposit_amount: '',
  contract_start: '',
  contract_end: '',
  status: 'active',
})

const columns = [
  { key: 'tenant_name', label: 'Tenant', sortable: true },
  { key: 'unit_number', label: 'Unit', sortable: true },
  { key: 'property_name', label: 'Property', sortable: true },
  { key: 'move_in_date', label: 'Move-In Date', sortable: true },
  { key: 'rent_amount', label: 'Rent', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'actions', label: 'Actions', width: 150 },
]

const tenantOptions = computed(() =>
  tenants.value.map((t) => ({ value: t.id, text: t.full_name }))
)

const unitOptions = computed(() =>
  units.value
    .filter((u) => u.status === 'vacant')
    .map((u) => ({ value: u.id, text: `${u.unit_number} - ${u.property_name}` }))
)

const getStatusColor = (status) => {
  const colors = {
    active: 'success',
    completed: 'info',
    terminated: 'danger',
  }
  return colors[status] || 'secondary'
}

const loadTenancies = async () => {
  loading.value = true
  try {
    const params = {}
    if (searchQuery.value) params.search = searchQuery.value
    if (filterStatus.value) params.status = filterStatus.value

    const response = await tenanciesAPI.list(params)
    tenancies.value = response.data.results || response.data
  } catch (error) {
    console.error('Error loading tenancies:', error)
  } finally {
    loading.value = false
  }
}

const loadTenants = async () => {
  try {
    const response = await tenantsAPI.list()
    tenants.value = response.data.results || response.data
  } catch (error) {
    console.error('Error loading tenants:', error)
  }
}

const loadUnits = async () => {
  try {
    const response = await unitsAPI.list({ status: 'vacant' })
    units.value = response.data.results || response.data
  } catch (error) {
    console.error('Error loading units:', error)
  }
}

const saveMoveIn = async () => {
  const isValid = await moveInForm.value?.validate()
  if (!isValid) return

  saving.value = true
  try {
    await tenanciesAPI.create(moveInData.value)
    closeMoveInModal()
    loadTenancies()
    loadUnits() // Refresh units to update vacant status
  } catch (error) {
    console.error('Error creating tenancy:', error)
  } finally {
    saving.value = false
  }
}

const openMoveOutModal = (tenancy) => {
  editingTenancyId.value = tenancy.id
  moveOutDate.value = ''
  moveOutModalOpen.value = true
}

const saveMoveOut = async () => {
  const isValid = await moveOutForm.value?.validate()
  if (!isValid) return

  saving.value = true
  try {
    await tenanciesAPI.moveOut(editingTenancyId.value, moveOutDate.value)
    closeMoveOutModal()
    loadTenancies()
    loadUnits() // Refresh units to update vacant status
  } catch (error) {
    console.error('Error moving out tenant:', error)
  } finally {
    saving.value = false
  }
}

const closeMoveInModal = () => {
  showMoveInModal.value = false
  moveInData.value = {
    tenant: null,
    unit: null,
    move_in_date: '',
    rent_amount: '',
    deposit_amount: '',
    contract_start: '',
    contract_end: '',
    status: 'active',
  }
}

const closeMoveOutModal = () => {
  moveOutModalOpen.value = false
  editingTenancyId.value = null
  moveOutDate.value = ''
}

onMounted(() => {
  loadTenancies()
  loadTenants()
  loadUnits()
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

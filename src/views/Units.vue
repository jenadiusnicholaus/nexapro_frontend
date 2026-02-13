<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">Units</h1>
      <VaButton @click="showModal = true">Add Unit</VaButton>
    </div>

    <VaCard>
      <VaCardContent>
        <div class="filters mb-4">
          <VaInput
            v-model="searchQuery"
            placeholder="Search units..."
            class="mr-2"
            style="max-width: 300px"
          >
            <template #prependInner>
              <VaIcon name="search" />
            </template>
          </VaInput>
          <VaSelect
            v-model="filterProperty"
            :options="propertyOptions"
            placeholder="Filter by property"
            style="max-width: 200px"
          />
          <VaSelect
            v-model="filterStatus"
            :options="statusOptions"
            placeholder="Filter by status"
            style="max-width: 200px"
          />
        </div>

        <VaDataTable
          :items="units"
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
              preset="plain"
              icon="edit"
              size="small"
              @click="editUnit(rowData)"
            />
            <VaButton
              preset="plain"
              icon="delete"
              size="small"
              color="danger"
              @click="deleteUnit(rowData.id)"
            />
          </template>
        </VaDataTable>
      </VaCardContent>
    </VaCard>

    <!-- Add/Edit Modal -->
    <VaModal v-model="showModal" :title="editingId ? 'Edit Unit' : 'Add Unit'">
      <VaForm ref="unitForm" @submit.prevent="saveUnit">
        <VaSelect
          v-model="formData.property"
          label="Property"
          :options="propertyOptions"
          :rules="[validators.required]"
          class="mb-4"
        />
        <VaInput
          v-model="formData.unit_number"
          label="Unit Number"
          :rules="[validators.required]"
          class="mb-4"
        />
        <VaInput
          v-model="formData.floor"
          label="Floor"
          class="mb-4"
        />
        <VaSelect
          v-model="formData.unit_type"
          label="Unit Type"
          :options="unitTypes"
          :rules="[validators.required]"
          class="mb-4"
        />
        <VaInput
          v-model="formData.rent_amount"
          label="Rent Amount"
          type="number"
          :rules="[validators.required]"
          class="mb-4"
        />
        <VaInput
          v-model="formData.deposit_amount"
          label="Deposit Amount"
          type="number"
          :rules="[validators.required]"
          class="mb-4"
        />
        <VaSelect
          v-model="formData.status"
          label="Status"
          :options="statusOptions"
          :rules="[validators.required]"
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
import { unitsAPI, propertiesAPI } from '@/services/api'
import { validators } from '@/utils/validators'

const loading = ref(false)
const saving = ref(false)
const units = ref([])
const properties = ref([])
const showModal = ref(false)
const editingId = ref(null)
const searchQuery = ref('')
const filterProperty = ref('')
const filterStatus = ref('')
const unitForm = ref(null)

const unitTypes = ['apartment', 'studio', 'office', 'shop', 'warehouse', 'other']
const statusOptions = ['vacant', 'occupied', 'maintenance']

const formData = ref({
  property: null,
  unit_number: '',
  floor: '',
  unit_type: 'apartment',
  rent_amount: '',
  deposit_amount: '',
  status: 'vacant',
})

const columns = [
  { key: 'unit_number', label: 'Unit #', sortable: true },
  { key: 'property_name', label: 'Property', sortable: true },
  { key: 'floor', label: 'Floor' },
  { key: 'unit_type', label: 'Type', sortable: true },
  { key: 'rent_amount', label: 'Rent', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'actions', label: 'Actions', width: 100 },
]

const propertyOptions = computed(() =>
  properties.value.map((p) => ({ value: p.id, text: p.property_name }))
)

const getStatusColor = (status) => {
  const colors = {
    vacant: 'success',
    occupied: 'info',
    maintenance: 'warning',
  }
  return colors[status] || 'secondary'
}

const loadUnits = async () => {
  loading.value = true
  try {
    const params = {}
    if (searchQuery.value) params.search = searchQuery.value
    if (filterProperty.value) params.property = filterProperty.value
    if (filterStatus.value) params.status = filterStatus.value

    const response = await unitsAPI.list(params)
    units.value = response.data.results || response.data
  } catch (error) {
    console.error('Error loading units:', error)
  } finally {
    loading.value = false
  }
}

const loadProperties = async () => {
  try {
    const response = await propertiesAPI.list()
    properties.value = response.data.results || response.data
  } catch (error) {
    console.error('Error loading properties:', error)
  }
}

const saveUnit = async () => {
  const isValid = await unitForm.value?.validate()
  if (!isValid) return

  saving.value = true
  try {
    if (editingId.value) {
      await unitsAPI.update(editingId.value, formData.value)
    } else {
      await unitsAPI.create(formData.value)
    }
    closeModal()
    loadUnits()
  } catch (error) {
    console.error('Error saving unit:', error)
  } finally {
    saving.value = false
  }
}

const editUnit = (unit) => {
  editingId.value = unit.id
  formData.value = { ...unit }
  showModal.value = true
}

const deleteUnit = async (id) => {
  if (!confirm('Are you sure you want to delete this unit?')) return

  try {
    await unitsAPI.delete(id)
    loadUnits()
  } catch (error) {
    console.error('Error deleting unit:', error)
  }
}

const closeModal = () => {
  showModal.value = false
  editingId.value = null
  formData.value = {
    property: null,
    unit_number: '',
    floor: '',
    unit_type: 'apartment',
    rent_amount: '',
    deposit_amount: '',
    status: 'vacant',
  }
}

onMounted(() => {
  loadUnits()
  loadProperties()
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

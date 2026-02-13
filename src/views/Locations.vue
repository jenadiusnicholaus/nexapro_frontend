<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Locations</h1>
      <VaButton @click="showModal = true" size="large">Add Location</VaButton>
    </div>

    <VaCard class="page-card">
      <VaCardContent>
        <VaInput
          v-model="searchQuery"
          placeholder="Search locations..."
          class="mb-4 search-input"
          preset="bordered"
        >
          <template #prependInner>
            <VaIcon name="search" size="small" />
          </template>
        </VaInput>

        <VaDataTable
          :items="locations"
          :columns="columns"
          :loading="loading"
        >
          <template #cell(actions)="{ rowData }">
            <VaButton
              preset="plain"
              icon="edit"
              size="small"
              @click="editLocation(rowData)"
            />
            <VaButton
              preset="plain"
              icon="delete"
              size="small"
              color="danger"
              @click="deleteLocation(rowData.id)"
            />
          </template>
        </VaDataTable>
      </VaCardContent>
    </VaCard>

    <!-- Add/Edit Modal -->
    <VaModal v-model="showModal" :title="editingId ? 'Edit Location' : 'Add Location'">
      <VaForm ref="locationForm" @submit.prevent="saveLocation">
        <VaInput
          v-model="formData.country"
          label="Country"
          :rules="[validators.required]"
          class="mb-4"
        />
        <VaInput
          v-model="formData.region"
          label="Region"
          :rules="[validators.required]"
          class="mb-4"
        />
        <VaInput
          v-model="formData.city"
          label="City"
          :rules="[validators.required]"
          class="mb-4"
        />
        <VaInput
          v-model="formData.area"
          label="Area"
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
import { ref, onMounted } from 'vue'
import { locationsAPI } from '@/services/api'
import { validators } from '@/utils/validators'

const loading = ref(false)
const saving = ref(false)
const locations = ref([])
const showModal = ref(false)
const editingId = ref(null)
const searchQuery = ref('')
const locationForm = ref(null)

const formData = ref({
  country: '',
  region: '',
  city: '',
  area: '',
})

const columns = [
  { key: 'country', label: 'Country', sortable: true },
  { key: 'region', label: 'Region', sortable: true },
  { key: 'city', label: 'City', sortable: true },
  { key: 'area', label: 'Area', sortable: true },
  { key: 'actions', label: 'Actions', width: 100 },
]

const loadLocations = async () => {
  loading.value = true
  try {
    const params = {}
    if (searchQuery.value) params.search = searchQuery.value

    const response = await locationsAPI.list(params)
    locations.value = response.data.results || response.data
  } catch (error) {
    console.error('Error loading locations:', error)
  } finally {
    loading.value = false
  }
}

const saveLocation = async () => {
  const isValid = await locationForm.value?.validate()
  if (!isValid) return

  saving.value = true
  try {
    if (editingId.value) {
      await locationsAPI.update(editingId.value, formData.value)
    } else {
      await locationsAPI.create(formData.value)
    }
    closeModal()
    loadLocations()
  } catch (error) {
    console.error('Error saving location:', error)
  } finally {
    saving.value = false
  }
}

const editLocation = (location) => {
  editingId.value = location.id
  formData.value = { ...location }
  showModal.value = true
}

const deleteLocation = async (id) => {
  if (!confirm('Are you sure you want to delete this location?')) return

  try {
    await locationsAPI.delete(id)
    loadLocations()
  } catch (error) {
    console.error('Error deleting location:', error)
  }
}

const closeModal = () => {
  showModal.value = false
  editingId.value = null
  formData.value = {
    country: '',
    region: '',
    city: '',
    area: '',
  }
}

onMounted(() => {
  loadLocations()
})
</script>

<style scoped>
.page-container {
  width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--va-text-primary);
}

.page-card {
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.search-input {
  max-width: 320px;
}

.mb-4 {
  margin-bottom: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}
</style>

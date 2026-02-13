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

        <AppDataTable
          :items="locationsStore.items"
          :columns="columns"
          :loading="locationsStore.loading"
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
        </AppDataTable>
      </VaCardContent>
    </VaCard>

    <!-- Add/Edit Modal -->
    <VaModal
      v-model="showModal"
      :title="editingId ? 'Edit Location' : 'Add Location'"
      hide-default-actions
      size="medium"
    >
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
import { ref, onMounted, watch } from 'vue'
import AppDataTable from '@/components/AppDataTable.vue'
import { useAppToast } from '@/composables/useAppToast'
import { useLocationsStore } from '@/stores'
import { validators } from '@/utils/validators'

const { success, error } = useAppToast()
const locationsStore = useLocationsStore()

const saving = ref(false)
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

const loadLocations = () => {
  const params = searchQuery.value ? { search: searchQuery.value } : {}
  return locationsStore.fetchList(params)
}

const saveLocation = async () => {
  const isValid = await locationForm.value?.validate()
  if (!isValid) return

  saving.value = true
  try {
    if (editingId.value) {
      await locationsStore.updateItem(editingId.value, formData.value)
    } else {
      await locationsStore.createItem(formData.value)
    }
    const wasEdit = !!editingId.value
    closeModal()
    success(wasEdit ? 'Location updated' : 'Location created')
  } catch (err) {
    console.error('Error saving location:', err)
    error('Failed to save location')
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
    await locationsStore.deleteItem(id)
    success('Location deleted')
  } catch (err) {
    console.error('Error deleting location:', err)
    error('Failed to delete location')
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
  loadLocations().catch((err) => console.error('Error loading locations:', err))
})

let searchDebounce: ReturnType<typeof setTimeout> | null = null
watch(searchQuery, () => {
  if (searchDebounce) clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => {
    loadLocations().catch((err) => console.error('Error loading locations:', err))
    searchDebounce = null
  }, 300)
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

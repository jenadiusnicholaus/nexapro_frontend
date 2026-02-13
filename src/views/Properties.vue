<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">Properties</h1>
      <VaButton @click="showModal = true">Add Property</VaButton>
    </div>

    <VaCard>
      <VaCardContent>
        <div class="filters mb-4">
          <VaInput
            v-model="searchQuery"
            placeholder="Search properties..."
            class="mr-2"
            style="max-width: 300px"
          >
            <template #prependInner>
              <VaIcon name="search" />
            </template>
          </VaInput>
          <VaSelect
            v-model="filterType"
            :options="propertyTypes"
            placeholder="Filter by type"
            style="max-width: 200px"
          />
        </div>

        <VaDataTable
          :items="properties"
          :columns="columns"
          :loading="loading"
        >
          <template #cell(actions)="{ rowData }">
            <VaButton
              preset="plain"
              icon="edit"
              size="small"
              @click="editProperty(rowData)"
            />
            <VaButton
              preset="plain"
              icon="delete"
              size="small"
              color="danger"
              @click="deleteProperty(rowData.id)"
            />
          </template>
        </VaDataTable>
      </VaCardContent>
    </VaCard>

    <!-- Add/Edit Modal -->
    <VaModal v-model="showModal" :title="editingId ? 'Edit Property' : 'Add Property'">
      <VaForm ref="propertyForm" @submit.prevent="saveProperty">
        <VaSelect
          v-model="formData.owner"
          label="Owner"
          :options="ownerOptions"
          :rules="[validators.required]"
          class="mb-4"
        />
        <VaSelect
          v-model="formData.location"
          label="Location"
          :options="locationOptions"
          class="mb-4"
        />
        <VaInput
          v-model="formData.property_name"
          label="Property Name"
          :rules="[validators.required]"
          class="mb-4"
        />
        <VaSelect
          v-model="formData.property_type"
          label="Property Type"
          :options="propertyTypes"
          :rules="[validators.required]"
          class="mb-4"
        />
        <VaInput
          v-model="formData.address"
          label="Address"
          :rules="[validators.required]"
          class="mb-4"
        />
        <VaTextarea
          v-model="formData.description"
          label="Description"
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
import { propertiesAPI, ownersAPI, locationsAPI } from '@/services/api'
import { validators } from '@/utils/validators'

const loading = ref(false)
const saving = ref(false)
const properties = ref([])
const owners = ref([])
const locations = ref([])
const showModal = ref(false)
const editingId = ref(null)
const searchQuery = ref('')
const filterType = ref('')
const propertyForm = ref(null)

const propertyTypes = ['residential', 'commercial', 'mixed']

const formData = ref({
  owner: null,
  location: null,
  property_name: '',
  property_type: 'residential',
  address: '',
  description: '',
})

const columns = [
  { key: 'property_name', label: 'Name', sortable: true },
  { key: 'owner_name', label: 'Owner', sortable: true },
  { key: 'property_type', label: 'Type', sortable: true },
  { key: 'location_display', label: 'Location' },
  { key: 'address', label: 'Address' },
  { key: 'actions', label: 'Actions', width: 100 },
]

const ownerOptions = computed(() =>
  owners.value.map((o) => ({ value: o.id, text: o.name }))
)

const locationOptions = computed(() =>
  locations.value.map((l) => ({
    value: l.id,
    text: `${l.area}, ${l.city}, ${l.region}, ${l.country}`,
  }))
)

const loadProperties = async () => {
  loading.value = true
  try {
    const params = {}
    if (searchQuery.value) params.search = searchQuery.value
    if (filterType.value) params.property_type = filterType.value

    const response = await propertiesAPI.list(params)
    properties.value = response.data.results || response.data
  } catch (error) {
    console.error('Error loading properties:', error)
  } finally {
    loading.value = false
  }
}

const loadOwners = async () => {
  try {
    const response = await ownersAPI.list()
    owners.value = response.data.results || response.data
  } catch (error) {
    console.error('Error loading owners:', error)
  }
}

const loadLocations = async () => {
  try {
    const response = await locationsAPI.list()
    locations.value = response.data.results || response.data
  } catch (error) {
    console.error('Error loading locations:', error)
  }
}

const saveProperty = async () => {
  const isValid = await propertyForm.value?.validate()
  if (!isValid) return

  saving.value = true
  try {
    if (editingId.value) {
      await propertiesAPI.update(editingId.value, formData.value)
    } else {
      await propertiesAPI.create(formData.value)
    }
    closeModal()
    loadProperties()
  } catch (error) {
    console.error('Error saving property:', error)
  } finally {
    saving.value = false
  }
}

const editProperty = (property) => {
  editingId.value = property.id
  formData.value = { ...property }
  showModal.value = true
}

const deleteProperty = async (id) => {
  if (!confirm('Are you sure you want to delete this property?')) return

  try {
    await propertiesAPI.delete(id)
    loadProperties()
  } catch (error) {
    console.error('Error deleting property:', error)
  }
}

const closeModal = () => {
  showModal.value = false
  editingId.value = null
  formData.value = {
    owner: null,
    location: null,
    property_name: '',
    property_type: 'residential',
    address: '',
    description: '',
  }
}

onMounted(() => {
  loadProperties()
  loadOwners()
  loadLocations()
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

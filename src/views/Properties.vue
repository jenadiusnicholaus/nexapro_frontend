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

        <AppDataTable
          :items="propertiesStore.items"
          :columns="columns"
          :loading="propertiesStore.loading"
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
              @click="deleteProperty(Number(rowData.id))"
            />
          </template>
        </AppDataTable>
      </VaCardContent>
    </VaCard>

    <!-- Add/Edit Modal -->
    <VaModal v-model="showModal" :title="editingId ? 'Edit Property' : 'Add Property'" hide-default-actions size="medium">
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

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import AppDataTable from '@/components/AppDataTable.vue'
import { useAppToast } from '@/composables/useAppToast'
import { usePropertiesStore, useOwnersStore, useLocationsStore } from '@/stores'
import { buildPayload } from '@/utils/apiPayload'
import { validators } from '@/utils/validators'

const { success, error } = useAppToast()
const propertiesStore = usePropertiesStore()
const ownersStore = useOwnersStore()
const locationsStore = useLocationsStore()

const saving = ref(false)
const showModal = ref(false)
const editingId = ref<number | null>(null)
const searchQuery = ref('')
const filterType = ref('')
const propertyForm = ref<{ validate: () => Promise<boolean> } | null>(null)

const propertyTypes = ['residential', 'commercial', 'mixed']

const formData = ref<{
  owner: number | null
  location: number | null
  property_name: string
  property_type: string
  address: string
  description: string
}>({
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
  (ownersStore.items as Record<string, unknown>[]).map((o) => ({ value: o.id as number, text: String(o.name ?? '') }))
)

const locationOptions = computed(() =>
  (locationsStore.items as Record<string, unknown>[]).map((l) => ({
    value: (l as Record<string, unknown>).id,
    text: `${(l as Record<string, unknown>).area}, ${(l as Record<string, unknown>).city}, ${(l as Record<string, unknown>).region}, ${(l as Record<string, unknown>).country}`,
  }))
)

const loadProperties = () => {
  const params: Record<string, unknown> = {}
  if (searchQuery.value) params.search = searchQuery.value
  if (filterType.value) params.property_type = filterType.value
  return propertiesStore.fetchList(params)
}

const saveProperty = async () => {
  const isValid = await propertyForm.value?.validate()
  if (!isValid) return

  const payload = buildPayload(formData.value, ['owner', 'location'])
  saving.value = true
  try {
    if (editingId.value) {
      await propertiesStore.updateItem(editingId.value, payload)
    } else {
      await propertiesStore.createItem(payload)
    }
    const wasEdit = !!editingId.value
    closeModal()
    success(wasEdit ? 'Property updated' : 'Property created')
  } catch (err) {
    console.error('Error saving property:', err)
    error('Failed to save property')
  } finally {
    saving.value = false
  }
}

const editProperty = (property: Record<string, unknown>) => {
  editingId.value = property.id as number
  formData.value = {
    owner: (property.owner as number) ?? null,
    location: (property.location as number) ?? null,
    property_name: String(property.property_name ?? ''),
    property_type: String(property.property_type ?? 'residential'),
    address: String(property.address ?? ''),
    description: String(property.description ?? ''),
  }
  showModal.value = true
}

const deleteProperty = async (id: number) => {
  if (!confirm('Are you sure you want to delete this property?')) return

  try {
    await propertiesStore.deleteItem(id)
    success('Property deleted')
  } catch (err) {
    console.error('Error deleting property:', err)
    error('Failed to delete property')
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
  loadProperties().catch((err) => console.error('Error loading properties:', err))
  ownersStore.fetchList().catch(() => {})
  locationsStore.fetchList().catch(() => {})
})

let filterDebounce: ReturnType<typeof setTimeout> | null = null;
watch([searchQuery, filterType], () => {
  if (filterDebounce) clearTimeout(filterDebounce);
  filterDebounce = setTimeout(() => {
    loadProperties().catch((err) => console.error('Error loading properties:', err));
    filterDebounce = null;
  }, 300);
});
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

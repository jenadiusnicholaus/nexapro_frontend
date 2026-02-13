<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Owners</h1>
        <p class="page-subtitle">Manage property owners and companies</p>
      </div>
      <VaButton
        icon="add"
        @click="showModal = true"
        size="large"
      >
        Add Owner
      </VaButton>
    </div>

    <VaCard class="data-card">
      <VaCardContent>
        <div class="filters">
          <VaInput
            v-model="searchQuery"
            placeholder="Search owners..."
            class="search-input"
            preset="bordered"
          >
            <template #prependInner>
              <VaIcon name="search" size="small" />
            </template>
          </VaInput>
          <VaSelect
            v-model="filterType"
            :options="ownerTypes"
            placeholder="Filter by type"
            class="filter-select"
            preset="bordered"
          />
        </div>

        <VaDataTable
          :items="filteredOwners"
          :columns="columns"
          :loading="loading"
          :hoverable="true"
          class="data-table"
        >
          <template #cell(actions)="{ rowData }">
            <VaButton
              preset="plain"
              icon="edit"
              size="small"
              @click="editOwner(rowData)"
            />
            <VaButton
              preset="plain"
              icon="delete"
              size="small"
              color="danger"
              @click="deleteOwner(rowData.id)"
            />
          </template>
        </VaDataTable>
      </VaCardContent>
    </VaCard>

    <!-- Add/Edit Modal -->
    <VaModal v-model="showModal" :title="editingId ? 'Edit Owner' : 'Add Owner'">
      <VaForm ref="ownerForm" @submit.prevent="saveOwner">
        <VaSelect
          v-model="formData.owner_type"
          label="Owner Type"
          :options="ownerTypes"
          :rules="[validators.required]"
          class="mb-4"
        />
        <VaInput
          v-model="formData.name"
          label="Name"
          :rules="[validators.required]"
          class="mb-4"
        />
        <VaInput
          v-if="formData.owner_type === 'company'"
          v-model="formData.contact_person"
          label="Contact Person"
          :rules="[validators.required]"
          class="mb-4"
        />
        <VaInput
          v-model="formData.phone"
          label="Phone"
          :rules="[validators.required]"
          class="mb-4"
        />
        <VaInput
          v-model="formData.email"
          label="Email"
          type="email"
          :rules="[validators.required, validators.email]"
          class="mb-4"
        />
        <VaInput
          v-model="formData.address"
          label="Address"
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
import { ownersAPI } from '@/services/api'
import { validators } from '@/utils/validators'

const loading = ref(false)
const saving = ref(false)
const owners = ref([])
const showModal = ref(false)
const editingId = ref(null)
const searchQuery = ref('')
const filterType = ref('')
const filteredCount = ref(0)
const ownerForm = ref(null)

const ownerTypes = ['individual', 'company']

const formData = ref({
  owner_type: 'individual',
  name: '',
  contact_person: '',
  phone: '',
  email: '',
  address: '',
})

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'owner_type', label: 'Type', sortable: true },
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email' },
  { key: 'address', label: 'Address' },
  { key: 'actions', label: 'Actions', width: 100 },
]

const filteredOwners = computed(() => {
  let result = owners.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (o) =>
        o.name?.toLowerCase().includes(query) ||
        o.email?.toLowerCase().includes(query) ||
        o.phone?.includes(query)
    )
  }

  if (filterType.value) {
    result = result.filter((o) => o.owner_type === filterType.value)
  }

  return result
})

const loadOwners = async () => {
  loading.value = true
  try {
    const params = {}
    if (searchQuery.value) params.search = searchQuery.value
    if (filterType.value) params.owner_type = filterType.value

    const response = await ownersAPI.list(params)
    owners.value = response.data.results || response.data
  } catch (error) {
    console.error('Error loading owners:', error)
  } finally {
    loading.value = false
  }
}

const saveOwner = async () => {
  const isValid = await ownerForm.value?.validate()
  if (!isValid) return

  saving.value = true
  try {
    if (editingId.value) {
      await ownersAPI.update(editingId.value, formData.value)
    } else {
      await ownersAPI.create(formData.value)
    }
    closeModal()
    loadOwners()
  } catch (error) {
    console.error('Error saving owner:', error)
  } finally {
    saving.value = false
  }
}

const editOwner = (owner) => {
  editingId.value = owner.id
  formData.value = { ...owner }
  showModal.value = true
}

const deleteOwner = async (id) => {
  if (!confirm('Are you sure you want to delete this owner?')) return

  try {
    await ownersAPI.delete(id)
    loadOwners()
  } catch (error) {
    console.error('Error deleting owner:', error)
  }
}

const closeModal = () => {
  showModal.value = false
  editingId.value = null
  formData.value = {
    owner_type: 'individual',
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
  }
}

onMounted(() => {
  loadOwners()
})
</script>

<style scoped>
.page-container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--va-text-primary);
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  font-size: 0.875rem;
  color: var(--va-text-secondary);
  margin: 0;
}

.data-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.search-input {
  flex: 1;
  min-width: 250px;
}

.filter-select {
  min-width: 200px;
}

.data-table {
  margin-top: 0.5rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .filters {
    flex-direction: column;
  }

  .search-input,
  .filter-select {
    width: 100%;
  }
}
</style>

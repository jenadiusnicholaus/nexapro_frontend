<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Tenants</h1>
        <p class="page-subtitle">Manage tenant contacts and emergency info</p>
      </div>
      <VaButton
        icon="add"
        @click="showModal = true"
        size="large"
      >
        Add Tenant
      </VaButton>
    </div>

    <VaCard class="page-card">
      <VaCardContent>
        <div class="filters">
          <VaInput
            v-model="searchQuery"
            placeholder="Search tenants..."
            class="search-input"
            preset="bordered"
          >
            <template #prependInner>
              <VaIcon name="search" size="small" />
            </template>
          </VaInput>
        </div>

        <AppDataTable
          :items="tenantsStore.items"
          :columns="columns"
          :loading="tenantsStore.loading"
        >
          <template #cell(actions)="{ rowData }">
            <VaButton
              preset="plain"
              icon="edit"
              size="small"
              @click="editTenant(rowData)"
            />
            <VaButton
              preset="plain"
              icon="delete"
              size="small"
              color="danger"
              @click="deleteTenant(rowData.id)"
            />
          </template>
        </AppDataTable>
      </VaCardContent>
    </VaCard>

    <!-- Add/Edit Modal -->
    <VaModal v-model="showModal" :title="editingId ? 'Edit Tenant' : 'Add Tenant'" hide-default-actions size="medium">
      <VaForm ref="tenantForm" @submit.prevent="saveTenant">
        <VaInput
          v-model="formData.full_name"
          label="Full Name"
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
          v-model="formData.id_number"
          label="ID Number"
          :rules="[validators.required]"
          class="mb-4"
        />
        <VaInput
          v-model="formData.emergency_contact"
          label="Emergency Contact"
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
import { useTenantsStore } from '@/stores'
import { validators } from '@/utils/validators'

const { success, error } = useAppToast()
const tenantsStore = useTenantsStore()

const saving = ref(false)
const showModal = ref(false)
const editingId = ref(null)
const searchQuery = ref('')
const tenantForm = ref(null)

const formData = ref({
  full_name: '',
  phone: '',
  email: '',
  id_number: '',
  emergency_contact: '',
})

const columns = [
  { key: 'full_name', label: 'Name', sortable: true },
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email' },
  { key: 'id_number', label: 'ID Number' },
  { key: 'emergency_contact', label: 'Emergency Contact' },
  { key: 'actions', label: 'Actions', width: 100 },
]

const loadTenants = () => {
  const params = searchQuery.value ? { search: searchQuery.value } : {}
  return tenantsStore.fetchList(params)
}

const saveTenant = async () => {
  const isValid = await tenantForm.value?.validate()
  if (!isValid) return

  saving.value = true
  try {
    if (editingId.value) {
      await tenantsStore.updateItem(editingId.value, formData.value)
    } else {
      await tenantsStore.createItem(formData.value)
    }
    const wasEdit = !!editingId.value
    closeModal()
    success(wasEdit ? 'Tenant updated' : 'Tenant created')
  } catch (err) {
    console.error('Error saving tenant:', err)
    error('Failed to save tenant')
  } finally {
    saving.value = false
  }
}

const editTenant = (tenant) => {
  editingId.value = tenant.id
  formData.value = { ...tenant }
  showModal.value = true
}

const deleteTenant = async (id) => {
  if (!confirm('Are you sure you want to delete this tenant?')) return

  try {
    await tenantsStore.deleteItem(id)
    success('Tenant deleted')
  } catch (err) {
    console.error('Error deleting tenant:', err)
    error('Failed to delete tenant')
  }
}

const closeModal = () => {
  showModal.value = false
  editingId.value = null
  formData.value = {
    full_name: '',
    phone: '',
    email: '',
    id_number: '',
    emergency_contact: '',
  }
}

onMounted(() => {
  loadTenants().catch((err) => console.error('Error loading tenants:', err))
})

const searchDebounce = ref(null)
watch(searchQuery, () => {
  if (searchDebounce.value) clearTimeout(searchDebounce.value)
  searchDebounce.value = setTimeout(() => {
    loadTenants().catch((err) => console.error('Error loading tenants:', err))
    searchDebounce.value = null
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
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--va-text-primary);
}

.page-subtitle {
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
  color: var(--va-text-secondary);
}

.page-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.search-input {
  max-width: 320px;
  min-width: 200px;
}

.data-table {
  --va-data-table-border: 1px solid rgba(0, 0, 0, 0.06);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}
</style>

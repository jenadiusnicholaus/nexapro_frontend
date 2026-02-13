<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Profiles</h1>
        <p class="page-subtitle">Manage user profiles</p>
      </div>
      <VaButton
        icon="add"
        @click="showModal = true"
        size="large"
      >
        Add Profile
      </VaButton>
    </div>

    <VaCard class="page-card">
      <VaCardContent>
        <VaInput
          v-model="searchQuery"
          placeholder="Search profiles..."
          class="mb-4 search-input"
          preset="bordered"
        >
          <template #prependInner>
            <VaIcon name="search" size="small" />
          </template>
        </VaInput>

        <AppDataTable
          :items="profilesStore.items"
          :columns="columns"
          :loading="profilesStore.loading"
        >
          <template #cell(actions)="{ rowData }">
            <VaButton
              preset="plain"
              icon="edit"
              size="small"
              @click="editProfile(rowData)"
            />
            <VaButton
              preset="plain"
              icon="delete"
              size="small"
              color="danger"
              @click="deleteProfile(Number(rowData.id))"
            />
          </template>
        </AppDataTable>
      </VaCardContent>
    </VaCard>

    <!-- Add/Edit Modal -->
    <VaModal
      v-model="showModal"
      :title="editingId ? 'Edit Profile' : 'Add Profile'"
      hide-default-actions
      size="medium"
    >
      <VaForm ref="profileForm" @submit.prevent="saveProfile">
        <VaInput
          v-model="formData.display_name"
          label="Display Name"
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
          v-model="formData.phone"
          label="Phone"
          class="mb-4"
        />
        <VaTextarea
          v-model="formData.bio"
          label="Bio"
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
import { ref, onMounted, watch } from 'vue'
import AppDataTable from '@/components/AppDataTable.vue'
import { useAppToast } from '@/composables/useAppToast'
import { useProfilesStore } from '@/stores'
import { validators } from '@/utils/validators'

const { success, error } = useAppToast()
const profilesStore = useProfilesStore()

const saving = ref(false)
const showModal = ref(false)
const editingId = ref<number | null>(null)
const searchQuery = ref('')
const profileForm = ref<{ validate: () => Promise<boolean> } | null>(null)

const formData = ref({
  display_name: '',
  email: '',
  phone: '',
  bio: '',
})

const columns = [
  { key: 'display_name', label: 'Display Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'phone', label: 'Phone', sortable: true },
  { key: 'actions', label: 'Actions', width: 100 },
]

const loadProfiles = () => {
  const params = searchQuery.value ? { search: searchQuery.value } : {}
  return profilesStore.fetchList(params)
}

const saveProfile = async () => {
  const isValid = await profileForm.value?.validate()
  if (!isValid) return

  saving.value = true
  try {
    if (editingId.value) {
      await profilesStore.updateItem(editingId.value, formData.value)
    } else {
      await profilesStore.createItem(formData.value)
    }
    const wasEdit = !!editingId.value
    closeModal()
    success(wasEdit ? 'Profile updated' : 'Profile created')
  } catch (err) {
    console.error('Error saving profile:', err)
    error('Failed to save profile')
  } finally {
    saving.value = false
  }
}

const editProfile = (profile: Record<string, unknown>) => {
  editingId.value = profile.id as number
  formData.value = {
    display_name: String(profile.display_name ?? ''),
    email: String(profile.email ?? ''),
    phone: String(profile.phone ?? ''),
    bio: String(profile.bio ?? ''),
  }
  showModal.value = true
}

const deleteProfile = async (id: number) => {
  if (!confirm('Are you sure you want to delete this profile?')) return

  try {
    await profilesStore.deleteItem(id)
    success('Profile deleted')
  } catch (err) {
    console.error('Error deleting profile:', err)
    error('Failed to delete profile')
  }
}

const closeModal = () => {
  showModal.value = false
  editingId.value = null
  formData.value = {
    display_name: '',
    email: '',
    phone: '',
    bio: '',
  }
}

onMounted(() => {
  loadProfiles().catch((err) => console.error('Error loading profiles:', err))
})

let searchDebounce: ReturnType<typeof setTimeout> | null = null;
watch(searchQuery, () => {
  if (searchDebounce) clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    loadProfiles().catch((err) => console.error('Error loading profiles:', err));
    searchDebounce = null;
  }, 300);
});
</script>

<style scoped>
.page-container {
  max-width: 1600px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title {
  margin: 0;
  font-size: 1.5rem;
  color: var(--va-primary);
}

.page-subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  color: var(--va-secondary);
}

.page-card {
  margin-bottom: 1rem;
}

.search-input {
  max-width: 320px;
}

.data-table {
  width: 100%;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.mb-4 {
  margin-bottom: 1rem;
}
</style>

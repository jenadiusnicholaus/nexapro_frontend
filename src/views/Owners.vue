<template>
  <div class="owners-page">
    <div class="page-header-premium">
      <div class="header-content">
        <h1 class="premium-title">Owners</h1>
        <p class="premium-subtitle">Manage property owners and companies</p>
      </div>
      <VaButton 
        size="large" 
        class="premium-add-btn"
        icon="add"
        @click="showModal = true"
      >
        Add Owner
      </VaButton>
    </div>

    <div class="stats-mini-grid mb-6">
      <div class="stat-card-glass">
        <div class="stat-icon-wrap emerald">
          <VaIcon name="person" size="24px" />
        </div>
        <div class="stat-info">
          <span class="stat-label">Total Owners</span>
          <span class="stat-value">{{ ownersStore.items.length }}</span>
        </div>
      </div>
    </div>

    <VaCard class="premium-card">
      <VaCardContent>
        <div class="filters-premium mb-6">
          <div class="search-wrap">
            <VaInput
              v-model="searchQuery"
              placeholder="Search owners..."
              class="premium-input-search"
              background="rgba(255,255,255,0.03)"
            >
              <template #prependInner>
                <VaIcon name="search" color="#22c55e" />
              </template>
            </VaInput>
          </div>
          <div class="select-wrap">
            <VaSelect
              v-model="filterType"
              :options="ownerTypes"
              placeholder="All Types"
              class="premium-select"
              background="rgba(255,255,255,0.03)"
            />
          </div>
        </div>

        <AppDataTable
          :items="ownersStore.items"
          :columns="columns"
          :loading="ownersStore.loading"
        >
          <template #cell(name)="{ rowData }">
            <div class="owner-name-cell">
              <span class="name-main">{{ rowData.name }}</span>
              <span class="name-sub">{{ rowData.owner_type }}</span>
            </div>
          </template>

          <template #cell(actions)="{ rowData }">
            <div class="actions-cell">
              <VaButton
                preset="secondary"
                icon="edit"
                size="small"
                class="action-btn-glass"
                @click="editOwner(rowData)"
              />
              <VaButton
                preset="secondary"
                icon="delete"
                size="small"
                color="danger"
                class="action-btn-glass delete"
                @click="deleteOwner(rowData.id)"
              />
            </div>
          </template>
        </AppDataTable>
      </VaCardContent>
    </VaCard>

    <!-- Add/Edit Modal Premium -->
    <VaModal
      v-model="showModal"
      :title="editingId ? 'Edit Owner' : 'Add Owner'"
      hide-default-actions
      size="medium"
      class="premium-modal"
    >
      <div class="modal-inner">
        <VaForm ref="ownerForm" @submit.prevent="saveOwner" class="premium-form">
          <VaSelect
            v-model="formData.owner_type"
            label="Owner Type"
            :options="ownerTypes"
            :rules="[validators.required]"
            class="mb-4"
            background="rgba(255,255,255,0.03)"
          />
          <VaInput
            v-model="formData.name"
            label="Name"
            :rules="[validators.required]"
            class="mb-4"
            background="rgba(255,255,255,0.03)"
          />
          <VaInput
            v-if="formData.owner_type === 'company'"
            v-model="formData.contact_person"
            label="Contact Person"
            :rules="[validators.required]"
            class="mb-4"
            background="rgba(255,255,255,0.03)"
          />
          <PhoneInput
            v-model="formData.phone"
            label="Phone"
            :required="true"
            class="mb-4"
            background="rgba(255,255,255,0.03)"
          />
          <div class="form-grid">
            <VaInput
              v-model="formData.email"
              label="Email"
              type="email"
              :rules="[validators.required, validators.email]"
              class="mb-4"
              background="rgba(255,255,255,0.03)"
            />
            <VaInput
              v-model="formData.address"
              label="Address"
              :rules="[validators.required]"
              class="mb-4"
              background="rgba(255,255,255,0.03)"
            />
          </div>

          <div class="modal-footer">
            <VaButton preset="secondary" @click="closeModal" class="cancel-btn">Cancel</VaButton>
            <VaButton type="submit" :loading="saving" class="save-btn-premium">
              {{ editingId ? 'Update Owner' : 'Create Owner' }}
            </VaButton>
          </div>
        </VaForm>
      </div>
    </VaModal>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import AppDataTable from "@/components/AppDataTable.vue";
import { useAppToast } from "@/composables/useAppToast";
import { useOwnersStore } from "@/stores";
import { validators } from "@/utils/validators";
import PhoneInput from "@/components/PhoneInput.vue";

const { success, error } = useAppToast();
const ownersStore = useOwnersStore();

const saving = ref(false);
const showModal = ref(false);
const editingId = ref(null);
const searchQuery = ref("");
const filterType = ref("");
const ownerForm = ref(null);

const ownerTypes = ["individual", "company"];

const formData = ref({
  owner_type: "individual",
  name: "",
  contact_person: "",
  phone: "",
  email: "",
  address: "",
});

const columns = [
  { key: "name", label: "Owner", sortable: true },
  { key: "owner_type", label: "Type", sortable: true },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "address", label: "Address" },
  { key: "actions", label: "Actions", width: 120 },
];

const loadOwners = () => {
  const params = {};
  if (searchQuery.value) params.search = searchQuery.value;
  if (filterType.value) params.owner_type = filterType.value;
  return ownersStore.fetchList(params);
};

const saveOwner = async () => {
  const isValid = await ownerForm.value?.validate();
  if (!isValid) return;

  saving.value = true;
  try {
    if (editingId.value) {
      await ownersStore.updateItem(editingId.value, formData.value);
    } else {
      await ownersStore.createItem(formData.value);
    }
    const wasEdit = !!editingId.value;
    closeModal();
    success(wasEdit ? "Owner updated" : "Owner created");
  } catch (err) {
    console.error("Error saving owner:", err);
    error("Failed to save owner");
  } finally {
    saving.value = false;
  }
};

const editOwner = (owner) => {
  editingId.value = owner.id;
  formData.value = { ...owner };
  showModal.value = true;
};

const deleteOwner = async (id) => {
  if (!confirm("Are you sure you want to delete this owner?")) return;

  try {
    await ownersStore.deleteItem(id);
    success("Owner deleted");
  } catch (err) {
    console.error("Error deleting owner:", err);
    error("Failed to delete owner");
  }
};

const closeModal = () => {
  showModal.value = false;
  editingId.value = null;
  formData.value = {
    owner_type: "individual",
    name: "",
    contact_person: "",
    phone: "",
    email: "",
    address: "",
  };
};

onMounted(() => {
  loadOwners().catch((err) => console.error("Error loading owners:", err));
});

const filterDebounce = ref(null);
watch([searchQuery, filterType], () => {
  if (filterDebounce.value) clearTimeout(filterDebounce.value);
  filterDebounce.value = setTimeout(() => {
    loadOwners().catch((err) => console.error("Error loading owners:", err));
    filterDebounce.value = null;
  }, 300);
});
</script>

<style scoped>
.owners-page {
  padding: 1.5rem;
  min-height: calc(100vh - 4rem);
}

.page-header-premium {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2.5rem;
}

.premium-title {
  font-size: 2.25rem;
  font-weight: 800;
  color: var(--va-text-primary);
  margin: 0;
  letter-spacing: -0.02em;
}

.premium-subtitle {
  color: var(--va-text-secondary);
  font-size: 1rem;
  margin: 0.25rem 0 0;
}

.premium-add-btn {
  background: linear-gradient(135deg, #22c55e, #10b981) !important;
  color: white !important;
  font-weight: 700 !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3) !important;
  transition: all 0.3s ease !important;
}

.premium-add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(34, 197, 94, 0.4) !important;
}

/* Stats */
.stats-mini-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card-glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 1.25rem;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon-wrap.emerald {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f1f5f9;
}

/* Premium Card & Filters */
.premium-card {
  background: var(--va-background-card-primary) !important;
  backdrop-filter: blur(20px) !important;
  border: 1px solid var(--va-background-border) !important;
  border-radius: 20px !important;
}

.filters-premium {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.search-wrap {
  flex: 1;
  min-width: 300px;
}

.select-wrap {
  width: 200px;
}

.premium-input-search :deep(.va-input-wrapper) {
  border-radius: 12px !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.premium-select :deep(.va-input-wrapper) {
  border-radius: 12px !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

/* Owner Name Cell */
.owner-name-cell {
  display: flex;
  flex-direction: column;
}

.owner-primary-name {
  font-weight: 700;
  color: var(--va-text-primary);
  font-size: 0.95rem;
}

.name-sub {
  font-size: 0.75rem;
  color: var(--va-text-secondary);
  text-transform: capitalize;
}

/* Actions */
.actions-cell {
  display: flex;
  gap: 0.5rem;
}

.action-btn-glass {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  border-radius: 8px !important;
  color: var(--va-text-secondary) !important;
}

.action-btn-glass:hover {
  background: rgba(255, 255, 255, 0.08) !important;
  color: #22c55e !important;
}

.action-btn-glass.delete:hover {
  color: #ef4444 !important;
}

/* Modal Premium */
.premium-modal {
  --va-modal-background: var(--va-background-primary);
  --va-modal-border-radius: 24px;
}

.modal-inner {
  padding: 1.5rem 0.5rem;
}

.premium-form :deep(.va-input-wrapper) {
  border-radius: 12px !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.save-btn-premium {
  background: linear-gradient(135deg, #22c55e, #10b981) !important;
  border-radius: 10px !important;
  font-weight: 700 !important;
}

.cancel-btn {
  border-radius: 10px !important;
}

@media (max-width: 768px) {
  .page-header-premium {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>

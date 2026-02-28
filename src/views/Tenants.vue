<template>
  <div class="tenants-page-premium">
    <div class="page-header-premium">
      <div class="header-content">
        <h1 class="premium-title">Tenants</h1>
        <p class="premium-subtitle">Manage tenant contacts and emergency information</p>
      </div>
      <VaButton 
        size="large" 
        class="premium-add-btn"
        icon="add"
        @click="showModal = true"
      >
        Add Tenant
      </VaButton>
    </div>

    <div class="stats-mini-grid mb-6">
      <div class="stat-card-glass">
        <div class="stat-icon-wrap emerald">
          <VaIcon name="people" size="24px" />
        </div>
        <div class="stat-info">
          <span class="stat-label">Total Tenants</span>
          <span class="stat-value">{{ tenantsStore.items.length }}</span>
        </div>
      </div>
    </div>

    <VaCard class="premium-card">
      <VaCardContent>
        <div class="filters-premium mb-6">
          <div class="search-wrap">
            <VaInput
              v-model="searchQuery"
              placeholder="Search tenants..."
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
              v-model="filterProperty"
              :options="propertyOptions"
              text-by="text"
              value-by="value"
              placeholder="All Properties"
              class="premium-select"
              background="rgba(255,255,255,0.03)"
              clearable
            />
          </div>
        </div>

        <AppDataTable
          :items="tenantsStore.items"
          :columns="columns"
          :loading="tenantsStore.loading"
        >
          <template #cell(full_name)="{ rowData }">
            <div class="name-cell">
              <span class="tenant-primary-name">{{ rowData.full_name }}</span>
              <span class="tenant-id-sub">ID: {{ rowData.id_number }}</span>
            </div>
          </template>

          <template #cell(phone)="{ rowData }">
            <div class="contact-cell">
              <VaIcon name="phone" size="14px" class="mr-2" />
              <span>{{ rowData.phone }}</span>
            </div>
          </template>

          <template #cell(email)="{ rowData }">
            <div class="contact-cell">
              <VaIcon name="mail" size="14px" class="mr-2" />
              <span>{{ rowData.email }}</span>
            </div>
          </template>

          <template #cell(actions)="{ rowData }">
            <div class="actions-cell">
              <VaButton
                preset="plain"
                icon="edit"
                size="small"
                color="#94a3b8"
                class="hover-emerald"
                @click="editTenant(rowData)"
              />
              <VaButton
                preset="plain"
                icon="delete"
                size="small"
                color="#ef4444"
                @click="deleteTenant(rowData.id)"
              />
            </div>
          </template>
        </AppDataTable>
      </VaCardContent>
    </VaCard>

    <!-- Add/Edit Modal Premium -->
    <VaModal
      v-model="showModal"
      :title="editingId ? 'Edit Tenant' : 'Add Tenant'"
      hide-default-actions
      size="medium"
      class="premium-modal"
    >
      <div class="modal-inner">
        <VaForm ref="tenantForm" @submit.prevent="saveTenant" class="premium-form">
          <VaInput
            v-model="formData.full_name"
            label="Full Name"
            :rules="[validators.required]"
            class="mb-4"
            background="rgba(255,255,255,0.03)"
          />
          <div class="form-grid">
            <PhoneInput
              v-model="formData.phone"
              label="Phone"
              :required="true"
              class="mb-4"
              background="rgba(255,255,255,0.03)"
            />
            <VaInput
              v-model="formData.email"
              label="Email"
              type="email"
              :rules="[validators.required, validators.email]"
              class="mb-4"
              background="rgba(255,255,255,0.03)"
            />
          </div>
          <div class="form-grid">
            <VaInput
              v-model="formData.id_number"
              label="ID Number"
              :rules="[validators.required]"
              class="mb-4"
              background="rgba(255,255,255,0.03)"
            />
            <VaInput
              v-model="formData.emergency_contact"
              label="Emergency Contact"
              :rules="[validators.required]"
              class="mb-4"
              background="rgba(255,255,255,0.03)"
            />
          </div>
          <div class="modal-footer">
            <VaButton preset="secondary" @click="closeModal" class="cancel-btn">Cancel</VaButton>
            <VaButton type="submit" :loading="saving" class="save-btn-premium">Confirm Tenant</VaButton>
          </div>
        </VaForm>
      </div>
    </VaModal>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import AppDataTable from "@/components/AppDataTable.vue";
import { useAppToast } from "@/composables/useAppToast";
import { useTenantsStore, usePropertiesStore, useUnitsStore } from "@/stores";
import { validators } from "@/utils/validators";
import PhoneInput from "@/components/PhoneInput.vue";

const { success, error } = useAppToast();
const tenantsStore = useTenantsStore();
const propertiesStore = usePropertiesStore();
const unitsStore = useUnitsStore();

const saving = ref(false);
const showModal = ref(false);
const editingId = ref(null);
const searchQuery = ref("");
const filterProperty = ref("");
const filterUnit = ref("");
const tenantForm = ref(null);

const formData = ref({
  full_name: "",
  phone: "",
  email: "",
  id_number: "",
  emergency_contact: "",
});

const columns = [
  { key: "full_name", label: "Tenant Info", sortable: true },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "emergency_contact", label: "Emergency Contact" },
  { key: "actions", label: "Actions", width: 100 },
];

const propertyOptions = computed(() =>
  propertiesStore.items.map((p) => ({
    value: p.id,
    text: p.property_name,
  })),
);

const unitOptions = computed(() =>
  unitsStore.items.map((u) => ({
    value: u.id,
    text: `${u.property_name || ""} - Unit ${u.unit_number}`,
  })),
);

const loadTenants = () => {
  const params = {};
  if (searchQuery.value) params.search = searchQuery.value;
  if (filterProperty.value) params.property = filterProperty.value;
  if (filterUnit.value) params.unit = filterUnit.value;
  return tenantsStore.fetchList(params);
};

const saveTenant = async () => {
  const isValid = await tenantForm.value?.validate();
  if (!isValid) return;

  saving.value = true;
  try {
    if (editingId.value) {
      await tenantsStore.updateItem(editingId.value, formData.value);
    } else {
      await tenantsStore.createItem(formData.value);
    }
    const wasEdit = !!editingId.value;
    closeModal();
    success(wasEdit ? "Tenant updated" : "Tenant created");
  } catch (err) {
    console.error("Error saving tenant:", err);
    error("Failed to save tenant");
  } finally {
    saving.value = false;
  }
};

const editTenant = (tenant) => {
  editingId.value = tenant.id;
  formData.value = { ...tenant };
  showModal.value = true;
};

const deleteTenant = async (id) => {
  if (!confirm("Are you sure you want to delete this tenant?")) return;

  try {
    await tenantsStore.deleteItem(id);
    success("Tenant deleted");
  } catch (err) {
    console.error("Error deleting tenant:", err);
    error("Failed to delete tenant");
  }
};

const closeModal = () => {
  showModal.value = false;
  editingId.value = null;
  formData.value = {
    full_name: "",
    phone: "",
    email: "",
    id_number: "",
    emergency_contact: "",
  };
};

onMounted(() => {
  loadTenants().catch((err) => console.error("Error loading tenants:", err));
  propertiesStore.fetchList().catch(() => {});
  unitsStore.fetchList().catch(() => {});
});

const searchDebounce = ref(null);
watch(searchQuery, () => {
  if (searchDebounce.value) clearTimeout(searchDebounce.value);
  searchDebounce.value = setTimeout(() => {
    loadTenants().catch((err) => console.error("Error loading tenants:", err));
    searchDebounce.value = null;
  }, 300);
});

watch([filterProperty, filterUnit], () => {
  loadTenants().catch((err) => console.error("Error loading tenants:", err));
});
</script>

<style scoped>
.tenants-page-premium {
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

/* Stats */
.stats-mini-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card-glass {
  background: var(--va-background-card-primary);
  backdrop-filter: blur(10px);
  border: 1px solid var(--va-background-border);
  padding: 1.25rem;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon-wrap.emerald {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  color: var(--va-text-secondary);
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--va-text-primary);
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
  width: 250px;
}

.premium-input-search :deep(.va-input-wrapper),
.premium-select :deep(.va-input-wrapper) {
  border-radius: 12px !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

/* Cell Styles */
.name-cell {
  display: flex;
  flex-direction: column;
}

.tenant-primary-name {
  font-weight: 700;
  color: var(--va-text-primary);
}

.tenant-id-sub {
  font-size: 0.75rem;
  color: #64748b;
}

.contact-cell {
  display: flex;
  align-items: center;
  color: #94a3b8;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

.hover-emerald:hover {
  color: #22c55e !important;
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

.mr-2 { margin-right: 0.5rem; }

@media (max-width: 768px) {
  .page-header-premium {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>

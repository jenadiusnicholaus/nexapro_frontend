<template>
  <div class="units-page-premium">
    <div class="page-header-premium">
      <div class="header-content">
        <h1 class="premium-title">Property Units</h1>
        <p class="premium-subtitle">Manage individual rental spaces and availability</p>
      </div>
      <VaButton 
        size="large" 
        class="premium-add-btn"
        icon="add"
        @click="showModal = true"
      >
        Add Unit
      </VaButton>
    </div>

    <div class="stats-mini-grid mb-6">
      <div class="stat-card-glass">
        <div class="stat-icon-wrap emerald">
          <VaIcon name="meeting_room" size="24px" />
        </div>
        <div class="stat-info">
          <span class="stat-label">Total Units</span>
          <span class="stat-value">{{ unitsStore.items.length }}</span>
        </div>
      </div>
      <div class="stat-card-glass">
        <div class="stat-icon-wrap emerald">
          <VaIcon name="check_circle" size="24px" />
        </div>
        <div class="stat-info">
          <span class="stat-label">Vacant</span>
          <span class="stat-value">{{ unitsStore.items.filter(u => u.status === 'vacant').length }}</span>
        </div>
      </div>
    </div>

    <VaCard class="premium-card">
      <VaCardContent>
        <div class="filters-premium mb-6">
          <div class="search-wrap">
            <VaInput
              v-model="searchQuery"
              placeholder="Search units..."
              class="premium-input-search"
              background="rgba(255,255,255,0.03)"
            >
              <template #prependInner>
                <VaIcon name="search" color="#22c55e" />
              </template>
            </VaInput>
          </div>
          <div class="select-wrap-dual">
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
            <VaSelect
              v-model="filterStatus"
              :options="statusOptions"
              text-by="(option) => option.charAt(0).toUpperCase() + option.slice(1)"
              placeholder="Any Status"
              class="premium-select"
              background="rgba(255,255,255,0.03)"
              clearable
            />
          </div>
        </div>

        <AppDataTable
          :items="unitsStore.items"
          :columns="columns"
          :loading="unitsStore.loading"
        >
          <template #cell(image)="{ rowData }">
            <div class="unit-image-ring">
              <img
                v-if="rowData.image_url"
                :src="rowData.image_url"
                :alt="rowData.unit_number"
                class="unit-thumb-premium"
              />
              <div v-else class="unit-thumb-placeholder">
                <VaIcon name="home_work" size="small" />
              </div>
            </div>
          </template>

          <template #cell(unit_number)="{ rowData }">
            <div class="unit-id-cell">
              <span class="unit-num-main">Unit {{ rowData.unit_number }}</span>
              <span class="prop-name-sub">{{ rowData.property_name }}</span>
            </div>
          </template>

          <template #cell(rent_amount)="{ rowData }">
            <span class="rent-value-premium">
              ${{ Number(rowData.rent_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
            </span>
          </template>

          <template #cell(status)="{ rowData }">
            <div class="status-glow" :class="rowData.status">
              {{ rowData.status }}
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
                @click="editUnit(rowData)"
              />
              <VaButton
                preset="plain"
                icon="delete"
                size="small"
                color="#ef4444"
                @click="deleteUnit(Number(rowData.id))"
              />
            </div>
          </template>
        </AppDataTable>
      </VaCardContent>
    </VaCard>

    <!-- Add/Edit Modal Premium -->
    <VaModal
      v-model="showModal"
      :title="editingId ? 'Edit Unit' : 'Add Unit'"
      hide-default-actions
      size="medium"
      class="premium-modal"
    >
      <div class="modal-inner">
        <VaForm ref="unitForm" @submit.prevent="saveUnit" class="premium-form">
          <VaSelect
            v-model="formData.property"
            label="Property"
            :options="propertyOptions"
            text-by="text"
            value-by="value"
            :rules="[validators.required]"
            class="mb-4"
            background="rgba(255,255,255,0.03)"
          />
          <div class="form-grid">
            <VaInput
              v-model="formData.unit_number"
              label="Unit Number"
              :rules="[validators.required]"
              class="mb-4"
              background="rgba(255,255,255,0.03)"
            />
            <VaInput v-model="formData.floor" label="Floor" class="mb-4" background="rgba(255,255,255,0.03)" />
          </div>
          <div class="form-grid">
            <VaSelect
              v-model="formData.unit_type"
              label="Unit Type"
              :options="unitTypes"
              text-by="(option) => option.charAt(0).toUpperCase() + option.slice(1)"
              value-by="value"
              :rules="[validators.required]"
              class="mb-4"
              background="rgba(255,255,255,0.03)"
            />
            <VaInput
              v-model="formData.rent_amount"
              label="Rent Amount"
              type="number"
              :rules="[validators.required]"
              class="mb-4"
              background="rgba(255,255,255,0.03)"
            />
          </div>
          <VaSelect
            v-model="formData.status"
            label="Status"
            :options="statusOptions"
            text-by="(option) => option.charAt(0).toUpperCase() + option.slice(1)"
            value-by="value"
            :rules="[validators.required]"
            class="mb-4"
            background="rgba(255,255,255,0.03)"
          />

          <!-- Premium Image Upload -->
          <div class="image-upload-premium">
            <span class="upload-label">Unit Media</span>
            <div class="image-box-premium" :class="{ 'has-image': imagePreview }">
              <div v-if="imagePreview" class="preview-wrap">
                <img :src="imagePreview" alt="Preview" />
                <div class="overlay" @click="removeImage">
                  <VaIcon name="delete" color="white" />
                </div>
              </div>
              <div v-else class="upload-placeholder">
                <VaIcon name="cloud_upload" size="32px" color="#22c55e" />
                <p>Drag or click to upload</p>
              </div>
              <input type="file" ref="imageInput" accept="image/*" @change="handleImageSelect" class="absolute-input" />
            </div>
          </div>

          <div class="modal-footer">
            <VaButton preset="secondary" @click="closeModal" class="cancel-btn">Cancel</VaButton>
            <VaButton type="submit" :loading="saving" class="save-btn-premium">Confirm Unit</VaButton>
          </div>
        </VaForm>
      </div>
    </VaModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import AppDataTable from "@/components/AppDataTable.vue";
import { useAppToast } from "@/composables/useAppToast";
import { useUnitsStore, usePropertiesStore } from "@/stores";
import { buildPayload } from "@/utils/apiPayload";
import { validators } from "@/utils/validators";

const { success, error } = useAppToast();
const unitsStore = useUnitsStore();
const propertiesStore = usePropertiesStore();

const saving = ref(false);
const showModal = ref(false);
const editingId = ref<number | null>(null);
const searchQuery = ref("");
const filterProperty = ref("");
const filterStatus = ref("");
const unitForm = ref<{ validate: () => Promise<boolean> } | null>(null);
const imageInput = ref<HTMLInputElement | null>(null);
const imagePreview = ref<string | null>(null);
const selectedImage = ref<File | null>(null);

const unitTypes = [
  "apartment",
  "studio",
  "office",
  "shop",
  "warehouse",
  "other",
];
const statusOptions = ["vacant", "occupied", "maintenance"];

const formData = ref<{
  property: number | null;
  unit_number: string;
  floor: string;
  unit_type: string;
  rent_amount: string;
  status: string;
}>({
  property: null,
  unit_number: "",
  floor: "",
  unit_type: "apartment",
  rent_amount: "",
  status: "vacant",
});

const columns = [
  { key: "image", label: "Preview", width: 80 },
  { key: "unit_number", label: "Unit Info", sortable: true },
  { key: "floor", label: "Floor" },
  { key: "unit_type", label: "Type", sortable: true },
  { key: "rent_amount", label: "Monthly Rent", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "actions", label: "Actions", width: 100 },
];

const propertyOptions = computed(() =>
  (propertiesStore.items as Record<string, unknown>[]).map((p) => ({
    value: p.id,
    text: p.property_name,
  })),
);

const loadUnits = () => {
  const params: Record<string, unknown> = {};
  if (searchQuery.value) params.search = searchQuery.value;
  if (filterProperty.value) params.property = filterProperty.value;
  if (filterStatus.value) params.status = filterStatus.value;
  return unitsStore.fetchList(params);
};

const handleImageSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    error("Please select an image file");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    error("Image size must be less than 5MB");
    return;
  }

  selectedImage.value = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};

const removeImage = () => {
  selectedImage.value = null;
  imagePreview.value = null;
  if (imageInput.value) {
    imageInput.value.value = "";
  }
};

const saveUnit = async () => {
  const isValid = await unitForm.value?.validate();
  if (!isValid) return;

  saving.value = true;
  try {
    const payload = buildPayload(formData.value, ["property"]);

    if (selectedImage.value && imagePreview.value) {
      payload.image = imagePreview.value; 
    }

    if (editingId.value) {
      await unitsStore.updateItem(editingId.value, payload);
    } else {
      await unitsStore.createItem(payload);
    }

    const wasEdit = !!editingId.value;
    closeModal();
    success(wasEdit ? "Unit updated" : "Unit created");
  } catch (err: any) {
    console.error("Error saving unit:", err);
    error("Failed to save unit");
  } finally {
    saving.value = false;
  }
};

const editUnit = (unit: Record<string, unknown>) => {
  editingId.value = unit.id as number;
  const propertyId =
    unit.property_id ??
    (unit.property as Record<string, unknown>)?.id ??
    unit.property;
  formData.value = {
    property: (propertyId as number) ?? null,
    unit_number: String(unit.unit_number ?? ""),
    floor: String(unit.floor ?? ""),
    unit_type: String(unit.unit_type ?? "apartment"),
    rent_amount: String(unit.rent_amount ?? ""),
    status: String(unit.status ?? "vacant"),
  };

  selectedImage.value = null;
  imagePreview.value = null;
  if (imageInput.value) {
    imageInput.value.value = "";
  }

  if (unit.image_url) {
    imagePreview.value = String(unit.image_url);
  }

  showModal.value = true;
};

const deleteUnit = async (id: number) => {
  if (!confirm("Are you sure you want to delete this unit?")) return;

  try {
    await unitsStore.deleteItem(id);
    success("Unit deleted");
  } catch (err) {
    error("Failed to delete unit");
  }
};

const closeModal = () => {
  showModal.value = false;
  editingId.value = null;
  formData.value = {
    property: null,
    unit_number: "",
    floor: "",
    unit_type: "apartment",
    rent_amount: "",
    status: "vacant",
  };
  removeImage();
};

onMounted(() => {
  loadUnits().catch((err) => console.error("Error loading units:", err));
  propertiesStore.fetchList().catch(() => {});
});

let searchDebounce: ReturnType<typeof setTimeout> | null = null;
watch(searchQuery, () => {
  if (searchDebounce) clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    loadUnits().catch((err) => console.error("Error loading units:", err));
    searchDebounce = null;
  }, 300);
});

watch([filterProperty, filterStatus], () => {
  loadUnits().catch((err) => console.error("Error loading units:", err));
});
</script>

<style scoped>
.units-page-premium {
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

/* Filters */
.filters-premium {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.search-wrap {
  flex: 1;
  min-width: 300px;
}

.select-wrap-dual {
  display: flex;
  gap: 1rem;
}

.premium-card {
  background: rgba(15, 23, 42, 0.6) !important;
  backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  border-radius: 20px !important;
}

.premium-input-search :deep(.va-input-wrapper),
.premium-select :deep(.va-input-wrapper) {
  border-radius: 12px !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

/* Cell Styles */
.unit-image-ring {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  padding: 2px;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.3), transparent);
  overflow: hidden;
}

.unit-thumb-premium {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
}

.unit-thumb-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.02);
  color: #64748b;
  border-radius: 10px;
}

.unit-id-cell {
  display: flex;
  flex-direction: column;
}

.unit-num-main {
  font-weight: 700;
  color: #f1f5f9;
}

.prop-name-sub {
  font-size: 0.75rem;
  color: #64748b;
}

.rent-value-premium {
  font-weight: 700;
  color: #22c55e;
  font-size: 1.05rem;
}

.status-glow {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: capitalize;
}

.status-glow.vacant {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.2);
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.1);
}

.status-glow.occupied {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.status-glow.maintenance {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.2);
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

/* Premium Image Upload */
.image-upload-premium {
  margin-top: 1.5rem;
}

.upload-label {
  display: block;
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.image-box-premium {
  position: relative;
  width: 100%;
  height: 180px;
  border: 2px dashed rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.image-box-premium:hover {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.02);
}

.preview-wrap {
  width: 100%;
  height: 100%;
  position: relative;
}

.preview-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-wrap .overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  cursor: pointer;
}

.preview-wrap:hover .overlay {
  opacity: 1;
}

.upload-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #64748b;
  gap: 0.5rem;
}

.absolute-input {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  opacity: 0;
  cursor: pointer;
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

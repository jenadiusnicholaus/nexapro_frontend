<template>
  <div class="properties-page">
    <div class="page-header-premium">
      <div class="header-content">
        <h1 class="premium-title">Properties</h1>
        <p class="premium-subtitle">Manage and monitor your real estate portfolio</p>
      </div>
      <VaButton 
        size="large" 
        class="premium-add-btn"
        icon="add"
        @click="showModal = true"
      >
        Add Property
      </VaButton>
    </div>

    <div class="stats-mini-grid mb-6">
      <div class="stat-card-glass">
        <div class="stat-icon-wrap green">
          <VaIcon name="home" size="24px" />
        </div>
        <div class="stat-info">
          <span class="stat-label">Total Properties</span>
          <span class="stat-value">{{ propertiesStore.items.length }}</span>
        </div>
      </div>
      <!-- Add more mini stats here if data available -->
    </div>

    <VaCard class="premium-card">
      <VaCardContent>
        <div class="filters-premium mb-6">
          <div class="search-wrap">
            <VaInput
              v-model="searchQuery"
              placeholder="Search properties..."
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
              :options="propertyTypes"
              placeholder="All Types"
              class="premium-select"
              text-by="(option) => option.charAt(0).toUpperCase() + option.slice(1)"
              background="rgba(255,255,255,0.03)"
            />
          </div>
        </div>

        <AppDataTable
          :items="propertiesStore.items"
          :columns="columns"
          :loading="propertiesStore.loading"
        >
          <template #cell(image)="{ rowData }">
            <div class="property-image-cell-premium">
              <div class="image-inner-glass">
                <img
                  v-if="rowData.image_url"
                  :src="rowData.image_url"
                  :alt="rowData.property_name"
                  class="property-thumbnail-premium"
                />
                <div v-else class="property-placeholder-premium">
                  <VaIcon name="home" size="20px" color="#10b981" />
                </div>
              </div>
            </div>
          </template>
          
          <template #cell(property_name)="{ rowData }">
            <div class="property-name-cell">
              <span class="name-main">{{ rowData.property_name }}</span>
              <span class="name-sub">{{ rowData.property_type }}</span>
            </div>
          </template>

          <template #cell(actions)="{ rowData }">
            <div class="actions-cell">
              <VaButton
                preset="secondary"
                icon="visibility"
                size="small"
                class="action-btn-glass"
                @click="viewProperty(rowData)"
              />
              <VaButton
                preset="secondary"
                icon="edit"
                size="small"
                class="action-btn-glass"
                @click="editProperty(rowData)"
              />
              <VaButton
                preset="secondary"
                icon="delete"
                size="small"
                color="danger"
                class="action-btn-glass delete"
                @click="deleteProperty(Number(rowData.id))"
              />
            </div>
          </template>
        </AppDataTable>
      </VaCardContent>
    </VaCard>

    <!-- Add/Edit Modal Premium -->
    <VaModal
      v-model="showModal"
      :title="editingId ? 'Edit Property' : 'Add Property'"
      hide-default-actions
      size="medium"
      class="premium-modal"
    >
      <div class="modal-inner">
        <VaForm ref="propertyForm" @submit.prevent="saveProperty" class="premium-form">
          <div class="form-grid">
            <VaSelect
              v-model="formData.owner"
              label="Owner"
              :options="ownerOptions"
              text-by="text"
              value-by="value"
              :rules="[validators.required]"
              class="mb-4"
              background="rgba(255,255,255,0.03)"
            />
            <VaSelect
              v-model="formData.location"
              label="Location"
              :options="locationOptions"
              text-by="text"
              value-by="value"
              class="mb-4"
              background="rgba(255,255,255,0.03)"
            />
          </div>
          
          <VaInput
            v-model="formData.property_name"
            label="Property Name"
            :rules="[validators.required]"
            class="mb-4"
            background="rgba(255,255,255,0.03)"
          />
          
          <div class="form-grid">
            <VaSelect
              v-model="formData.property_type"
              label="Property Type"
              :options="propertyTypes"
              text-by="(option) => option.charAt(0).toUpperCase() + option.slice(1)"
              :rules="[validators.required]"
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

          <VaTextarea
            v-model="formData.description"
            label="Description"
            class="mb-4"
            background="rgba(255,255,255,0.03)"
          />

          <!-- Image Upload Premium -->
          <div class="mb-6">
            <label class="va-input-label mb-2 block">Property Image</label>
            <div class="image-upload-premium">
              <div v-if="imagePreview" class="image-preview-premium">
                <img :src="imagePreview" alt="Preview" />
                <div class="preview-overlay">
                  <VaButton
                    preset="secondary"
                    icon="close"
                    size="small"
                    color="danger"
                    class="remove-img-btn"
                    @click="removeImage"
                  />
                </div>
              </div>
              <div v-else class="upload-placeholder-premium">
                <VaIcon name="cloud_upload" size="32px" color="#22c55e" />
                <div class="upload-text">
                  <span class="main">Click to upload or drag & drop</span>
                  <span class="sub">PNG, JPG up to 5MB</span>
                </div>
              </div>
              <input
                type="file"
                ref="imageInput"
                accept="image/*"
                @change="handleImageSelect"
                class="hidden-input"
              />
            </div>
          </div>

          <div class="modal-footer">
            <VaButton preset="secondary" @click="closeModal" class="cancel-btn">Cancel</VaButton>
            <VaButton type="submit" :loading="saving" class="save-btn-premium">
              {{ editingId ? 'Update Property' : 'Create Property' }}
            </VaButton>
          </div>
        </VaForm>
      </div>
    </VaModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useRouter } from "vue-router";
import AppDataTable from "@/components/AppDataTable.vue";
import { useAppToast } from "@/composables/useAppToast";
import {
  usePropertiesStore,
  useOwnersStore,
  useLocationsStore,
} from "@/stores";
import { buildPayload } from "@/utils/apiPayload";
import { validators } from "@/utils/validators";

const router = useRouter();
const { success, error } = useAppToast();
const propertiesStore = usePropertiesStore();
const ownersStore = useOwnersStore();
const locationsStore = useLocationsStore();

const saving = ref(false);
const showModal = ref(false);
const editingId = ref<number | null>(null);
const searchQuery = ref("");
const filterType = ref("");
const propertyForm = ref<{ validate: () => Promise<boolean> } | null>(null);
const imageInput = ref<HTMLInputElement | null>(null);
const imagePreview = ref<string | null>(null);
const selectedImage = ref<File | null>(null);

const propertyTypes = ["residential", "commercial", "mixed"];

const formData = ref<{
  owner: number | null;
  location: number | null;
  property_name: string;
  property_type: string;
  address: string;
  description: string;
}>({
  owner: null,
  location: null,
  property_name: "",
  property_type: "residential",
  address: "",
  description: "",
});

const columns = [
  { key: "image", label: "", width: 80 },
  { key: "property_name", label: "Property", sortable: true },
  { key: "owner_name", label: "Owner", sortable: true },
  { key: "property_type", label: "Type", sortable: true },
  { key: "location_display", label: "Location" },
  { key: "address", label: "Address" },
  { key: "actions", label: "Actions", width: 140 },
];

const ownerOptions = computed(() =>
  (ownersStore.items as Record<string, unknown>[]).map((o) => ({
    value: o.id as number,
    text: String(o.name ?? ""),
  })),
);

const locationOptions = computed(() =>
  (locationsStore.items as Record<string, unknown>[]).map((l) => ({
    value: (l as Record<string, unknown>).id,
    text: `${(l as Record<string, unknown>).area}, ${(l as Record<string, unknown>).city}, ${(l as Record<string, unknown>).region}, ${(l as Record<string, unknown>).country}`,
  })),
);

const loadProperties = () => {
  const params: Record<string, unknown> = {};
  if (searchQuery.value) params.search = searchQuery.value;
  if (filterType.value) params.property_type = filterType.value;
  return propertiesStore.fetchList(params);
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

const saveProperty = async () => {
  const isValid = await propertyForm.value?.validate();
  if (!isValid) return;

  saving.value = true;
  try {
    const payload = buildPayload(formData.value, ["owner", "location"]);
    if (selectedImage.value && imagePreview.value) {
      payload.image = imagePreview.value;
    }

    if (editingId.value) {
      await propertiesStore.updateItem(editingId.value, payload);
    } else {
      await propertiesStore.createItem(payload);
    }

    const wasEdit = !!editingId.value;
    closeModal();
    success(wasEdit ? "Property updated" : "Property created");
  } catch (err: any) {
    console.error("Error saving property:", err);
    error(err.response?.data?.message || "Failed to save property");
  } finally {
    saving.value = false;
  }
};

const viewProperty = (property: Record<string, unknown>) => {
  router.push({
    name: "property-details",
    params: { id: String(property.id) },
  });
};

const editProperty = (property: Record<string, unknown>) => {
  editingId.value = property.id as number;
  formData.value = {
    owner: (property.owner as number) ?? null,
    location: (property.location as number) ?? null,
    property_name: String(property.property_name ?? ""),
    property_type: String(property.property_type ?? "residential"),
    address: String(property.address ?? ""),
    description: String(property.description ?? ""),
  };

  selectedImage.value = null;
  imagePreview.value = null;
  if (imageInput.value) {
    imageInput.value.value = "";
  }
  if (property.image_url) {
    imagePreview.value = String(property.image_url);
  }
  showModal.value = true;
};

const deleteProperty = async (id: number) => {
  if (!confirm("Are you sure you want to delete this property?")) return;
  try {
    await propertiesStore.deleteItem(id);
    success("Property deleted");
  } catch (err: any) {
    console.error("Error deleting property:", err);
    error("Failed to delete property");
  }
};

const closeModal = () => {
  showModal.value = false;
  editingId.value = null;
  formData.value = {
    owner: null,
    location: null,
    property_name: "",
    property_type: "residential",
    address: "",
    description: "",
  };
  removeImage();
};

onMounted(() => {
  loadProperties().catch((err) => console.error("Error loading properties:", err));
  ownersStore.fetchList().catch(() => {});
  locationsStore.fetchList().catch(() => {});
});

let filterDebounce: ReturnType<typeof setTimeout> | null = null;
watch([searchQuery, filterType], () => {
  if (filterDebounce) clearTimeout(filterDebounce);
  filterDebounce = setTimeout(() => {
    loadProperties().catch((err) => console.error("Error loading properties:", err));
    filterDebounce = null;
  }, 300);
});
</script>

<style scoped>
.properties-page {
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
  transform: translateY(0);
  transition: all 0.3s ease !important;
}

.premium-add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(34, 197, 94, 0.4) !important;
}

/* Mini Stats */
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

.stat-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon-wrap.green {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
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
  overflow: hidden;
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

/* Image Cell */
.property-image-cell-premium {
  display: flex;
  align-items: center;
}

.image-inner-glass {
  width: 54px;
  height: 54px;
  border-radius: 12px;
  padding: 2px;
  background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
  border: 1px solid rgba(255,255,255,0.05);
}

.property-thumbnail-premium {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
}

.property-placeholder-premium {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 10px;
}

/* Name Cell */
.property-name-cell {
  display: flex;
  flex-direction: column;
}

.name-main {
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
  color: #94a3b8 !important;
}

.action-btn-glass:hover {
  background: rgba(255, 255, 255, 0.08) !important;
  color: #22c55e !important;
}

.action-btn-glass.delete:hover {
  color: #ef4444 !important;
}

/* Modal Premium Styling */
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

.image-upload-premium {
  height: 160px;
  border: 2px dashed rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.02);
}

.image-upload-premium:hover {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.03);
}

.upload-placeholder-premium {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 0.75rem;
}

.upload-text {
  text-align: center;
  display: flex;
  flex-direction: column;
}

.upload-text .main {
  font-size: 0.85rem;
  color: #e2e8f0;
  font-weight: 600;
}

.upload-text .sub {
  font-size: 0.75rem;
  color: #64748b;
}

.image-preview-premium {
  width: 100%;
  height: 100%;
  position: relative;
}

.image-preview-premium img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.preview-overlay:hover {
  opacity: 1;
}

.hidden-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
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

.mb-6 { margin-bottom: 1.5rem; }
.block { display: block; }

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

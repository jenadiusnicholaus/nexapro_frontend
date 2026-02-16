<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">Units</h1>
      <VaButton @click="showModal = true">Add Unit</VaButton>
    </div>

    <VaCard>
      <VaCardContent>
        <div class="filters mb-4">
          <VaInput
            v-model="searchQuery"
            placeholder="Search units..."
            class="mr-2"
            style="max-width: 300px"
          >
            <template #prependInner>
              <VaIcon name="search" />
            </template>
          </VaInput>
          <VaSelect
            v-model="filterProperty"
            :options="propertyOptions"
            text-by="text"
            value-by="value"
            placeholder="Filter by property"
            style="max-width: 200px"
            clearable
          />
          <VaSelect
            v-model="filterStatus"
            :options="statusOptions"
            text-by="(option) => option.charAt(0).toUpperCase() + option.slice(1)"
            placeholder="Filter by status"
            style="max-width: 200px"
            clearable
          />
        </div>

        <AppDataTable
          :items="unitsStore.items"
          :columns="columns"
          :loading="unitsStore.loading"
        >
          <template #cell(image)="{ rowData }">
            <div class="unit-image-cell">
              <img
                v-if="rowData.image_url"
                :src="rowData.image_url"
                :alt="rowData.unit_number"
                class="unit-thumbnail"
              />
              <div v-else class="unit-placeholder">
                <VaIcon name="meeting_room" size="small" />
              </div>
            </div>
          </template>
          <template #cell(status)="{ rowData }">
            <VaChip :color="getStatusColor(rowData.status)">
              {{ rowData.status }}
            </VaChip>
          </template>
          <template #cell(actions)="{ rowData }">
            <VaButton
              preset="plain"
              icon="edit"
              size="small"
              @click="editUnit(rowData)"
            />
            <VaButton
              preset="plain"
              icon="delete"
              size="small"
              color="danger"
              @click="deleteUnit(Number(rowData.id))"
            />
          </template>
        </AppDataTable>
      </VaCardContent>
    </VaCard>

    <!-- Add/Edit Modal -->
    <VaModal
      v-model="showModal"
      :title="editingId ? 'Edit Unit' : 'Add Unit'"
      hide-default-actions
      size="medium"
    >
      <VaForm ref="unitForm" @submit.prevent="saveUnit">
        <VaSelect
          v-model="formData.property"
          label="Property"
          :options="propertyOptions"
          text-by="text"
          value-by="value"
          :rules="[validators.required]"
          class="mb-4"
        />
        <VaInput
          v-model="formData.unit_number"
          label="Unit Number"
          :rules="[validators.required]"
          class="mb-4"
        />
        <VaInput v-model="formData.floor" label="Floor" class="mb-4" />
        <VaSelect
          v-model="formData.unit_type"
          label="Unit Type"
          :options="unitTypes"
          text-by="(option) => option.charAt(0).toUpperCase() + option.slice(1)"
          value-by="value"
          :rules="[validators.required]"
          class="mb-4"
        />
        <VaInput
          v-model="formData.rent_amount"
          label="Rent Amount"
          type="number"
          :rules="[validators.required]"
          class="mb-4"
        />
        <VaSelect
          v-model="formData.status"
          label="Status"
          :options="statusOptions"
          text-by="(option) => option.charAt(0).toUpperCase() + option.slice(1)"
          value-by="value"
          :rules="[validators.required]"
          class="mb-4"
        />

        <!-- Image Upload -->
        <div class="mb-4">
          <label class="va-input-label">Unit Image</label>
          <div class="image-upload-container">
            <div v-if="imagePreview" class="image-preview">
              <img :src="imagePreview" alt="Preview" />
              <VaButton
                preset="plain"
                icon="close"
                size="small"
                color="danger"
                class="remove-image-btn"
                @click="removeImage"
              />
            </div>
            <div v-else class="image-upload-placeholder">
              <VaIcon name="add_photo_alternate" size="large" />
              <p>Click to upload image</p>
            </div>
            <input
              type="file"
              ref="imageInput"
              accept="image/*"
              @change="handleImageSelect"
              class="image-input"
            />
          </div>
        </div>

        <div class="modal-actions">
          <VaButton preset="secondary" @click="closeModal">Cancel</VaButton>
          <VaButton type="submit" :loading="saving">Save</VaButton>
        </div>
      </VaForm>
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
  { key: "image", label: "Image", width: 80 },
  { key: "unit_number", label: "Unit #", sortable: true },
  { key: "property_name", label: "Property", sortable: true },
  { key: "floor", label: "Floor" },
  { key: "unit_type", label: "Type", sortable: true },
  { key: "rent_amount", label: "Rent", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "actions", label: "Actions", width: 100 },
];

const propertyOptions = computed(() =>
  (propertiesStore.items as Record<string, unknown>[]).map((p) => ({
    value: p.id,
    text: p.property_name,
  })),
);

const getStatusColor = (status: unknown) => {
  const colors: Record<string, string> = {
    vacant: "success",
    occupied: "info",
    maintenance: "warning",
  };
  return colors[String(status)] || "secondary";
};

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
    // Build base payload
    const payload = buildPayload(formData.value, ["property"]);

    // Add base64 image if a new image was selected
    if (selectedImage.value && imagePreview.value) {
      payload.image = imagePreview.value; // imagePreview already contains base64 data URL
    }

    if (editingId.value) {
      await unitsStore.updateItem(editingId.value, payload);
    } else {
      await unitsStore.createItem(payload);
    }

    const wasEdit = !!editingId.value;
    closeModal();
    success(wasEdit ? "Unit updated" : "Unit created");
  } catch (err) {
    console.error("Error saving unit:", err);
    if (err.response?.data) {
      console.error("API Error details:", err.response.data);
      const errorMsg =
        typeof err.response.data === "object"
          ? JSON.stringify(err.response.data)
          : err.response.data;
      error(`Failed to save unit: ${errorMsg}`);
    } else {
      error("Failed to save unit");
    }
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

  // Reset image state first
  selectedImage.value = null;
  imagePreview.value = null;
  if (imageInput.value) {
    imageInput.value.value = "";
  }

  // Show existing image preview but don't set selectedImage
  // selectedImage should only be set when user selects a NEW file
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
    console.error("Error deleting unit:", err);
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
  gap: 0.5rem;
  margin-top: 1rem;
}

.unit-image-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

.unit-thumbnail {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.unit-placeholder {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  color: #718096;
}

.image-upload-container {
  position: relative;
  width: 100%;
  min-height: 200px;
  border: 2px dashed #cbd5e0;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.image-upload-container:hover {
  border-color: #5a67d8;
}

.image-upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #718096;
}

.image-upload-placeholder p {
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

.image-preview {
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
}

.image-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}
</style>

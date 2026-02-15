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
            text-by="(option) => option.charAt(0).toUpperCase() + option.slice(1)"
          />
        </div>

        <AppDataTable
          :items="propertiesStore.items"
          :columns="columns"
          :loading="propertiesStore.loading"
        >
          <template #cell(image)="{ rowData }">
            <div class="property-image-cell">
              <img
                v-if="rowData.image_url"
                :src="rowData.image_url"
                :alt="rowData.property_name"
                class="property-thumbnail"
              />
              <div v-else class="property-placeholder">
                <VaIcon name="home" size="small" />
              </div>
            </div>
          </template>
          <template #cell(actions)="{ rowData }">
            <VaButton
              preset="plain"
              icon="visibility"
              size="small"
              @click="viewProperty(rowData)"
            />
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
    <VaModal
      v-model="showModal"
      :title="editingId ? 'Edit Property' : 'Add Property'"
      hide-default-actions
      size="medium"
    >
      <VaForm ref="propertyForm" @submit.prevent="saveProperty">
        <VaSelect
          v-model="formData.owner"
          label="Owner"
          :options="ownerOptions"
          text-by="text"
          value-by="value"
          :rules="[validators.required]"
          class="mb-4"
        />
        <VaSelect
          v-model="formData.location"
          label="Location"
          :options="locationOptions"
          text-by="text"
          value-by="value"
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
          text-by="(option) => option.charAt(0).toUpperCase() + option.slice(1)"
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

        <!-- Image Upload -->
        <div class="mb-4">
          <label class="va-input-label">Property Image</label>
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
  { key: "image", label: "Image", width: 80 },
  { key: "property_name", label: "Name", sortable: true },
  { key: "owner_name", label: "Owner", sortable: true },
  { key: "property_type", label: "Type", sortable: true },
  { key: "location_display", label: "Location" },
  { key: "address", label: "Address" },
  { key: "actions", label: "Actions", width: 100 },
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
    if (selectedImage.value) {
      // Create FormData for multipart/form-data upload
      const formDataPayload = new FormData();
      formDataPayload.append("owner", String(formData.value.owner));
      if (formData.value.location) {
        formDataPayload.append("location", String(formData.value.location));
      }
      formDataPayload.append("property_name", formData.value.property_name);
      formDataPayload.append("property_type", formData.value.property_type);
      formDataPayload.append("address", formData.value.address);
      formDataPayload.append("description", formData.value.description);
      formDataPayload.append("image", selectedImage.value);

      if (editingId.value) {
        await propertiesStore.updateItem(editingId.value, formDataPayload);
      } else {
        await propertiesStore.createItem(formDataPayload);
      }
    } else {
      // Regular JSON payload without image
      const payload = buildPayload(formData.value, ["owner", "location"]);
      if (editingId.value) {
        await propertiesStore.updateItem(editingId.value, payload);
      } else {
        await propertiesStore.createItem(payload);
      }
    }

    const wasEdit = !!editingId.value;
    closeModal();
    success(wasEdit ? "Property updated" : "Property created");
  } catch (err) {
    console.error("Error saving property:", err);
    if (err.response?.data) {
      console.error("API Error details:", err.response.data);
      const errorMsg =
        typeof err.response.data === "object"
          ? JSON.stringify(err.response.data)
          : err.response.data;
      error(`Failed to save property: ${errorMsg}`);
    } else {
      error("Failed to save property");
    }
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
  showModal.value = true;
};

const deleteProperty = async (id: number) => {
  if (!confirm("Are you sure you want to delete this property?")) return;

  try {
    await propertiesStore.deleteItem(id);
    success("Property deleted");
  } catch (err) {
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
  loadProperties().catch((err) =>
    console.error("Error loading properties:", err),
  );
  ownersStore.fetchList().catch(() => {});
  locationsStore.fetchList().catch(() => {});
});

let filterDebounce: ReturnType<typeof setTimeout> | null = null;
watch([searchQuery, filterType], () => {
  if (filterDebounce) clearTimeout(filterDebounce);
  filterDebounce = setTimeout(() => {
    loadProperties().catch((err) =>
      console.error("Error loading properties:", err),
    );
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
  gap: 0.5rem;
  margin-top: 1rem;
}

.property-image-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

.property-thumbnail {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.property-placeholder {
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

<template>
  <div class="property-details">
    <!-- Header with property info -->
    <div class="details-header">
      <VaButton preset="plain" icon="arrow_back" @click="goBack">
        Back to Properties
      </VaButton>
      <div v-if="property" class="property-info">
        <div class="property-main-info">
          <img
            v-if="property.image_url"
            :src="property.image_url"
            :alt="property.property_name"
            class="property-image"
          />
          <div v-else class="property-image-placeholder">
            <VaIcon name="home" size="large" />
          </div>
          <div>
            <h1 class="property-title">{{ property.property_name }}</h1>
            <p class="property-meta">
              <VaIcon name="location_on" size="small" />
              {{ property.location_display }}
            </p>
            <p class="property-meta">
              <VaIcon name="business" size="small" />
              {{ property.property_type }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <VaCard>
      <VaCardContent>
        <VaTabs v-model="activeTab" class="property-tabs">
          <template #tabs>
            <VaTab name="units">
              <VaIcon name="meeting_room" size="small" class="tab-icon" />
              Units
            </VaTab>
            <VaTab name="tenancies">
              <VaIcon name="description" size="small" class="tab-icon" />
              Tenancies
            </VaTab>
            <VaTab name="tenants">
              <VaIcon name="people" size="small" class="tab-icon" />
              Tenants
            </VaTab>
          </template>
        </VaTabs>

        <!-- Units Tab -->
        <div v-if="activeTab === 'units'" class="tab-content">
          <div class="tab-header">
            <h2>Units</h2>
            <div class="tab-actions">
              <VaSelect
                v-model="unitStatusFilter"
                :options="['all', 'vacant', 'occupied', 'maintenance']"
                text-by="(option) => option === 'all' ? 'All Status' : option.charAt(0).toUpperCase() + option.slice(1)"
                placeholder="Filter by status"
                style="max-width: 200px"
                clearable
              />
              <VaButton @click="showAddUnitModal = true">Add Unit</VaButton>
            </div>
          </div>

          <AppDataTable
            :items="filteredUnits"
            :columns="unitColumns"
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
        </div>

        <!-- Tenancies Tab -->
        <div v-if="activeTab === 'tenancies'" class="tab-content">
          <div class="tab-header">
            <h2>Tenancies</h2>
            <VaButton @click="openAddTenancyModal">Add Tenancy</VaButton>
          </div>

          <AppDataTable
            :items="propertyTenancies"
            :columns="tenancyColumns"
            :loading="tenanciesStore.loading"
          >
            <template #cell(status)="{ rowData }">
              <VaChip :color="getTenancyStatusColor(rowData.status)">
                {{ rowData.status }}
              </VaChip>
            </template>
            <template #cell(actions)="{ rowData }">
              <VaButton
                color="warning"
                icon="logout"
                size="small"
                @click="moveOutTenancy(rowData)"
                v-if="rowData.status === 'active'"
              >
                Move Out
              </VaButton>
            </template>
          </AppDataTable>
        </div>

        <!-- Tenants Tab -->
        <div v-if="activeTab === 'tenants'" class="tab-content">
          <div class="tab-header">
            <h2>Tenants</h2>
          </div>

          <AppDataTable
            :items="propertyTenants"
            :columns="tenantColumns"
            :loading="tenantsStore.loading"
          >
            <template #cell(current_unit)="{ rowData }">
              {{ getTenantCurrentUnit(rowData.id) }}
            </template>
            <template #cell(actions)="{ rowData }">
              <VaButton
                preset="plain"
                icon="visibility"
                size="small"
                @click="viewTenant(rowData)"
              >
                View
              </VaButton>
            </template>
          </AppDataTable>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Add Tenancy Modal -->
    <VaModal
      v-model="showAddTenancyModal"
      title="Add Tenancy"
      size="medium"
      hide-default-actions
    >
      <VaForm ref="tenancyForm" @submit.prevent="saveTenancy">
        <div class="tenant-select-group mb-4">
          <VaSelect
            v-model="tenancyFormData.tenant"
            label="Tenant"
            :options="tenantOptions"
            text-by="text"
            value-by="value"
            :rules="[(v) => !!v || 'Tenant is required']"
            placeholder="Select a tenant"
            searchable
            clearable
          />
          <VaButton
            preset="primary"
            icon="add"
            size="small"
            class="add-tenant-btn"
            @click="openAddTenantModal"
          >
            Add New
          </VaButton>
        </div>
        <VaSelect
          v-model="tenancyFormData.unit"
          label="Unit"
          :options="availableUnitOptions"
          text-by="text"
          value-by="value"
          :rules="[(v) => !!v || 'Unit is required']"
          class="mb-4"
        />
        <VaInput
          v-model="tenancyFormData.move_in_date"
          label="Move-In Date"
          type="date"
          :rules="[(v) => !!v || 'Move-in date is required']"
          class="mb-4"
        />
        <div class="row mb-4">
          <div class="flex md4">
            <VaInput
              v-model="tenancyFormData.rent_amount"
              :label="`Rent Amount (per ${tenancyFormData.rent_period})`"
              type="number"
              :rules="[(v) => !!v || 'Rent amount is required']"
            />
          </div>
          <div class="flex md4">
            <VaSelect
              v-model="tenancyFormData.rent_period"
              label="Rent Period"
              :options="[
                { value: 'month', text: 'Per Month' },
                { value: 'day', text: 'Per Day' },
              ]"
              text-by="text"
              value-by="value"
            />
          </div>
          <div class="flex md4">
            <VaSelect
              v-model="tenancyFormData.currency"
              label="Currency"
              :options="['TZS', 'USD', 'EUR']"
            />
          </div>
        </div>
        <VaInput
          v-model="tenancyFormData.deposit_amount"
          label="Deposit Amount"
          type="number"
          :rules="[(v) => !!v || 'Deposit amount is required']"
          class="mb-4"
        />
        <div class="row mb-4">
          <div class="flex md6">
            <VaInput
              v-model="tenancyFormData.stay_duration_value"
              label="Stay Duration"
              type="number"
              :rules="[(v) => !!v || 'Duration is required']"
              :placeholder="
                tenancyFormData.stay_duration_unit === 'month'
                  ? 'e.g. 6'
                  : 'e.g. 30'
              "
            />
          </div>
          <div class="flex md6">
            <VaSelect
              v-model="tenancyFormData.stay_duration_unit"
              label="Duration Unit"
              :options="[
                { value: 'month', text: 'Months' },
                { value: 'day', text: 'Days' },
              ]"
              text-by="text"
              value-by="value"
            />
          </div>
        </div>
        <div class="modal-actions">
          <VaButton preset="secondary" @click="closeTenancyModal"
            >Cancel</VaButton
          >
          <VaButton type="submit" :loading="saving">Save</VaButton>
        </div>
      </VaForm>
    </VaModal>

    <!-- Add Tenant Modal (Independent) -->
    <VaModal
      v-model="showAddTenantModal"
      title="Add New Tenant"
      size="small"
      hide-default-actions
    >
      <VaForm ref="tenantForm" @submit.prevent="createNewTenant">
        <VaInput
          v-model="newTenantData.full_name"
          label="Full Name"
          :rules="[(v) => !!v || 'Name is required']"
          placeholder="Enter full name"
          class="mb-4"
        />
        <VaInput
          v-model="newTenantData.id_number"
          label="ID Number"
          :rules="[(v) => !!v || 'ID number is required']"
          placeholder="Enter ID/Passport number"
          class="mb-4"
        />
        <VaInput
          v-model="newTenantData.email"
          label="Email"
          type="email"
          :rules="[
            (v) => !!v || 'Email is required',
            (v) => /.+@.+\..+/.test(v) || 'Email must be valid',
          ]"
          placeholder="tenant@example.com"
          class="mb-4"
        />
        <VaInput
          v-model="newTenantData.phone"
          label="Phone"
          :rules="[(v) => !!v || 'Phone is required']"
          placeholder="+255 XXX XXX XXX"
          class="mb-4"
        />
        <div class="modal-actions">
          <VaButton preset="secondary" @click="closeAddTenantModal"
            >Cancel</VaButton
          >
          <VaButton type="submit" :loading="creatingTenant"
            >Create Tenant</VaButton
          >
        </div>
      </VaForm>
    </VaModal>

    <!-- Add Unit Modal -->
    <VaModal v-model="showAddUnitModal" title="Add Unit" size="medium">
      <VaForm ref="unitForm" @submit.prevent="saveUnit">
        <VaInput
          v-model="unitFormData.unit_number"
          label="Unit Number"
          :rules="[(v) => !!v || 'Unit number is required']"
          class="mb-4"
        />
        <VaInput v-model="unitFormData.floor" label="Floor" class="mb-4" />
        <VaSelect
          v-model="unitFormData.unit_type"
          label="Unit Type"
          :options="['apartment', 'studio', 'office']"
          :rules="[(v) => !!v || 'Unit type is required']"
          class="mb-4"
        />
        <VaInput
          v-model="unitFormData.rent_amount"
          label="Rent Amount"
          type="number"
          :rules="[(v) => !!v || 'Rent amount is required']"
          class="mb-4"
        />
        <VaSelect
          v-model="unitFormData.status"
          label="Status"
          :options="['vacant', 'occupied', 'maintenance']"
          :rules="[(v) => !!v || 'Status is required']"
          class="mb-4"
        />
        <div class="modal-actions">
          <VaButton preset="secondary" @click="closeUnitModal">Cancel</VaButton>
          <VaButton type="submit" :loading="savingUnit">Save</VaButton>
        </div>
      </VaForm>
    </VaModal>

    <!-- Move Out Modal -->
    <VaModal v-model="showMoveOutModal" title="Move Out Tenant" size="small">
      <VaForm ref="moveOutForm" @submit.prevent="confirmMoveOut">
        <p class="mb-4">
          Moving out tenant from
          <strong>{{ selectedTenancyForMoveOut?.unit_number }}</strong>
        </p>
        <VaInput
          v-model="moveOutDate"
          label="Move-Out Date"
          type="date"
          :rules="[(v) => !!v || 'Move-out date is required']"
          class="mb-4"
        />
        <div class="modal-actions">
          <VaButton preset="secondary" @click="closeMoveOutModal"
            >Cancel</VaButton
          >
          <VaButton type="submit" :loading="movingOut">Move Out</VaButton>
        </div>
      </VaForm>
    </VaModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  useUnitsStore,
  useTenanciesStore,
  useTenantsStore,
  usePropertiesStore,
} from "@/stores";
import { useAppToast } from "@/composables/useAppToast";
import AppDataTable from "@/components/AppDataTable.vue";
import { buildPayload } from "@/utils/apiPayload";

const route = useRoute();
const router = useRouter();
const { success, error } = useAppToast();

const unitsStore = useUnitsStore();
const tenanciesStore = useTenanciesStore();
const tenantsStore = useTenantsStore();
const propertiesStore = usePropertiesStore();

const propertyId = ref<number>(Number(route.params.id));
const property = ref<any>(null);
const activeTab = ref("units");
const unitStatusFilter = ref("all");
const showAddUnitModal = ref(false);
const showAddTenancyModal = ref(false);
const showAddTenantModal = ref(false);
const showMoveOutModal = ref(false);
const saving = ref(false);
const savingUnit = ref(false);
const creatingTenant = ref(false);
const movingOut = ref(false);
const tenancyForm = ref<{ validate: () => Promise<boolean> } | null>(null);
const tenantForm = ref<{ validate: () => Promise<boolean> } | null>(null);
const unitForm = ref<{ validate: () => Promise<boolean> } | null>(null);
const moveOutForm = ref<{ validate: () => Promise<boolean> } | null>(null);
const selectedTenancyForMoveOut = ref<any>(null);
const moveOutDate = ref("");

const tenancyFormData = ref({
  tenant: null,
  unit: null,
  move_in_date: "",
  rent_amount: "",
  rent_period: "month",
  deposit_amount: "",
  currency: "TZS",
  stay_duration_value: "",
  stay_duration_unit: "month",
  status: "active",
});

const newTenantData = ref({
  full_name: "",
  id_number: "",
  email: "",
  phone: "",
});

const unitFormData = ref({
  unit_number: "",
  floor: "",
  unit_type: "",
  rent_amount: "",
  status: "vacant",
});

// Unit columns
const unitColumns = [
  { key: "image", label: "Image", width: 80 },
  { key: "unit_number", label: "Unit #", sortable: true },
  { key: "floor", label: "Floor" },
  { key: "unit_type", label: "Type", sortable: true },
  { key: "rent_amount", label: "Rent", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "actions", label: "Actions", width: 100 },
];

// Tenancy columns
const tenancyColumns = [
  { key: "tenant_name", label: "Tenant", sortable: true },
  { key: "unit_number", label: "Unit", sortable: true },
  { key: "start_date", label: "Start Date", sortable: true },
  { key: "end_date", label: "End Date" },
  { key: "rent_amount", label: "Rent", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "actions", label: "Actions", width: 100 },
];

// Tenant columns
const tenantColumns = [
  { key: "full_name", label: "Name", sortable: true },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "current_unit", label: "Current Unit" },
  { key: "actions", label: "Actions", width: 100 },
];

// Filtered units based on status
const filteredUnits = computed(() => {
  if (unitStatusFilter.value === "all" || !unitStatusFilter.value) {
    return unitsStore.items;
  }
  return unitsStore.items.filter(
    (unit: any) => unit.status === unitStatusFilter.value,
  );
});

// Property tenancies (already filtered by API)
const propertyTenancies = computed(() => {
  return tenanciesStore.items;
});

// Property tenants (already filtered by API with distinct results)
const propertyTenants = computed(() => {
  return tenantsStore.items;
});

// Tenant options for dropdown - load all tenants, not just property-filtered
const tenantOptions = computed(() => {
  if (!tenantsStore.items || tenantsStore.items.length === 0) {
    return [];
  }
  return (tenantsStore.items as any[]).map((tenant) => ({
    value: tenant.id,
    text: tenant.full_name || `Tenant ${tenant.id}`,
  }));
});

// Available units (vacant only) for tenancy
const availableUnitOptions = computed(() => {
  return (unitsStore.items as any[])
    .filter((unit) => unit.status === "vacant")
    .map((unit) => ({
      value: unit.id,
      text: `Unit ${unit.unit_number}${unit.floor ? " - Floor " + unit.floor : ""}`,
    }));
});

const getStatusColor = (status: unknown) => {
  const colors: Record<string, string> = {
    vacant: "success",
    occupied: "info",
    maintenance: "warning",
  };
  return colors[String(status)] || "secondary";
};

const getTenancyStatusColor = (status: unknown) => {
  const colors: Record<string, string> = {
    active: "success",
    ended: "secondary",
    pending: "warning",
  };
  return colors[String(status)] || "secondary";
};

const getTenantCurrentUnit = (tenantId: number) => {
  const activeTenancy = (tenanciesStore.items as any[]).find(
    (tenancy: any) =>
      (tenancy.tenant === tenantId || tenancy.tenant_id === tenantId) &&
      tenancy.status === "active",
  );
  return activeTenancy?.unit_number || "N/A";
};

const loadPropertyData = async () => {
  try {
    // Load property details
    const properties = propertiesStore.items as any[];
    property.value = properties.find((p: any) => p.id === propertyId.value);

    if (!property.value) {
      await propertiesStore.fetchList();
      property.value = (propertiesStore.items as any[]).find(
        (p: any) => p.id === propertyId.value,
      );
    }

    // Load units for this property
    await unitsStore.fetchList({ property: propertyId.value });

    // Load tenancies for this property
    await tenanciesStore.fetchList({ property: propertyId.value });

    // Load tenants for this property (filtered by property)
    await tenantsStore.fetchList({ property: propertyId.value });
  } catch (err) {
    console.error("Error loading property data:", err);
    error("Failed to load property details");
  }
};

const goBack = () => {
  router.push({ name: "properties" });
};

const saveUnit = async () => {
  const isValid = await unitForm.value?.validate();
  if (!isValid) return;

  savingUnit.value = true;
  try {
    const unitData = {
      property: propertyId.value,
      unit_number: unitFormData.value.unit_number,
      floor: unitFormData.value.floor,
      unit_type: unitFormData.value.unit_type,
      rent_amount: unitFormData.value.rent_amount,
      status: unitFormData.value.status,
    };

    const payload = buildPayload(unitData, ["property"]);
    await unitsStore.createItem(payload);
    success("Unit created successfully");
    closeUnitModal();

    // Refresh units list
    await unitsStore.fetchList({ property: propertyId.value });
  } catch (err: any) {
    console.error("Error creating unit:", err);
    if (err.response?.data) {
      const errorMsg =
        typeof err.response.data === "object"
          ? JSON.stringify(err.response.data)
          : err.response.data;
      error(`Failed to create unit: ${errorMsg}`);
    } else {
      error("Failed to create unit");
    }
  } finally {
    savingUnit.value = false;
  }
};

const closeUnitModal = () => {
  showAddUnitModal.value = false;
  unitFormData.value = {
    unit_number: "",
    floor: "",
    unit_type: "",
    rent_amount: "",
    status: "vacant",
  };
};

const editUnit = (unit: any) => {
  // TODO: Implement edit unit
  console.log("Edit unit:", unit);
};

const deleteUnit = async (id: number) => {
  if (confirm("Are you sure you want to delete this unit?")) {
    try {
      await unitsStore.deleteItem(id);
      success("Unit deleted successfully");
      await unitsStore.fetchList({ property: propertyId.value });
    } catch (err) {
      error("Failed to delete unit");
    }
  }
};

const moveOutTenancy = (tenancy: any) => {
  selectedTenancyForMoveOut.value = tenancy;
  moveOutDate.value = "";
  showMoveOutModal.value = true;
};

const confirmMoveOut = async () => {
  const isValid = await moveOutForm.value?.validate();
  if (!isValid) return;

  movingOut.value = true;
  try {
    await tenanciesStore.moveOut(
      selectedTenancyForMoveOut.value.id,
      moveOutDate.value,
    );
    success("Tenant moved out successfully");
    closeMoveOutModal();

    // Refresh data
    await tenanciesStore.fetchList({ property: propertyId.value });
    await unitsStore.fetchList({ property: propertyId.value });
  } catch (err: any) {
    console.error("Error moving out tenant:", err);
    if (err.response?.data) {
      const errorMsg =
        typeof err.response.data === "object"
          ? JSON.stringify(err.response.data)
          : err.response.data;
      error(`Failed to move out tenant: ${errorMsg}`);
    } else {
      error("Failed to move out tenant");
    }
  } finally {
    movingOut.value = false;
  }
};

const closeMoveOutModal = () => {
  showMoveOutModal.value = false;
  selectedTenancyForMoveOut.value = null;
  moveOutDate.value = "";
};

const viewTenant = (tenant: any) => {
  router.push({ name: "tenants", query: { id: tenant.id } });
};

const openAddTenancyModal = async () => {
  // Load all tenants for this property's owner
  try {
    if (property.value?.owner || property.value?.owner_id) {
      const ownerId = property.value.owner || property.value.owner_id;
      await tenantsStore.fetchList({ owner: ownerId });
    } else {
      await tenantsStore.fetchList();
    }
    showAddTenancyModal.value = true;
  } catch (err) {
    console.error("Error loading tenants:", err);
    showAddTenancyModal.value = true;
  }
};

const openAddTenantModal = () => {
  showAddTenantModal.value = true;
};

const closeAddTenantModal = () => {
  showAddTenantModal.value = false;
  newTenantData.value = {
    full_name: "",
    id_number: "",
    email: "",
    phone: "",
  };
};

const createNewTenant = async () => {
  const isValid = await tenantForm.value?.validate();
  if (!isValid) return;

  creatingTenant.value = true;
  try {
    const ownerId = property.value?.owner || property.value?.owner_id;
    const tenantPayload = {
      full_name: newTenantData.value.full_name,
      id_number: newTenantData.value.id_number,
      email: newTenantData.value.email,
      phone: newTenantData.value.phone,
      owner: ownerId,
    };

    const newTenant = (await tenantsStore.createItem(tenantPayload)) as any;
    success("Tenant created successfully");

    // Refresh tenants list with owner filter to match the dropdown's expected data
    if (property.value?.owner || property.value?.owner_id) {
      const ownerId = property.value.owner || property.value.owner_id;
      await tenantsStore.fetchList({ owner: ownerId });
    } else {
      await tenantsStore.fetchList();
    }

    // Select the newly created tenant
    tenancyFormData.value.tenant = newTenant?.id;

    // Close modal and reset form
    closeAddTenantModal();
  } catch (err: any) {
    console.error("Error creating tenant:", err);
    if (err.response?.data) {
      const errorMsg =
        typeof err.response.data === "object"
          ? JSON.stringify(err.response.data)
          : err.response.data;
      error(`Failed to create tenant: ${errorMsg}`);
    } else {
      error("Failed to create tenant");
    }
  } finally {
    creatingTenant.value = false;
  }
};

const saveTenancy = async () => {
  const isValid = await tenancyForm.value?.validate();
  if (!isValid) return;

  saving.value = true;
  try {
    const tenancyPayload = {
      tenant: tenancyFormData.value.tenant,
      unit: tenancyFormData.value.unit,
      move_in_date: tenancyFormData.value.move_in_date,
      contract_start: tenancyFormData.value.move_in_date,
      rent_amount: tenancyFormData.value.rent_amount,
      rent_period: tenancyFormData.value.rent_period,
      deposit_amount: tenancyFormData.value.deposit_amount,
      currency: tenancyFormData.value.currency,
      stay_duration_value: parseInt(tenancyFormData.value.stay_duration_value),
      stay_duration_unit: tenancyFormData.value.stay_duration_unit,
      status: tenancyFormData.value.status,
    };

    await tenanciesStore.createItem(tenancyPayload);
    closeTenancyModal();
    success("Tenancy created successfully");

    // Refresh data
    await tenanciesStore.fetchList({ property: propertyId.value });
    await unitsStore.fetchList({ property: propertyId.value });
  } catch (err: any) {
    console.error("Error creating tenancy:", err);
    if (err.response?.data) {
      console.error("API Error details:", err.response.data);
      const errorMsg =
        typeof err.response.data === "object"
          ? JSON.stringify(err.response.data)
          : err.response.data;
      error(`Failed to create tenancy: ${errorMsg}`);
    } else {
      error("Failed to create tenancy");
    }
  } finally {
    saving.value = false;
  }
};

const closeTenancyModal = () => {
  showAddTenancyModal.value = false;
  tenancyFormData.value = {
    tenant: null,
    unit: null,
    move_in_date: "",
    rent_amount: "",
    rent_period: "month",
    deposit_amount: "",
    currency: "TZS",
    stay_duration_value: "",
    stay_duration_unit: "month",
    status: "active",
  };
};

onMounted(() => {
  loadPropertyData();
});

// Watch for tab changes and refresh data
watch(activeTab, async (newTab) => {
  try {
    if (newTab === "units") {
      await unitsStore.fetchList({ property: propertyId.value });
    } else if (newTab === "tenancies") {
      await tenanciesStore.fetchList({ property: propertyId.value });
    } else if (newTab === "tenants") {
      await tenantsStore.fetchList({ property: propertyId.value });
    }
  } catch (err) {
    console.error(`Error refreshing ${newTab} data:`, err);
  }
});
</script>

<style scoped>
.property-details {
  padding: 0 1rem;
  max-width: 1400px;
  margin: 0 auto;
}

.details-header {
  margin-bottom: 2rem;
}

.property-info {
  margin-top: 1rem;
}

.property-main-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.property-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
}

.property-image-placeholder {
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7fafc;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  color: #718096;
}

.property-title {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
}

.property-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.25rem 0;
  color: #718096;
  font-size: 0.95rem;
}

.property-tabs {
  margin-bottom: 1.5rem;
}

.tab-icon {
  margin-right: 0.5rem;
}

.tab-content {
  padding: 1rem 0;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.tab-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
}

.tab-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
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

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.tenant-select-group {
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
}

.tenant-select-group .va-select {
  flex: 1;
}

.add-tenant-btn {
  flex-shrink: 0;
  margin-bottom: 0.125rem;
}
</style>

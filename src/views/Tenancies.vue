<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">Tenancies</h1>
      <VaButton @click="showMoveInModal = true">Move-In Tenant</VaButton>
    </div>

    <VaCard>
      <VaCardContent>
        <div class="filters mb-4">
          <VaInput
            v-model="searchQuery"
            placeholder="Search tenancies..."
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
            style="max-width: 250px"
            clearable
          />
          <VaSelect
            v-model="filterUnit"
            :options="unitOptions"
            text-by="text"
            value-by="value"
            placeholder="Filter by unit"
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
          :items="tenanciesStore.items"
          :columns="columns"
          :loading="tenanciesStore.loading"
        >
          <template #cell(status)="{ rowData }">
            <VaChip :color="getStatusColor(rowData.status)">
              {{ rowData.status }}
            </VaChip>
          </template>
          <template #cell(actions)="{ rowData }">
            <VaButton
              v-if="rowData.status === 'active'"
              preset="plain"
              icon="exit_to_app"
              size="small"
              color="warning"
              @click="openMoveOutModal(rowData)"
            >
              Move Out
            </VaButton>
          </template>
        </AppDataTable>
      </VaCardContent>
    </VaCard>

    <!-- Move-In Modal -->
    <VaModal
      v-model="showMoveInModal"
      title="Move-In Tenant"
      hide-default-actions
      size="medium"
    >
      <VaForm ref="moveInForm" @submit.prevent="saveMoveIn">
        <VaSelect
          v-model="moveInData.tenant"
          label="Tenant"
          :options="tenantOptions"
          :rules="[validators.required]"
          class="mb-4"
        />
        <VaSelect
          v-model="moveInData.unit"
          label="Unit"
          :options="unitOptions"
          :rules="[validators.required]"
          class="mb-4"
        />
        <VaInput
          v-model="moveInData.move_in_date"
          label="Move-In Date"
          type="date"
          :rules="[validators.required]"
          class="mb-4"
        />
        <VaInput
          v-model="moveInData.rent_amount"
          label="Rent Amount"
          type="number"
          :rules="[validators.required]"
          class="mb-4"
        />
        <VaInput
          v-model="moveInData.deposit_amount"
          label="Deposit Amount"
          type="number"
          :rules="[validators.required]"
          class="mb-4"
        />
        <VaInput
          v-model="moveInData.contract_start"
          label="Contract Start Date"
          type="date"
          :rules="[validators.required]"
          class="mb-4"
        />
        <VaInput
          v-model="moveInData.contract_end"
          label="Contract End Date"
          type="date"
          class="mb-4"
        />
        <div class="modal-actions">
          <VaButton preset="secondary" @click="closeMoveInModal"
            >Cancel</VaButton
          >
          <VaButton type="submit" :loading="saving">Save</VaButton>
        </div>
      </VaForm>
    </VaModal>

    <!-- Move-Out Modal -->
    <VaModal
      v-model="moveOutModalOpen"
      title="Move-Out Tenant"
      hide-default-actions
      size="medium"
    >
      <VaForm ref="moveOutForm" @submit.prevent="saveMoveOut">
        <VaInput
          v-model="moveOutDate"
          label="Move-Out Date"
          type="date"
          :rules="[validators.required]"
          class="mb-4"
        />
        <div class="modal-actions">
          <VaButton preset="secondary" @click="closeMoveOutModal"
            >Cancel</VaButton
          >
          <VaButton type="submit" :loading="saving">Confirm Move-Out</VaButton>
        </div>
      </VaForm>
    </VaModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import AppDataTable from "@/components/AppDataTable.vue";
import { useAppToast } from "@/composables/useAppToast";
import {
  useTenanciesStore,
  useTenantsStore,
  useUnitsStore,
  usePropertiesStore,
} from "@/stores";
import { buildPayload } from "@/utils/apiPayload";
import { validators } from "@/utils/validators";

const { success, error } = useAppToast();
const tenanciesStore = useTenanciesStore();
const tenantsStore = useTenantsStore();
const unitsStore = useUnitsStore();
const propertiesStore = usePropertiesStore();

const saving = ref(false);
const showMoveInModal = ref(false);
const moveOutModalOpen = ref(false);
const editingTenancyId = ref<number | null>(null);
const searchQuery = ref("");
const filterProperty = ref("");
const filterUnit = ref("");
const filterStatus = ref("");
const moveInForm = ref<{ validate: () => Promise<boolean> } | null>(null);
const moveOutForm = ref<{ validate: () => Promise<boolean> } | null>(null);
const moveOutDate = ref("");

const statusOptions = ["active", "completed", "terminated"];

const moveInData = ref({
  tenant: null,
  unit: null,
  move_in_date: "",
  rent_amount: "",
  deposit_amount: "",
  contract_start: "",
  contract_end: "",
  status: "active",
});

const columns = [
  { key: "tenant_name", label: "Tenant", sortable: true },
  { key: "unit_number", label: "Unit", sortable: true },
  { key: "property_name", label: "Property", sortable: true },
  { key: "move_in_date", label: "Move-In Date", sortable: true },
  { key: "rent_amount", label: "Rent", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "actions", label: "Actions", width: 150 },
];

const tenantOptions = computed(() =>
  (tenantsStore.items as Record<string, unknown>[]).map((t) => ({
    value: t.id,
    text: t.full_name,
  })),
);

const propertyOptions = computed(() =>
  (propertiesStore.items as Record<string, unknown>[]).map((p) => ({
    value: p.id,
    text: p.property_name,
  })),
);

const unitOptions = computed(() =>
  (unitsStore.items as Record<string, unknown>[])
    .filter((u) => (u as Record<string, unknown>).status === "vacant")
    .map((u) => ({
      value: (u as Record<string, unknown>).id,
      text: `${(u as Record<string, unknown>).unit_number} - ${(u as Record<string, unknown>).property_name}`,
    })),
);

const getStatusColor = (status: unknown) => {
  const colors: Record<string, string> = {
    active: "success",
    completed: "info",
    terminated: "danger",
  };
  return colors[String(status)] || "secondary";
};

const loadTenancies = () => {
  const params: Record<string, unknown> = {};
  if (searchQuery.value) params.search = searchQuery.value;
  if (filterProperty.value) params.property = filterProperty.value;
  if (filterUnit.value) params.unit = filterUnit.value;
  if (filterStatus.value) params.status = filterStatus.value;
  return tenanciesStore.fetchList(params);
};

const saveMoveIn = async () => {
  const isValid = await moveInForm.value?.validate();
  if (!isValid) return;

  const payload = buildPayload(moveInData.value, ["tenant", "unit"]);
  saving.value = true;
  try {
    await tenanciesStore.createItem(payload);
    closeMoveInModal();
    success("Tenant moved in");
    await unitsStore.fetchList({ status: "vacant" });
  } catch (err) {
    console.error("Error creating tenancy:", err);
    error("Failed to move in tenant");
  } finally {
    saving.value = false;
  }
};

const openMoveOutModal = (tenancy: Record<string, unknown>) => {
  editingTenancyId.value = tenancy.id as number;
  moveOutDate.value = "";
  moveOutModalOpen.value = true;
};

const saveMoveOut = async () => {
  const isValid = await moveOutForm.value?.validate();
  if (!isValid) return;

  saving.value = true;
  try {
    await tenanciesStore.moveOut(editingTenancyId.value!, moveOutDate.value);
    closeMoveOutModal();
    success("Tenant moved out");
    await unitsStore.fetchList({ status: "vacant" });
  } catch (err) {
    console.error("Error moving out tenant:", err);
    error("Failed to move out tenant");
  } finally {
    saving.value = false;
  }
};

const closeMoveInModal = () => {
  showMoveInModal.value = false;
  moveInData.value = {
    tenant: null,
    unit: null,
    move_in_date: "",
    rent_amount: "",
    deposit_amount: "",
    contract_start: "",
    contract_end: "",
    status: "active",
  };
};

const closeMoveOutModal = () => {
  moveOutModalOpen.value = false;
  editingTenancyId.value = null;
  moveOutDate.value = "";
};

onMounted(() => {
  loadTenancies().catch((err) =>
    console.error("Error loading tenancies:", err),
  );
  tenantsStore.fetchList().catch(() => {});
  unitsStore.fetchList({ status: "vacant" }).catch(() => {});
  propertiesStore.fetchList().catch(() => {});
});

let searchDebounce: ReturnType<typeof setTimeout> | null = null;
watch(searchQuery, () => {
  if (searchDebounce) clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    loadTenancies().catch((err) =>
      console.error("Error loading tenancies:", err),
    );
    searchDebounce = null;
  }, 300);
});

watch([filterProperty, filterUnit, filterStatus], () => {
  loadTenancies().catch((err) =>
    console.error("Error loading tenancies:", err),
  );
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
  gap: 1rem;
  margin-top: 1.5rem;
}
</style>

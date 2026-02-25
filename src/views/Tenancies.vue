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
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap">
              <VaButton
                icon="visibility"
                size="small"
                preset="secondary"
                @click="viewTenancyDetails(rowData)"
              >
                View Details
              </VaButton>
              <VaButton
                icon="description"
                size="small"
                color="primary"
                @click="generateContract(rowData)"
                :loading="generatingContractId === rowData.id"
              >
                Contract
              </VaButton>
              <VaButton
                v-if="rowData.status === 'active'"
                icon="sms"
                size="small"
                color="success"
                @click="sendReminder(rowData)"
                :loading="sendingReminderId === rowData.id"
              >
                Send SMS
              </VaButton>
              <VaButton
                v-if="rowData.status === 'active'"
                icon="exit_to_app"
                size="small"
                color="danger"
                @click="openMoveOutModal(rowData)"
              >
                Move Out
              </VaButton>
            </div>
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
        <div
          style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem"
          class="mb-4"
        >
          <VaInput
            v-model="moveInData.rent_amount"
            label="Rent Amount (Per Month)"
            type="number"
            :rules="[validators.required]"
          />
          <VaSelect
            v-model="moveInData.rent_period"
            label="Rent Period"
            :options="['month', 'week', 'year']"
            :rules="[validators.required]"
          />
        </div>
        <VaSelect
          v-model="moveInData.currency"
          label="Currency"
          :options="['TZS', 'USD', 'EUR']"
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
        <div
          style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem"
          class="mb-4"
        >
          <VaInput
            v-model="moveInData.stay_duration_value"
            label="Stay Duration"
            type="number"
            placeholder="e.g. 6"
            :rules="[validators.required]"
          />
          <VaSelect
            v-model="moveInData.stay_duration_unit"
            label="Duration Unit"
            :options="['month', 'year']"
            :rules="[validators.required]"
          />
        </div>

        <VaCheckbox
          v-model="moveInData.deposit_paid"
          label="Confirm payment received"
          class="mb-3"
        />

        <VaAlert v-if="!moveInData.deposit_paid" color="warning" class="mb-3">
          ⚠️ Receipt SMS will not be sent to tenant
        </VaAlert>

        <VaSelect
          v-if="moveInData.deposit_paid"
          v-model="moveInData.deposit_payment_method"
          label="Payment Method"
          :options="[
            { value: 'cash', text: 'Cash' },
            { value: 'bank', text: 'Bank Transfer' },
            {
              value: 'mobile_money',
              text: 'Mobile Money (M-Pesa/Airtel/Tigo)',
            },
            { value: 'cheque', text: 'Cheque' },
            { value: 'other', text: 'Other' },
          ]"
          text-by="text"
          value-by="value"
          :rules="[
            (v) =>
              !!v || 'Payment method is required when payment is confirmed',
          ]"
          placeholder="Select payment method"
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

    <!-- SMS Confirmation Modal -->
    <VaModal
      v-model="showSmsModal"
      title="Send Rent Reminder SMS"
      hide-default-actions
      size="medium"
    >
      <div class="sms-modal-container">
        <p class="mb-4">
          Select who should receive the rent reminder SMS for
          <strong>{{ currentTenancyForSms?.tenant_name }}</strong
          >:
        </p>

        <div class="recipient-selection mb-4">
          <VaCheckbox
            v-model="smsRecipients.sendToTenant"
            label="Send to Tenant"
            class="mb-3"
          >
            <template #label>
              <div>
                <strong>Send to Tenant</strong>
                <p class="recipient-info">
                  {{ currentTenancyForSms?.tenant_name }}
                </p>
              </div>
            </template>
          </VaCheckbox>

          <VaCheckbox v-model="smsRecipients.sendToOwner" label="Send to Owner">
            <template #label>
              <div>
                <strong>Send to Property Owner</strong>
                <p class="recipient-info">Notification about reminder sent</p>
              </div>
            </template>
          </VaCheckbox>
        </div>

        <VaAlert
          v-if="!smsRecipients.sendToTenant && !smsRecipients.sendToOwner"
          color="warning"
          class="mb-4"
        >
          Please select at least one recipient
        </VaAlert>

        <div class="modal-actions">
          <VaButton preset="secondary" @click="closeSmsModal">Cancel</VaButton>
          <VaButton
            color="success"
            @click="confirmSendReminder"
            :disabled="
              !smsRecipients.sendToTenant && !smsRecipients.sendToOwner
            "
            :loading="sendingReminderId !== null"
          >
            Send SMS
          </VaButton>
        </div>
      </div>
    </VaModal>

    <!-- Signature Upload Modal -->
    <VaModal
      v-model="showSignatureModal"
      title="Upload Signatures"
      hide-default-actions
      size="large"
    >
      <div class="signature-upload-container">
        <p class="mb-4">
          Please upload signatures before generating the contract.
        </p>

        <!-- Owner Signature Section -->
        <div class="signature-section mb-6">
          <h3 class="mb-3">Owner Signature & Stamp</h3>
          <div class="upload-grid">
            <div class="upload-item">
              <label class="upload-label">Owner Signature</label>
              <input
                type="file"
                ref="ownerSignatureInput"
                accept="image/*"
                @change="handleOwnerSignatureSelect"
                class="file-input"
              />
              <div v-if="ownerSignaturePreview" class="preview-image">
                <img :src="ownerSignaturePreview" alt="Owner Signature" />
              </div>
            </div>
            <div class="upload-item">
              <label class="upload-label">Owner Stamp</label>
              <input
                type="file"
                ref="ownerStampInput"
                accept="image/*"
                @change="handleOwnerStampSelect"
                class="file-input"
              />
              <div v-if="ownerStampPreview" class="preview-image">
                <img :src="ownerStampPreview" alt="Owner Stamp" />
              </div>
            </div>
          </div>
        </div>

        <!-- Tenant Signature Section -->
        <div class="signature-section mb-6">
          <h3 class="mb-3">Tenant Signature</h3>
          <div class="upload-item">
            <label class="upload-label">Tenant Signature</label>
            <input
              type="file"
              ref="tenantSignatureInput"
              accept="image/*"
              @change="handleTenantSignatureSelect"
              class="file-input"
            />
            <div v-if="tenantSignaturePreview" class="preview-image">
              <img :src="tenantSignaturePreview" alt="Tenant Signature" />
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <VaButton preset="secondary" @click="closeSignatureModal"
            >Cancel</VaButton
          >
          <VaButton @click="uploadSignatures" :loading="uploadingSignatures">
            Upload & Generate Contract
          </VaButton>
        </div>
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
  useTenanciesStore,
  useTenantsStore,
  useUnitsStore,
  usePropertiesStore,
} from "@/stores";
import { tenanciesAPI, ownersAPI, tenantsAPI } from "@/services/api";
import { buildPayload } from "@/utils/apiPayload";
import { validators } from "@/utils/validators";

const router = useRouter();
const { success, error } = useAppToast();
const tenanciesStore = useTenanciesStore();
const tenantsStore = useTenantsStore();
const unitsStore = useUnitsStore();
const propertiesStore = usePropertiesStore();

const saving = ref(false);
const showMoveInModal = ref(false);
const moveOutModalOpen = ref(false);
const showSignatureModal = ref(false);
const showSmsModal = ref(false);
const editingTenancyId = ref<number | null>(null);
const generatingContractId = ref<number | null>(null);
const sendingReminderId = ref<number | null>(null);
const uploadingSignatures = ref(false);
const currentTenancyForContract = ref<Record<string, unknown> | null>(null);
const currentTenancyForSms = ref<Record<string, unknown> | null>(null);
const smsRecipients = ref({
  sendToTenant: true,
  sendToOwner: true,
});
const searchQuery = ref("");
const filterProperty = ref("");
const filterUnit = ref("");
const filterStatus = ref("");
const moveInForm = ref<{ validate: () => Promise<boolean> } | null>(null);
const moveOutForm = ref<{ validate: () => Promise<boolean> } | null>(null);
const moveOutDate = ref("");

// Signature upload refs
const ownerSignatureInput = ref<HTMLInputElement | null>(null);
const ownerStampInput = ref<HTMLInputElement | null>(null);
const tenantSignatureInput = ref<HTMLInputElement | null>(null);
const ownerSignatureFile = ref<File | null>(null);
const ownerStampFile = ref<File | null>(null);
const tenantSignatureFile = ref<File | null>(null);
const ownerSignaturePreview = ref<string | null>(null);
const ownerStampPreview = ref<string | null>(null);
const tenantSignaturePreview = ref<string | null>(null);

const statusOptions = ["active", "completed", "terminated"];

const moveInData = ref({
  tenant: null,
  unit: null,
  move_in_date: "",
  rent_amount: "",
  rent_period: "month",
  currency: "TZS",
  deposit_amount: "",
  stay_duration_value: "",
  stay_duration_unit: "month",
  status: "active",
  deposit_paid: false,
  deposit_payment_method: "",
  duration_months: 6, // Default 6 months
});

const columns = [
  { key: "tenant_name", label: "Tenant", sortable: true },
  { key: "unit_number", label: "Unit", sortable: true },
  { key: "property_name", label: "Property", sortable: true },
  { key: "move_in_date", label: "Move-In Date", sortable: true },
  { key: "rent_amount", label: "Rent", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "actions", label: "Actions", width: 450 },
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

  // Validation: Confirm payment if deposit_paid is checked
  if (!moveInData.value.deposit_paid) {
    const confirmProceed = confirm(
      "Payment not confirmed. Receipt SMS will not be sent to tenant. Continue?",
    );
    if (!confirmProceed) return;
  }

  // Validation: Payment method required if deposit is paid
  if (
    moveInData.value.deposit_paid &&
    !moveInData.value.deposit_payment_method
  ) {
    error("Please select a payment method");
    return;
  }

  saving.value = true;
  try {
    // Calculate total deposit amount (rent × duration)
    const durationValue =
      parseInt(moveInData.value.stay_duration_value) ||
      moveInData.value.duration_months ||
      6;
    const rentAmount = parseFloat(moveInData.value.rent_amount);
    const calculatedDeposit = rentAmount * durationValue;

    // Build robust payload according to new billing system
    const tenancyPayload: any = {
      tenant: moveInData.value.tenant,
      unit: moveInData.value.unit,
      move_in_date: moveInData.value.move_in_date,
      contract_start: moveInData.value.move_in_date, // Required field
      rent_amount: rentAmount,
      rent_period: moveInData.value.rent_period || "month",
      deposit_amount: moveInData.value.deposit_amount || calculatedDeposit,
      deposit_paid: moveInData.value.deposit_paid,
      currency: moveInData.value.currency || "TZS",
      status: moveInData.value.status || "active",
    };

    // Add payment method only if deposit is paid
    if (
      moveInData.value.deposit_paid &&
      moveInData.value.deposit_payment_method
    ) {
      tenancyPayload.deposit_payment_method =
        moveInData.value.deposit_payment_method;
    }

    // Add duration - prefer duration_months for clarity
    if (moveInData.value.duration_months) {
      tenancyPayload.duration_months = Number(moveInData.value.duration_months);
    } else if (moveInData.value.stay_duration_value) {
      tenancyPayload.stay_duration_value = parseInt(
        String(moveInData.value.stay_duration_value),
      );
      tenancyPayload.stay_duration_unit =
        moveInData.value.stay_duration_unit || "month";
    }

    console.log("Creating tenancy with payload:", tenancyPayload);

    await tenanciesStore.createItem(tenancyPayload);
    closeMoveInModal();

    // Show appropriate success message
    if (moveInData.value.deposit_paid) {
      success("Tenant moved in successfully! Receipt SMS sent to tenant.");
    } else {
      success(
        "Tenant moved in successfully. No receipt SMS sent (payment not confirmed).",
      );
    }

    await unitsStore.fetchList({ status: "vacant" });
  } catch (err: any) {
    console.error("Error creating tenancy:", err);

    // Enhanced error handling
    if (err.response?.data) {
      console.error("API Error details:", err.response.data);

      // Handle specific error cases
      if (err.response.data.unit) {
        error(`Unit Error: ${err.response.data.unit}`);
      } else if (err.response.data.detail) {
        error(`Error: ${err.response.data.detail}`);
      } else if (err.response.data.non_field_errors) {
        error(`Error: ${err.response.data.non_field_errors.join(", ")}`);
      } else {
        const errorMsg =
          typeof err.response.data === "object"
            ? JSON.stringify(err.response.data)
            : err.response.data;
        error(`Failed to move in tenant: ${errorMsg}`);
      }
    } else if (err.message) {
      error(`Network error: ${err.message}`);
    } else {
      error("Failed to move in tenant. Please try again.");
    }
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
    rent_period: "month",
    currency: "TZS",
    deposit_amount: "",
    stay_duration_value: "",
    stay_duration_unit: "month",
    status: "active",
    deposit_paid: false,
    deposit_payment_method: "",
    duration_months: 6,
  };
};

const closeMoveOutModal = () => {
  moveOutModalOpen.value = false;
  editingTenancyId.value = null;
  moveOutDate.value = "";
};

const viewTenancyDetails = async (tenancy: Record<string, unknown>) => {
  try {
    console.log("Viewing tenancy details for:", tenancy);

    // Fetch full tenancy details to get property_id
    const response = await tenanciesAPI.get(tenancy.id as number);
    const fullTenancy = response.data;

    console.log("Full tenancy data:", fullTenancy);

    // Try multiple possible property field names
    const propertyId =
      fullTenancy.property_id ||
      fullTenancy.property ||
      fullTenancy.unit?.property ||
      fullTenancy.unit?.property_id;

    console.log("Extracted property ID:", propertyId);

    if (propertyId) {
      const targetRoute = {
        name: "property-details",
        params: { id: String(propertyId) },
      };
      console.log("Navigating to:", targetRoute);

      await router.push(targetRoute);
    } else {
      console.error("No property ID found in tenancy data:", fullTenancy);
      error("Property information not available for this tenancy");
    }
  } catch (err: any) {
    console.error("Error fetching tenancy details:", err);
    if (err.response?.data) {
      console.error("API Error details:", err.response.data);
    }
    error("Failed to load tenancy details");
  }
};

// Signature upload handlers
const handleOwnerSignatureSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  ownerSignatureFile.value = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    ownerSignaturePreview.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};

const handleOwnerStampSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  ownerStampFile.value = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    ownerStampPreview.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};

const handleTenantSignatureSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  tenantSignatureFile.value = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    tenantSignaturePreview.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};

const uploadSignatures = async () => {
  if (!currentTenancyForContract.value) return;

  uploadingSignatures.value = true;
  try {
    const tenancy = currentTenancyForContract.value;

    // Fetch full tenancy details to get owner information
    const response = await tenanciesAPI.get(tenancy.id as number);
    const fullTenancy = response.data;

    // Get the property to find owner_id
    const propertyId = fullTenancy.property_id || fullTenancy.property;
    let ownerId: number | null = null;

    if (propertyId) {
      const propertyResponse = propertiesStore.items.find(
        (p: any) => p.id === propertyId,
      );
      ownerId = (propertyResponse?.owner as number | undefined) || null;
    }

    // Upload owner signature and stamp if provided and owner found
    if (
      (ownerSignatureFile.value || ownerStampFile.value) &&
      ownerId !== null
    ) {
      const ownerFormData = new FormData();
      if (ownerSignatureFile.value) {
        ownerFormData.append("signature", ownerSignatureFile.value);
      }
      if (ownerStampFile.value) {
        ownerFormData.append("stamp", ownerStampFile.value);
      }
      await ownersAPI.uploadSignature(ownerId, ownerFormData);
    }

    // Upload tenant signature if provided
    if (tenantSignatureFile.value) {
      const tenantFormData = new FormData();
      tenantFormData.append("signature", tenantSignatureFile.value);
      const tenantId = fullTenancy.tenant || tenancy.tenant;
      await tenantsAPI.uploadSignature(tenantId, tenantFormData);
    }

    success("Signatures uploaded successfully");
    closeSignatureModal();

    // Now generate the contract
    await proceedWithContractGeneration(tenancy);
  } catch (err: any) {
    console.error("Error uploading signatures:", err);
    error("Failed to upload signatures");
  } finally {
    uploadingSignatures.value = false;
  }
};

const closeSignatureModal = () => {
  showSignatureModal.value = false;
  currentTenancyForContract.value = null;
  ownerSignatureFile.value = null;
  ownerStampFile.value = null;
  tenantSignatureFile.value = null;
  ownerSignaturePreview.value = null;
  ownerStampPreview.value = null;
  tenantSignaturePreview.value = null;
  if (ownerSignatureInput.value) ownerSignatureInput.value.value = "";
  if (ownerStampInput.value) ownerStampInput.value.value = "";
  if (tenantSignatureInput.value) tenantSignatureInput.value.value = "";
};

const generateContract = async (tenancy: Record<string, unknown>) => {
  // Store tenancy for later use and show signature upload modal
  currentTenancyForContract.value = tenancy;
  showSignatureModal.value = true;
};

const proceedWithContractGeneration = async (
  tenancy: Record<string, unknown>,
) => {
  const tenancyId = tenancy.id as number;
  generatingContractId.value = tenancyId;

  try {
    const response = await tenanciesAPI.generateContract(tenancyId);
    const contractData = response.data;

    // Try to download PDF if available
    if (contractData.contract_pdf_base64) {
      const base64Data = contractData.contract_pdf_base64;
      const binaryString = window.atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);

      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `tenancy_contract_${tenancyId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      success("Contract PDF downloaded successfully");
    } else if (contractData.contract_text) {
      // Fallback: Download contract as text file
      const blob = new Blob([contractData.contract_text], {
        type: "text/plain",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `tenancy_contract_${tenancyId}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      success("Contract downloaded as text (PDF generation unavailable)");
    } else {
      error("Contract not available");
    }
  } catch (err: any) {
    console.error("Error generating contract:", err);
    error("Failed to generate contract");
  } finally {
    generatingContractId.value = null;
  }
};

const sendReminder = (tenancy: Record<string, unknown>) => {
  // Store tenancy and show SMS modal
  currentTenancyForSms.value = tenancy;
  smsRecipients.value = {
    sendToTenant: true,
    sendToOwner: true,
  };
  showSmsModal.value = true;
};

const closeSmsModal = () => {
  showSmsModal.value = false;
  currentTenancyForSms.value = null;
  smsRecipients.value = {
    sendToTenant: true,
    sendToOwner: true,
  };
};

const confirmSendReminder = async () => {
  if (!currentTenancyForSms.value) return;

  const tenancyId = currentTenancyForSms.value.id as number;
  sendingReminderId.value = tenancyId;

  try {
    const response = await tenanciesAPI.sendReminder(tenancyId);
    const data = response.data;

    if (data.success) {
      const recipients = [];
      if (smsRecipients.value.sendToTenant) recipients.push("tenant");
      if (smsRecipients.value.sendToOwner) recipients.push("owner");

      success(
        `Rent reminder SMS sent successfully to ${recipients.join(" and ")}!`,
      );

      // Close modal and refresh tenancies
      closeSmsModal();
      await loadTenancies();
    } else {
      error(data.message || "Failed to send SMS reminder");
    }
  } catch (err: any) {
    console.error("Error sending reminder:", err);
    if (err.response?.data?.message) {
      error(err.response.data.message);
    } else {
      error("Failed to send SMS reminder. Please try again.");
    }
  } finally {
    sendingReminderId.value = null;
  }
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

.signature-upload-container {
  padding: 1rem 0;
}

.signature-section {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  background: #f7fafc;
}

.signature-section h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.upload-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.upload-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.upload-label {
  font-weight: 500;
  color: #4a5568;
  font-size: 0.9rem;
}

.file-input {
  padding: 0.5rem;
  border: 2px dashed #cbd5e0;
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.file-input:hover {
  border-color: #4299e1;
}

.preview-image {
  margin-top: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 0.5rem;
  background: white;
}

.preview-image img {
  max-width: 100%;
  max-height: 150px;
  object-fit: contain;
}

.mb-6 {
  margin-bottom: 1.5rem;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.sms-modal-container {
  padding: 1rem 0;
}

.recipient-selection {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  background: #f7fafc;
}

.recipient-info {
  font-size: 0.875rem;
  color: #718096;
  margin: 0.25rem 0 0 0;
}
</style>

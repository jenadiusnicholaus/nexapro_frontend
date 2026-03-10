<template>
  <div>
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">Notifications</h1>
        <VaChip
          v-if="totalNotifications > 0"
          color="primary"
          size="large"
          class="notification-count-chip"
        >
          {{ totalNotifications }} Total Messages
        </VaChip>
        <VaChip
          v-if="sentCount > 0"
          color="success"
          size="large"
          class="notification-count-chip"
        >
          {{ sentCount }} Sent SMS
        </VaChip>
      </div>
      <VaButton @click="showModal = true">Create Notification</VaButton>
    </div>

    <VaCard>
      <VaCardContent>
        <div class="filters mb-4">
          <VaInput
            v-model="searchQuery"
            placeholder="Search notifications..."
            class="mr-2"
            style="max-width: 300px"
          >
            <template #prependInner>
              <VaIcon name="search" />
            </template>
          </VaInput>
          <VaSelect
            v-model="filterType"
            :options="notificationTypes"
            placeholder="Filter by type"
            style="max-width: 200px"
          />
          <VaSelect
            v-model="filterStatus"
            :options="statusOptions"
            placeholder="Filter by status"
            style="max-width: 200px"
          />
        </div>

        <AppDataTable
          :items="notificationsStore.items"
          :columns="columns"
          :loading="notificationsStore.loading"
        >
          <template #cell(status)="{ rowData }">
            <VaChip :color="getStatusColor(rowData.status)">
              {{ rowData.status }}
            </VaChip>
          </template>
          <template #cell(actions)="{ rowData }">
            <VaButton
              icon="visibility"
              size="small"
              preset="secondary"
              @click="viewNotificationDetails(rowData)"
            >
              View Details
            </VaButton>
          </template>
        </AppDataTable>
      </VaCardContent>
    </VaCard>

    <!-- View Details Modal Professional -->
    <VaModal
      v-model="showDetailsModal"
      hide-default-actions
      size="medium"
      class="premium-modal"
    >
      <template #header>
        <div class="modal-premium-header">
          <VaIcon name="notifications_active" color="primary" size="small" class="mr-2" />
          <div class="header-text">
            <h3 class="modal-title">Notification Details</h3>
            <p class="modal-subtitle">Full message and transmission logs</p>
          </div>
        </div>
      </template>

      <div v-if="selectedNotification" class="notification-premium-details">
        <div class="details-grid">
          <div class="detail-field">
            <span class="field-label">Recipient Tenant</span>
            <div class="field-value-wrap">
              <VaIcon name="person" size="small" color="secondary" class="field-icon" />
              <p class="field-value">{{ selectedNotification.tenant_name || "N/A" }}</p>
            </div>
          </div>

          <div class="detail-field">
            <span class="field-label">Notification Type</span>
            <div class="field-value-wrap">
              <VaIcon name="category" size="small" color="secondary" class="field-icon" />
              <p class="field-value capitalize">{{ String(selectedNotification.notification_type).replace('_', ' ') }}</p>
            </div>
          </div>

          <div class="detail-field">
            <span class="field-label">Channel</span>
            <div class="field-value-wrap">
              <VaIcon name="phonelink" size="small" color="secondary" class="field-icon" />
              <p class="field-value">{{ selectedNotification.channel }}</p>
            </div>
          </div>

          <div class="detail-field">
            <span class="field-label">Status</span>
            <div class="field-value-wrap">
              <VaChip :color="getStatusColor(selectedNotification.status)" size="small" class="status-chip shadow-sm">
                {{ selectedNotification.status }}
              </VaChip>
            </div>
          </div>
        </div>

        <div class="detail-field full-width mt-6">
          <span class="field-label">Subject</span>
          <p class="subject-text">{{ selectedNotification.subject }}</p>
        </div>

        <div class="detail-field full-width mt-4">
          <span class="field-label">Message Content</span>
          <div class="message-box-premium">
            {{ selectedNotification.message }}
          </div>
        </div>

        <div class="detail-field full-width mt-6">
          <div class="timestamp-wrap">
            <VaIcon name="schedule" size="small" color="secondary" class="mr-2" />
            <span class="timestamp-label">Transmission Time:</span>
            <span class="timestamp-value">
               {{ selectedNotification.sent_at || "Awaiting dispatch..." }}
            </span>
          </div>
        </div>
      </div>

      <div class="modal-footer-premium">
        <VaButton preset="secondary" @click="closeDetailsModal" class="premium-btn">Dismiss</VaButton>
      </div>
    </VaModal>

    <!-- Create Notification Modal Premium -->
    <VaModal
      v-model="showModal"
      hide-default-actions
      size="medium"
      class="premium-modal"
    >
      <template #header>
        <div class="modal-premium-header">
          <VaIcon name="add_circle" color="primary" size="small" class="mr-2" />
          <div class="header-text">
            <h3 class="modal-title">Create Notification</h3>
            <p class="modal-subtitle">Dispatch a new message to a tenant</p>
          </div>
        </div>
      </template>

      <VaForm ref="notificationForm" @submit.prevent="saveNotification" class="premium-form mt-4">
        <div class="details-grid">
          <VaSelect
            v-model="formData.tenancy"
            label="Target Tenancy"
            :options="tenancyOptions"
            :rules="[validators.required]"
            class="mb-4"
            background="rgba(255,255,255,0.03)"
          />
          <VaSelect
            v-model="formData.notification_type"
            label="Type"
            :options="notificationTypes"
            :rules="[validators.required]"
            class="mb-4"
            background="rgba(255,255,255,0.03)"
          />
          <VaSelect
            v-model="formData.channel"
            label="Channel"
            :options="channels"
            :rules="[validators.required]"
            class="mb-4"
            background="rgba(255,255,255,0.03)"
          />
          <VaInput
            v-model="formData.subject"
            label="Subject"
            :rules="[validators.required]"
            class="mb-4"
            background="rgba(255,255,255,0.03)"
          />
        </div>
        
        <VaTextarea
          v-model="formData.message"
          label="Message Body"
          :rules="[validators.required]"
          class="mb-4 full-width"
          background="rgba(255,255,255,0.03)"
          :min-rows="4"
        />

        <div class="modal-footer-premium">
          <VaButton preset="secondary" @click="closeModal" class="premium-btn">Cancel</VaButton>
          <VaButton type="submit" :loading="saving" class="premium-btn primary-gradient">Dispatch Notification</VaButton>
        </div>
      </VaForm>
    </VaModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import AppDataTable from "@/components/AppDataTable.vue";
import { useAppToast } from "@/composables/useAppToast";
import { useNotificationsStore, useTenanciesStore } from "@/stores";
import { buildPayload } from "@/utils/apiPayload";
import { validators } from "@/utils/validators";

const { success, error } = useAppToast();
const notificationsStore = useNotificationsStore();
const tenanciesStore = useTenanciesStore();

const saving = ref(false);
const showModal = ref(false);
const showDetailsModal = ref(false);
const selectedNotification = ref<Record<string, unknown> | null>(null);
const searchQuery = ref("");
const filterType = ref("");
const filterStatus = ref("");
const notificationForm = ref<{ validate: () => Promise<boolean> } | null>(null);

const notificationTypes = [
  "upcoming_reminder",
  "due_today",
  "overdue",
  "payment_received",
  "general",
];
const channels = ["sms", "whatsapp", "email", "in_app"];
const statusOptions = ["pending", "sent", "failed"];

const formData = ref({
  tenancy: null,
  notification_type: "general",
  channel: "in_app",
  subject: "",
  message: "",
  status: "pending",
});

const columns = [
  { key: "tenant_name", label: "Tenant", sortable: true },
  { key: "notification_type", label: "Type", sortable: true },
  { key: "channel", label: "Channel", sortable: true },
  { key: "subject", label: "Subject" },
  { key: "status", label: "Status", sortable: true },
  { key: "sent_at", label: "Sent At", sortable: true },
  { key: "actions", label: "Actions" },
];

const tenancyOptions = computed(() =>
  (tenanciesStore.items as Record<string, unknown>[]).map((t) => ({
    value: t.id,
    text: `${t.tenant_name} - ${t.unit_number}`,
  })),
);

const totalNotifications = computed(() => notificationsStore.items.length);

const sentCount = computed(
  () =>
    notificationsStore.items.filter(
      (n: any) => n.status === "sent" && n.channel === "sms",
    ).length,
);

const getStatusColor = (status: unknown) => {
  const colors: Record<string, string> = {
    pending: "warning",
    sent: "success",
    failed: "danger",
  };
  return colors[String(status)] || "secondary";
};

const loadNotifications = () => {
  const params: Record<string, unknown> = { ordering: "-created_at" };
  if (searchQuery.value) params.search = searchQuery.value;
  if (filterType.value) params.notification_type = filterType.value;
  if (filterStatus.value) params.status = filterStatus.value;
  return notificationsStore.fetchList(params);
};

const saveNotification = async () => {
  const isValid = await notificationForm.value?.validate();
  if (!isValid) return;

  const payload = buildPayload(formData.value, ["tenancy"]);
  saving.value = true;
  try {
    await notificationsStore.createItem(payload);
    closeModal();
    success("Notification created");
  } catch (err) {
    console.error("Error saving notification:", err);
    error("Failed to create notification");
  } finally {
    saving.value = false;
  }
};

const viewNotificationDetails = (notification: Record<string, unknown>) => {
  selectedNotification.value = notification;
  showDetailsModal.value = true;
};

const closeDetailsModal = () => {
  showDetailsModal.value = false;
  selectedNotification.value = null;
};

const closeModal = () => {
  showModal.value = false;
  formData.value = {
    tenancy: null,
    notification_type: "general",
    channel: "in_app",
    subject: "",
    message: "",
    status: "pending",
  };
};

onMounted(() => {
  loadNotifications().catch((err) =>
    console.error("Error loading notifications:", err),
  );
  tenanciesStore.fetchList().catch(() => {});
});

let filterDebounce: ReturnType<typeof setTimeout> | null = null;
watch([searchQuery, filterType, filterStatus], () => {
  if (filterDebounce) clearTimeout(filterDebounce);
  filterDebounce = setTimeout(() => {
    loadNotifications().catch((err) =>
      console.error("Error loading notifications:", err),
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

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.page-title {
  margin: 0;
  color: var(--va-primary);
}

.notification-count-chip {
  font-weight: 600;
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

.notification-premium-details {
  padding: 1rem 0;
}

.modal-premium-header {
  display: flex;
  align-items: center;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--va-background-border);
  width: 100%;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--va-text-primary);
  margin: 0;
  letter-spacing: -0.02em;
}

.modal-subtitle {
  font-size: 0.8rem;
  color: var(--va-text-secondary);
  margin: 0;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.detail-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  font-size: 0.7rem;
  font-weight: 800;
  color: #10b981; /* Emerald accent */
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.field-value-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.field-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--va-text-primary);
  margin: 0;
}

.subject-text {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--va-text-primary);
  margin: 0.25rem 0 0;
}

.message-box-premium {
  margin-top: 0.5rem;
  background: rgba(var(--va-primary-rgb), 0.03);
  backdrop-filter: blur(8px);
  border: 1px solid var(--va-background-border);
  border-radius: 16px;
  padding: 1.5rem;
  font-size: 1rem;
  line-height: 1.6;
  color: var(--va-text-primary);
  white-space: pre-wrap;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);
}

.timestamp-wrap {
  display: flex;
  align-items: center;
  background: var(--va-background-secondary);
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  width: fit-content;
}

.timestamp-label {
  font-size: 0.8rem;
  color: var(--va-text-secondary);
  margin-right: 0.5rem;
}

.timestamp-value {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--va-text-primary);
}

.modal-footer-premium {
  display: flex;
  justify-content: flex-end;
  margin-top: 2.5rem;
  gap: 1rem;
}

.premium-btn {
  border-radius: 12px !important;
  font-weight: 700 !important;
  padding: 0.6rem 2rem !important;
}

.primary-gradient {
  background: linear-gradient(135deg, #10b981, #3b82f6) !important;
  color: white !important;
}

.premium-form :deep(.va-input-wrapper) {
  border-radius: 12px !important;
  border: 1px solid var(--va-background-border) !important;
}

.full-width {
  grid-column: span 2;
}

.status-chip {
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
}

.mr-2 { margin-right: 0.5rem; }
.mt-4 { margin-top: 1rem; }
.mt-6 { margin-top: 1.5rem; }
.capitalize { text-transform: capitalize; }
.shadow-sm { box-shadow: 0 2px 4px rgba(0,0,0,0.1); }

@media (max-width: 640px) {
  .details-grid {
    grid-template-columns: 1fr;
  }
  .full-width {
    grid-column: span 1;
  }
}
</style>

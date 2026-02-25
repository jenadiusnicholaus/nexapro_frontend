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

    <!-- View Details Modal -->
    <VaModal
      v-model="showDetailsModal"
      title="Notification Details"
      hide-default-actions
      size="medium"
    >
      <div v-if="selectedNotification" class="notification-details">
        <div class="detail-row">
          <label class="detail-label">Tenant:</label>
          <p class="detail-value">
            {{ selectedNotification.tenant_name || "N/A" }}
          </p>
        </div>

        <div class="detail-row">
          <label class="detail-label">Type:</label>
          <p class="detail-value">
            {{ selectedNotification.notification_type }}
          </p>
        </div>

        <div class="detail-row">
          <label class="detail-label">Channel:</label>
          <p class="detail-value">{{ selectedNotification.channel }}</p>
        </div>

        <div class="detail-row">
          <label class="detail-label">Subject:</label>
          <p class="detail-value">{{ selectedNotification.subject }}</p>
        </div>

        <div class="detail-row">
          <label class="detail-label">Message:</label>
          <p class="detail-value message-content">
            {{ selectedNotification.message }}
          </p>
        </div>

        <div class="detail-row">
          <label class="detail-label">Status:</label>
          <VaChip :color="getStatusColor(selectedNotification.status)">
            {{ selectedNotification.status }}
          </VaChip>
        </div>

        <div class="detail-row">
          <label class="detail-label">Sent At:</label>
          <p class="detail-value">
            {{ selectedNotification.sent_at || "Not sent yet" }}
          </p>
        </div>
      </div>

      <div class="modal-actions">
        <VaButton preset="secondary" @click="closeDetailsModal">Close</VaButton>
      </div>
    </VaModal>

    <!-- Create Notification Modal -->
    <VaModal
      v-model="showModal"
      title="Create Notification"
      hide-default-actions
      size="medium"
    >
      <VaForm ref="notificationForm" @submit.prevent="saveNotification">
        <VaSelect
          v-model="formData.tenancy"
          label="Tenancy"
          :options="tenancyOptions"
          :rules="[validators.required]"
          class="mb-4"
        />
        <VaSelect
          v-model="formData.notification_type"
          label="Notification Type"
          :options="notificationTypes"
          :rules="[validators.required]"
          class="mb-4"
        />
        <VaSelect
          v-model="formData.channel"
          label="Channel"
          :options="channels"
          :rules="[validators.required]"
          class="mb-4"
        />
        <VaInput
          v-model="formData.subject"
          label="Subject"
          :rules="[validators.required]"
          class="mb-4"
        />
        <VaTextarea
          v-model="formData.message"
          label="Message"
          :rules="[validators.required]"
          class="mb-4"
        />
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

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.notification-details {
  padding: 1rem 0;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.detail-row:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.detail-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-value {
  font-size: 1rem;
  color: #1a202c;
  margin: 0;
  line-height: 1.5;
}

.message-content {
  white-space: pre-wrap;
  background: #f7fafc;
  padding: 1rem;
  border-radius: 8px;
  border-left: 3px solid #7c3aed;
}
</style>

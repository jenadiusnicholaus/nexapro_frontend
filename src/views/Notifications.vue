<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">Notifications</h1>
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

        <VaDataTable
          :items="notifications"
          :columns="columns"
          :loading="loading"
        >
          <template #cell(status)="{ rowData }">
            <VaChip :color="getStatusColor(rowData.status)">
              {{ rowData.status }}
            </VaChip>
          </template>
        </VaDataTable>
      </VaCardContent>
    </VaCard>

    <!-- Create Notification Modal -->
    <VaModal v-model="showModal" title="Create Notification">
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

<script setup>
import { ref, onMounted, computed } from 'vue'
import { notificationsAPI, tenanciesAPI } from '@/services/api'
import { validators } from '@/utils/validators'

const loading = ref(false)
const saving = ref(false)
const notifications = ref([])
const tenancies = ref([])
const showModal = ref(false)
const searchQuery = ref('')
const filterType = ref('')
const filterStatus = ref('')
const notificationForm = ref(null)

const notificationTypes = [
  'upcoming_reminder',
  'due_today',
  'overdue',
  'payment_received',
  'general',
]
const channels = ['sms', 'whatsapp', 'email', 'in_app']
const statusOptions = ['pending', 'sent', 'failed']

const formData = ref({
  tenancy: null,
  notification_type: 'general',
  channel: 'in_app',
  subject: '',
  message: '',
  status: 'pending',
})

const columns = [
  { key: 'tenant_name', label: 'Tenant', sortable: true },
  { key: 'notification_type', label: 'Type', sortable: true },
  { key: 'channel', label: 'Channel', sortable: true },
  { key: 'subject', label: 'Subject' },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'sent_at', label: 'Sent At', sortable: true },
]

const tenancyOptions = computed(() =>
  tenancies.value.map((t) => ({
    value: t.id,
    text: `${t.tenant_name} - ${t.unit_number}`,
  }))
)

const getStatusColor = (status) => {
  const colors = {
    pending: 'warning',
    sent: 'success',
    failed: 'danger',
  }
  return colors[status] || 'secondary'
}

const loadNotifications = async () => {
  loading.value = true
  try {
    const params = { ordering: '-created_at' }
    if (searchQuery.value) params.search = searchQuery.value
    if (filterType.value) params.notification_type = filterType.value
    if (filterStatus.value) params.status = filterStatus.value

    const response = await notificationsAPI.list(params)
    notifications.value = response.data.results || response.data
  } catch (error) {
    console.error('Error loading notifications:', error)
  } finally {
    loading.value = false
  }
}

const loadTenancies = async () => {
  try {
    const response = await tenanciesAPI.list()
    tenancies.value = response.data.results || response.data
  } catch (error) {
    console.error('Error loading tenancies:', error)
  }
}

const saveNotification = async () => {
  const isValid = await notificationForm.value?.validate()
  if (!isValid) return

  saving.value = true
  try {
    await notificationsAPI.create(formData.value)
    closeModal()
    loadNotifications()
  } catch (error) {
    console.error('Error saving notification:', error)
  } finally {
    saving.value = false
  }
}

const closeModal = () => {
  showModal.value = false
  formData.value = {
    tenancy: null,
    notification_type: 'general',
    channel: 'in_app',
    subject: '',
    message: '',
    status: 'pending',
  }
}

onMounted(() => {
  loadNotifications()
  loadTenancies()
})
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

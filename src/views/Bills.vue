<template>
  <div class="bills-page">
    <div class="page-header-premium">
      <div class="header-content">
        <h1 class="premium-title">Bills</h1>
        <p class="premium-subtitle">Manage invoicing and tenant statements</p>
      </div>
      <div class="header-actions">
        <VaButton
          preset="secondary"
          color="#ef4444"
          class="mr-4 glass-btn"
          icon="history"
          @click="markOverdue"
        >
          Mark Overdue
        </VaButton>
        <VaButton
          size="large"
          class="premium-add-btn"
          icon="bolt"
          @click="generateBills"
        >
          Generate Bills
        </VaButton>
      </div>
    </div>

    <div class="stats-mini-grid mb-6">
      <div class="stat-card-glass">
        <div class="stat-icon-wrap emerald">
          <VaIcon name="receipt" size="24px" />
        </div>
        <div class="stat-info">
          <span class="stat-label">Total Bills</span>
          <span class="stat-value">{{ billsStore.items.length }}</span>
        </div>
      </div>
    </div>

    <VaCard class="premium-card">
      <VaCardContent>
        <div class="filters-premium mb-6">
          <div class="search-wrap">
            <VaInput
              v-model="searchQuery"
              placeholder="Search bills..."
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
              v-model="filterStatus"
              :options="statusOptions"
              placeholder="All Status"
              class="premium-select"
              background="rgba(255,255,255,0.03)"
            />
          </div>
          <div class="input-wrap">
            <VaInput
              v-model="filterPeriod"
              placeholder="Period (YYYY-MM)"
              class="premium-input"
              background="rgba(255,255,255,0.03)"
            />
          </div>
        </div>

        <AppDataTable
          :items="billsStore.items"
          :columns="columns"
          :loading="billsStore.loading"
        >
          <template #cell(tenant_name)="{ rowData }">
            <div class="tenant-cell">
              <span class="tenant-name">{{ rowData.tenant_name }}</span>
              <span class="unit-info">{{ rowData.property_name }} - {{ rowData.unit_number }}</span>
            </div>
          </template>

          <template #cell(status)="{ rowData }">
            <div 
              class="status-badge-premium" 
              :class="rowData.status"
            >
              <span class="dot"></span>
              {{ rowData.status }}
            </div>
          </template>

          <template #cell(amount)="{ rowData }">
            <span class="amount-cell">
              {{ rowData.currency || "TZS" }}
              {{
                Number(rowData.amount || 0).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              }}
            </span>
          </template>

          <template #cell(balance)="{ rowData }">
            <span class="balance-cell" :class="{ 'has-balance': Number(rowData.balance) > 0 }">
              {{ rowData.currency || "TZS" }}
              {{
                Number(rowData.balance || 0).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              }}
            </span>
          </template>
        </AppDataTable>
      </VaCardContent>
    </VaCard>

    <!-- Generate Bills Modal Premium -->
    <VaModal
      v-model="showGenerateModal"
      title="Generate Monthly Bills"
      hide-default-actions
      size="medium"
      class="premium-modal"
    >
      <div class="modal-inner">
        <VaForm ref="generateForm" @submit.prevent="generateBills" class="premium-form">
          <VaInput
            v-model="generateData.billing_period"
            label="Billing Period (YYYY-MM)"
            placeholder="2026-03"
            :rules="[validators.required]"
            class="mb-4"
            background="rgba(255,255,255,0.03)"
          />
          <VaInput
            v-model="generateData.due_day"
            label="Due Day (1-28)"
            type="number"
            min="1"
            max="28"
            :rules="[validators.required]"
            class="mb-4"
            background="rgba(255,255,255,0.03)"
          />
          <div class="modal-footer">
            <VaButton preset="secondary" @click="showGenerateModal = false" class="cancel-btn">
              Cancel
            </VaButton>
            <VaButton type="submit" :loading="generating" class="save-btn-premium">Generate</VaButton>
          </div>
        </VaForm>
      </div>
    </VaModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import AppDataTable from "@/components/AppDataTable.vue";
import { useAppToast } from "@/composables/useAppToast";
import { useBillsStore } from "@/stores";
import { validators } from "@/utils/validators";

const { success, error } = useAppToast();
const billsStore = useBillsStore();

const generating = ref(false);
const showGenerateModal = ref(false);
const searchQuery = ref("");
const filterStatus = ref("");
const filterPeriod = ref("");
const generateForm = ref<{ validate: () => Promise<boolean> } | null>(null);

const statusOptions = ["unpaid", "paid", "partially_paid", "overdue"];

const generateData = ref({
  billing_period: "",
  due_day: 5,
});

const columns = [
  { key: "tenant_name", label: "Tenant & Unit", sortable: true },
  { key: "billing_period", label: "Period", sortable: true, width: 100 },
  { key: "amount", label: "Amount", sortable: true },
  { key: "due_date", label: "Due Date", sortable: true },
  { key: "balance", label: "Balance", sortable: true },
  { key: "status", label: "Status", sortable: true, width: 140 },
];

const loadBills = () => {
  const params: Record<string, unknown> = {};
  if (searchQuery.value) params.search = searchQuery.value;
  if (filterStatus.value) params.status = filterStatus.value;
  if (filterPeriod.value) params.billing_period = filterPeriod.value;
  return billsStore.fetchList(params);
};

const generateBills = async () => {
  const isValid = await generateForm.value?.validate();
  if (!isValid) return;

  generating.value = true;
  try {
    const response = await billsStore.generate(
      generateData.value.billing_period,
      generateData.value.due_day,
    );
    const data = response.data as { created: number; skipped: number };
    success(`Generated ${data.created} bills, skipped ${data.skipped}`);
    showGenerateModal.value = false;
    generateData.value = { billing_period: "", due_day: 5 };
  } catch (err) {
    console.error("Error generating bills:", err);
    error("Failed to generate bills");
  } finally {
    generating.value = false;
  }
};

const markOverdue = async () => {
  if (!confirm("Mark all unpaid bills past due date as overdue?")) return;

  try {
    await billsStore.markOverdue();
    success("Bills marked as overdue");
  } catch (err) {
    console.error("Error marking overdue:", err);
    error("Failed to mark bills as overdue");
  }
};

onMounted(() => {
  loadBills().catch((err) => console.error("Error loading bills:", err));
});

let filterDebounce: ReturnType<typeof setTimeout> | null = null;
watch([searchQuery, filterStatus, filterPeriod], () => {
  if (filterDebounce) clearTimeout(filterDebounce);
  filterDebounce = setTimeout(() => {
    loadBills().catch((err) => console.error("Error loading bills:", err));
    filterDebounce = null;
  }, 300);
});
</script>

<style scoped>
.bills-page {
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

.header-actions-premium {
  display: flex;
  gap: 1rem;
}

.action-btn-glass {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  border-radius: 12px !important;
  color: #f1f5f9 !important;
  font-weight: 600 !important;
}

.premium-outline-btn {
  background: transparent !important;
  border: 1px solid #22c55e !important;
  color: #22c55e !important;
  font-weight: 700 !important;
  border-radius: 12px !important;
}

.premium-outline-btn:hover {
  background: rgba(34, 197, 94, 0.1) !important;
}

/* Stats */
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

.select-wrap, .input-wrap {
  width: 200px;
}

.premium-input-search :deep(.va-input-wrapper),
.premium-select :deep(.va-input-wrapper),
.premium-input :deep(.va-input-wrapper) {
  border-radius: 12px !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

/* Cell Styles */
.tenant-cell {
  display: flex;
  flex-direction: column;
}

.tenant-name {
  font-weight: 700;
  color: var(--va-text-primary);
}

.unit-info {
  font-size: 0.75rem;
  color: var(--va-text-secondary);
}

.amount-cell {
  font-weight: 600;
  color: var(--va-text-primary);
}

.balance-cell.has-balance {
  color: #fbbf24;
}

/* Status Badges */
.status-badge-premium {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.75rem;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-badge-premium .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-badge-premium.paid {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.2);
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.1);
}
.status-badge-premium.paid .dot { background: #22c55e; box-shadow: 0 0 5px #22c55e; }

.status-badge-premium.unpaid {
  background: rgba(251, 191, 36, 0.1);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.2);
}
.status-badge-premium.unpaid .dot { background: #fbbf24; }

.status-badge-premium.overdue {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.1);
}
.status-badge-premium.overdue .dot { background: #ef4444; box-shadow: 0 0 5px #ef4444; }

.status-badge-premium.partially_paid {
  background: rgba(56, 189, 248, 0.1);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.2);
}
.status-badge-premium.partially_paid .dot { background: #38bdf8; }

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

@media (max-width: 768px) {
  .page-header-premium {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
}
</style>

<template>
  <div class="modern-dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="dashboard-title">{{ t('dashboard.title') }}</h1>
          <p class="dashboard-subtitle">
            {{ t('dashboard.subtitle') }}
          </p>
        </div>
        <div class="header-actions">
          <VaSelect
            v-model="dateRange"
            :options="dateRangeOptions"
            text-by="text"
            value-by="value"
            class="date-selector"
            preset="outlined"
          />
          <VaButton
            preset="secondary"
            icon="refresh"
            @click="loadDashboardData"
            :loading="loading"
          >
            {{ t('dashboard.refresh') }}
          </VaButton>
        </div>
      </div>
    </div>

    <!-- Key Metrics -->
    <div class="metrics-grid">
      <div
        v-for="(metric, index) in mainMetrics"
        :key="metric.label"
        class="metric-card"
        :class="`metric-card--${metric.color}`"
      >
        <div class="metric-icon">
          <VaIcon :name="metric.icon" size="24px" />
        </div>
        <div class="metric-content">
          <div class="metric-value">{{ metric.value }}</div>
          <div class="metric-label">{{ metric.label }}</div>
          <div
            v-if="metric.change"
            class="metric-change"
            :class="metric.changeType"
          >
            <VaIcon
              :name="
                metric.changeType === 'positive'
                  ? 'trending_up'
                  : 'trending_down'
              "
              size="14px"
            />
            {{ metric.change }}
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="dashboard-grid">
      <!-- Left Column -->
      <div class="dashboard-column">
        <!-- Revenue Chart -->
        <VaCard class="chart-card">
          <VaCardTitle class="chart-header">
            <div class="chart-title-group">
              <h3>{{ t('dashboard.charts.revenueTitle') }}</h3>
              <p class="chart-subtitle">{{ t('dashboard.charts.revenueSubtitle') }}</p>
            </div>
            <div class="chart-actions">
              <VaButtonGroup>
                <VaButton
                  v-for="period in revenuePeriods"
                  :key="period.value"
                  :preset="
                    selectedRevenuePeriod === period.value
                      ? 'primary'
                      : 'secondary'
                  "
                  size="small"
                  @click="selectedRevenuePeriod = period.value"
                >
                  {{ period.label }}
                </VaButton>
              </VaButtonGroup>
            </div>
          </VaCardTitle>
          <VaCardContent>
            <div class="revenue-chart">
              <div class="chart-legend">
                <div class="legend-item">
                  <div class="legend-dot legend-dot--primary"></div>
                  <span>{{ t('dashboard.charts.thisMonth') }}</span>
                </div>
                <div class="legend-item">
                  <div class="legend-dot legend-dot--secondary"></div>
                  <span>{{ t('dashboard.charts.lastMonth') }}</span>
                </div>
              </div>
              <div class="chart-bars">
                <div
                  v-for="(bar, i) in revenueChartData"
                  :key="i"
                  class="chart-bar-group"
                >
                  <div
                    class="chart-bar chart-bar--primary"
                    :style="{ height: `${bar.primary}%` }"
                  ></div>
                  <div
                    class="chart-bar chart-bar--secondary"
                    :style="{ height: `${bar.secondary}%` }"
                  ></div>
                  <div class="chart-label">{{ bar.label }}</div>
                </div>
              </div>
            </div>
          </VaCardContent>
        </VaCard>

        <!-- Properties Overview -->
        <VaCard class="overview-card">
          <VaCardTitle class="card-header">
            <h3>{{ t('dashboard.overview.title') }}</h3>
            <VaButton preset="plain" size="small" to="/properties">
              {{ t('dashboard.overview.viewAll') }}
              <VaIcon name="arrow_forward" size="small" />
            </VaButton>
          </VaCardTitle>
          <VaCardContent>
            <div class="properties-stats">
              <div class="stat-item">
                <div class="stat-icon stat-icon--occupied">
                  <VaIcon name="home" />
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ occupiedUnits }}</div>
                  <div class="stat-label">{{ t('dashboard.overview.occupied') }}</div>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon stat-icon--vacant">
                  <VaIcon name="vacation_home" />
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ vacantUnits }}</div>
                  <div class="stat-label">{{ t('dashboard.overview.vacant') }}</div>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon stat-icon--maintenance">
                  <VaIcon name="build" />
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ maintenanceUnits }}</div>
                  <div class="stat-label">{{ t('dashboard.overview.maintenance') }}</div>
                </div>
              </div>
            </div>
            <div class="occupancy-progress">
              <div class="progress-header">
                <span>{{ t('dashboard.overview.occupancyRate') }}</span>
                <span class="progress-value">{{ occupancyRate }}%</span>
              </div>
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: `${occupancyRate}%` }"
                ></div>
              </div>
            </div>
          </VaCardContent>
        </VaCard>
      </div>

      <!-- Right Column -->
      <div class="dashboard-column">
        <!-- Recent Activity -->
        <VaCard class="activity-card">
          <VaCardTitle class="card-header">
            <h3>{{ t('dashboard.activity.title') }}</h3>
            <VaChip color="primary" size="small">{{
              recentBills.length + recentPayments.length
            }}</VaChip>
          </VaCardTitle>
          <VaCardContent>
            <div class="activity-tabs">
              <VaButtonGroup>
                <VaButton
                  :preset="activeTab === 'bills' ? 'primary' : 'secondary'"
                  size="small"
                  @click="activeTab = 'bills'"
                >
                  {{ t('dashboard.activity.bills') }}
                </VaButton>
                <VaButton
                  :preset="activeTab === 'payments' ? 'primary' : 'secondary'"
                  size="small"
                  @click="activeTab = 'payments'"
                >
                  {{ t('dashboard.activity.payments') }}
                </VaButton>
              </VaButtonGroup>
            </div>

            <div class="activity-content">
              <div v-if="loading" class="loading-state">
                <VaProgressCircle indeterminate size="small" />
              </div>
              <div
                v-else-if="currentActivityList.length === 0"
                class="empty-state"
              >
                <VaIcon name="inbox" size="large" />
                <p>{{ t('dashboard.activity.noItemsFound', { item: activeTab === 'bills' ? t('dashboard.activity.bills') : t('dashboard.activity.payments') }) }}</p>
              </div>
              <div v-else class="activity-list">
                <div
                  v-for="item in currentActivityList"
                  :key="item.id"
                  class="activity-item"
                >
                  <div
                    class="activity-icon"
                    :class="`activity-icon--${activeTab}`"
                  >
                    <VaIcon
                      :name="activeTab === 'bills' ? 'receipt' : 'payments'"
                    />
                  </div>
                  <div class="activity-details">
                    <div class="activity-title">
                      {{
                        activeTab === "bills"
                          ? item.tenant_name
                          : item.tenant_name
                      }}
                    </div>
                    <div class="activity-subtitle">
                      {{
                        activeTab === "bills"
                          ? `${item.unit_number} • ${item.billing_period}`
                          : `${item.payment_date} • ${formatPaymentMethod(item.payment_method)}`
                      }}
                    </div>
                  </div>
                  <div
                    class="activity-amount"
                    :class="`activity-amount--${activeTab}`"
                  >
                    {{
                      activeTab === "bills"
                        ? `${item.currency || "TZS"} ${formatCurrency(item.amount)}`
                        : `+${item.currency || "TZS"} ${formatCurrency(item.amount_paid)}`
                    }}
                  </div>
                </div>
              </div>
            </div>
          </VaCardContent>
        </VaCard>

        <!-- Quick Actions -->
        <VaCard class="quick-actions-card">
          <VaCardTitle class="card-header">
            <h3>{{ t('dashboard.quickActions.title') }}</h3>
          </VaCardTitle>
          <VaCardContent>
            <div class="quick-actions-grid">
              <VaButton
                v-for="action in quickActions"
                :key="action.label"
                preset="secondary"
                class="quick-action-btn"
                :to="action.route"
              >
                <VaIcon :name="action.icon" />
                <span>{{ action.label }}</span>
              </VaButton>
            </div>
          </VaCardContent>
        </VaCard>

        <!-- Insights -->
        <VaCard class="insights-card">
          <VaCardTitle class="card-header">
            <div class="insights-header">
              <VaIcon name="lightbulb" class="insights-icon" />
              <h3>{{ t('dashboard.insights.title') }}</h3>
            </div>
            <VaChip color="warning" size="small">{{ insights.length }}</VaChip>
          </VaCardTitle>
          <VaCardContent>
            <div class="insights-list">
              <div
                v-for="(insight, index) in insights"
                :key="index"
                class="insight-item"
              >
                <div class="insight-dot"></div>
                <div class="insight-content">
                  <div class="insight-text">{{ insight.title }}</div>
                  <div class="insight-time">{{ insight.date }}</div>
                </div>
              </div>
            </div>
          </VaCardContent>
        </VaCard>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import {
  billingAPI,
  paymentsAPI,
  propertiesAPI,
  tenanciesAPI,
  unitsAPI,
} from "@/services/api";

const { t } = useI18n({ useScope: 'global' });

const loading = ref(false);
const dateRange = ref("last_28_days");
const selectedRevenuePeriod = ref("6months");
const activeTab = ref("bills");

const dateRangeOptions = [
  { value: "last_7_days", text: "Last 7 days" },
  { value: "last_28_days", text: "Last 28 days" },
  { value: "last_90_days", text: "Last 90 days" },
  { value: "this_month", text: "This month" },
  { value: "last_month", text: "Last month" },
];

const revenuePeriods = [
  { value: "1month", label: "1M" },
  { value: "3months", label: "3M" },
  { value: "6months", label: "6M" },
  { value: "1year", label: "1Y" },
];

const quickActions = [
  { label: "Add Property", icon: "add_home", route: "/properties" },
  { label: "New Tenancy", icon: "person_add", route: "/tenancies" },
  { label: "Generate Bill", icon: "receipt_long", route: "/bills" },
  { label: "Record Payment", icon: "payments", route: "/payments" },
];

const totalProperties = ref(0);
const activeTenancies = ref(0);
const unpaidBills = ref(0);
const totalRevenue = ref(0);
const monthlyRevenue = ref(0);
const lastMonthRevenue = ref(0);
const occupiedUnits = ref(0);
const vacantUnits = ref(0);
const totalUnits = ref(0);
const maintenanceUnits = ref(0);
const recentBills = ref([]);
const recentPayments = ref([]);

const mainMetrics = computed(() => [
  {
    label: "Total Properties",
    value: totalProperties.value.toLocaleString(),
    icon: "apartment",
    color: "blue",
    change: "+12%",
    changeType: "positive",
  },
  {
    label: "Active Tenancies",
    value: activeTenancies.value.toLocaleString(),
    icon: "groups",
    color: "green",
    change: "+5%",
    changeType: "positive",
  },
  {
    label: "Unpaid Bills",
    value: unpaidBills.value.toLocaleString(),
    icon: "warning",
    color: "orange",
    change: "-8%",
    changeType: "positive",
  },
  {
    label: "Total Units",
    value: totalUnits.value.toLocaleString(),
    icon: "home",
    color: "purple",
    change: `${vacantUnits.value} vacant`,
    changeType: "positive",
  },
]);

const insights = computed(() => {
  const items = [];
  if (unpaidBills.value > 5) {
    items.push({
      title: `${unpaidBills.value} unpaid bills need attention`,
      date: "Today",
    });
  }
  if (occupancyRate.value > 90) {
    items.push({
      title: `Excellent occupancy rate at ${occupancyRate.value}%`,
      date: "Today",
    });
  }
  if (monthlyRevenue.value > lastMonthRevenue.value * 1.1) {
    items.push({
      title: `Revenue up ${Math.round(((monthlyRevenue.value - lastMonthRevenue.value) / lastMonthRevenue.value) * 100)}% from last month`,
      date: "Today",
    });
  }
  return items.slice(0, 3);
});

const occupancyRate = computed(() => {
  if (totalUnits.value === 0) return 0;
  return Math.round((occupiedUnits.value / totalUnits.value) * 100);
});

const vacancyRate = computed(() => {
  if (totalUnits.value === 0) return 0;
  return Math.round((vacantUnits.value / totalUnits.value) * 100);
});

const revenueChartData = computed(() => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  return months.map((month) => ({
    label: month,
    primary: Math.floor(Math.random() * 40) + 60,
    secondary: Math.floor(Math.random() * 40) + 40,
  }));
});

const currentActivityList = computed(() => {
  return activeTab.value === "bills" ? recentBills.value : recentPayments.value;
});

const formatCurrency = (value) => {
  return parseFloat(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatStatus = (status) => {
  const statusMap = {
    unpaid: "Unpaid",
    paid: "Paid",
    partially_paid: "Partial",
    overdue: "Overdue",
  };
  return statusMap[status] || status;
};

const formatPaymentMethod = (method) => {
  const methodMap = {
    cash: "Cash",
    bank: "Bank",
    mobile_money: "Mobile",
    cheque: "Cheque",
    other: "Other",
  };
  return methodMap[method] || method;
};

const getBillStatusColor = (status) => {
  const colors = {
    unpaid: "warning",
    paid: "success",
    partially_paid: "info",
    overdue: "danger",
  };
  return colors[status] || "secondary";
};

const loadDashboardData = async () => {
  loading.value = true;
  try {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthStr = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, "0")}`;

    const [
      propertiesRes,
      tenanciesRes,
      billsRes,
      paymentsRes,
      allPaymentsRes,
      unitsRes,
    ] = await Promise.all([
      propertiesAPI.list(),
      tenanciesAPI.list({ status: "active" }),
      billingAPI.list({ status: "unpaid" }),
      paymentsAPI.list({ ordering: "-created_at" }),
      paymentsAPI.list(),
      unitsAPI.list(),
    ]);

    totalProperties.value =
      propertiesRes.data.count || propertiesRes.data.results?.length || 0;
    activeTenancies.value =
      tenanciesRes.data.count || tenanciesRes.data.results?.length || 0;
    unpaidBills.value =
      billsRes.data.count || billsRes.data.results?.length || 0;

    const allPayments =
      allPaymentsRes.data.results || allPaymentsRes.data || [];
    totalRevenue.value = allPayments.reduce(
      (sum, p) => sum + parseFloat(p.amount_paid || 0),
      0,
    );

    monthlyRevenue.value = allPayments
      .filter((p) => p.payment_date?.startsWith(currentMonth))
      .reduce((sum, p) => sum + parseFloat(p.amount_paid || 0), 0);

    lastMonthRevenue.value = allPayments
      .filter((p) => p.payment_date?.startsWith(lastMonthStr))
      .reduce((sum, p) => sum + parseFloat(p.amount_paid || 0), 0);

    const units = unitsRes.data.results || unitsRes.data || [];
    totalUnits.value = units.length;
    occupiedUnits.value = units.filter((u) => u.status === "occupied").length;
    vacantUnits.value = units.filter((u) => u.status === "vacant").length;
    maintenanceUnits.value = units.filter(
      (u) => u.status === "maintenance",
    ).length;

    recentBills.value = billsRes.data.results?.slice(0, 5) || [];
    recentPayments.value = paymentsRes.data.results?.slice(0, 5) || [];
  } catch (error) {
    console.error("Error loading dashboard data:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadDashboardData();
});
</script>

<style scoped>
.modern-dashboard {
  min-height: 100vh;
  background: var(--va-background-primary);
  padding: 1.25rem;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: var(--va-text-primary);
  transition: all 0.3s ease;
}

/* Header */
.dashboard-header { margin-bottom: 1.25rem; }
.header-content {
  background: var(--va-background-card-primary);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  padding: 1.5rem 2rem;
  border: 1px solid var(--va-background-border);
  display: flex; justify-content: space-between; align-items: center;
}
.dashboard-title { font-size: 2rem; font-weight: 700; color: var(--va-text-primary); margin: 0 0 .35rem; letter-spacing: -.02em; }
.dashboard-subtitle { color: var(--va-text-secondary); font-size: .95rem; margin: 0; }
.header-actions { display: flex; gap: .75rem; align-items: center; }
.date-selector { min-width: 150px; }

/* Metrics Grid */
.metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin-bottom: 1.25rem; }
.metric-card {
  background: var(--va-background-card-primary);
  border-radius: 14px; padding: 1.25rem;
  border: 1px solid var(--va-background-border);
  display: flex; align-items: center; gap: 1rem;
  transition: all 0.3s cubic-bezier(.4,0,.2,1);
}
.metric-card:hover { border-color: rgba(34,197,94,.2); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.2); }

.metric-icon {
  width: 48px; height: 48px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  background: transparent; border: none;
}
.metric-card--blue .metric-icon { background: linear-gradient(135deg, #22c55e, #10b981); color: #fff; }
.metric-card--green .metric-icon { background: linear-gradient(135deg, #22c55e, #10b981); color: #fff; }
.metric-card--orange .metric-icon { background: linear-gradient(135deg, #f59e0b, #f97316); color: #fff; }
.metric-card--purple .metric-icon { background: linear-gradient(135deg, #10b981, #34d399); color: #fff; }
.metric-value { font-size: 1.75rem; font-weight: 700; color: var(--va-text-primary); line-height: 1; margin-bottom: .2rem; }
.metric-label { color: var(--va-text-secondary); font-size: .8rem; margin-bottom: .35rem; }
.metric-change { display: flex; align-items: center; gap: .2rem; font-size: .72rem; font-weight: 600; color: #22c55e; }
.metric-change.positive { color: #22c55e; }

/* Dashboard Grid */
.dashboard-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.dashboard-column { display: flex; flex-direction: column; gap: 1rem; }

/* Cards */
.chart-card, .overview-card, .activity-card, .quick-actions-card, .insights-card {
  background: var(--va-background-card-primary);
  border-radius: 14px;
  border: 1px solid var(--va-background-border);
  overflow: hidden;
}
.chart-header, .card-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.25rem 1.5rem .75rem;
  border-bottom: 1px solid var(--va-background-border);
}
.chart-header h3, .card-header h3 { font-size: 1.1rem; font-weight: 600; color: var(--va-text-primary); margin: 0; }
.chart-subtitle { color: var(--va-text-secondary); font-size: .82rem; margin: .2rem 0 0; }
.insights-header { display: flex; align-items: center; gap: .5rem; }
.insights-icon { color: #f59e0b; }

/* Revenue Chart */
.revenue-chart { padding: 1rem 1.5rem; }
.chart-legend { display: flex; gap: 1.5rem; margin-bottom: 1rem; }
.legend-item { display: flex; align-items: center; gap: .4rem; font-size: .82rem; color: #94a3b8; }
.legend-dot { width: 8px; height: 8px; border-radius: 50%; }
.legend-dot--primary { background: #22c55e; }
.legend-dot--secondary { background: var(--va-background-element); }
.chart-bars { display: flex; justify-content: space-between; align-items: flex-end; height: 200px; gap: .75rem; }
.chart-bar-group { flex: 1; display: flex; flex-direction: column; align-items: center; gap: .4rem; }
.chart-bar {
  width: 100%; max-width: 36px; border-radius: 6px 6px 0 0;
  transition: opacity .2s ease;
}
.chart-bar--primary { background: linear-gradient(180deg, #22c55e, #16a34a); }
.chart-bar--secondary { background: var(--va-background-element); }
.chart-label { font-size: .72rem; color: #64748b; margin-top: .35rem; }

/* Properties Overview */
.properties-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: .75rem; margin-bottom: 1rem; }
.stat-item {
  display: flex; align-items: center; gap: .75rem;
  padding: .75rem; background: var(--va-background-element); border-radius: 10px;
  border: 1px solid var(--va-background-border);
}
.stat-icon {
  width: 38px; height: 38px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  background: transparent; border: none;
}
.stat-icon--occupied { background: rgba(34,197,94,.12); color: #22c55e; }
.stat-icon--vacant { background: rgba(249,115,22,.12); color: #f97316; }
.stat-icon--maintenance { background: rgba(34,197,94,.12); color: #34d399; }
.stat-value { font-size: 1.35rem; font-weight: 700; color: var(--va-text-primary); }
.stat-label { color: var(--va-text-secondary); font-size: .8rem; }
.occupancy-progress { padding: 0 .5rem; }
.progress-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: .4rem; color: #94a3b8; font-size: .85rem; }
.progress-value { font-weight: 600; color: var(--va-text-primary); }
.progress-bar { height: 8px; background: var(--va-background-element); border-radius: 4px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #22c55e, #10b981); border-radius: 4px; transition: width .5s ease; }

/* Activity Card */
.activity-tabs { padding: .75rem 1.5rem 0; }
.activity-content { padding: .75rem 1.5rem 1rem; }
.loading-state, .empty-state { text-align: center; padding: 2.5rem 1rem; color: #64748b; }
.activity-list { display: flex; flex-direction: column; gap: .6rem; }
.activity-item {
  display: flex; align-items: center; gap: .75rem;
  padding: .75rem; background: var(--va-background-element); border-radius: 10px;
  border: 1px solid var(--va-background-border);
  transition: all .2s ease;
}
.activity-item:hover { background: rgba(255,255,255,.05); border-color: rgba(255,255,255,.08); }
.activity-icon {
  width: 38px; height: 38px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  border: none;
}
.activity-icon--bills { background: rgba(249,115,22,.12); color: #f97316; }
.activity-icon--payments { background: rgba(34,197,94,.12); color: #22c55e; }
.activity-details { flex: 1; }
.activity-title { font-weight: 600; color: var(--va-text-primary); margin-bottom: .15rem; font-size: .9rem; }
.activity-subtitle { font-size: .8rem; color: var(--va-text-secondary); }
.activity-amount { font-weight: 600; font-size: .9rem; }
.activity-amount--bills { color: #f97316; }
.activity-amount--payments { color: #22c55e; }

/* Quick Actions */
.quick-actions-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: .6rem; padding: .75rem 1.5rem 1rem; }
.quick-action-btn {
  display: flex !important; flex-direction: column !important; align-items: center !important;
  gap: .4rem !important; padding: 1rem .75rem !important;
  border-radius: 12px !important; background: var(--va-background-element) !important;
  border: 1px solid var(--va-background-border) !important;
  color: var(--va-text-secondary) !important;
  transition: all .25s cubic-bezier(.4,0,.2,1) !important;
}
.quick-action-btn:hover {
  background: rgba(34,197,94,.08) !important;
  border-color: rgba(34,197,94,.2) !important;
  color: #fff !important; transform: translateY(-2px) !important;
}

/* Insights */
.insights-list { padding: .75rem 1.5rem 1rem; }
.insight-item {
  display: flex; align-items: flex-start; gap: .75rem;
  padding: .75rem; background: var(--va-background-element); border-radius: 10px;
  margin-bottom: .6rem;
  border-left: 3px solid #22c55e;
}
.insight-dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; margin-top: .4rem; }
.insight-text { color: var(--va-text-primary); font-size: .85rem; margin-bottom: .15rem; }
.insight-time { color: var(--va-text-secondary); font-size: .72rem; }

/* Responsive */
@media (max-width: 1200px) {
  .dashboard-grid { grid-template-columns: 1fr; }
  .metrics-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .modern-dashboard { padding: .75rem; }
  .header-content { flex-direction: column; align-items: flex-start; gap: .75rem; }
  .dashboard-title { font-size: 1.5rem; }
  .metrics-grid { grid-template-columns: 1fr; }
  .properties-stats { grid-template-columns: 1fr; }
  .quick-actions-grid { grid-template-columns: 1fr; }
}
</style>



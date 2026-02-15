<template>
  <div class="modern-dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="dashboard-title">Dashboard</h1>
          <p class="dashboard-subtitle">
            Welcome back! Here's what's happening with your properties today.
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
            Refresh
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
              <h3>Revenue Overview</h3>
              <p class="chart-subtitle">Monthly revenue trends</p>
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
                  <span>This Month</span>
                </div>
                <div class="legend-item">
                  <div class="legend-dot legend-dot--secondary"></div>
                  <span>Last Month</span>
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
            <h3>Properties Overview</h3>
            <VaButton preset="plain" size="small" to="/properties">
              View all
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
                  <div class="stat-label">Occupied</div>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon stat-icon--vacant">
                  <VaIcon name="vacation_home" />
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ vacantUnits }}</div>
                  <div class="stat-label">Vacant</div>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon stat-icon--maintenance">
                  <VaIcon name="build" />
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ maintenanceUnits }}</div>
                  <div class="stat-label">Maintenance</div>
                </div>
              </div>
            </div>
            <div class="occupancy-progress">
              <div class="progress-header">
                <span>Occupancy Rate</span>
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
            <h3>Recent Activity</h3>
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
                  Bills
                </VaButton>
                <VaButton
                  :preset="activeTab === 'payments' ? 'primary' : 'secondary'"
                  size="small"
                  @click="activeTab = 'payments'"
                >
                  Payments
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
                <p>No {{ activeTab }} found</p>
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
            <h3>Quick Actions</h3>
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
              <h3>Insights</h3>
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
import {
  billingAPI,
  paymentsAPI,
  propertiesAPI,
  tenanciesAPI,
  unitsAPI,
} from "@/services/api";

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
    label: "Total Revenue",
    value: `TZS ${formatCurrency(totalRevenue.value)}`,
    icon: "trending_up",
    color: "purple",
    change: "+18%",
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
  background: #f8f9fa;
  padding: 1rem;
}

/* Header */
.dashboard-header {
  margin-bottom: 1rem;
}

.header-content {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.header-left {
  flex: 1;
}

.dashboard-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.dashboard-subtitle {
  color: #6c757d;
  font-size: 1rem;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.date-selector {
  min-width: 150px;
}

/* Metrics Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.metric-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: border-color 0.3s ease;
}

.metric-card:hover {
  border-color: #cbd5e0;
}

.metric-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 2px solid #e2e8f0;
}

.metric-card--blue .metric-icon {
  border-color: #4a5568;
  color: #4a5568;
}

.metric-card--green .metric-icon {
  border-color: #48bb78;
  color: #48bb78;
}

.metric-card--orange .metric-icon {
  border-color: #ed8936;
  color: #ed8936;
}

.metric-card--purple .metric-icon {
  border-color: #5a67d8;
  color: #5a67d8;
}

.metric-content {
  flex: 1;
}

.metric-value {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.metric-label {
  color: #718096;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.metric-change {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #718096;
}

/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.dashboard-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Cards */
.chart-card,
.overview-card,
.activity-card,
.quick-actions-card,
.insights-card {
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.chart-header,
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem 0.75rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.chart-header h3,
.card-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.chart-subtitle {
  color: #718096;
  font-size: 0.875rem;
  margin: 0.25rem 0 0 0;
}

.insights-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.insights-icon {
  color: #718096;
}

/* Revenue Chart */
.revenue-chart {
  padding: 1rem 1.5rem;
}

.chart-legend {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #4a5568;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.legend-dot--primary {
  background: #5a67d8;
}

.legend-dot--secondary {
  background: #e2e8f0;
}

.chart-bars {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 200px;
  gap: 1rem;
}

.chart-bar-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.chart-bar {
  width: 100%;
  max-width: 40px;
  border-radius: 8px 8px 0 0;
  transition: opacity 0.2s ease;
}

.chart-bar--primary {
  background: #5a67d8;
}

.chart-bar--secondary {
  background: #e2e8f0;
}

.chart-label {
  font-size: 0.75rem;
  color: #718096;
  margin-top: 0.5rem;
}

/* Properties Overview */
.properties-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #f7fafc;
  border-radius: 8px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 2px solid #e2e8f0;
}

.stat-icon--occupied {
  border-color: #48bb78;
  color: #48bb78;
}

.stat-icon--vacant {
  border-color: #ed8936;
  color: #ed8936;
}

.stat-icon--maintenance {
  border-color: #4299e1;
  color: #4299e1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
}

.stat-label {
  color: #718096;
  font-size: 0.875rem;
}

.occupancy-progress {
  padding: 0 1rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.progress-value {
  font-weight: 600;
  color: #2d3748;
}

.progress-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #48bb78;
  transition: width 0.3s ease;
}

/* Activity Card */
.activity-tabs {
  padding: 0.75rem 1.5rem 0;
}

.activity-content {
  padding: 0.75rem 1.5rem 1rem;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #718096;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f7fafc;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.activity-item:hover {
  background: #edf2f7;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 2px solid #e2e8f0;
}

.activity-icon--bills {
  border-color: #ed8936;
  color: #ed8936;
}

.activity-icon--payments {
  border-color: #48bb78;
  color: #48bb78;
}

.activity-details {
  flex: 1;
}

.activity-title {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.activity-subtitle {
  font-size: 0.875rem;
  color: #718096;
}

.activity-amount {
  font-weight: 600;
  color: #2d3748;
}

.activity-amount--bills,
.activity-amount--payments {
  color: #2d3748;
}

/* Quick Actions */
.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  padding: 0.75rem 1.5rem 1rem;
}

.quick-action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 0.75rem;
  border-radius: 8px;
  background: #f7fafc;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.quick-action-btn:hover {
  background: white;
  border-color: #718096;
  transform: translateY(-2px);
}

/* Insights */
.insights-list {
  padding: 0.75rem 1.5rem 1rem;
}

.insight-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f7fafc;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  border-left: 4px solid #718096;
}

.insight-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #718096;
  margin-top: 0.5rem;
}

.insight-text {
  color: #2d3748;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.insight-time {
  color: #718096;
  font-size: 0.75rem;
}

/* Responsive */
@media (max-width: 1200px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .modern-dashboard {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .dashboard-title {
    font-size: 2rem;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .properties-stats {
    grid-template-columns: 1fr;
  }

  .quick-actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>

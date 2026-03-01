<template>
  <div class="modern-dashboard dark-premium-theme">
    <!-- Property Alert Banner (Mockup style) -->
    <div v-if="vacantUnits > 0" class="alert-banner">
      <div class="alert-icon-wrap">
        <VaIcon name="error_outline" color="#22c55e" size="small" />
      </div>
      <div class="alert-content">
        <h4>{{ t('dashboard.alerts.vacantTitle', { count: vacantUnits }, `${vacantUnits} of your properties have vacancies open.`) }}</h4>
        <p>{{ t('dashboard.alerts.vacantDesc', 'Find new tenants soon to maintain efficiency.') }}</p>
        <div class="alert-action">
          <div class="alert-avatar"><img src="/images/hero_person.png" alt="Agent" /></div>
          <span>Sam has potential leads ready for review now</span>
        </div>
      </div>
      <button class="alert-close"><VaIcon name="close" size="small" /></button>
    </div>

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
            class="date-selector premium-select"
            preset="bordered"
          />
        </div>
      </div>
    </div>

    <!-- Top Metrics (Hidden in strict mockup, keeping as part of responsive or if needed, but omitted for closer mockup match) -->
    <!-- Main Content Grid -->
    <div class="dashboard-grid mock-grid">
      <!-- Row 1: Left (Properties) | Right (Revenue) -->
      <div class="mock-row">
        <!-- Properties Overview -->
        <div class="mock-card properties-card">
          <div class="mock-card-header">
            <h3>Properties Overview</h3>
            <a href="/properties" class="view-all-link">View All</a>
          </div>
          <div class="mock-card-body">
            <div class="prop-stats-row">
              <div class="m-stat">
                <div class="m-stat-icon"><VaIcon name="apartment" size="small"/></div>
                <div class="m-stat-info">
                  <div class="m-val">{{ totalUnits }}</div>
                  <div class="m-lbl">Total Properties</div>
                  <div class="m-chg pos">~ -5%</div>
                </div>
              </div>
              <div class="m-stat">
                <div class="m-stat-icon"><VaIcon name="home" size="small"/></div>
                <div class="m-stat-info">
                  <div class="m-val">{{ vacantUnits }}</div>
                  <div class="m-lbl">Vacant Properties</div>
                  <div class="m-chg pos">+1</div>
                </div>
              </div>
              <div class="m-stat">
                <div class="m-stat-icon"><VaIcon name="domain" size="small"/></div>
                <div class="m-stat-info">
                  <div class="m-val">{{ activeTenancies }}</div>
                  <div class="m-lbl">Active Tenancies</div>
                  <div class="m-chg pos">~ 23%</div>
                </div>
              </div>
            </div>
            
            <div class="occupancy-row">
              <div class="occ-box">
                <div class="occ-val">{{ occupancyRate }}%</div>
                <div class="occ-lbl">Occupancy Rate</div>
                <div class="occ-bar-bg"><div class="occ-bar-fill" :style="{width: occupancyRate + '%'}"></div></div>
              </div>
              <div class="occ-box">
                <div class="occ-val">Tot</div>
                <div class="occ-lbl">~ -7% <span class="occ-right">65%</span></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Revenue Overview (requires reports_analytics) -->
        <div class="mock-card revenue-card" :class="{ 'feature-locked': !hasReportsAnalytics }">
          <div class="mock-card-header">
            <h3>Revenue Overview</h3>
            <VaIcon name="insights" size="small" color="#22c55e" />
          </div>
          <div class="mock-card-body">
            <div class="rev-total">Tzs {{ formatCurrency(totalRevenue) }}</div>
            <div class="rev-change pos">~ +Tzs {{ formatCurrency(monthlyRevenue - lastMonthRevenue) }} vs last period</div>
            <div class="rev-chart-container">
              <div class="chart-y-axis">
                <span>{{ formatCompact(maxChartRevenue) }}</span>
                <span>{{ formatCompact(maxChartRevenue / 2) }}</span>
                <span>0</span>
              </div>
              <div class="rev-chart-area">
                 <svg class="trend-curve" viewBox="0 0 400 100" preserveAspectRatio="none">
                   <path d="M0,80 Q40,40 80,60 T160,50 T240,60 T320,30 T400,10" fill="none" stroke="#22c55e" stroke-width="2" />
                   <path d="M0,80 Q40,40 80,60 T160,50 T240,60 T320,30 T400,10 L400,100 L0,100 Z" fill="url(#gradGreen)" opacity="0.1" />
                   <defs>
                     <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="0%" stop-color="#22c55e" stop-opacity="1" />
                       <stop offset="100%" stop-color="#22c55e" stop-opacity="0" />
                     </linearGradient>
                   </defs>
                 </svg>
                 <div class="chart-x-axis">
                   <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                 </div>
              </div>
            </div>
          </div>
          <!-- Upgrade overlay -->
          <div v-if="!hasReportsAnalytics" class="locked-overlay">
            <VaIcon name="lock" size="28px" color="#f59e0b" />
            <p>Reports & Analytics</p>
            <button class="upgrade-cta" @click="goToUpgrade('reports_analytics')">Upgrade to Unlock</button>
          </div>
        </div>
      </div>

      <!-- Row 2: Left (Recent Activity) | Right (Recent Payments) -->
      <!-- Row 2: Left (Recent Activity) | Right (Recent Payments) — requires payment_tracking -->
      <div class="mock-row">
        <!-- Recent Activity Box -->
        <div class="mock-card activity-mock" :class="{ 'feature-locked': !hasPaymentTracking }">
          <div class="mock-card-header">
            <h3>Recent Activity</h3>
            <a href="/bills" class="view-all-link">View All</a>
          </div>
          <div class="mock-card-body">
            <div class="activity-filters">
              <button 
                class="a-filter" 
                :class="{ active: activeTab === 'bills' }" 
                @click="activeTab = 'bills'"
              >
                Bills
              </button>
              <button 
                class="a-filter" 
                :class="{ active: activeTab === 'payments' }" 
                @click="activeTab = 'payments'"
              >
                Payments
              </button>
            </div>
            <div class="a-list">
              <template v-if="activeTab === 'bills'">
                <div v-for="bill in recentBills.slice(0,3)" :key="bill.id" class="a-item">
                  <div class="a-icon"><VaIcon name="receipt" size="small" color="#f59e0b" /></div>
                  <div class="a-details">
                    <div class="a-title">{{ bill.tenant_name || 'Tenant' }}</div>
                    <div class="a-sub">ID: {{ bill.id }} - {{ bill.billing_period }}</div>
                  </div>
                  <div class="a-amount pos">Tzs {{ formatCurrency(bill.amount) }} <span>▲</span></div>
                </div>
              </template>
              <template v-else>
                <div v-for="pay in recentPayments.slice(0,3)" :key="pay.id" class="a-item">
                  <div class="a-icon"><VaIcon name="payments" size="small" color="#22c55e" /></div>
                  <div class="a-details">
                    <div class="a-title">{{ pay.tenant_name || 'Tenant' }}</div>
                    <div class="a-sub">Payment: #{{ pay.id }}</div>
                  </div>
                  <div class="a-amount pos">Tzs {{ formatCurrency(pay.amount_paid) }} <span>▲</span></div>
                </div>
              </template>
            </div>
          </div>
          <!-- Upgrade overlay -->
          <div v-if="!hasPaymentTracking" class="locked-overlay">
            <VaIcon name="lock" size="28px" color="#f59e0b" />
            <p>Payment Tracking</p>
            <button class="upgrade-cta" @click="goToUpgrade('payment_tracking')">Upgrade to Unlock</button>
          </div>
        </div>

        <!-- Recent Payments Box -->
        <div class="mock-card payments-mock" :class="{ 'feature-locked': !hasPaymentTracking }">
          <div class="mock-card-header">
            <h3>Recent Payments</h3>
            <a href="/payments" class="view-all-link">View All</a>
          </div>
          <div class="mock-card-body">
            <div class="p-total">Tzs {{ formatCurrency(monthlyRevenue) }}</div>
            <div class="p-change pos">~ +Tzs {{ formatCurrency(monthlyRevenue - lastMonthRevenue) }} vs last period</div>
            
            <div class="p-list-header">
              <span>Total Collected</span>
              <span>Last 28 days</span>
            </div>
            
            <div class="p-list">
              <div v-for="pay in recentPayments.slice(0,4)" :key="pay.id" class="p-item">
                <div class="p-avatar"><VaIcon name="person" size="14px" /></div>
                <div class="p-name">{{ pay.tenant_name || 'Tenant' }}</div>
                <div class="p-amt">Tzs {{ formatCurrency(pay.amount_paid) }}</div>
              </div>
            </div>
          </div>
          <!-- Upgrade overlay -->
          <div v-if="!hasPaymentTracking" class="locked-overlay">
            <VaIcon name="lock" size="28px" color="#f59e0b" />
            <p>Payment Tracking</p>
            <button class="upgrade-cta" @click="goToUpgrade('payment_tracking')">Upgrade to Unlock</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import {
  billingAPI,
  paymentsAPI,
  propertiesAPI,
  tenanciesAPI,
  unitsAPI,
  // @ts-ignore
} from "@/services/api";
import { useSubscription } from "@/composables/useSubscription";

const router = useRouter();
const { hasPaymentTracking, hasReportsAnalytics } = useSubscription();

const goToUpgrade = (feature: string) => {
  router.push({ name: 'subscription-plans', query: { upgrade: feature } });
};

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
const recentBills = ref<any[]>([]);
const recentPayments = ref<any[]>([]);

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
  const baseValue = monthlyRevenue.value > 0 ? monthlyRevenue.value : 10000000;
  return months.map((month) => ({
    label: month,
    primary: Math.floor(Math.random() * (baseValue * 0.4)) + (baseValue * 0.6), 
    secondary: Math.floor(Math.random() * (baseValue * 0.4)) + (baseValue * 0.4),
  }));
});

const maxChartRevenue = computed(() => {
  if (!revenueChartData.value || revenueChartData.value.length === 0) return 0;
  const max = Math.max(...revenueChartData.value.map(d => d.primary));
  // Round up to nearest nice number (e.g., 100M, 50M) for the axis top
  return max > 0 ? max : 10000000;
});

const currentActivityList = computed(() => {
  return activeTab.value === "bills" ? recentBills.value : recentPayments.value;
});

const formatCurrency = (value: any) => {
  return parseFloat(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatCompact = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(value);
};

const formatStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    unpaid: "Unpaid",
    paid: "Paid",
    partially_paid: "Partial",
    overdue: "Overdue",
  };
  return statusMap[status] || status;
};

const formatPaymentMethod = (method: string) => {
  const methodMap: Record<string, string> = {
    cash: "Cash",
    bank: "Bank",
    mobile_money: "Mobile",
    cheque: "Cheque",
    other: "Other",
  };
  return methodMap[method] || method;
};

const getBillStatusColor = (status: string) => {
  const colors: Record<string, string> = {
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
    const currentMonth = `${now.getFullYear()}-${("0" + (now.getMonth() + 1)).slice(-2)}`;
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthStr = `${lastMonth.getFullYear()}-${("0" + (lastMonth.getMonth() + 1)).slice(-2)}`;

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
      (sum:any, p:any) => sum + parseFloat(p.amount_paid || 0),
      0,
    );

    monthlyRevenue.value = allPayments
      .filter((p:any) => p.payment_date?.startsWith(currentMonth))
      .reduce((sum:any, p:any) => sum + parseFloat(p.amount_paid || 0), 0);

    lastMonthRevenue.value = allPayments
      .filter((p:any) => p.payment_date?.startsWith(lastMonthStr))
      .reduce((sum:any, p:any) => sum + parseFloat(p.amount_paid || 0), 0);

    const units = unitsRes.data.results || unitsRes.data || [];
    totalUnits.value = units.length;
    occupiedUnits.value = units.filter((u:any) => u.status === "occupied").length;
    vacantUnits.value = units.filter((u:any) => u.status === "vacant").length;
    maintenanceUnits.value = units.filter(
      (u:any) => u.status === "maintenance",
    ).length;

    recentBills.value = billsRes.data.results?.slice(0, 5) || [];
    recentPayments.value = paymentsRes.data.results?.slice(0, 5) || [];
  } catch (error) {
    console.error("Error loading dashboard data:", error);
  } finally {
    loading.value = false;        
  }
};

watch([activeTab, dateRange], () => {
  loadDashboardData();
});

onMounted(() => {
  loadDashboardData();
});
</script>

<style scoped>
.modern-dashboard.dark-premium-theme {
  min-height: 100vh;
  background: var(--va-background-primary);
  padding: 1.5rem;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: var(--va-text-primary);
  transition: all 0.3s ease;
}

/* Alert Banner */
.alert-banner {
  display: flex;
  align-items: center;
  background: var(--va-background-secondary);
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  margin-bottom: 2rem;
  position: relative;
}
.alert-icon-wrap { margin-right: 1rem; }
.alert-content h4 { color: var(--va-text-primary); margin: 0 0 .25rem 0; font-size: 1.05rem; font-weight: 500; }
.alert-content p { color: var(--va-text-secondary); margin: 0 0 .75rem 0; font-size: 0.9rem; }
.alert-action { display: flex; align-items: center; gap: .5rem; color: #22c55e; font-size: .85rem; font-weight: 500; }
.alert-avatar { width: 24px; height: 24px; border-radius: 50%; overflow: hidden; }
.alert-avatar img { width: 100%; height: 100%; object-fit: cover; }
.alert-close { position: absolute; right: 1rem; top: 1rem; background: none; border: none; color: var(--va-text-secondary); cursor: pointer; }

/* Header */
.dashboard-header { margin-bottom: 2rem; }
.header-content {
  display: flex; justify-content: space-between; align-items: center;
}
.dashboard-title { font-size: 2rem; font-weight: 600; color: var(--va-text-primary); margin: 0 0 .25rem; }
.dashboard-subtitle { color: var(--va-text-secondary); font-size: .95rem; margin: 0; }
.premium-select :deep(.va-input-wrapper) { 
  background: var(--va-background-secondary); border-color: var(--va-background-border); border-radius: 8px; color: var(--va-text-primary);
}

/* Grid Layout */
.mock-grid { display: flex; flex-direction: column; gap: 1.5rem; }
.mock-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }

/* Cards */
.mock-card {
  background: var(--va-background-secondary);
  border: 1px solid var(--va-background-border);
  border-radius: 12px;
  display: flex; flex-direction: column;
}
.mock-card-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.25rem 1.5rem 1rem;
}
.mock-card-header h3 { font-size: 1.15rem; font-weight: 600; color: var(--va-text-primary); margin: 0; }
.view-all-link { color: #22c55e; font-size: .85rem; text-decoration: none; font-weight: 500; }
.mock-card-body { padding: 0 1.5rem 1.5rem; flex: 1; }

/* Properties Stats */
.prop-stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
.m-stat { display: flex; align-items: center; gap: .75rem; }
.m-stat-icon { width: 36px; height: 36px; border-radius: 8px; background: rgba(34,197,94,0.15); color: #22c55e; display: flex; align-items: center; justify-content: center; }
.m-val { font-size: 1.25rem; font-weight: 600; color: var(--va-text-primary); line-height: 1.2; }
.m-lbl { font-size: .75rem; color: var(--va-text-secondary); margin: .15rem 0; }
.m-chg { font-size: .7rem; }
.m-chg.pos { color: #22c55e; }

.occupancy-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.occ-box { background: var(--va-background-element); padding: 1rem; border-radius: 10px; border: 1px solid var(--va-background-border); }
.occ-val { font-size: 1.8rem; font-weight: 500; color: var(--va-text-primary); margin-bottom: .25rem; }
.occ-lbl { font-size: .8rem; color: var(--va-text-secondary); display: flex; justify-content: space-between; margin-bottom: .75rem; }
.occ-right { color: var(--va-text-primary); }
.occ-bar-bg { height: 6px; background: var(--va-background-border); border-radius: 3px; }
.occ-bar-fill { height: 100%; background: #22c55e; border-radius: 3px; }

/* Revenue */
.rev-total { font-size: 1.8rem; font-weight: 600; color: var(--va-text-primary); margin-bottom: .25rem; }
.rev-change { font-size: .8rem; margin-bottom: 0.5rem; }
.rev-chart-container { display: flex; gap: 0.75rem; margin-top: 1rem; }
.chart-y-axis { display: flex; flex-direction: column; justify-content: space-between; font-size: 0.7rem; color: var(--va-text-secondary); text-align: right; margin-bottom: 1.2rem; }
.rev-chart-area { flex: 1; position: relative; height: 160px; }
.trend-curve { width: 100%; height: 100%; display: block; overflow: visible; }
.chart-x-axis { display: flex; justify-content: space-between; font-size: .7rem; color: var(--va-text-secondary); margin-top: 0.5rem; }

/* Activity */
.activity-filters { display: flex; gap: .5rem; margin-bottom: 1rem; }
.a-filter { background: var(--va-background-element); border: none; padding: .4rem .8rem; border-radius: 20px; color: var(--va-text-secondary); font-size: .8rem; cursor: pointer; }
.a-filter.active { background: #22c55e; color: #000; font-weight: 500; }
.a-list { display: flex; flex-direction: column; gap: .75rem; }
.a-item { display: flex; align-items: center; gap: 1rem; background: var(--va-background-element); padding: .75rem 1rem; border-radius: 10px; border: 1px solid var(--va-background-border); }
.a-icon { width: 32px; height: 32px; background: rgba(245,158,11,0.1); display: flex; align-items: center; justify-content: center; border-radius: 6px; }
.a-details { flex: 1; }
.a-title { font-size: .9rem; color: var(--va-text-primary); font-weight: 500; }
.a-sub { font-size: .75rem; color: var(--va-text-secondary); margin-top: .15rem; }
.a-amount { font-size: .9rem; font-weight: 500; color: var(--va-text-primary); }

/* Payments */
.p-total { font-size: 1.8rem; font-weight: 600; color: var(--va-text-primary); margin-bottom: .25rem; }
.p-change { font-size: .8rem; margin-bottom: 1.5rem; }
.p-list-header { display: flex; justify-content: space-between; font-size: .8rem; color: var(--va-text-secondary); margin-bottom: .75rem; padding-bottom: .5rem; border-bottom: 1px solid var(--va-background-border); }
.p-list { display: flex; flex-direction: column; gap: .5rem; }
.p-item { display: flex; align-items: center; gap: .75rem; }
.p-avatar { width: 24px; height: 24px; background: var(--va-background-element); border-radius: 4px; display: flex; align-items: center; justify-content: center; color: var(--va-text-secondary); }
.p-name { flex: 1; font-size: .85rem; color: var(--va-text-primary); }
.p-amt { font-size: .85rem; color: #22c55e; font-weight: 500; }

/* Responsive */
@media (max-width: 1024px) {
  .mock-row { grid-template-columns: 1fr; }
}

/* ── Feature-locked cards ──────────────────────────────── */
.feature-locked {
  position: relative;
  overflow: hidden;
}
.feature-locked > .mock-card-body {
  filter: blur(6px);
  pointer-events: none;
  user-select: none;
}

.locked-overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  border-radius: 12px;
}
.locked-overlay p {
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0;
}
.upgrade-cta {
  margin-top: 0.5rem;
  padding: 0.5rem 1.5rem;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #000;
  font-weight: 600;
  font-size: 0.85rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.upgrade-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.35);
}
</style>



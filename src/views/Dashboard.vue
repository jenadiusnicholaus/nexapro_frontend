<template>
  <div class="modern-dashboard dark-premium-theme">
    <div v-if="dashboardStore.loading" class="dashboard-loading-overlay">
      <VaInnerLoading loading />
    </div>

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

    <!-- Subscription Alert Banner -->
    <div v-if="subscriptionAlert" class="alert-banner" :class="subscriptionAlert.type">
      <div class="alert-icon-wrap">
        <VaIcon :name="subscriptionAlert.type === 'error' ? 'warning' : 'schedule'" :color="subscriptionAlert.type === 'error' ? '#ef4444' : '#f59e0b'" size="small" />
      </div>
      <div class="alert-content">
        <h4>{{ subscriptionAlert.title }}</h4>
        <p>{{ subscriptionAlert.message }}</p>
        <div class="alert-action subscription-action">
          <VaButton size="small" :color="subscriptionAlert.type === 'error' ? 'danger' : 'warning'" @click="router.push('/admin/subscription/plans')">
            {{ subscriptionAlert.type === 'error' ? 'Renew Now' : 'Extend Plan' }}
          </VaButton>
        </div>
      </div>
      <button class="alert-close" @click="dismissSubscriptionAlertByMock"><VaIcon name="close" size="small" /></button>
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
                <div class="m-stat-icon prop-icon"><VaIcon name="apartment" size="small"/></div>
                <div class="m-stat-info">
                  <div class="m-val">{{ totalProperties }}</div>
                  <div class="m-lbl">Properties</div>
                </div>
              </div>
              <div class="m-stat">
                <div class="m-stat-icon unit-icon"><VaIcon name="business" size="small"/></div>
                <div class="m-stat-info">
                  <div class="m-val">{{ totalUnits }}</div>
                  <div class="m-lbl">Units</div>
                </div>
              </div>
              <div class="m-stat">
                <div class="m-stat-icon vacant-icon"><VaIcon name="event_busy" size="small"/></div>
                <div class="m-stat-info">
                  <div class="m-val">{{ vacantUnits }}</div>
                  <div class="m-lbl">Vacant</div>
                </div>
              </div>
              <div class="m-stat">
                <div class="m-stat-icon sms-stat-icon"><VaIcon name="sms" size="small"/></div>
                <div class="m-stat-info">
                  <div class="m-val">{{ smsUsage?.usage?.sent || 0 }}/{{ smsUsage?.usage?.is_unlimited ? '∞' : smsUsage?.usage?.limit || 0 }}</div>
                  <div class="m-lbl">SMS</div>
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
                <div class="occ-val" :class="{ 'text-danger': !canSendSMS }">
                  {{ canSendSMS ? 'Active' : 'Locked' }}
                </div>
                <div class="occ-lbl">
                  SMS Status 
                  <span class="occ-right">
                    {{ smsUsage?.usage?.is_unlimited ? 'Unlimited' : (smsUsage?.usage?.percentage_used?.toFixed(0) || 0) + '%' }}
                  </span>
                </div>
                <div class="occ-bar-bg" v-if="!smsUsage?.usage?.is_unlimited">
                  <div class="occ-bar-fill sms-bar" :style="{width: (smsUsage?.usage?.percentage_used || 0) + '%', background: canSendSMS ? '#0ea5e9' : '#ef4444'}"></div>
                </div>
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
            <!-- Financial Footer -->
            <div class="rev-footer">
              <div class="rev-stat-item">
                <span class="rev-stat-lbl">Outstanding</span>
                <span class="rev-stat-val">Tzs {{ formatCurrency(outstandingAmount) }}</span>
              </div>
              <div class="rev-stat-item">
                <span class="rev-stat-lbl">Overdue</span>
                <span class="rev-stat-val text-danger">Tzs {{ formatCurrency(overdueAmount) }}</span>
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
            <a href="/tenancies" class="view-all-link">View All</a>
          </div>
          <div class="mock-card-body">
            <div class="activity-filters">
              <button 
                class="a-filter" 
                :class="{ active: activeTab === 'tenancies' }" 
                @click="activeTab = 'tenancies'"
              >
                Tenancies
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
              <template v-if="activeTab === 'tenancies'">
                <div v-for="tenancy in recentTenancies.slice(0,3)" :key="tenancy.id" class="a-item">
                  <div class="a-icon"><VaIcon name="person_add" size="small" color="#f59e0b" /></div>
                  <div class="a-details">
                    <div class="a-title">{{ tenancy.tenant || 'New Tenant' }}</div>
                    <div class="a-sub">{{ tenancy.property }} - {{ tenancy.unit }}</div>
                  </div>
                  <div class="a-amount pos">Tzs {{ formatCurrency(tenancy.rent_amount) }} <span>▲</span></div>
                </div>
              </template>
              <template v-else>
                <div v-for="pay in recentPayments.slice(0,3)" :key="pay.id" class="a-item">
                  <div class="a-icon"><VaIcon name="payments" size="small" color="#22c55e" /></div>
                  <div class="a-details">
                    <div class="a-title">{{ pay.tenant || 'Tenant' }}</div>
                    <div class="a-sub">{{ pay.property }} - {{ pay.unit }}</div>
                  </div>
                  <div class="a-amount pos">Tzs {{ formatCurrency(pay.amount) }} <span>▲</span></div>
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
                <div class="p-name">{{ pay.tenant || 'Tenant' }}</div>
                <div class="p-amt">Tzs {{ formatCurrency(pay.amount) }}</div>
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
  useProfilesStore,
  useSubscriptionsStore,
  useDashboardStore,
} from "@/stores";
import { useSubscription } from "@/composables/useSubscription";

const router = useRouter();
const profilesStore = useProfilesStore();
const subscriptionsStore = useSubscriptionsStore();
const dashboardStore = useDashboardStore();
const { hasPaymentTracking, hasReportsAnalytics } = useSubscription();

const profile = computed(() => profilesStore.profile);
const smsUsage = computed(() => subscriptionsStore.smsUsage);
const canSendSMS = computed(() => smsUsage.value?.can_send ?? true);

const summary = computed(() => dashboardStore.summary);
const financial = computed(() => dashboardStore.financial);
const recentActivity = computed(() => dashboardStore.recentActivity);

const totalProperties = computed(() => summary.value.total_properties || 0);
const totalUnits = computed(() => summary.value.total_units || 0);
const vacantUnits = computed(() => summary.value.vacant_units || 0);
const occupancyRate = computed(() => summary.value.occupancy_rate || 0);

const totalRevenue = computed(() => financial.value.total_revenue || 0);
const monthlyRevenue = computed(() => financial.value.current_month_revenue || 0);
const lastMonthRevenue = computed(() => financial.value.last_month_revenue || 0);
const outstandingAmount = computed(() => financial.value.outstanding_amount || 0);
const overdueAmount = computed(() => financial.value.overdue_amount || 0);

const recentPayments = computed(() => recentActivity.value.recent_payments || []);
const recentTenancies = computed(() => recentActivity.value.recent_tenancies || []);

const subscriptionAlert = computed(() => {
  const sub = profile.value?.subscription;
  if (!sub) return null;

  if (sub.is_expired) {
    return {
      type: "error",
      title: "Subscription Expired",
      message: `Your ${sub.plan.name} has expired. Access to premium features is limited.`,
    };
  }

  if (sub.days_remaining <= 7) {
    return {
      type: "warning",
      title: "Subscription Expiring Soon",
      message: `Your ${sub.plan.name} expires in ${sub.days_remaining} days. Renew now to avoid interruption.`,
    };
  }

  return null;
});

const dismissSubscriptionAlertByMock = () => {
  // Logic to hide locally if needed
};

const goToUpgrade = (feature: string) => {
  router.push({ name: 'subscription-plans', query: { upgrade: feature } });
};

const { t } = useI18n({ useScope: 'global' });

const dateRange = ref("last_28_days");
const activeTab = ref("tenancies");
const dateRangeOptions = [
  { value: "last_7_days", text: "Last 7 days" },
  { value: "last_28_days", text: "Last 28 days" },
  { value: "last_90_days", text: "Last 90 days" },
  { value: "this_month", text: "This month" },
  { value: "last_month", text: "Last month" },
];

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

const loadDashboardData = async () => {
  try {
    await dashboardStore.fetchStats({ range: dateRange.value });
  } catch (error) {
    console.error("Error loading dashboard data:", error);
  }
};


watch([activeTab, dateRange], () => {
  loadDashboardData();
});

onMounted(() => {
  loadDashboardData();
  profilesStore.fetchCurrentProfile();
  subscriptionsStore.fetchSMSUsage();
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
  position: relative;
}

.dashboard-loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(var(--va-background-primary-rgb), 0.7);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
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
.subscription-action { margin-top: 0.5rem; justify-content: flex-start; }
.alert-avatar { width: 24px; height: 24px; border-radius: 50%; overflow: hidden; }
.alert-avatar img { width: 100%; height: 100%; object-fit: cover; }
.alert-close { position: absolute; right: 1rem; top: 1rem; background: none; border: none; color: var(--va-text-secondary); cursor: pointer; }

.alert-banner.error {
  border-color: rgba(239, 68, 68, 0.4);
  background: rgba(239, 68, 68, 0.05);
}

.alert-banner.warning {
  border-color: rgba(245, 158, 11, 0.4);
  background: rgba(245, 158, 11, 0.05);
}

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
.prop-stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
.m-stat { display: flex; align-items: center; gap: .75rem; }
.m-stat-icon { width: 36px; height: 36px; border-radius: 8px; background: rgba(34,197,94,0.15); color: #22c55e; display: flex; align-items: center; justify-content: center; }
.prop-icon { background: rgba(16, 185, 129, 0.15); color: #10b981; }
.unit-icon { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
.vacant-icon { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
.sms-stat-icon { background: rgba(14, 165, 233, 0.15); color: #0ea5e9; }
.m-val { font-size: 1.15rem; font-weight: 600; color: var(--va-text-primary); line-height: 1.2; }
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

.rev-footer {
  display: flex;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--va-background-border);
  gap: 2rem;
}
.rev-stat-item {
  display: flex;
  flex-direction: column;
}
.rev-stat-lbl {
  font-size: 0.75rem;
  color: var(--va-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}
.rev-stat-val {
  font-size: 1rem;
  font-weight: 600;
  color: var(--va-text-primary);
}
.rev-stat-val.danger {
  color: #ef4444;
}

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



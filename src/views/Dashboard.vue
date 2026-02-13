<template>
  <div class="dashboard-container">
    <!-- Header with Date Range -->
    <div class="dashboard-header">
      <div class="header-left">
        <h1 class="dashboard-title">Reports Snapshot</h1>
        <VaSelect
          v-model="dateRange"
          :options="dateRangeOptions"
          class="date-selector"
          preset="bordered"
        />
      </div>
      <div class="header-actions">
        <VaButton
          preset="plain"
          icon="refresh"
          @click="loadDashboardData"
          :loading="loading"
        >
          Refresh
        </VaButton>
        <VaButton preset="plain" icon="share">Share</VaButton>
        <VaButton preset="plain" icon="download">Export</VaButton>
      </div>
    </div>

    <!-- Key Metrics Row - H-care style with colored icons -->
    <div class="metrics-row metrics-row--hcare">
      <VaCard
        v-for="(stat, index) in mainMetrics"
        :key="stat.label"
        class="metric-card-hcare"
      >
        <VaCardContent>
          <div class="metric-card-header-hcare">
            <div class="metric-icon-circle" :class="`metric-icon-circle--${stat.color}`">
              <VaIcon :name="stat.icon" size="small" class="metric-icon-inner" />
            </div>
            <VaButton preset="plain" icon="more_vert" size="small" class="metric-menu-btn" />
          </div>
          <div class="metric-value-hcare">{{ stat.value }}</div>
          <div class="metric-label-hcare">{{ stat.label }}</div>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Chart Row -->
    <VaCard class="chart-main-card">
      <VaCardTitle class="card-title">
        <span>Overview</span>
      </VaCardTitle>
      <VaCardContent>
        <div class="chart-placeholder">
          <div class="chart-info">
            <div class="chart-label">Activity Over Time</div>
            <div class="chart-value">{{ totalUnits }} Units</div>
          </div>
          <div class="chart-bars">
            <div
              v-for="(bar, i) in chartData"
              :key="i"
              class="chart-bar"
              :style="{ height: `${bar.height}%` }"
              :title="`${bar.value} units`"
            ></div>
          </div>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Prominent Highlight Card - H-care style -->
    <div class="highlight-row">
      <VaCard class="highlight-card">
        <VaCardContent>
          <div class="highlight-value">{{ (activeTenancies ?? 0).toLocaleString() }}</div>
          <div class="highlight-label">Active tenancies this month</div>
          <div class="highlight-chart">
            <div
              v-for="(bar, i) in highlightChartData"
              :key="i"
              class="highlight-bar"
              :style="{ height: `${bar}%` }"
            ></div>
          </div>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Two Column Layout -->
    <div class="dashboard-grid">
      <!-- Left Column -->
      <div class="dashboard-column">
        <!-- Recent Activity -->
        <VaCard class="dashboard-card">
          <VaCardTitle class="card-title">
            <span>Recent Bills</span>
            <VaButton preset="plain" size="small" to="/bills">
              View all
              <VaIcon name="arrow_forward" size="small" />
            </VaButton>
          </VaCardTitle>
          <VaCardContent>
            <div v-if="loading" class="loading-state">
              <VaProgressCircle indeterminate />
            </div>
            <div v-else-if="recentBills.length === 0" class="empty-state">
              <VaIcon name="inbox" size="large" />
              <p>No bills found</p>
            </div>
            <div v-else class="list-items">
              <div
                v-for="bill in recentBills"
                :key="bill.id"
                class="list-item"
              >
                <div class="list-item-content">
                  <div class="list-item-title">{{ bill.tenant_name }}</div>
                  <div class="list-item-subtitle">{{ bill.unit_number }} • {{ bill.billing_period }}</div>
                </div>
                <div class="list-item-actions">
                  <span class="list-item-amount">${{ formatCurrency(bill.amount) }}</span>
                  <VaChip :color="getBillStatusColor(bill.status)" size="small">
                    {{ formatStatus(bill.status) }}
                  </VaChip>
                </div>
              </div>
            </div>
          </VaCardContent>
        </VaCard>

        <!-- Properties / Units by type -->
        <VaCard class="dashboard-card">
          <VaCardTitle class="card-title">
            <span>Units by status</span>
          </VaCardTitle>
          <VaCardContent>
            <div class="division-list">
              <div class="division-row division-row--header">
                <span>STATUS</span>
                <span>UNITS</span>
              </div>
              <div class="division-row">
                <span><VaIcon name="check_circle" size="small" class="division-icon division-icon--success" /> Occupied</span>
                <span>{{ occupiedUnits }}</span>
              </div>
              <div class="division-row">
                <span><VaIcon name="home" size="small" class="division-icon division-icon--warning" /> Vacant</span>
                <span>{{ vacantUnits }}</span>
              </div>
              <div class="division-row">
                <span><VaIcon name="build" size="small" class="division-icon division-icon--info" /> Maintenance</span>
                <span>{{ maintenanceUnits }}</span>
              </div>
            </div>
          </VaCardContent>
        </VaCard>

        <!-- Insights -->
        <VaCard class="dashboard-card">
          <VaCardTitle class="card-title">
            <VaIcon name="lightbulb" class="mr-2" />
            <span>Insights</span>
            <VaChip color="primary" size="small">{{ insights.length }}</VaChip>
          </VaCardTitle>
          <VaCardContent>
            <div class="insights-list">
              <div
                v-for="(insight, index) in insights"
                :key="index"
                class="insight-item"
              >
                <VaIcon name="info" size="small" class="insight-icon" />
                <div class="insight-content">
                  <div class="insight-title">{{ insight.title }}</div>
                  <div class="insight-date">{{ insight.date }}</div>
                </div>
              </div>
            </div>
          </VaCardContent>
        </VaCard>
      </div>

      <!-- Right Column -->
      <div class="dashboard-column">
        <!-- Real-time Stats -->
        <VaCard class="dashboard-card realtime-card">
          <VaCardTitle class="card-title">
            <span>UNITS STATUS</span>
          </VaCardTitle>
          <VaCardContent>
            <div class="realtime-metric">
              <div class="realtime-value">{{ totalUnits }}</div>
              <div class="realtime-label">Total Units</div>
            </div>
            <div class="realtime-breakdown">
              <div class="breakdown-item">
                <div class="breakdown-label">Occupied</div>
                <div class="breakdown-bar">
                  <div
                    class="breakdown-fill breakdown-fill--success"
                    :style="{ width: `${occupancyRate}%` }"
                  ></div>
                </div>
                <div class="breakdown-value">{{ occupiedUnits }}</div>
              </div>
              <div class="breakdown-item">
                <div class="breakdown-label">Vacant</div>
                <div class="breakdown-bar">
                  <div
                    class="breakdown-fill breakdown-fill--warning"
                    :style="{ width: `${vacancyRate}%` }"
                  ></div>
                </div>
                <div class="breakdown-value">{{ vacantUnits }}</div>
              </div>
            </div>
          </VaCardContent>
        </VaCard>

        <!-- Revenue Breakdown -->
        <VaCard class="dashboard-card">
          <VaCardTitle class="card-title">
            <span>Revenue Breakdown</span>
          </VaCardTitle>
          <VaCardContent>
            <div class="revenue-section">
              <div class="revenue-total-large">${{ formatCurrency(totalRevenue) }}</div>
              <div class="revenue-period-label">Total Revenue</div>
            </div>
            <div class="revenue-comparison">
              <div class="comparison-item">
                <div class="comparison-label">This Month</div>
                <div class="comparison-value">${{ formatCurrency(monthlyRevenue) }}</div>
              </div>
              <div class="comparison-item">
                <div class="comparison-label">Last Month</div>
                <div class="comparison-value">${{ formatCurrency(lastMonthRevenue) }}</div>
              </div>
            </div>
          </VaCardContent>
        </VaCard>

        <!-- Recent Payments -->
        <VaCard class="dashboard-card">
          <VaCardTitle class="card-title">
            <span>Recent Payments</span>
            <VaButton preset="plain" size="small" to="/payments">
              View all
              <VaIcon name="arrow_forward" size="small" />
            </VaButton>
          </VaCardTitle>
          <VaCardContent>
            <div v-if="loading" class="loading-state">
              <VaProgressCircle indeterminate />
            </div>
            <div v-else-if="recentPayments.length === 0" class="empty-state">
              <VaIcon name="inbox" size="large" />
              <p>No payments found</p>
            </div>
            <div v-else class="list-items">
              <div
                v-for="payment in recentPayments"
                :key="payment.id"
                class="list-item"
              >
                <div class="list-item-content">
                  <div class="list-item-title">{{ payment.tenant_name }}</div>
                  <div class="list-item-subtitle">{{ payment.payment_date }} • {{ formatPaymentMethod(payment.payment_method) }}</div>
                </div>
                <div class="list-item-actions">
                  <span class="list-item-amount list-item-amount--success">
                    +${{ formatCurrency(payment.amount_paid) }}
                  </span>
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
import { ref, onMounted, computed } from 'vue'
import { billingAPI, paymentsAPI, propertiesAPI, tenanciesAPI, unitsAPI } from '@/services/api'

const loading = ref(false)
const dateRange = ref('last_28_days')

const dateRangeOptions = [
  { value: 'last_7_days', text: 'Last 7 days' },
  { value: 'last_28_days', text: 'Last 28 days' },
  { value: 'last_90_days', text: 'Last 90 days' },
  { value: 'this_month', text: 'This month' },
  { value: 'last_month', text: 'Last month' },
]

const totalProperties = ref(0)
const activeTenancies = ref(0)
const unpaidBills = ref(0)
const totalRevenue = ref(0)
const monthlyRevenue = ref(0)
const lastMonthRevenue = ref(0)
const occupiedUnits = ref(0)
const vacantUnits = ref(0)
const totalUnits = ref(0)
const maintenanceUnits = ref(0)
const recentBills = ref([])
const recentPayments = ref([])

const mainMetrics = computed(() => [
  {
    label: 'Total Properties',
    value: totalProperties.value.toLocaleString(),
    icon: 'home',
    color: 'purple',
  },
  {
    label: 'Active Tenancies',
    value: activeTenancies.value.toLocaleString(),
    icon: 'people',
    color: 'teal',
  },
  {
    label: 'Unpaid Bills',
    value: unpaidBills.value.toLocaleString(),
    icon: 'receipt',
    color: 'orange',
  },
  {
    label: 'Total Revenue',
    value: `$${formatCurrency(totalRevenue.value)}`,
    icon: 'attach_money',
    color: 'pink',
  },
])

const insights = computed(() => {
  const items = []
  if (unpaidBills.value > 10) {
    items.push({
      title: `High number of unpaid bills: ${unpaidBills.value} bills require attention`,
      date: 'Today',
    })
  }
  if (occupancyRate.value > 90) {
    items.push({
      title: `High occupancy rate: ${occupancyRate.value}% of units are occupied`,
      date: 'Today',
    })
  }
  if (monthlyRevenue.value > lastMonthRevenue.value * 1.1) {
    items.push({
      title: `Revenue increased by ${Math.round(((monthlyRevenue.value - lastMonthRevenue.value) / lastMonthRevenue.value) * 100)}% compared to last month`,
      date: 'Today',
    })
  }
  return items.slice(0, 3)
})

const occupancyRate = computed(() => {
  if (totalUnits.value === 0) return 0
  return Math.round((occupiedUnits.value / totalUnits.value) * 100)
})

const vacancyRate = computed(() => {
  if (totalUnits.value === 0) return 0
  return Math.round((vacantUnits.value / totalUnits.value) * 100)
})

const chartData = computed(() => {
  const data = []
  for (let i = 0; i < 14; i++) {
    data.push({
      value: Math.floor(Math.random() * 50) + 10,
      height: Math.floor(Math.random() * 60) + 20,
    })
  }
  return data
})

const highlightChartData = computed(() => {
  return [40, 65, 45, 80, 55, 70, 90]
})

const formatCurrency = (value) => {
  return parseFloat(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const formatStatus = (status) => {
  const statusMap = {
    unpaid: 'Unpaid',
    paid: 'Paid',
    partially_paid: 'Partial',
    overdue: 'Overdue',
  }
  return statusMap[status] || status
}

const formatPaymentMethod = (method) => {
  const methodMap = {
    cash: 'Cash',
    bank: 'Bank',
    mobile_money: 'Mobile',
    cheque: 'Cheque',
    other: 'Other',
  }
  return methodMap[method] || method
}

const getBillStatusColor = (status) => {
  const colors = {
    unpaid: 'warning',
    paid: 'success',
    partially_paid: 'info',
    overdue: 'danger',
  }
  return colors[status] || 'secondary'
}

const loadDashboardData = async () => {
  loading.value = true
  try {
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthStr = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`

    const [
      propertiesRes,
      tenanciesRes,
      billsRes,
      paymentsRes,
      allPaymentsRes,
      unitsRes,
    ] = await Promise.all([
      propertiesAPI.list(),
      tenanciesAPI.list({ status: 'active' }),
      billingAPI.list({ status: 'unpaid' }),
      paymentsAPI.list({ ordering: '-created_at' }),
      paymentsAPI.list(),
      unitsAPI.list(),
    ])

    totalProperties.value = propertiesRes.data.count || propertiesRes.data.results?.length || 0
    activeTenancies.value = tenanciesRes.data.count || tenanciesRes.data.results?.length || 0
    unpaidBills.value = billsRes.data.count || billsRes.data.results?.length || 0

    const allPayments = allPaymentsRes.data.results || allPaymentsRes.data || []
    totalRevenue.value = allPayments.reduce(
      (sum, p) => sum + parseFloat(p.amount_paid || 0),
      0
    )

    monthlyRevenue.value = allPayments
      .filter((p) => p.payment_date?.startsWith(currentMonth))
      .reduce((sum, p) => sum + parseFloat(p.amount_paid || 0), 0)

    lastMonthRevenue.value = allPayments
      .filter((p) => p.payment_date?.startsWith(lastMonthStr))
      .reduce((sum, p) => sum + parseFloat(p.amount_paid || 0), 0)

    const units = unitsRes.data.results || unitsRes.data || []
    totalUnits.value = units.length
    occupiedUnits.value = units.filter((u) => u.status === 'occupied').length
    vacantUnits.value = units.filter((u) => u.status === 'vacant').length
    maintenanceUnits.value = units.filter((u) => u.status === 'maintenance').length

    recentBills.value = billsRes.data.results?.slice(0, 5) || []
    recentPayments.value = paymentsRes.data.results?.slice(0, 5) || []
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
.dashboard-container {
  width: 100%;
}

/* Header */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--va-background-border);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.dashboard-title {
  font-size: 1.5rem;
  font-weight: 400;
  color: var(--va-text-primary);
  margin: 0;
}

.date-selector {
  min-width: 180px;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

/* Main Metrics Row */
.metrics-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

/* H-care style metric cards */
.metrics-row--hcare {
  gap: 1.25rem;
}

.metric-card-hcare {
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.metric-card-header-hcare {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.metric-icon-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.metric-icon-circle--purple {
  background: rgba(124, 58, 237, 0.12);
  color: #7c3aed;
}

.metric-icon-circle--teal {
  background: rgba(6, 182, 212, 0.12);
  color: #06b6d4;
}

.metric-icon-circle--orange {
  background: rgba(249, 115, 22, 0.12);
  color: #f97316;
}

.metric-icon-circle--pink {
  background: rgba(236, 72, 153, 0.12);
  color: #ec4899;
}

.metric-icon-inner {
  color: inherit !important;
}

.metric-menu-btn {
  color: #9ca3af !important;
}

.metric-value-hcare {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--va-text-primary);
  line-height: 1.2;
  margin-bottom: 0.25rem;
}

.metric-label-hcare {
  font-size: 0.8125rem;
  color: var(--va-text-secondary);
}

/* Prominent highlight card */
.highlight-row {
  margin-bottom: 1.5rem;
}

.highlight-card {
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%) !important;
  border: none !important;
  box-shadow: 0 4px 14px rgba(124, 58, 237, 0.35);
}

.highlight-card .va-card__content {
  padding: 1.5rem 2rem;
}

.highlight-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.25rem;
}

.highlight-label {
  font-size: 0.9375rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 1rem;
}

.highlight-chart {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 60px;
  margin-top: 0.5rem;
}

.highlight-bar {
  flex: 1;
  background: rgba(255, 255, 255, 0.35);
  border-radius: 4px 4px 0 0;
  min-height: 8px;
  transition: opacity 0.2s;
}

.highlight-bar:hover {
  opacity: 0.9;
}

/* Chart Card */
.chart-main-card {
  margin-bottom: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--va-background-border);
}

.card-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--va-background-border);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--va-text-primary);
}

.chart-placeholder {
  padding: 1.5rem;
}

.chart-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.chart-label {
  font-size: 0.875rem;
  color: var(--va-text-secondary);
}

.chart-value {
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--va-text-primary);
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 200px;
  padding-top: 1rem;
}

.chart-bar {
  flex: 1;
  background: #4285f4;
  border-radius: 4px 4px 0 0;
  min-height: 4px;
  transition: opacity 0.2s;
}

.chart-bar:hover {
  opacity: 0.8;
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

.dashboard-card {
  border-radius: 8px;
  border: 1px solid var(--va-background-border);
}

/* List Items */
.list-items {
  padding: 0.5rem 0;
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid var(--va-background-border);
}

.list-item:last-child {
  border-bottom: none;
}

.list-item-content {
  flex: 1;
}

.list-item-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--va-text-primary);
  margin-bottom: 0.25rem;
}

.list-item-subtitle {
  font-size: 0.75rem;
  color: var(--va-text-secondary);
}

.list-item-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.list-item-amount {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--va-text-primary);
}

.list-item-amount--success {
  color: var(--va-success);
}

/* Realtime Card */
.realtime-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
}

.realtime-metric {
  text-align: center;
  padding: 1.5rem 0;
  border-bottom: 1px solid var(--va-background-border);
  margin-bottom: 1rem;
}

.realtime-value {
  font-size: 3rem;
  font-weight: 400;
  color: var(--va-text-primary);
  margin-bottom: 0.5rem;
}

.realtime-label {
  font-size: 0.75rem;
  color: var(--va-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.realtime-breakdown {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.breakdown-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.breakdown-label {
  font-size: 0.75rem;
  color: var(--va-text-secondary);
  min-width: 80px;
}

.breakdown-bar {
  flex: 1;
  height: 8px;
  background: var(--va-background-secondary);
  border-radius: 4px;
  overflow: hidden;
}

.breakdown-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.breakdown-fill--success {
  background: #34a853;
}

.breakdown-fill--warning {
  background: #fbbc04;
}

.breakdown-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--va-text-primary);
  min-width: 40px;
  text-align: right;
}

/* Revenue Section */
.revenue-section {
  text-align: center;
  padding: 1.5rem 0;
  border-bottom: 1px solid var(--va-background-border);
  margin-bottom: 1rem;
}

.revenue-total-large {
  font-size: 2.5rem;
  font-weight: 400;
  color: var(--va-text-primary);
  margin-bottom: 0.5rem;
}

.revenue-period-label {
  font-size: 0.75rem;
  color: var(--va-text-secondary);
}

.revenue-comparison {
  display: flex;
  justify-content: space-around;
}

.comparison-item {
  text-align: center;
}

.comparison-label {
  font-size: 0.75rem;
  color: var(--va-text-secondary);
  margin-bottom: 0.5rem;
}

.comparison-value {
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--va-text-primary);
}

/* Insights */
.insights-list {
  padding: 0.5rem 0;
}

.insight-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid var(--va-background-border);
}

.insight-item:last-child {
  border-bottom: none;
}

.insight-icon {
  color: var(--va-primary);
  margin-top: 0.125rem;
}

.insight-content {
  flex: 1;
}

.insight-title {
  font-size: 0.875rem;
  color: var(--va-text-primary);
  margin-bottom: 0.25rem;
}

.insight-date {
  font-size: 0.75rem;
  color: var(--va-text-secondary);
}

/* Empty/Loading States */
.empty-state,
.loading-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--va-text-secondary);
}

.empty-state p {
  margin-top: 1rem;
  font-size: 0.875rem;
}

/* Division list - H-care style */
.division-list {
  padding: 0.5rem 0;
}

.division-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid var(--va-background-border);
  font-size: 0.875rem;
}

.division-row:last-child {
  border-bottom: none;
}

.division-row--header {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--va-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.division-icon {
  margin-right: 0.5rem;
  vertical-align: middle;
}

.division-icon--success {
  color: #10b981 !important;
}

.division-icon--warning {
  color: #f59e0b !important;
}

.division-icon--info {
  color: #06b6d4 !important;
}

.mr-2 {
  margin-right: 0.5rem;
}

/* Responsive */
@media (max-width: 1200px) {
  .metrics-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .metrics-row {
    grid-template-columns: 1fr;
  }

  .main-metric-value {
    font-size: 1.75rem;
  }
}
</style>

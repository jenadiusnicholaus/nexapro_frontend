<template>
  <div class="subscription-plans-page">
    <!-- Hero Section -->
    <div class="page-header">
      <div class="header-badge">
        <span class="badge-dot"></span>
        Flexible Subscription Plans
      </div>
      <h1 class="title">Elevate Your Management</h1>
      <p class="subtitle">Choose a plan that scales with your property portfolio. Professional features for professional owners.</p>
    </div>

    <!-- Alert States -->
    <div class="alerts-container">
      <VaAlert v-if="subscriptionsStore.loading" color="info" outline class="mb-4">
        <template #prependInner>
          <VaProgressCircle indeterminate size="small" class="mr-2" />
        </template>
        Loading subscription plans...
      </VaAlert>

      <VaAlert v-if="subscriptionsStore.error" color="danger" border="left" class="mb-4">
        {{ subscriptionsStore.error }}
      </VaAlert>
    </div>

    <!-- Current Subscription Card -->
    <div v-if="profilesStore.profile?.subscription?.plan" class="current-sub-wrapper">
      <VaCard class="current-subscription-card">
        <div class="card-glow"></div>
        <VaCardContent>
          <div class="current-subscription-content">
            <div class="subscription-icon-wrapper">
              <div class="icon-circle">
                <VaIcon name="workspace_premium" size="2.5rem" />
              </div>
            </div>
            <div class="subscription-details">
              <div class="subscription-header">
                <div>
                  <div class="status-indicator">
                    <span class="pulse-dot" :class="{ 'is-expired': profilesStore.profile?.subscription?.is_expired }"></span>
                    {{ profilesStore.profile?.subscription?.status?.toUpperCase() }}
                  </div>
                  <h3 class="plan-name-title">
                    {{ profilesStore.profile?.subscription?.plan?.name }}
                  </h3>
                </div>
                <div class="days-remaining">
                  <span class="days-num">{{ profilesStore.profile?.subscription?.days_remaining }}</span>
                  <span class="days-label">Days Left</span>
                </div>
              </div>
              <div class="subscription-footer">
                <div class="detail-item">
                  <VaIcon name="event" size="18px" />
                  <span>Renews on: {{ new Date(profilesStore.profile?.subscription?.end_date).toLocaleDateString() }}</span>
                </div>
                <div class="divider-dot"></div>
                <div class="detail-item">
                  <VaIcon name="shield" size="18px" />
                  <span>Secure Billing</span>
                </div>
              </div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Plans Grid -->
    <div class="plans-grid">
      <div
        v-for="plan in subscriptionsStore.plans"
        :key="plan.id"
        class="plan-card-wrapper"
        :class="{ 'is-current': isCurrentPlan(plan.id) }"
      >
        <VaCard class="plan-card">
          <div v-if="plan.is_popular" class="popular-ribbon">Most Popular</div>
          <div v-if="isCurrentPlan(plan.id)" class="current-plan-tag">Your Current Plan</div>
          
          <VaCardContent class="plan-content">
            <div class="plan-header">
              <h3 class="plan-name">{{ plan.name }}</h3>
              <p class="plan-desc">{{ plan.description }}</p>
            </div>

            <div class="plan-pricing">
              <div class="price-container">
                <span class="currency">{{ plan.currency }}</span>
                <span class="price-val">{{ formatPrice(plan.price) }}</span>
              </div>
              <span class="duration" v-if="parseFloat(plan.price) > 0">
                per {{ plan.duration_days }} days
              </span>
              <span class="duration" v-else>Free forever</span>
            </div>

            <div class="plan-features">
              <div class="features-label">Included Features</div>
              <ul class="features-list">
                <li>
                  <VaIcon name="check_circle" size="18px" class="feat-icon" />
                  <span class="feat-text"><strong>{{ plan.max_properties }}</strong> Properties</span>
                </li>
                <li>
                  <VaIcon name="check_circle" size="18px" class="feat-icon" />
                  <span class="feat-text"><strong>{{ plan.max_units }}</strong> Units</span>
                </li>
                <li>
                  <VaIcon name="check_circle" size="18px" class="feat-icon" />
                  <span class="feat-text"><strong>{{ plan.max_tenants }}</strong> Tenants</span>
                </li>
                <li :class="{ 'dimmed': !plan.sms_notifications }">
                  <VaIcon :name="plan.sms_notifications ? 'check_circle' : 'cancel'" size="18px" class="feat-icon" />
                  <span class="feat-text">SMS Notifications</span>
                </li>
                <li :class="{ 'dimmed': !plan.contract_generation }">
                  <VaIcon :name="plan.contract_generation ? 'check_circle' : 'cancel'" size="18px" class="feat-icon" />
                  <span class="feat-text">Digital Contracts</span>
                </li>
                <li :class="{ 'dimmed': !plan.payment_tracking }">
                  <VaIcon :name="plan.payment_tracking ? 'check_circle' : 'cancel'" size="18px" class="feat-icon" />
                  <span class="feat-text">Payment Tracking</span>
                </li>
                <li :class="{ 'dimmed': !plan.reports_analytics }">
                  <VaIcon :name="plan.reports_analytics ? 'check_circle' : 'cancel'" size="18px" class="feat-icon" />
                  <span class="feat-text">Advanced Analytics</span>
                </li>
              </ul>
            </div>

            <VaButton
              v-if="isCurrentPlan(plan.id)"
              class="plan-btn current-btn"
              preset="primary"
              border-color="primary"
              block
              disabled
            >
              <VaIcon name="check" size="small" class="mr-2" />
              Active Plan
            </VaButton>

            <VaButton
              v-else-if="plan.is_free_tier"
              class="plan-btn free-btn"
              preset="secondary"
              block
              disabled
            >
              Free Access
            </VaButton>

            <VaButton
              v-else
              class="plan-btn upgrade-btn"
              @click.stop.prevent="selectPlan(plan)"
              block
            >
              Select Plan
            </VaButton>
          </VaCardContent>
        </VaCard>
      </div>
    </div>
  </div>

  <!-- Payment Modal -->
  <VaModal v-model="showPaymentModal" hide-default-actions size="medium" class="payment-modal">
    <template #header>
      <div class="modal-header">
        <VaIcon name="payments" color="primary" size="large" />
        <h2 class="modal-title">Secure Checkout</h2>
      </div>
    </template>

    <div class="payment-modal-body" v-if="selectedPlan">
      <div class="order-summary">
        <div class="order-label">Selected Plan</div>
        <div class="order-plan-details">
          <span class="order-plan-name">{{ selectedPlan.name }}</span>
          <span class="order-plan-price">{{ selectedPlan.currency }} {{ formatPrice(selectedPlan.price) }}</span>
        </div>
      </div>

      <div class="payment-instructions">
        <div class="instr-icon"><VaIcon name="smartphone" /></div>
        <p>Complete your payment via Mobile Money. We will send a prompt to your phone.</p>
      </div>

      <VaForm ref="paymentForm" class="mt-4">
        <VaInput
          v-model="paymentData.account_number"
          label="Mobile Number"
          placeholder="07xxxxxxxx"
          preset="bordered"
          class="mb-4 payment-input"
          :rules="[
            (v: string) => !!v || 'Phone number is required',
            (v: string) => /^\d{10}$/.test(v) || 'Enter a valid 10-digit number',
          ]"
        >
          <template #prependInner><VaIcon name="phone" size="small" /></template>
        </VaInput>

        <VaSelect
          v-model="paymentData.provider"
          label="Payment Provider"
          value-by="value"
          text-by="text"
          preset="bordered"
          class="mb-4 payment-input"
          :options="[
            { text: 'Vodacom M-Pesa', value: 'mpesa' },
            { text: 'Airtel Money', value: 'airtel' },
            { text: 'Tigo Pesa', value: 'tigo' },
            { text: 'Halopesa', value: 'halopesa' },
            { text: 'Azampesa', value: 'azampesa' },
          ]"
        >
          <template #prependInner><VaIcon name="account_balance_wallet" size="small" /></template>
        </VaSelect>
      </VaForm>
    </div>

    <template #footer>
      <div class="modal-footer-btns">
        <VaButton preset="secondary" @click="showPaymentModal = false" class="cancel-btn">
          Cancel
        </VaButton>
        <VaButton :loading="subscriptionsStore.loading" @click="processUpgrade" class="confirm-btn">
          Pay & Upgrade
          <VaIcon name="arrow_forward" size="small" class="ml-2" />
        </VaButton>
      </div>
    </template>
  </VaModal>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAppToast } from "@/composables/useAppToast";
import { useProfilesStore, useSubscriptionsStore } from "@/stores";

const router = useRouter();
const { success, error } = useAppToast();
const profilesStore = useProfilesStore();
const subscriptionsStore = useSubscriptionsStore();

const showPaymentModal = ref(false);
const selectedPlan = ref<any>(null);
const paymentForm = ref<any>(null);

const paymentData = ref({
  account_number: "",
  provider: "mpesa",
});

const isCurrentPlan = (planId: number) => {
  const currentPlanId = profilesStore.profile?.subscription?.plan?.id;
  return currentPlanId === planId;
};

const formatPrice = (price: any) => {
  return parseFloat(price || 0).toLocaleString();
};

const loadPlans = async () => {
  try {
    await subscriptionsStore.fetchPlans();
  } catch (err: any) {
    error("Failed to load subscription plans. Please try again later.");
  }
};

const selectPlan = (plan: any) => {
  if (!plan) return;
  selectedPlan.value = plan;
  paymentData.value = { account_number: "", provider: "mpesa" };
  showPaymentModal.value = true;
};

const processUpgrade = async () => {
  if (!selectedPlan.value) return;

  const isValid = await paymentForm.value?.validate();
  if (!isValid) return;

  try {
    const data = await subscriptionsStore.upgradeSubscription({
      plan_id: selectedPlan.value.id,
      account_number: paymentData.value.account_number,
      provider: paymentData.value.provider,
    });

    if (data.success) {
      success(data.status === "pending" 
        ? `Payment initiated! Please check your phone for the USSD prompt.`
        : `Successfully upgraded to ${selectedPlan.value.name}!`);
      
      showPaymentModal.value = false;
      await profilesStore.fetchCurrentProfile();
      router.push("/admin/profiles");
    } else {
      error(data.message || "Upgrade failed. Please try again.");
    }
  } catch (err: any) {
    error(err.response?.data?.error || "Payment failed. Please try again.");
  }
};

onMounted(() => {
  loadPlans();
  profilesStore.fetchCurrentProfile();
  subscriptionsStore.fetchCurrentSubscription();
});
</script>

<style scoped>
.subscription-plans-page {
  padding: 3rem 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background: var(--va-background-primary);
  min-height: 100vh;
}

/* Hero Section */
.page-header {
  text-align: center;
  margin-bottom: 4rem;
  animation: fadeInUp 0.8s ease-out;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--va-background-element);
  border: 1px solid var(--va-background-border);
  padding: 0.4rem 1rem;
  border-radius: 50px;
  color: var(--va-primary);
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
}

.badge-dot {
  width: 6px;
  height: 6px;
  background: #22c55e;
  border-radius: 50%;
  box-shadow: 0 0 10px #22c55e;
}

.title {
  font-size: 3rem;
  font-weight: 800;
  color: var(--va-text-primary);
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
}

.subtitle {
  font-size: 1.125rem;
  color: var(--va-text-secondary);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Current Subscription Card */
.current-sub-wrapper {
  margin-bottom: 4rem;
  animation: fadeInUp 1s ease-out;
}

.current-subscription-card {
  background: var(--va-background-card-primary) !important;
  border: 1px solid var(--va-background-border) !important;
  border-radius: 20px !important;
  overflow: hidden;
  position: relative;
  backdrop-filter: blur(10px);
}

.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(34, 197, 94, 0.05) 0%, transparent 70%);
  pointer-events: none;
}

.current-subscription-content {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 1rem;
}

.icon-circle {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #22c55e, #10b981);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 8px 16px rgba(34, 197, 94, 0.2);
}

.subscription-details { flex: 1; }

.subscription-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #22c55e;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: #22c55e;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.pulse-dot.is-expired {
  background: #ef4444;
  animation: none;
}

.plan-name-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--va-text-primary);
  margin: 0;
}

.days-remaining {
  text-align: right;
  background: var(--va-background-element);
  padding: 0.5rem 1rem;
  border-radius: 12px;
  border: 1px solid var(--va-background-border);
}

.days-num {
  display: block;
  font-size: 1.5rem;
  font-weight: 800;
  color: #22c55e;
  line-height: 1;
}

.days-label {
  font-size: 0.7rem;
  color: var(--va-text-secondary);
  text-transform: uppercase;
  font-weight: 600;
}

.subscription-footer {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  border-top: 1px solid var(--va-background-border);
  padding-top: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--va-text-secondary);
  font-size: 0.85rem;
}

.divider-dot {
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

/* Plans Grid */
.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  animation: fadeInUp 1.2s ease-out;
}

.plan-card-wrapper {
  position: relative;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.plan-card-wrapper:hover { transform: translateY(-10px); }

.plan-card {
  height: 100%;
  background: var(--va-background-card-primary) !important;
  border: 1px solid var(--va-background-border) !important;
  border-radius: 24px !important;
  overflow: visible !important;
}

.plan-card-wrapper.is-current .plan-card {
  border: 2px solid #22c55e !important;
  background: rgba(34, 197, 94, 0.02) !important;
  box-shadow: 0 0 30px rgba(34, 197, 94, 0.1);
}

.popular-ribbon {
  position: absolute;
  top: -12px;
  right: 20px;
  box-shadow: 0 4px 10px rgba(34, 197, 94, 0.3);
  z-index: 2;
}

.current-plan-tag {
  position: absolute;
  top: -12px;
  left: 20px;
  background: #22c55e;
  color: #fff;
  padding: 0.35rem 1rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 700;
  box-shadow: 0 4px 10px rgba(34, 197, 94, 0.3);
  z-index: 2;
}

.plan-content {
  display: flex;
  flex-direction: column;
  padding: 2.5rem 2rem !important;
  height: 100%;
}

.plan-name { font-size: 1.25rem; font-weight: 700; color: var(--va-text-primary); margin-bottom: 0.5rem; }
.plan-desc { font-size: 0.85rem; color: var(--va-text-secondary); margin-bottom: 2rem; min-height: 2.5rem; }

.plan-pricing { margin-bottom: 2rem; }
.price-container { display: flex; align-items: baseline; gap: 0.25rem; }
.currency { font-size: 1.125rem; font-weight: 600; color: #22c55e; }
.price-val { font-size: 2.5rem; font-weight: 800; color: var(--va-text-primary); letter-spacing: -1px; }
.duration { font-size: 0.85rem; color: var(--va-text-secondary); }

.plan-features { flex: 1; margin-bottom: 2.5rem; }
.features-label { font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 1.25rem; }
.features-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 1rem; }
.features-list li { display: flex; align-items: center; gap: 0.75rem; color: var(--va-text-primary); font-size: 0.95rem; }
.features-list li.dimmed { color: var(--va-text-disabled); }
.feat-icon { color: #22c55e; flex-shrink: 0; }
.features-list li.dimmed .feat-icon { color: var(--va-text-disabled); }

.plan-btn {
  border-radius: 12px !important;
  font-weight: 700 !important;
  padding: 0.8rem !important;
  transition: all 0.3s !important;
}

.upgrade-btn {
  background: #22c55e !important;
  color: #fff !important;
  box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3) !important;
}

.upgrade-btn:hover {
  background: #10b981 !important;
  box-shadow: 0 8px 25px rgba(34, 197, 94, 0.4) !important;
}

.current-btn { background: var(--va-background-element) !important; color: var(--va-text-secondary) !important; border: 1px solid var(--va-background-border) !important; }

/* Payment Modal */
.modal-header { display: flex; align-items: center; gap: 1rem; padding-bottom: 1rem; }
.modal-title { font-size: 1.5rem; font-weight: 800; color: #fff; margin: 0; }
.payment-modal-body { padding: 1rem 0; }
.order-summary {
  background: var(--va-background-element);
  padding: 1.25rem;
  border-radius: 14px;
  border: 1px solid var(--va-background-border);
  margin-bottom: 1.5rem;
}
.order-label { font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 0.5rem; }
.order-plan-details { display: flex; justify-content: space-between; align-items: center; }
.order-plan-name { font-size: 1.1rem; font-weight: 700; color: var(--va-text-primary); }
.order-plan-price { font-size: 1.1rem; font-weight: 800; color: #22c55e; }

.payment-instructions { display: flex; gap: 1rem; color: var(--va-text-secondary); font-size: 0.85rem; line-height: 1.5; align-items: center; }
.instr-icon { color: #22c55e; }

.payment-input { margin-bottom: 1rem; }

.modal-footer-btns { display: grid; grid-template-columns: 1fr 2.5fr; gap: 1rem; width: 100%; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 1.5rem; }
.cancel-btn { border-radius: 12px !important; }
.confirm-btn {
  background: #22c55e !important; color: #fff !important;
  border-radius: 12px !important; font-weight: 700 !important;
  box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3) !important;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
  70% { transform: scale(1.1); box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}

@media (max-width: 768px) {
  .title { font-size: 2.25rem; }
  .current-subscription-content { flex-direction: column; text-align: center; }
  .subscription-header { flex-direction: column; align-items: center; gap: 1rem; }
  .days-remaining { text-align: center; }
  .subscription-footer { flex-direction: column; gap: 0.75rem; }
  .modal-footer-btns { grid-template-columns: 1fr; }
}
</style>

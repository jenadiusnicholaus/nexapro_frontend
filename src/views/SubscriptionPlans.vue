<template>
  <div class="subscription-plans-page">
    <div class="page-header">
      <h1 class="title">Subscription Plans</h1>
      <p class="subtitle">Choose the plan that fits your needs</p>
    </div>

    <!-- Loading State -->
    <VaAlert v-if="subscriptionsStore.loading" color="info">
      Loading subscription plans...
    </VaAlert>

    <!-- Error State -->
    <VaAlert v-if="subscriptionsStore.error" color="danger">
      {{ subscriptionsStore.error }}
    </VaAlert>

    <!-- Current Subscription Card -->
    <VaCard
      v-if="profilesStore.profile?.subscription?.plan"
      class="current-subscription-card mb-4"
    >
      <VaCardContent>
        <div class="current-subscription-content">
          <div class="subscription-icon">
            <VaIcon name="workspace_premium" size="3rem" color="#667eea" />
          </div>
          <div class="subscription-details">
            <div class="subscription-header">
              <h3>Your Current Plan</h3>
              <VaBadge
                :text="
                  profilesStore.profile?.subscription?.status?.toUpperCase()
                "
                :color="
                  profilesStore.profile?.subscription?.is_expired
                    ? 'danger'
                    : 'success'
                "
                size="large"
              />
            </div>
            <div class="subscription-info">
              <div class="plan-name">
                {{ profilesStore.profile?.subscription?.plan?.name }}
              </div>
              <div class="plan-details">
                <div class="detail-item">
                  <VaIcon name="calendar_today" size="small" />
                  <span
                    >{{
                      profilesStore.profile?.subscription?.days_remaining
                    }}
                    days remaining</span
                  >
                </div>
                <div class="detail-item">
                  <VaIcon name="event" size="small" />
                  <span
                    >Expires:
                    {{
                      new Date(
                        profilesStore.profile?.subscription?.end_date,
                      ).toLocaleDateString()
                    }}</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </VaCardContent>
    </VaCard>

    <div class="plans-grid">
      <VaCard
        v-for="plan in subscriptionsStore.plans"
        :key="plan.id"
        class="plan-card"
        :class="{ 'current-plan': isCurrentPlan(plan.id) }"
        :style="
          isCurrentPlan(plan.id)
            ? {
                border: '3px solid #4299e1',
                backgroundColor: '#ebf8ff',
                boxShadow: '0 8px 16px rgba(66, 153, 225, 0.2)',
              }
            : {}
        "
      >
        <VaCardTitle>
          <div class="plan-header">
            <h3>{{ plan.name }}</h3>
            <VaBadge
              v-if="isCurrentPlan(plan.id)"
              text="CURRENT PLAN"
              color="primary"
              size="large"
            />
          </div>
        </VaCardTitle>
        <VaCardContent>
          <div class="plan-price">
            <span class="price">{{ plan.price }}</span>
            <span class="currency">{{ plan.currency }}</span>
            <span class="duration" v-if="parseFloat(plan.price) > 0"
              >/{{ plan.duration_days }} days</span
            >
          </div>

          <p class="plan-description">{{ plan.description }}</p>

          <div class="plan-features">
            <h4>Features:</h4>
            <ul>
              <li>
                <VaIcon name="check_circle" color="success" size="small" />
                {{ plan.max_properties }} Properties
              </li>
              <li>
                <VaIcon name="check_circle" color="success" size="small" />
                {{ plan.max_units }} Units
              </li>
              <li>
                <VaIcon name="check_circle" color="success" size="small" />
                {{ plan.max_tenants }} Tenants
              </li>
              <li>
                <VaIcon name="check_circle" color="success" size="small" />
                {{ plan.sms_notifications ? "SMS" : "No" }} Notifications
              </li>
              <li>
                <VaIcon name="check_circle" color="success" size="small" />
                {{ plan.contract_generation ? "Contract" : "No" }} Generation
              </li>
              <li>
                <VaIcon name="check_circle" color="success" size="small" />
                {{ plan.payment_tracking ? "Payment" : "No" }} Tracking
              </li>
              <li>
                <VaIcon name="check_circle" color="success" size="small" />
                {{ plan.reports_analytics ? "Reports" : "No" }} & Analytics
              </li>
              <li>
                <VaIcon name="check_circle" color="success" size="small" />
                {{ plan.priority_support ? "Priority" : "Standard" }} Support
              </li>
            </ul>
          </div>

          <VaButton
            v-if="!isCurrentPlan(plan.id) && !plan.is_free_tier"
            color="primary"
            @click.stop.prevent="selectPlan(plan)"
            block
          >
            Upgrade
          </VaButton>

          <VaButton
            v-else-if="isCurrentPlan(plan.id) && !plan.is_free_tier"
            color="success"
            disabled
            block
          >
            Current Plan
          </VaButton>
        </VaCardContent>
      </VaCard>
    </div>
  </div>

  <!-- Payment Modal -->
  <VaModal v-model="showPaymentModal" title="Complete Payment" size="small">
    <div class="payment-form" v-if="selectedPlan">
      <p class="mb-4">
        You are upgrading to <strong>{{ selectedPlan.name }}</strong> for
        <strong>{{ selectedPlan.price }} {{ selectedPlan.currency }}</strong>
      </p>

      <VaAlert color="info" class="mb-4">
        Enter your mobile money details to complete the subscription
      </VaAlert>

      <VaInput
        v-model="paymentData.account_number"
        label="Phone Number"
        placeholder="0712345678"
        class="mb-4"
        :rules="[
          (v: string) => !!v || 'Phone number is required',
          (v: string) =>
            /^\d{9,12}$/.test(v.replace(/[^\d]/g, '')) ||
            'Invalid phone number format',
        ]"
      />

      <VaSelect
        v-model="paymentData.provider"
        label="Mobile Money Provider"
        value-by="value"
        text-by="text"
        :options="[
          { text: 'M-Pesa', value: 'mpesa' },
          { text: 'Airtel Money', value: 'airtel' },
          { text: 'Tigo Pesa', value: 'tigo' },
          { text: 'Halopesa', value: 'halopesa' },
          { text: 'Azampesa', value: 'azampesa' },
        ]"
        class="mb-4"
        :rules="[(v: any) => !!v || 'Provider is required']"
      />
    </div>

    <template #footer>
      <VaButton preset="secondary" @click="showPaymentModal = false">
        Cancel
      </VaButton>
      <VaButton :loading="subscriptionsStore.loading" @click="processUpgrade">
        Confirm Payment
      </VaButton>
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

const paymentData = ref({
  account_number: "",
  provider: "mpesa",
});

const isCurrentPlan = (planId: number) => {
  // Use profile data which contains subscription
  const currentPlanId = profilesStore.profile?.subscription?.plan?.id;
  const isCurrent = currentPlanId === planId;
  return isCurrent;
};

const loadPlans = async () => {
  try {
    await subscriptionsStore.fetchPlans();
  } catch (err: any) {
    console.error("Failed to load plans:", err);
    error("Failed to load subscription plans. Please try again later.");
  }
};

const fetchCurrentSubscription = async () => {
  try {
    await subscriptionsStore.fetchCurrentSubscription();
  } catch (err: any) {
    console.error("Failed to fetch current subscription:", err);
    // Don't show error to user for this call, it's optional
  }
};

const checkPaymentStatus = async (paymentId: number) => {
  try {
    return await subscriptionsStore.checkPaymentStatus(paymentId);
  } catch (err: any) {
    console.error("Failed to check payment status:", err);
    return null;
  }
};

const selectPlan = (plan: any) => {
  if (!plan) return;

  selectedPlan.value = plan;

  // Reset payment data
  paymentData.value = {
    account_number: "",
    provider: "mpesa",
  };

  // Open modal
  showPaymentModal.value = true;
};

const processUpgrade = async () => {
  if (!selectedPlan.value) return;

  try {
    const data = await subscriptionsStore.upgradeSubscription({
      plan_id: selectedPlan.value.id,
      account_number: paymentData.value.account_number,
      provider: paymentData.value.provider,
    });

    if (data.success) {
      let message = `Successfully upgraded to ${selectedPlan.value.name}!`;

      if (data.status === "pending") {
        message = `Payment initiated! USSD push sent to ${paymentData.value.account_number}. Please complete the payment.`;
      } else if (data.status === "completed") {
        message = `Successfully upgraded to ${selectedPlan.value.name}!`;
      }

      success(message);
      showPaymentModal.value = false;

      // Refresh profile to get updated subscription
      await profilesStore.fetchCurrentProfile();

      // Redirect to profile
      router.push("/admin/profiles");
    } else {
      error(data.message || "Upgrade failed. Please try again.");
    }
  } catch (err: any) {
    console.error("Subscription upgrade error:", err);
    const errorMessage =
      err.response?.data?.error ||
      err.response?.data?.message ||
      "Payment failed. Please try again.";
    error(errorMessage);
  }
};

onMounted(() => {
  loadPlans();
  profilesStore.fetchCurrentProfile();
  fetchCurrentSubscription();
});
</script>

<style scoped>
.subscription-plans-page {
  padding: 2rem 1rem;
  max-width: 1400px;
  margin: 0 auto;
  background: #f8f9fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 3rem;
  text-align: center;
}

.title {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
}

.subtitle {
  margin: 1rem 0 0;
  font-size: 1.125rem;
  color: #4a5568;
  font-weight: 400;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.plan-card {
  border: none;
  border-radius: 16px;
  transition: all 0.3s ease;
  background: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  overflow: hidden;
  position: relative;
}

.plan-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
}

.plan-card.current-plan {
  border: 3px solid #4299e1;
  background: #ebf8ff;
  box-shadow: 0 8px 16px rgba(66, 153, 225, 0.2);
}

.plan-card.current-plan::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: #4299e1;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 0;
}

.plan-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.plan-price {
  margin: 1.5rem 0;
  padding: 1.5rem;
  background: #f7fafc;
  border-radius: 12px;
  text-align: center;
  border: 1px solid #e2e8f0;
}

.price {
  font-size: 3rem;
  font-weight: 800;
  color: #2d3748;
  display: block;
  line-height: 1;
}

.currency {
  font-size: 1.25rem;
  color: #718096;
  margin-left: 0.5rem;
}

.duration {
  display: block;
  font-size: 0.875rem;
  color: #718096;
  margin-top: 0.5rem;
  font-weight: 500;
}

.plan-description {
  margin: 1rem 0;
  color: #4a5568;
  line-height: 1.6;
  font-size: 0.95rem;
}

.plan-features {
  margin: 1.5rem 0;
}

.plan-features h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.plan-features ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.plan-features li {
  padding: 0.75rem 0;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #4a5568;
  font-size: 0.95rem;
}

.plan-features li:last-child {
  border-bottom: none;
}

.payment-form {
  padding: 1rem 0;
}

.plan-features h4 {
  margin: 0 0 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
}

.plan-features ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.plan-features li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  color: #4a5568;
}

.payment-form {
  padding: 1rem 0;
}

/* Current Subscription Card Styles */
.current-subscription-card {
  background: white;
  border: 2px solid #4299e1;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  position: relative;
}

.current-subscription-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: #4299e1;
  pointer-events: none;
}

.current-subscription-content {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 1rem;
  position: relative;
  z-index: 1;
}

.subscription-icon {
  background: #ebf8ff;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.subscription-details {
  flex: 1;
  color: #2d3748;
}

.subscription-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.subscription-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.subscription-info .plan-name {
  font-size: 2rem;
  font-weight: 800;
  color: #2d3748;
  margin-bottom: 1rem;
}

.plan-details {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4a5568;
  font-size: 0.95rem;
  font-weight: 500;
}

.detail-item .va-icon {
  color: #4299e1;
}

@media (max-width: 768px) {
  .current-subscription-content {
    flex-direction: column;
    text-align: center;
  }

  .subscription-header {
    flex-direction: column;
    gap: 0.5rem;
  }

  .plan-details {
    flex-direction: column;
    gap: 0.75rem;
    align-items: center;
  }
}
</style>

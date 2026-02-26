<template>
  <div class="subscription-plans-page">
    <div class="page-header">
      <h1 class="title">Subscription Plans</h1>
      <p class="subtitle">Choose the plan that fits your needs</p>
    </div>

    <VaAlert color="info" class="mb-4" v-if="currentSubscription">
      <strong>Current Plan:</strong> {{ currentSubscription.plan.name }} -
      {{ currentSubscription.days_remaining }} days remaining
    </VaAlert>

    <div class="plans-grid">
      <VaCard
        v-for="plan in plans"
        :key="plan.id"
        class="plan-card"
        :class="{ 'current-plan': isCurrentPlan(plan.id) }"
      >
        <VaCardTitle>
          <div class="plan-header">
            <h3>{{ plan.name }}</h3>
            <VaBadge
              v-if="isCurrentPlan(plan.id)"
              text="CURRENT"
              color="success"
            />
          </div>
        </VaCardTitle>
        <VaCardContent>
          <div class="plan-price">
            <span class="price">{{ plan.price }}</span>
            <span class="currency">{{ plan.currency }}</span>
            <span class="duration" v-if="plan.price > 0"
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
              <li v-if="plan.sms_notifications">
                <VaIcon name="check_circle" color="success" size="small" /> SMS
                Notifications
              </li>
              <li v-if="plan.contract_generation">
                <VaIcon name="check_circle" color="success" size="small" />
                Contract Generation
              </li>
              <li v-if="plan.payment_tracking">
                <VaIcon name="check_circle" color="success" size="small" />
                Payment Tracking
              </li>
              <li v-if="plan.reports_analytics">
                <VaIcon name="check_circle" color="success" size="small" />
                Reports & Analytics
              </li>
              <li v-if="plan.priority_support">
                <VaIcon name="check_circle" color="success" size="small" />
                Priority Support
              </li>
            </ul>
          </div>

          <VaButton
            v-if="!isCurrentPlan(plan.id) && !plan.is_free_tier"
            color="primary"
            @click="selectPlan(plan)"
            block
          >
            {{ currentSubscription?.plan.is_free_tier ? "Upgrade" : "Switch" }}
            to {{ plan.name }}
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

    <!-- Payment Modal -->
    <VaModal v-model="showPaymentModal" title="Complete Payment" size="small">
      <div class="payment-form" v-if="selectedPlan">
        <p class="mb-4">
          You are upgrading to <strong>{{ selectedPlan.name }}</strong> for
          <strong>{{ selectedPlan.price }} {{ selectedPlan.currency }}</strong>
        </p>

        <VaAlert color="warning" class="mb-4">
          This is a placeholder. Integrate with your payment gateway (M-Pesa,
          etc.)
        </VaAlert>

        <VaInput
          v-model="paymentData.transaction_id"
          label="Transaction ID"
          placeholder="Enter M-Pesa transaction ID"
          class="mb-4"
        />

        <VaSelect
          v-model="paymentData.payment_method"
          label="Payment Method"
          :options="['M-Pesa', 'Bank Transfer', 'Credit Card']"
          class="mb-4"
        />
      </div>

      <template #footer>
        <VaButton preset="secondary" @click="showPaymentModal = false">
          Cancel
        </VaButton>
        <VaButton :loading="processing" @click="processUpgrade">
          Confirm Payment
        </VaButton>
      </template>
    </VaModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAppToast } from "@/composables/useAppToast";
import { useProfilesStore } from "@/stores";
import axios from "axios";

const router = useRouter();
const { success, error } = useAppToast();
const profilesStore = useProfilesStore();

const plans = ref<any[]>([]);
const showPaymentModal = ref(false);
const selectedPlan = ref<any>(null);
const processing = ref(false);

const paymentData = ref({
  transaction_id: "",
  payment_method: "M-Pesa",
});

const currentSubscription = computed(() => profilesStore.profile?.subscription);

const isCurrentPlan = (planId: number) => {
  return currentSubscription.value?.plan.id === planId;
};

const loadPlans = async () => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL || "https://nexaproapi.quantumvision-tech.com/api/v1"}/subscriptions/plans/`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    );
    // Handle paginated response
    plans.value = response.data.results || response.data;
  } catch (err: any) {
    console.error("Failed to load plans:", err);
    error("Failed to load subscription plans. Please try again later.");
  }
};

const selectPlan = (plan: any) => {
  selectedPlan.value = plan;
  showPaymentModal.value = true;
};

const processUpgrade = async () => {
  if (!selectedPlan.value) return;

  processing.value = true;
  try {
    const token = localStorage.getItem("access_token");
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL || "https://nexaproapi.quantumvision-tech.com/api/v1"}/subscriptions/subscriptions/upgrade/`,
      {
        plan_id: selectedPlan.value.id,
        payment_method: paymentData.value.payment_method,
        transaction_id: paymentData.value.transaction_id,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (response.data.success) {
      success(`Successfully upgraded to ${selectedPlan.value.name}!`);
      showPaymentModal.value = false;

      // Refresh profile to get updated subscription
      await profilesStore.fetchCurrentProfile();

      // Redirect to profile
      router.push("/admin/profiles");
    }
  } catch (err: any) {
    error(err.response?.data?.message || "Upgrade failed. Please try again.");
  } finally {
    processing.value = false;
  }
};

onMounted(() => {
  loadPlans();
  profilesStore.fetchCurrentProfile();
});
</script>

<style scoped>
.subscription-plans-page {
  padding: 0 1rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.title {
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
  color: #2d3748;
}

.subtitle {
  margin: 0.5rem 0 0;
  font-size: 1rem;
  color: #718096;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.plan-card {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.plan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.plan-card.current-plan {
  border-color: #667eea;
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.05) 0%,
    rgba(118, 75, 162, 0.05) 100%
  );
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.plan-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.plan-price {
  margin: 1rem 0;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 8px;
  text-align: center;
}

.price {
  font-size: 2.5rem;
  font-weight: 700;
  color: #667eea;
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
  margin-top: 0.25rem;
}

.plan-description {
  margin: 1rem 0;
  color: #4a5568;
  line-height: 1.6;
}

.plan-features {
  margin: 1.5rem 0;
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
</style>

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { subscriptionsAPI } from "@/services/api";

export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: string;
  currency: string;
  duration_days: number;
  max_properties: number;
  max_units: number;
  max_tenants: number;
  sms_notifications: boolean;
  contract_generation: boolean;
  payment_tracking: boolean;
  reports_analytics: boolean;
  priority_support: boolean;
  is_active: boolean;
  is_free_tier: boolean;
  is_popular?: boolean;
}

export interface Subscription {
  id: number;
  plan: SubscriptionPlan;
  status: "active" | "expired" | "pending";
  start_date: string;
  end_date: string;
  days_remaining: number;
  auto_renew: boolean;
  is_active: boolean;
  is_expired: boolean;
}

export interface Payment {
  id: number;
  subscription: number;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed";
  payment_method: string;
  transaction_id?: string;
  created_at: string;
  provider: string;
}

export const useSubscriptionsStore = defineStore("subscriptions", () => {
  // State
  const plans = ref<SubscriptionPlan[]>([]);
  const currentSubscription = ref<Subscription | null>(null);
  const payments = ref<Payment[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Actions
  const fetchPlans = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await subscriptionsAPI.getPlans();
      // Handle paginated response - API returns { count, next, previous, results }
      plans.value = response.data.results || response.data;
    } catch (err: any) {
      error.value =
        err.response?.data?.message || "Failed to fetch subscription plans";
      console.error("Failed to fetch plans:", err);
    } finally {
      loading.value = false;
    }
  };

  const fetchCurrentSubscription = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await subscriptionsAPI.getCurrentSubscription();
      // API returns subscription object or array
      const subscriptionData = response.data;
      if (Array.isArray(subscriptionData)) {
        currentSubscription.value = subscriptionData[0] || null;
      } else {
        currentSubscription.value = subscriptionData;
      }
    } catch (err: any) {
      // Don't set error for this call - user might not have subscription yet
      currentSubscription.value = null;
      console.error("Failed to fetch current subscription:", err);
    } finally {
      loading.value = false;
    }
  };

  const upgradeSubscription = async (data: {
    plan_id: number;
    account_number: string;
    provider: string;
  }) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await subscriptionsAPI.upgradeSubscription(data);

      // Refresh subscription data after upgrade
      await fetchCurrentSubscription();

      return response.data;
    } catch (err: any) {
      error.value =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to upgrade subscription";
      console.error("Failed to upgrade subscription:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const renewSubscription = async (data: {
    plan_id: number;
    account_number: string;
    provider: string;
  }) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await subscriptionsAPI.renewSubscription(data);

      // Refresh subscription data after renewal
      await fetchCurrentSubscription();

      return response.data;
    } catch (err: any) {
      error.value =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to renew subscription";
      console.error("Failed to renew subscription:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchPaymentHistory = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await subscriptionsAPI.getPaymentHistory();
      payments.value = response.data.results || response.data;
    } catch (err: any) {
      error.value =
        err.response?.data?.message || "Failed to fetch payment history";
      console.error("Failed to fetch payment history:", err);
    } finally {
      loading.value = false;
    }
  };

  const checkPaymentStatus = async (paymentId: number) => {
    try {
      const response = await subscriptionsAPI.getPayment(paymentId);
      return response.data;
    } catch (err: any) {
      console.error("Failed to check payment status:", err);
      return null;
    }
  };

  // Getters
  const isSubscribed = computed(() => {
    return (
      currentSubscription.value &&
      currentSubscription.value.is_active &&
      !currentSubscription.value.is_expired &&
      currentSubscription.value.days_remaining > 0
    );
  });

  const isExpired = computed(() => {
    return (
      currentSubscription.value &&
      (currentSubscription.value.is_expired ||
        currentSubscription.value.days_remaining <= 0)
    );
  });

  const currentPlan = computed(() => {
    return currentSubscription.value?.plan || null;
  });

  const freePlan = computed(() => {
    return plans.value.find((plan) => plan.is_free_tier);
  });

  const paidPlans = computed(() => {
    return plans.value.filter((plan) => !plan.is_free_tier);
  });

  return {
    // State
    plans,
    currentSubscription,
    payments,
    loading,
    error,

    // Actions
    fetchPlans,
    fetchCurrentSubscription,
    upgradeSubscription,
    renewSubscription,
    fetchPaymentHistory,
    checkPaymentStatus,

    // Getters
    isSubscribed,
    isExpired,
    currentPlan,
    freePlan,
    paidPlans,
  };
});

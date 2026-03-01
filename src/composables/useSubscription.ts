import { computed } from "vue";
import { useRouter } from "vue-router";
import { useProfilesStore } from "@/stores";
import { useAppToast } from "./useAppToast";

/** Feature keys that map to SubscriptionPlan boolean flags */
export type SubscriptionFeature =
  | "sms_notifications"
  | "contract_generation"
  | "payment_tracking"
  | "reports_analytics"
  | "priority_support";

/** Human-readable labels for upgrade prompts */
const FEATURE_LABELS: Record<SubscriptionFeature, string> = {
  sms_notifications: "SMS Notifications",
  contract_generation: "Contract Generation",
  payment_tracking: "Payment Tracking",
  reports_analytics: "Reports & Analytics",
  priority_support: "Priority Support",
};

export function useSubscription() {
  const profilesStore = useProfilesStore();
  const router = useRouter();
  const { error: showError } = useAppToast();

  // ── Core refs ──────────────────────────────────────────────
  const subscription = computed(() => profilesStore.profile?.subscription);
  const plan = computed(() => subscription.value?.plan);

  const isExpired = computed(() => {
    return (
      subscription.value?.is_expired || subscription.value?.status === "expired"
    );
  });

  const daysRemaining = computed(() => {
    return subscription.value?.days_remaining || 0;
  });

  const isFreeTier = computed(() => {
    return plan.value?.is_free_tier || false;
  });

  // ── Feature-flag helpers ───────────────────────────────────
  const permissions = computed(() => profilesStore.profile?.permissions || {});

  /** Generic check – returns true if the user's permissions allow the given feature */
  const hasFeature = (feature: SubscriptionFeature): boolean => {
    if (isExpired.value) return false;

    // Map the feature string to the corresponding permission key
    const permissionMap: Record<SubscriptionFeature, string> = {
      payment_tracking: "can_manage_payments",
      sms_notifications: "can_manage_notifications",
      contract_generation: "can_generate_bills", // Using this as closest match for now
      reports_analytics: "can_manage_payments", // Temporary fallback if specific analytics permission is missing
      priority_support: "can_manage_all_owners", // Temporary fallback
    };

    const permKey = permissionMap[feature];
    return !!permissions.value[permKey];
  };

  const hasPaymentTracking = computed(() => hasFeature("payment_tracking"));
  const hasContractGeneration = computed(() => hasFeature("contract_generation"));
  const hasSmsNotifications = computed(() => hasFeature("sms_notifications"));
  const hasReportsAnalytics = computed(() => hasFeature("reports_analytics"));
  const hasPrioritySupport = computed(() => hasFeature("priority_support"));

  // ── Limit helpers ──────────────────────────────────────────
  const maxProperties = computed(() => plan.value?.max_properties ?? 0);
  const maxUnits = computed(() => plan.value?.max_units ?? 0);
  const maxTenants = computed(() => plan.value?.max_tenants ?? 0);

  const canCreateProperty = computed(() => {
    if (isExpired.value) return false;
    return true; // Actual limit check is done by backend
  });

  const canCreateUnit = computed(() => {
    if (isExpired.value) return false;
    return true;
  });

  const canCreateTenant = computed(() => {
    if (isExpired.value) return false;
    return true;
  });

  // ── Upgrade prompts ────────────────────────────────────────
  const showUpgradePrompt = (feature?: SubscriptionFeature) => {
    const label = feature ? FEATURE_LABELS[feature] : "this feature";
    const planName = plan.value?.name || "your current plan";
    showError(
      `${label} is not available on ${planName}. Please upgrade your subscription.`,
    );
    router.push({ name: "subscription-plans" });
  };

  const checkSubscriptionAccess = (
    action: string = "perform this action",
  ): boolean => {
    if (isExpired.value) {
      showError(
        `Your ${plan.value?.name || "subscription"} has expired. Please upgrade to ${action}.`,
      );
      router.push({ name: "subscription-plans" });
      return false;
    }
    return true;
  };

  /**
   * Check whether the current plan includes a specific feature.
   * If not, show an upgrade prompt and return false.
   */
  const requireFeature = (feature: SubscriptionFeature): boolean => {
    if (!hasFeature(feature)) {
      showUpgradePrompt(feature);
      return false;
    }
    return true;
  };

  const handleLimitError = (errorMessage: string) => {
    showError(errorMessage);
    router.push({ name: "subscription-plans" });
  };

  const handleApiError = (error: any) => {
    if (error.response?.status === 403) {
      const errorMessage = error.response?.data?.detail || "Access denied";

      if (
        errorMessage.includes("expired") ||
        errorMessage.includes("subscription")
      ) {
        checkSubscriptionAccess();
      } else if (errorMessage.includes("limit")) {
        handleLimitError(errorMessage);
      } else {
        showError(errorMessage);
      }
      return true;
    }
    return false;
  };

  return {
    // Core
    subscription,
    plan,
    isExpired,
    daysRemaining,
    isFreeTier,

    // Feature flags
    hasFeature,
    hasPaymentTracking,
    hasContractGeneration,
    hasSmsNotifications,
    hasReportsAnalytics,
    hasPrioritySupport,

    // Limits
    maxProperties,
    maxUnits,
    maxTenants,
    canCreateProperty,
    canCreateUnit,
    canCreateTenant,

    // Actions
    showUpgradePrompt,
    requireFeature,
    checkSubscriptionAccess,
    handleLimitError,
    handleApiError,
  };
}

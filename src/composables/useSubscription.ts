import { computed } from "vue";
import { useProfilesStore } from "@/stores";
import { useAppToast } from "./useAppToast";

export function useSubscription() {
  const profilesStore = useProfilesStore();
  const { error: showError } = useAppToast();

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

  const canCreateProperty = computed(() => {
    if (isExpired.value) return false;
    return true; // Actual limit check is done by backend
  });

  const canCreateUnit = computed(() => {
    if (isExpired.value) return false;
    return true; // Actual limit check is done by backend
  });

  const canCreateTenant = computed(() => {
    if (isExpired.value) return false;
    return true; // Actual limit check is done by backend
  });

  const checkSubscriptionAccess = (
    action: string = "perform this action",
  ): boolean => {
    if (isExpired.value) {
      const message = `Your ${plan.value?.name || "subscription"} has expired. Please upgrade to ${action}.`;
      const shouldUpgrade = confirm(`${message}\n\nClick OK to upgrade now.`);

      if (shouldUpgrade) {
        window.location.href = "/subscription/upgrade";
      }
      return false;
    }
    return true;
  };

  const handleLimitError = (errorMessage: string) => {
    const shouldViewPlans = confirm(
      `${errorMessage}\n\nClick OK to view available plans.`,
    );

    if (shouldViewPlans) {
      window.location.href = "/subscription/plans";
    }
  };

  const handleApiError = (error: any) => {
    if (error.response?.status === 403) {
      const errorMessage = error.response?.data?.detail || "Access denied";

      // Check if it's a subscription error
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
    subscription,
    plan,
    isExpired,
    daysRemaining,
    isFreeTier,
    canCreateProperty,
    canCreateUnit,
    canCreateTenant,
    checkSubscriptionAccess,
    handleLimitError,
    handleApiError,
  };
}

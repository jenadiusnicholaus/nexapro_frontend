# Subscription Implementation Guide

## ✅ Completed Features

### 1. Profile Page with Subscription Display

**File:** `/src/views/Profiles.vue`

**Features:**

- ✅ Subscription status alerts (expired/expiring soon)
- ✅ Current plan display with gradient design
- ✅ Plan limits display (properties, units, tenants)
- ✅ Days remaining counter
- ✅ Upgrade/Renew buttons
- ✅ Formatted dates

**Usage:**

```vue
<!-- Automatic display when profile loads -->
<!-- Shows subscription card if profile.subscription exists -->
```

---

### 2. Subscription Access Control Composable

**File:** `/src/composables/useSubscription.ts`

**Features:**

- ✅ Check if subscription is expired
- ✅ Check days remaining
- ✅ Handle 403 errors from API
- ✅ Show upgrade prompts
- ✅ Handle limit errors

**Usage Example:**

```typescript
import { useSubscription } from "@/composables/useSubscription";

const {
  subscription,
  plan,
  isExpired,
  daysRemaining,
  checkSubscriptionAccess,
  handleApiError,
} = useSubscription();

// Before creating a property
const createProperty = async () => {
  // Check access first
  if (!checkSubscriptionAccess("create properties")) {
    return; // Shows upgrade dialog if expired
  }

  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/properties/`,
      propertyData,
    );
    // Success
  } catch (error) {
    // Handle subscription/limit errors automatically
    if (handleApiError(error)) {
      return; // Error was subscription-related
    }
    // Handle other errors
  }
};
```

---

### 3. Subscription Plans Page

**File:** `/src/views/SubscriptionPlans.vue`

**Features:**

- ✅ Display all available plans
- ✅ Show current plan badge
- ✅ Plan comparison grid
- ✅ Feature lists
- ✅ Upgrade/switch functionality
- ✅ Payment modal (placeholder)

**Route:** `/subscription/plans` or `/subscription/upgrade`

---

## 🔧 How to Use in Your Components

### Example 1: Properties Component

```vue
<script setup lang="ts">
import { useSubscription } from "@/composables/useSubscription";
import { useAppToast } from "@/composables/useAppToast";

const { checkSubscriptionAccess, handleApiError } = useSubscription();
const { success, error } = useAppToast();

const createProperty = async () => {
  // Check subscription before showing form
  if (!checkSubscriptionAccess("create properties")) {
    return;
  }

  // Show create modal
  showCreateModal.value = true;
};

const saveProperty = async () => {
  try {
    const response = await propertiesAPI.create(formData.value);
    success("Property created successfully!");
  } catch (err: any) {
    // Automatically handles subscription errors
    if (!handleApiError(err)) {
      error("Failed to create property");
    }
  }
};
</script>
```

---

### Example 2: Units Component

```vue
<script setup lang="ts">
import { useSubscription } from "@/composables/useSubscription";

const { checkSubscriptionAccess, handleApiError } = useSubscription();

const handleAddUnit = async () => {
  if (!checkSubscriptionAccess("create units")) {
    return;
  }

  try {
    await unitsAPI.create(unitData);
  } catch (error) {
    handleApiError(error); // Shows appropriate error message
  }
};
</script>
```

---

### Example 3: Display Subscription Info in Dashboard

```vue
<template>
  <div class="dashboard">
    <!-- Subscription Alert -->
    <VaAlert v-if="isExpired" color="danger">
      Your subscription has expired.
      <router-link to="/subscription/upgrade">Upgrade now</router-link>
    </VaAlert>

    <VaAlert v-else-if="daysRemaining <= 7" color="warning">
      Your subscription expires in {{ daysRemaining }} days.
      <router-link to="/subscription/renew">Renew now</router-link>
    </VaAlert>

    <!-- Plan Usage -->
    <div class="usage-stats">
      <div class="stat-card">
        <h4>Properties</h4>
        <p>{{ propertiesCount }} / {{ plan?.max_properties }}</p>
      </div>
      <div class="stat-card">
        <h4>Units</h4>
        <p>{{ unitsCount }} / {{ plan?.max_units }}</p>
      </div>
      <div class="stat-card">
        <h4>Tenants</h4>
        <p>{{ tenantsCount }} / {{ plan?.max_tenants }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSubscription } from "@/composables/useSubscription";

const { subscription, plan, isExpired, daysRemaining } = useSubscription();
</script>
```

---

## 📋 API Error Handling

The backend returns these errors when limits are reached:

### Subscription Expired

```json
{
  "detail": "Your Free Trial subscription has expired. Please upgrade to continue using NexaPro features."
}
```

### Property Limit Reached

```json
{
  "detail": "Property limit reached (1). Upgrade to Basic to add more properties."
}
```

### Unit Limit Reached

```json
{
  "detail": "Unit limit reached (5). Upgrade to Basic to add more units."
}
```

### Tenant Limit Reached

```json
{
  "detail": "Tenant limit reached (10). Upgrade to Basic to add more tenants."
}
```

The `handleApiError()` function automatically detects these and shows appropriate dialogs.

---

## 🎨 Styling

All subscription components use consistent styling:

- **Primary color:** `#667eea` (purple)
- **Gradient:** `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- **Success:** Green badges for active subscriptions
- **Warning:** Orange/yellow for expiring soon
- **Danger:** Red for expired subscriptions

---

## 🚀 Next Steps

### To Complete Implementation:

1. **Add Routes** (in `/src/router/index.ts`):

```typescript
{
  path: '/subscription',
  children: [
    {
      path: 'plans',
      name: 'subscription-plans',
      component: () => import('@/views/SubscriptionPlans.vue'),
    },
    {
      path: 'upgrade',
      redirect: '/subscription/plans',
    },
    {
      path: 'renew',
      redirect: '/subscription/plans',
    },
  ],
},
```

2. **Update Components** to use `useSubscription()`:
   - Properties.vue
   - Units.vue
   - Tenants.vue
   - Tenancies.vue

3. **Add Dashboard Widget** showing subscription status

4. **Integrate Payment Gateway**:
   - Replace placeholder in SubscriptionPlans.vue
   - Add M-Pesa/payment provider integration

---

## 📊 Data Flow

```
1. User logs in
   ↓
2. Profile API returns subscription data
   ↓
3. Profile store saves subscription
   ↓
4. useSubscription() composable provides reactive access
   ↓
5. Components check access before actions
   ↓
6. Backend enforces limits (403 errors)
   ↓
7. Frontend handles errors gracefully
   ↓
8. User upgrades if needed
```

---

## ✨ Summary

**Implemented:**

- ✅ Profile page with full subscription display
- ✅ Subscription access control composable
- ✅ Plans page with upgrade functionality
- ✅ Error handling for API limits
- ✅ Beautiful UI with alerts and badges

**Ready to Use:**

- Import `useSubscription()` in any component
- Call `checkSubscriptionAccess()` before actions
- Use `handleApiError()` in catch blocks
- Display subscription info from profile store

**All subscription logic is now centralized and reusable!** 🎉

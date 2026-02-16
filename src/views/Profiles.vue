<template>
  <div class="profile-page">
    <!-- Header -->
    <div class="profile-header">
      <div>
        <h1 class="title">My Profile</h1>
        <p class="subtitle">Account and owner information</p>
      </div>
      <VaButton icon="edit" @click="showEditModal = true">
        Edit Profile
      </VaButton>
    </div>

    <!-- Subscription Banner -->
    <VaAlert
      v-if="profile?.subscription?.is_expired"
      color="danger"
      class="mb-4"
      border="top"
    >
      <div class="subscription-alert">
        <div>
          <strong>Subscription Expired</strong>
          <p>
            Your {{ profile.subscription.plan.name }} has expired. Upgrade now
            to continue using NexaPro features.
          </p>
        </div>
        <VaButton color="danger" @click="goToUpgrade">Upgrade Now</VaButton>
      </div>
    </VaAlert>

    <VaAlert
      v-else-if="
        profile?.subscription && profile.subscription.days_remaining <= 7
      "
      color="warning"
      class="mb-4"
      border="top"
    >
      <div class="subscription-alert">
        <div>
          <strong>Subscription Expiring Soon</strong>
          <p>
            Your {{ profile.subscription.plan.name }} expires in
            {{ profile.subscription.days_remaining }} days.
          </p>
        </div>
        <VaButton color="warning" @click="goToRenew">Renew Now</VaButton>
      </div>
    </VaAlert>

    <!-- Main Profile Card -->
    <VaCard class="profile-card">
      <VaCardContent>
        <div class="profile-content">
          <!-- Left: Avatar and Basic Info -->
          <div class="profile-main">
            <div class="avatar-section">
              <div class="avatar-wrapper">
                <img
                  v-if="profile?.image"
                  :src="profile.image"
                  alt="Profile avatar"
                  class="avatar-image"
                />
                <div v-else class="avatar">{{ initials }}</div>
                <label class="avatar-upload">
                  <input
                    type="file"
                    accept="image/*"
                    @change="handleAvatarUpload"
                    style="display: none"
                  />
                  <VaIcon name="camera_alt" size="small" />
                </label>
              </div>
              <div class="user-info">
                <h2 class="user-name">{{ profile?.owner?.name }}</h2>
                <p class="user-email">{{ profile?.user?.email }}</p>
                <VaBadge :text="profile?.role?.toUpperCase()" color="primary" />
              </div>
            </div>
          </div>

          <!-- Right: Details Grid -->
          <div class="profile-details">
            <div class="detail-row">
              <div class="detail-item">
                <VaIcon name="business" class="detail-icon" />
                <div>
                  <span class="detail-label">Owner Type</span>
                  <span class="detail-value">{{
                    profile?.owner?.owner_type || "N/A"
                  }}</span>
                </div>
              </div>
              <div class="detail-item">
                <VaIcon name="phone" class="detail-icon" />
                <div>
                  <span class="detail-label">Phone</span>
                  <span class="detail-value">{{
                    profile?.owner?.phone || "N/A"
                  }}</span>
                </div>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-item">
                <VaIcon name="person" class="detail-icon" />
                <div>
                  <span class="detail-label">Username</span>
                  <span class="detail-value">{{
                    profile?.user?.username || "N/A"
                  }}</span>
                </div>
              </div>
              <div class="detail-item">
                <VaIcon name="mail" class="detail-icon" />
                <div>
                  <span class="detail-label">Email</span>
                  <span class="detail-value">{{
                    profile?.owner?.email || "N/A"
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Subscription Card -->
    <VaCard v-if="profile?.subscription" class="subscription-card mt-4">
      <VaCardTitle>
        <div class="card-title-flex">
          <div>
            <VaIcon name="card_membership" class="mr-2" />
            Current Subscription
          </div>
          <VaBadge
            :text="profile.subscription.status.toUpperCase()"
            :color="profile.subscription.is_expired ? 'danger' : 'success'"
          />
        </div>
      </VaCardTitle>
      <VaCardContent>
        <div class="subscription-content">
          <!-- Plan Info -->
          <div class="plan-info">
            <h3 class="plan-name">{{ profile.subscription.plan.name }}</h3>
            <p class="plan-price">
              {{ profile.subscription.plan.price }}
              {{ profile.subscription.plan.currency }}
              <span v-if="profile.subscription.plan.price > 0"
                >/{{ profile.subscription.plan.duration_days }} days</span
              >
              <span v-else>Free Trial</span>
            </p>
            <div class="plan-dates">
              <div class="date-item">
                <VaIcon name="event" size="small" />
                <span
                  >Started:
                  {{ formatDate(profile.subscription.start_date) }}</span
                >
              </div>
              <div class="date-item">
                <VaIcon name="event_available" size="small" />
                <span
                  >Expires:
                  {{ formatDate(profile.subscription.end_date) }}</span
                >
              </div>
              <div
                class="date-item"
                :class="{
                  'text-danger': profile.subscription.days_remaining <= 7,
                }"
              >
                <VaIcon name="schedule" size="small" />
                <span
                  ><strong
                    >{{ profile.subscription.days_remaining }} days
                    remaining</strong
                  ></span
                >
              </div>
            </div>
          </div>

          <!-- Plan Limits -->
          <div class="plan-limits">
            <h4 class="limits-title">Plan Limits</h4>
            <div class="limits-grid">
              <div class="limit-item">
                <VaIcon name="business" color="primary" />
                <div class="limit-details">
                  <span class="limit-label">Properties</span>
                  <span class="limit-value">{{
                    profile.subscription.plan.max_properties
                  }}</span>
                </div>
              </div>
              <div class="limit-item">
                <VaIcon name="home" color="primary" />
                <div class="limit-details">
                  <span class="limit-label">Units</span>
                  <span class="limit-value">{{
                    profile.subscription.plan.max_units
                  }}</span>
                </div>
              </div>
              <div class="limit-item">
                <VaIcon name="people" color="primary" />
                <div class="limit-details">
                  <span class="limit-label">Tenants</span>
                  <span class="limit-value">{{
                    profile.subscription.plan.max_tenants
                  }}</span>
                </div>
              </div>
            </div>

            <div
              class="upgrade-section"
              v-if="
                profile.subscription.plan.is_free_tier ||
                profile.subscription.days_remaining <= 7
              "
            >
              <VaButton
                v-if="profile.subscription.plan.is_free_tier"
                color="primary"
                @click="goToUpgrade"
                block
              >
                <VaIcon name="upgrade" class="mr-2" />
                Upgrade for More Features
              </VaButton>
              <VaButton v-else color="primary" @click="goToRenew" block>
                <VaIcon name="refresh" class="mr-2" />
                Renew Subscription
              </VaButton>
            </div>
          </div>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Edit Profile Modal -->
    <VaModal v-model="showEditModal" title="Edit Profile" size="small">
      <VaForm ref="formRef" @submit.prevent="saveProfile">
        <VaInput
          v-model="formData.name"
          label="Name"
          placeholder="Enter your name"
          class="mb-4"
          required
        />
        <VaInput
          v-model="formData.email"
          label="Email"
          placeholder="Enter your email"
          type="email"
          class="mb-4"
          required
        />
        <PhoneInput v-model="formData.phone" label="Phone" class="mb-4" />
      </VaForm>

      <template #footer>
        <VaButton preset="secondary" @click="showEditModal = false">
          Cancel
        </VaButton>
        <VaButton :loading="saving" @click="saveProfile">
          Save Changes
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
import PhoneInput from "@/components/PhoneInput.vue";

const { success, error } = useAppToast();
const profilesStore = useProfilesStore();
const router = useRouter();

const profile = ref<any>(null);
const showEditModal = ref(false);
const saving = ref(false);

const formData = ref({
  name: "",
  email: "",
  phone: "",
});

const initials = computed(() => {
  const name = profile.value?.owner?.name || "";
  return name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();
});

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const goToUpgrade = () => {
  router.push("/admin/subscription/upgrade");
};

const goToRenew = () => {
  router.push("/admin/subscription/renew");
};

const loadProfile = async () => {
  try {
    const data: any = await profilesStore.fetchCurrentProfile();
    console.log("Profile data received:", data);
    profile.value = data;

    if (data?.owner) {
      formData.value = {
        name: data.owner.name || "",
        email: data.owner.email || "",
        phone: data.owner.phone || "",
      };
    } else {
      console.warn("No owner data found in profile response");
    }
  } catch (err) {
    console.error("Profile load error:", err);
    error("Failed to load profile");
  }
};

const saveProfile = async () => {
  saving.value = true;
  try {
    await profilesStore.updateOwner(formData.value);
    success("Profile updated successfully");
    showEditModal.value = false;
    loadProfile();
  } catch (err) {
    error("Failed to update profile");
  } finally {
    saving.value = false;
  }
};

const handleAvatarUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  // Validate file type
  if (!file.type.startsWith("image/")) {
    error("Please select an image file");
    return;
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    error("Image size must be less than 5MB");
    return;
  }

  const formData = new FormData();
  formData.append("avatar", file);

  saving.value = true;
  try {
    await profilesStore.updateAvatar(formData);
    success("Profile picture updated successfully");
    await loadProfile();
  } catch (err) {
    error("Failed to update profile picture");
  } finally {
    saving.value = false;
  }
};

onMounted(loadProfile);
</script>

<style scoped>
.profile-page {
  padding: 0 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Header */
.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
  color: #2d3748;
}

.subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  color: #718096;
}

/* Profile Card */
.profile-card {
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.profile-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 1rem;
}

/* Avatar Section */
.profile-main {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.avatar-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  flex-shrink: 0;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #5a67d8;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 600;
}

.avatar-image {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-upload {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #5a67d8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 2px solid white;
  transition: background 0.2s ease;
}

.avatar-upload:hover {
  background: #4c51bf;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.user-name {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
}

.user-email {
  margin: 0;
  font-size: 0.875rem;
  color: #718096;
}

/* Details Grid */
.profile-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.detail-icon {
  color: #718096;
  font-size: 1.25rem;
  margin-top: 0.25rem;
}

.detail-item > div {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.detail-label {
  font-size: 0.75rem;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.detail-value {
  font-size: 0.9375rem;
  color: #2d3748;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 968px) {
  .profile-content {
    grid-template-columns: 1fr;
  }

  .detail-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .profile-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .avatar-section {
    flex-direction: column;
    text-align: center;
  }

  .user-info {
    align-items: center;
  }
}

/* Subscription Alert */
.subscription-alert {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.subscription-alert p {
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
}

/* Subscription Card */
.subscription-card {
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.card-title-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.subscription-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

/* Plan Info */
.plan-info {
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;
}

.plan-name {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
  font-weight: 600;
}

.plan-price {
  margin: 0 0 1.5rem;
  font-size: 1.125rem;
  opacity: 0.9;
}

.plan-dates {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.date-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.date-item.text-danger {
  color: #ffd700;
  font-weight: 600;
}

/* Plan Limits */
.plan-limits {
  padding: 1rem;
}

.limits-title {
  margin: 0 0 1rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #2d3748;
}

.limits-grid {
  display: grid;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.limit-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #f7fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.limit-details {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.limit-label {
  font-size: 0.875rem;
  color: #718096;
}

.limit-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
}

.upgrade-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

@media (max-width: 768px) {
  .subscription-content {
    grid-template-columns: 1fr;
  }

  .subscription-alert {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

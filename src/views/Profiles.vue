<template>
  <div class="profile-page-premium">
    <!-- Header -->
    <div class="page-header-premium">
      <div class="header-content">
        <h1 class="premium-title">Account Profile</h1>
        <p class="premium-subtitle">Manage your personal and business details</p>
      </div>
      <VaButton 
        size="large" 
        class="premium-add-btn"
        icon="edit"
        @click="showEditModal = true"
      >
        Edit Profile
      </VaButton>
    </div>

    <!-- Subscription Banners Premium -->
    <div v-if="profile?.subscription?.is_expired" class="alert-premium expired">
      <div class="alert-icon-wrap">
        <VaIcon name="warning" color="#ef4444" />
      </div>
      <div class="alert-content">
        <strong>Subscription Expired</strong>
        <p>Your {{ profile.subscription.plan.name }} has expired. Upgrade now to continue.</p>
      </div>
      <VaButton color="danger" class="alert-btn" @click="goToUpgrade">Upgrade Now</VaButton>
    </div>

    <div v-else-if="profile?.subscription && profile.subscription.days_remaining <= 7" class="alert-premium warning">
      <div class="alert-icon-wrap">
        <VaIcon name="schedule" color="#fbbf24" />
      </div>
      <div class="alert-content">
        <strong>Expiring Soon</strong>
        <p>Your {{ profile.subscription.plan.name }} expires in {{ profile.subscription.days_remaining }} days.</p>
      </div>
      <VaButton color="warning" class="alert-btn" @click="goToRenew">Renew Now</VaButton>
    </div>

    <div class="profile-grid">
      <!-- Main Profile Card -->
      <VaCard class="premium-card profile-main-card">
        <VaCardContent>
          <div class="avatar-section-premium">
            <div class="avatar-outer-glow">
              <div class="avatar-wrapper">
                <img
                  v-if="profile?.image"
                  :src="profile.image"
                  alt="Profile avatar"
                  class="avatar-image-premium"
                />
                <div v-else class="avatar-text-premium">{{ initials }}</div>
                <label class="avatar-upload-premium">
                  <input type="file" accept="image/*" @change="handleAvatarUpload" style="display: none" />
                  <VaIcon name="camera_alt" size="small" />
                </label>
              </div>
            </div>
            <div class="user-meta">
              <h2 class="user-name-premium">{{ profile?.owner?.name }}</h2>
              <p class="user-email-premium">{{ profile?.user?.email }}</p>
              <div class="role-badge-premium">{{ profile?.role }}</div>
            </div>
          </div>

          <div class="details-list-premium">
            <div class="detail-item-premium">
              <div class="icon-box"><VaIcon name="business" /></div>
              <div class="info">
                <span class="label">Owner Type</span>
                <span class="value">{{ profile?.owner?.owner_type || "N/A" }}</span>
              </div>
            </div>
            <div class="detail-item-premium">
              <div class="icon-box"><VaIcon name="phone" /></div>
              <div class="info">
                <span class="label">Phone</span>
                <span class="value">{{ profile?.owner?.phone || "N/A" }}</span>
              </div>
            </div>
            <div class="detail-item-premium">
              <div class="icon-box"><VaIcon name="person" /></div>
              <div class="info">
                <span class="label">Username</span>
                <span class="value">{{ profile?.user?.username || "N/A" }}</span>
              </div>
            </div>
            <div class="detail-item-premium">
              <div class="icon-box"><VaIcon name="mail" /></div>
              <div class="info">
                <span class="label">Business Email</span>
                <span class="value">{{ profile?.owner?.email || "N/A" }}</span>
              </div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- Subscription Status Card -->
      <VaCard v-if="profile?.subscription" class="premium-card subscription-detail-card">
        <VaCardContent>
          <div class="subscription-header-premium">
            <div class="icon-circle"><VaIcon name="card_membership" /></div>
            <div class="title-wrap">
              <h3 class="card-title">Active Plan</h3>
              <div class="status-pill" :class="{ expired: profile.subscription.is_expired }">
                {{ profile.subscription.status }}
              </div>
            </div>
          </div>

          <div class="plan-display-premium">
            <h2 class="plan-name-premium">{{ profile.subscription.plan.name }}</h2>
            <div class="plan-price-premium">
              <span class="amount">{{ profile.subscription.plan.price }}</span>
              <span class="currency">{{ profile.subscription.plan.currency }}</span>
              <span class="period" v-if="profile.subscription.plan.price > 0">/ {{ profile.subscription.plan.duration_days }} days</span>
            </div>
          </div>

          <div class="usage-progress-premium">
            <div class="usage-header">
              <span>Time Remaining</span>
              <span>{{ profile.subscription.days_remaining }} Days</span>
            </div>
            <VaProgressBar 
              :model-value="(profile.subscription.days_remaining / profile.subscription.plan.duration_days) * 100" 
              color="#22c55e"
              class="premium-progress"
            />
          </div>

          <div class="limits-mini-grid">
            <div class="limit-mini">
              <VaIcon name="business" size="18px" />
              <span>{{ profile.subscription.plan.max_properties }} Properties</span>
            </div>
            <div class="limit-mini">
              <VaIcon name="home" size="18px" />
              <span>{{ profile.subscription.plan.max_units }} Units</span>
            </div>
            <div class="limit-mini">
              <VaIcon name="people" size="18px" />
              <span>{{ profile.subscription.plan.max_tenants }} Tenants</span>
            </div>
          </div>

          <div class="subscription-footer-premium">
            <VaButton 
              v-if="profile.subscription.plan.is_free_tier"
              class="upgrade-btn-premium"
              @click="goToUpgrade"
              block
            >
              Ugrade Plan
            </VaButton>
            <VaButton v-else preset="secondary" class="renew-btn-glass" @click="goToRenew" block>
              Renew Subscription
            </VaButton>
          </div>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Edit Profile Modal Premium -->
    <VaModal v-model="showEditModal" title="Edit Profile" hide-default-actions size="medium" class="premium-modal">
      <div class="modal-inner">
        <VaForm ref="formRef" @submit.prevent="saveProfile" class="premium-form">
          <VaInput
            v-model="formData.name"
            label="Name"
            class="mb-4"
            required
            background="rgba(255,255,255,0.03)"
          />
          <VaInput
            v-model="formData.email"
            label="Email"
            type="email"
            class="mb-4"
            required
            background="rgba(255,255,255,0.03)"
          />
          <PhoneInput v-model="formData.phone" label="Phone" class="mb-4" background="rgba(255,255,255,0.03)" />
          
          <div class="modal-footer">
            <VaButton preset="secondary" @click="showEditModal = false" class="cancel-btn">Cancel</VaButton>
            <VaButton :loading="saving" @click="saveProfile" class="save-btn-premium">Save Changes</VaButton>
          </div>
        </VaForm>
      </div>
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
    profile.value = data;

    if (data?.owner) {
      formData.value = {
        name: data.owner.name || "",
        email: data.owner.email || "",
        phone: data.owner.phone || "",
      };
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

  if (!file.type.startsWith("image/")) {
    error("Please select an image file");
    return;
  }

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
.profile-page-premium {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 4rem);
}

.page-header-premium {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2.5rem;
}

.premium-title {
  font-size: 2.25rem;
  font-weight: 800;
  color: var(--va-text-primary);
  margin: 0;
  letter-spacing: -0.02em;
}

.premium-subtitle {
  color: var(--va-text-secondary);
  font-size: 1rem;
  margin: 0.25rem 0 0;
}

.premium-add-btn {
  background: linear-gradient(135deg, #22c55e, #10b981) !important;
  color: white !important;
  font-weight: 700 !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3) !important;
}

/* Alerts */
.alert-premium {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.alert-premium-icon-wrap {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.alert-content {
  flex: 1;
}

.alert-content strong {
  display: block;
  font-size: 1.125rem;
  color: #f1f5f9;
}

.alert-content p {
  color: #64748b;
  margin: 0.25rem 0 0;
}

/* Profile Grid */
.profile-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 2rem;
}

.premium-card {
  background: var(--va-background-card-primary) !important;
  backdrop-filter: blur(20px) !important;
  border: 1px solid var(--va-background-border) !important;
  border-radius: 20px !important;
  overflow: hidden;
}

/* Profile Main Card */
.avatar-section-premium {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 1rem 0 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 2rem;
}

.avatar-outer-glow {
  padding: 8px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(34, 197, 94, 0.2) 0%, transparent 70%);
}

.avatar-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
}

.avatar-image-premium, .avatar-text-premium {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid rgba(15, 23, 42, 0.8);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
}

.avatar-text-premium {
  background: linear-gradient(135deg, #22c55e, #10b981);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 800;
  color: white;
}

.avatar-upload-premium {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #22c55e;
  border: 4px solid #0a0f1e;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.3s ease;
}

.user-name-premium {
  font-size: 2rem;
  font-weight: 800;
  color: var(--va-text-primary);
  margin: 0;
}

.user-email-premium {
  color: var(--va-text-secondary);
  font-size: 1.125rem;
  margin: 0.25rem 0 0.75rem;
}

.role-badge-premium {
  display: inline-block;
  padding: 0.25rem 1rem;
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.details-list-premium {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.detail-item-premium {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.icon-box {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-item-premium .info {
  display: flex;
  flex-direction: column;
}

.detail-item-premium .info-label {
  font-size: 0.75rem;
  color: var(--va-text-secondary);
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.info-value {
  color: var(--va-text-primary);
  font-weight: 600;
}

/* Subscription Card */
.subscription-header-premium {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.icon-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #22c55e, #10b981);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 15px rgba(34, 197, 94, 0.3);
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--va-text-primary);
  margin: 0;
}

.status-pill {
  font-size: 0.7rem;
  text-transform: uppercase;
  font-weight: 800;
  color: #22c55e;
}
.status-pill.expired { color: #ef4444; }

.plan-display-premium {
  text-align: center;
  padding: 2rem 0;
  background: radial-gradient(circle, rgba(34, 197, 94, 0.05) 0%, transparent 70%);
  border-radius: 20px;
  margin-bottom: 2rem;
}

.plan-name-premium {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--va-text-primary);
  margin: 0 0 0.5rem;
}

.plan-price-premium {
  color: #22c55e;
}

.plan-price-premium .amount { font-size: 2rem; font-weight: 800; }
.plan-price-premium .currency { font-size: 1rem; margin-left: 0.25rem; }
.plan-price-premium .period { color: var(--va-text-secondary); font-size: 0.875rem; }

.usage-progress-premium {
  margin-bottom: 2rem;
}

.usage-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  color: #94a3b8;
  font-weight: 600;
}

.premium-progress {
  height: 8px !important;
  border-radius: 4px;
}

.limits-mini-grid {
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
}

.limit-mini {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--va-text-primary);
  font-size: 0.95rem;
}

.upgrade-btn-premium {
  background: linear-gradient(135deg, #22c55e, #10b981) !important;
  font-weight: 700 !important;
  border-radius: 12px !important;
}

.renew-btn-glass {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  font-weight: 700 !important;
  border-radius: 12px !important;
}

/* Modal Premium */
.premium-modal {
  --va-modal-background: var(--va-background-primary);
  --va-modal-border-radius: 24px;
}

.modal-inner {
  padding: 1.5rem 0.5rem;
}

.premium-form :deep(.va-input-wrapper) {
  border-radius: 12px !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.save-btn-premium {
  background: linear-gradient(135deg, #22c55e, #10b981) !important;
  border-radius: 10px !important;
  font-weight: 700 !important;
}

@media (max-width: 968px) {
  .profile-grid { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .page-header-premium { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .avatar-section-premium { flex-direction: column; text-align: center; }
  .details-list-premium { grid-template-columns: 1fr; }
}
</style>

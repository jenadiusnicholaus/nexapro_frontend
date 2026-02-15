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
        <VaInput
          v-model="formData.phone"
          label="Phone"
          placeholder="Enter your phone"
          class="mb-4"
        />
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
import { useAppToast } from "@/composables/useAppToast";
import { useProfilesStore } from "@/stores";

const { success, error } = useAppToast();
const profilesStore = useProfilesStore();

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

const loadProfile = async () => {
  try {
    const data: any = await profilesStore.fetchCurrentProfile();
    profile.value = data;

    formData.value = {
      name: data.owner.name,
      email: data.owner.email,
      phone: data.owner.phone,
    };
  } catch (err) {
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
</style>

<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-card">
        <div class="register-header">
          <img
            src="/images/transparent_longo.png"
            alt="NexaPro"
            class="register-logo"
          />
          <h1 class="register-title">Create Account</h1>
          <p class="register-subtitle">
            Join NexaPro and start managing your properties
          </p>
        </div>

        <VaAlert v-if="errorMessage" color="danger" class="mb-4">{{
          errorMessage
        }}</VaAlert>

        <!-- Step 1: Registration Form -->
        <div v-if="step === 1" class="form-container">
          <VaForm ref="registerForm" @submit.prevent="handleRegister">
            <div class="form-grid">
              <!-- Left Column -->
              <div class="form-column">
                <VaInput
                  v-model="formData.name"
                  label="Full Name"
                  placeholder="Enter your full name"
                  :rules="[(v) => !!v || 'Name is required']"
                  class="form-input"
                >
                  <template #prepend>
                    <VaIcon name="person" />
                  </template>
                </VaInput>

                <PhoneInput
                  v-model="phone"
                  label="Phone Number"
                  :required="true"
                  class="form-input"
                />

                <VaInput
                  v-model="formData.email"
                  label="Email Address"
                  placeholder="Enter your email"
                  type="email"
                  class="form-input"
                >
                  <template #prepend>
                    <VaIcon name="email" />
                  </template>
                </VaInput>

                <VaInput
                  v-model="formData.password"
                  label="Password"
                  placeholder="Create a password"
                  type="password"
                  :rules="[
                    (v) => !!v || 'Password is required',
                    (v) =>
                      v.length >= 8 || 'Password must be at least 8 characters',
                  ]"
                  class="form-input"
                >
                  <template #prepend>
                    <VaIcon name="lock" />
                  </template>
                </VaInput>
              </div>

              <!-- Right Column -->
              <div class="form-column">
                <VaSelect
                  v-model="formData.owner_type"
                  label="Account Type"
                  :options="ownerTypeOptions"
                  class="form-input"
                >
                  <template #prepend>
                    <VaIcon name="business" />
                  </template>
                </VaSelect>

                <VaInput
                  v-if="formData.owner_type === 'company'"
                  v-model="formData.contact_person"
                  label="Contact Person"
                  placeholder="Contact person name"
                  class="form-input"
                >
                  <template #prepend>
                    <VaIcon name="badge" />
                  </template>
                </VaInput>

                <VaTextarea
                  v-model="formData.address"
                  label="Address"
                  placeholder="Enter your address"
                  :min-rows="3"
                  class="form-input"
                >
                  <template #prepend>
                    <VaIcon name="location_on" />
                  </template>
                </VaTextarea>
              </div>
            </div>

            <div class="form-actions">
              <VaButton
                type="submit"
                :loading="loading"
                size="large"
                class="register-button"
              >
                Send Verification Code
              </VaButton>

              <div class="login-link">
                Already have an account?
                <router-link to="/login" class="login-link-text"
                  >Sign in</router-link
                >
              </div>
            </div>
          </VaForm>
        </div>

        <!-- Step 2: Verification Code -->
        <div v-if="step === 2" class="form-container">
          <VaForm ref="verificationForm" @submit.prevent="verifyToken">
            <div class="verification-container">
              <div class="verification-header">
                <VaIcon name="sms" size="large" color="primary" />
                <h3 class="verification-title">Verify Your Phone</h3>
                <p class="verification-subtitle">
                  We've sent a 6-digit verification code to
                  <strong>{{ phone }}</strong>
                </p>
              </div>

              <VaInput
                v-model="token"
                label="Verification Code"
                placeholder="Enter 6-digit code"
                :rules="[
                  (v) => !!v || 'Verification code is required',
                  (v) => /^[0-9]{6}$/.test(v) || 'Must be 6 digits',
                ]"
                maxlength="6"
                class="verification-input"
              >
                <template #prepend>
                  <VaIcon name="lock" />
                </template>
              </VaInput>

              <div class="verification-info">
                <span v-if="expiresIn > 0" class="timer">
                  <VaIcon name="schedule" size="small" />
                  Code expires in: {{ formatTime(expiresIn) }}
                </span>
                <div v-else class="expired-warning">
                  <VaIcon name="warning" size="small" />
                  Code expired. Please request a new one.
                </div>
              </div>

              <div class="verification-actions">
                <VaButton
                  preset="secondary"
                  @click="goBack"
                  :disabled="loading"
                  class="back-button"
                >
                  Back
                </VaButton>
                <VaButton
                  type="submit"
                  :loading="loading"
                  :disabled="expiresIn <= 0"
                  class="verify-button"
                >
                  Complete Registration
                </VaButton>
              </div>

              <VaButton
                preset="plain"
                @click="resendCode"
                :disabled="expiresIn > 0 || loading"
                class="resend-button"
                block
              >
                <VaIcon name="refresh" class="mr-2" />
                Resend Verification Code
              </VaButton>
            </div>
          </VaForm>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAppToast } from "@/composables/useAppToast";
import axios from "axios";
import PhoneInput from "@/components/PhoneInput.vue";
import { useI18n } from "vue-i18n";

const router = useRouter();
const { success, error } = useAppToast();
const { t } = useI18n({ useScope: "global" });

const step = ref(1);
const phone = ref("");
const token = ref("");
const loading = ref(false);
const errorMessage = ref("");
const expiresIn = ref(600);
let countdownInterval: ReturnType<typeof setInterval> | null = null;

const formData = ref({
  name: "",
  email: "",
  password: "",
  password_confirm: "",
  owner_type: "individual",
  address: "",
  contact_person: "",
});

const ownerTypeOptions = [
  { value: "individual", text: "Individual" },
  { value: "company", text: "Company" },
];

const registerForm = ref<{ validate: () => Promise<boolean> } | null>(null);
const verificationForm = ref<{ validate: () => Promise<boolean> } | null>(null);

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "https://nexaproapi.quantumvision-tech.com/api/v1";

const handleRegister = async () => {
  if (!registerForm.value) return;
  const isValid = await registerForm.value.validate();
  if (!isValid) return;

  errorMessage.value = "";
  loading.value = true;

  try {
    // Step 1: Request verification code
    const response = await axios.post(
      `${API_BASE}/owners/register/request-token/`,
      {
        phone: phone.value,
        name: formData.value.name,
      },
    );

    if (response.data.success) {
      success("Verification code sent to your phone!");
      step.value = 2;
      expiresIn.value = response.data.expires_in || 600;
      startCountdown();
    } else {
      errorMessage.value = response.data.message;
    }
  } catch (err: any) {
    if (err.response?.data?.message) {
      errorMessage.value = err.response.data.message;
    } else {
      errorMessage.value =
        "Failed to send verification code. Please try again.";
    }
  } finally {
    loading.value = false;
  }
};

const verifyToken = async () => {
  if (!verificationForm.value) return;
  const isValid = await verificationForm.value.validate();
  if (!isValid) return;

  errorMessage.value = "";
  loading.value = true;

  try {
    // Step 2: Complete registration
    const response = await axios.post(`${API_BASE}/owners/register/verify/`, {
      phone: phone.value,
      token: token.value,
      name: formData.value.name,
      email: formData.value.email,
      owner_type: formData.value.owner_type,
      address: formData.value.address,
      contact_person: formData.value.contact_person,
    });

    if (response.data.success) {
      success("Registration successful! You can now login.");
      stopCountdown();
      router.push("/login");
    } else {
      errorMessage.value = response.data.message || "Invalid verification code";
    }
  } catch (err: any) {
    if (err.response?.data?.message) {
      errorMessage.value = err.response.data.message;
    } else {
      errorMessage.value = "Registration failed. Please try again.";
    }
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  step.value = 1;
  token.value = "";
  errorMessage.value = "";
  stopCountdown();
};

const startCountdown = () => {
  stopCountdown();
  countdownInterval = setInterval(() => {
    expiresIn.value > 0 ? expiresIn.value-- : stopCountdown();
  }, 1000);
};
const stopCountdown = () => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
};
const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  return `${m}:${(seconds % 60).toString().padStart(2, "0")}`;
};

const resendCode = async () => {
  token.value = "";
  errorMessage.value = "";
  expiresIn.value = 0;
  stopCountdown();

  loading.value = true;
  try {
    const response = await axios.post(
      `${API_BASE}/owners/register/request-token/`,
      {
        phone: phone.value,
        name: formData.value.name,
      },
    );

    if (response.data.success) {
      success("Verification code resent to your phone!");
      expiresIn.value = response.data.expires_in || 600;
      startCountdown();
    } else {
      errorMessage.value = response.data.message;
    }
  } catch (err: any) {
    errorMessage.value = "Failed to resend code. Please try again.";
  } finally {
    loading.value = false;
  }
};
onUnmounted(() => {
  stopCountdown();
});
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: var(--va-background-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  margin: 0;
  width: 100%;
}
.register-container {
  width: 100%;
  max-width: 900px;
}

.register-card {
  background: var(--va-background-element);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  border: 1px solid var(--va-background-border);
}

.register-header {
  text-align: center;
  margin-bottom: 2.5rem;
}
.register-logo {
  margin-bottom: 1rem;
}
.register-logo {
  height: 60px;
  margin-bottom: 1.5rem;
}

.register-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--va-text-primary);
  margin-bottom: 0.5rem;
}

.register-subtitle {
  color: var(--va-text-secondary);
  font-size: 1rem;
}

.form-container {
  width: 100%;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.form-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-input {
  width: 100%;
}

.verification-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.verification-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: #718096;
}

.resend-link {
  color: var(--va-primary) !important;
  font-weight: 600;
}

.form-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.register-button {
  width: 100%;
  max-width: 400px;
  background: var(--va-primary) !important;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.login-link {
  color: var(--va-text-secondary);
  font-size: 0.875rem;
  text-align: center;
}

.login-link-text {
  color: var(--va-primary);
  font-weight: 600;
  text-decoration: none;
  margin-left: 0.5rem;
}

.login-link-text:hover {
  text-decoration: underline;
}

/* Verification Step Styles */
.verification-container {
  max-width: 400px;
  margin: 0 auto;
  text-align: center;
}

.verification-header {
  margin-bottom: 2rem;
}

.verification-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--va-text-primary);
  margin: 1rem 0 0.5rem 0;
}

.verification-subtitle {
  color: var(--va-text-secondary);
  font-size: 0.95rem;
  line-height: 1.5;
}

.verification-input {
  margin-bottom: 1.5rem;
}

.verification-info {
  margin-bottom: 2rem;
}

.timer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--va-primary);
  font-weight: 600;
  font-size: 0.875rem;
}

.expired-warning {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #e53e3e;
  font-weight: 600;
  font-size: 0.875rem;
}

.verification-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.back-button {
  flex: 1;
}

.verify-button {
  flex: 2;
  background: var(--va-primary) !important;
}

.resend-button {
  color: var(--va-primary) !important;
  font-weight: 600;
}

.resend-button:disabled {
  opacity: 0.5;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .register-page {
    padding: 1rem;
  }

  .register-card {
    padding: 2rem 1.5rem;
    border-radius: 12px;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .register-title {
    font-size: 1.5rem;
  }

  .register-subtitle {
    font-size: 0.875rem;
  }

  .register-logo {
    height: 50px;
  }
}

@media (max-width: 480px) {
  .register-page {
    padding: 0.5rem;
  }

  .register-card {
    padding: 1.5rem 1rem;
  }

  .register-header {
    margin-bottom: 1.5rem;
  }
}
</style>

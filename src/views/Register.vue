<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-card">
        <div class="register-header">
          <h1 class="register-title">Register as Property Owner</h1>
          <p class="register-subtitle">
            Join NexaPro and start managing your properties
          </p>
        </div>

        <VaAlert v-if="errorMessage" color="danger" class="mb-4">
          {{ errorMessage }}
        </VaAlert>

        <!-- Step 1: Phone Number -->
        <div v-if="step === 1" class="step-container">
          <div class="step-indicator">
            <div class="step-badge active">1</div>
            <div class="step-line"></div>
            <div class="step-badge">2</div>
            <div class="step-line"></div>
            <div class="step-badge">3</div>
          </div>

          <VaForm ref="phoneForm" @submit.prevent="requestToken">
            <div class="form-section">
              <h3 class="section-title">Enter Your Phone Number</h3>
              <p class="section-description">
                We'll send you a verification code via SMS
              </p>

              <PhoneInput
                v-model="phone"
                label="Phone Number"
                :required="true"
                class="mb-4"
              />

              <p class="helper-text">
                <VaIcon name="info" size="small" />
                We'll send a verification code to this number
              </p>

              <VaButton
                type="submit"
                class="submit-button"
                :loading="loading"
                block
              >
                Send Verification Code
              </VaButton>

              <div class="login-link">
                Already have an account?
                <router-link to="/auth/login">Login here</router-link>
              </div>
            </div>
          </VaForm>
        </div>

        <!-- Step 2: Verification Code -->
        <div v-if="step === 2" class="step-container">
          <div class="step-indicator">
            <div class="step-badge completed">
              <VaIcon name="check" size="small" />
            </div>
            <div class="step-line active"></div>
            <div class="step-badge active">2</div>
            <div class="step-line"></div>
            <div class="step-badge">3</div>
          </div>

          <VaForm ref="verificationForm" @submit.prevent="verifyToken">
            <div class="form-section">
              <div class="verification-info">
                <VaIcon name="sms" size="large" color="primary" />
                <p class="verification-text">
                  Verification code sent to <strong>{{ phone }}</strong>
                </p>
                <div v-if="expiresIn > 0" class="timer">
                  <VaIcon name="schedule" size="small" />
                  Expires in: {{ formatTime(expiresIn) }}
                </div>
                <div v-else class="expired-warning">
                  <VaIcon name="warning" size="small" />
                  Code expired. Please request a new one.
                </div>
              </div>

              <VaInput
                v-model="token"
                label="Verification Code"
                placeholder="123456"
                :rules="[
                  (v) => !!v || 'Verification code is required',
                  (v) => /^[0-9]{6}$/.test(v) || 'Must be 6 digits',
                ]"
                maxlength="6"
                class="mb-4"
              >
                <template #prepend>
                  <VaIcon name="lock" />
                </template>
              </VaInput>

              <div class="button-group">
                <VaButton
                  preset="secondary"
                  @click="goBack"
                  :disabled="loading"
                >
                  Back
                </VaButton>
                <VaButton
                  type="submit"
                  :loading="loading"
                  :disabled="expiresIn <= 0"
                >
                  Verify Code
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

        <!-- Step 3: Owner Details & Password -->
        <div v-if="step === 3" class="step-container">
          <div class="step-indicator">
            <div class="step-badge completed">
              <VaIcon name="check" size="small" />
            </div>
            <div class="step-line completed"></div>
            <div class="step-badge completed">
              <VaIcon name="check" size="small" />
            </div>
            <div class="step-line active"></div>
            <div class="step-badge active">3</div>
          </div>

          <VaForm ref="registerForm" @submit.prevent="completeRegistration">
            <div class="form-section">
              <VaDivider class="mb-4">
                <span class="divider-text">Owner Details</span>
              </VaDivider>

              <VaInput
                v-model="formData.name"
                label="Full Name / Company Name"
                placeholder="John Doe"
                :rules="[(v) => !!v || 'Name is required']"
                class="mb-4"
              >
                <template #prepend>
                  <VaIcon name="person" />
                </template>
              </VaInput>

              <VaInput
                v-model="formData.email"
                label="Email Address (Optional)"
                placeholder="john@example.com"
                type="email"
                class="mb-4"
              >
                <template #prepend>
                  <VaIcon name="email" />
                </template>
              </VaInput>

              <VaDivider class="my-4">
                <span class="divider-text">Password</span>
              </VaDivider>

              <VaInput
                v-model="formData.password"
                label="Password"
                placeholder="Create a secure password"
                type="password"
                :rules="[
                  (v) => !!v || 'Password is required',
                  (v) =>
                    v.length >= 8 || 'Password must be at least 8 characters',
                  (v) =>
                    /[A-Z]/.test(v) ||
                    'Password must contain an uppercase letter',
                  (v) =>
                    /[a-z]/.test(v) ||
                    'Password must contain a lowercase letter',
                  (v) => /[0-9]/.test(v) || 'Password must contain a number',
                ]"
                class="mb-4"
              >
                <template #prepend>
                  <VaIcon name="lock" />
                </template>
              </VaInput>

              <VaInput
                v-model="formData.password_confirm"
                label="Confirm Password"
                placeholder="Re-enter your password"
                type="password"
                :rules="[
                  (v) => !!v || 'Please confirm your password',
                  (v) => v === formData.password || 'Passwords do not match',
                ]"
                class="mb-4"
              >
                <template #prepend>
                  <VaIcon name="lock" />
                </template>
              </VaInput>

              <VaDivider class="my-4">
                <span class="divider-text">Address (Optional)</span>
              </VaDivider>

              <VaSelect
                v-model="formData.owner_type"
                label="Owner Type"
                :options="ownerTypeOptions"
                class="mb-4"
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
                class="mb-4"
              >
                <template #prepend>
                  <VaIcon name="badge" />
                </template>
              </VaInput>

              <VaTextarea
                v-model="formData.address"
                label="Address (Optional)"
                placeholder="123 Main Street, Dar es Salaam"
                :min-rows="2"
                :max-rows="4"
                class="mb-4"
              >
                <template #prepend>
                  <VaIcon name="location_on" />
                </template>
              </VaTextarea>

              <div class="button-group">
                <VaButton
                  preset="secondary"
                  @click="step = 2"
                  :disabled="loading"
                >
                  Back
                </VaButton>
                <VaButton type="submit" :loading="loading">
                  Complete Registration
                </VaButton>
              </div>
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

const router = useRouter();
const { success, error } = useAppToast();

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

const phoneForm = ref<{ validate: () => Promise<boolean> } | null>(null);
const registerForm = ref<{ validate: () => Promise<boolean> } | null>(null);

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "https://nexaproapi.quantumvision-tech.com/api/v1";

const requestToken = async () => {
  if (!phoneForm.value) return;
  const isValid = await phoneForm.value.validate();
  if (!isValid) return;

  errorMessage.value = "";
  loading.value = true;

  try {
    const response = await axios.post(
      `${API_BASE}/owners/register/request-token/`,
      {
        phone: phone.value,
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

const verificationForm = ref<{ validate: () => Promise<boolean> } | null>(null);

const verifyToken = async () => {
  if (!verificationForm.value) return;
  const isValid = await verificationForm.value.validate();
  if (!isValid) return;

  errorMessage.value = "";
  loading.value = true;

  try {
    const response = await axios.post(
      `${API_BASE}/owners/register/verify-token/`,
      {
        phone: phone.value,
        token: token.value,
      },
    );

    if (response.data.success) {
      success("Code verified! Please complete your registration.");
      step.value = 3;
    } else {
      errorMessage.value = response.data.message || "Invalid verification code";
    }
  } catch (err: any) {
    if (err.response?.data?.message) {
      errorMessage.value = err.response.data.message;
    } else {
      errorMessage.value = "Verification failed. Please try again.";
    }
  } finally {
    loading.value = false;
  }
};

const completeRegistration = async () => {
  if (!registerForm.value) return;
  const isValid = await registerForm.value.validate();
  if (!isValid) return;

  errorMessage.value = "";
  loading.value = true;

  try {
    // Prepare payload without password_confirm
    const { password_confirm, ...registrationData } = formData.value;

    const response = await axios.post(`${API_BASE}/owners/register/verify/`, {
      phone: phone.value,
      token: token.value,
      ...registrationData,
    });

    if (response.data.success) {
      success("Registration successful! You can now login.");
      stopCountdown();
      router.push("/auth/login");
    } else {
      errorMessage.value = response.data.message;
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

const startCountdown = () => {
  stopCountdown();
  countdownInterval = setInterval(() => {
    if (expiresIn.value > 0) {
      expiresIn.value--;
    } else {
      stopCountdown();
    }
  }, 1000);
};

const stopCountdown = () => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const goBack = () => {
  step.value = 1;
  token.value = "";
  errorMessage.value = "";
  stopCountdown();
};

const resendCode = async () => {
  token.value = "";
  errorMessage.value = "";
  expiresIn.value = 0;
  stopCountdown();
  await requestToken();
};

onUnmounted(() => {
  stopCountdown();
});
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  margin: 0;
  width: 100%;
}

.register-container {
  width: 100%;
  max-width: 600px;
}

.register-card {
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 3rem;
}

.register-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.register-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.register-subtitle {
  color: #718096;
  font-size: 1rem;
}

.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
}

.step-badge {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #a0aec0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.125rem;
}

.step-badge.active {
  background: #667eea;
  color: #ffffff;
}

.step-badge.completed {
  background: #48bb78;
  color: #ffffff;
}

.step-line {
  width: 80px;
  height: 3px;
  background: #e2e8f0;
  margin: 0 0.5rem;
}

.step-line.active {
  background: #667eea;
}

.form-section {
  margin-top: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.section-description {
  color: #718096;
  margin-bottom: 1.5rem;
}

.helper-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #718096;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.submit-button {
  margin-bottom: 1rem;
}

.login-link {
  text-align: center;
  color: #718096;
  font-size: 0.875rem;
}

.login-link a {
  color: #667eea;
  font-weight: 600;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}

.verification-info {
  background: linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%);
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  margin-bottom: 1.5rem;
  border: 2px solid #c7d2fe;
}

.verification-text {
  margin: 0.75rem 0;
  color: #4c51bf;
  font-size: 0.95rem;
}

.timer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #667eea;
  font-weight: 600;
  margin-top: 0.5rem;
}

.expired-warning {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #e53e3e;
  font-weight: 600;
  margin-top: 0.5rem;
}

.divider-text {
  color: #718096;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.button-group {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.resend-button {
  margin-top: 0.5rem;
  color: #667eea !important;
}

.resend-button:disabled {
  opacity: 0.5;
}

.phone-input-wrapper {
  width: 100%;
}

.phone-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2d3748;
  font-size: 0.875rem;
}

.phone-input {
  width: 100%;
}

.phone-input :deep(.vue-phone-number-input) {
  width: 100%;
}

.phone-input :deep(.select-country-container) {
  border: 1px solid #cbd5e0;
  border-radius: 8px 0 0 8px;
  background: #ffffff;
}

.phone-input :deep(.input-tel) {
  border: 1px solid #cbd5e0;
  border-left: none;
  border-radius: 0 8px 8px 0;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  width: 100%;
}

.phone-input :deep(.input-tel:focus) {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.error-text {
  color: #e53e3e;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  margin-bottom: 0;
}

@media (max-width: 640px) {
  .register-card {
    padding: 2rem 1.5rem;
  }

  .register-title {
    font-size: 1.5rem;
  }

  .button-group {
    grid-template-columns: 1fr;
  }
}
</style>

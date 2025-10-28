<script setup lang="ts">
import { ref, computed } from 'vue'
import logo from '@/assets/img/tuaslogo.png'
import AppHeader from '@/components/AppHeader.vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const isLoading = ref(false)
const error = ref('')

const currentDate = computed(() =>
  new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }),
)

const signInWithMicrosoft = async () => {
  if (isLoading.value) return
  isLoading.value = true
  error.value = ''
  try {
    await authStore.login()
    router.replace('/')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Sign in failed.'
    isLoading.value = false
  }
}
</script>

<template>
  <v-app>
    <AppHeader
      title="Meal Check-In"
      :subtitle="currentDate"
      title-class="text-h4 font-weight-bold text-grey-darken-4"
      color="white"
      :dark="false"
      :height="120"
      :show-logo="true"
      :logo-src="logo"
      logo-alt="Logo"
      :logo-size="60"
      :show-logout-button="false"
    />
    <v-main class="bg-grey-lighten-4">
      <v-container class="fill-height d-flex align-center justify-center pa-4 pa-md-6">
        <div class="text-center w-100 step-content" style="max-width: 480px">
          <!-- Logo with Glow Effect -->
          <div class="logo-container mb-8">
            <div class="logo-glow">
              <img :src="logo" alt="TUAS Logo" class="main-logo" />
            </div>
            <div class="logo-ripple ripple-1"></div>
            <div class="logo-ripple ripple-2"></div>
          </div>

          <!-- Welcome Text -->
          <div class="welcome-section mb-8">
            <h2 class="welcome-title mb-4">Welcome</h2>
            <p class="welcome-subtitle">Sign in with your Windows ID to access meal check-in app</p>
          </div>

          <!-- Error Alert with Enhanced Styling -->
          <v-alert
            v-if="error"
            type="error"
            variant="tonal"
            class="error-alert mb-6"
            rounded="xl"
            prominent
          >
            <template v-slot:prepend>
              <v-icon size="24" class="error-icon">mdi-alert-circle</v-icon>
            </template>
            {{ error }}
          </v-alert>

          <!-- Enhanced Sign-in Button -->
          <div class="signin-button-container text-center">
            <v-btn
              color="primary"
              block
              rounded="xl"
              class="signin-button py-3 px-4 text-none"
              :loading="isLoading"
              :disabled="isLoading"
              @click="signInWithMicrosoft"
            >
              <v-icon start class="microsoft-icon" :size="$vuetify.display.smAndDown ? 20 : 28">
                mdi-microsoft
              </v-icon>
              <span
                class="button-text"
                :class="$vuetify.display.smAndDown ? 'text-caption' : 'text-subtitle-1'"
              >
                {{ isLoading ? 'Signing You In...' : 'Continue with your Windows ID' }}
              </span>
              <v-icon
                end
                v-if="!isLoading"
                :size="$vuetify.display.smAndDown ? 16 : 20"
                class="arrow-icon"
              >
                mdi-arrow-right
              </v-icon>
            </v-btn>

            <!-- Button Glow -->
            <div class="button-glow" :class="{ loading: isLoading }"></div>
          </div>
          <!-- Security Badge -->
          <div class="security-badge mt-8">
            <v-icon size="16" color="success" class="me-2">mdi-shield-check</v-icon>
            <span class="security-text">Secured with Microsoft Authentication</span>
          </div>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.step-content {
  animation: contentSlideUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.security-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  animation: badgeSlideIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.9s backwards;
}
@keyframes badgeSlideIn {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes contentSlideUp {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.logo-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo-glow {
  position: relative;
  z-index: 3;
  animation: logoEntry 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

@keyframes logoEntry {
  0% {
    opacity: 0;
    transform: scale(0.5) rotateY(-180deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotateY(0deg);
  }
}

.main-logo {
  width: 100px;
  height: auto;
  filter: drop-shadow(0 8px 24px rgba(102, 126, 234, 0.3));
  transition: all 0.3s ease;
}

.main-logo:hover {
  transform: scale(1.05);
  filter: drop-shadow(0 12px 32px rgba(102, 126, 234, 0.4));
}

.logo-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 50%;
  animation: logoRipple 3s infinite ease-out;
}

.ripple-1 {
  width: 140px;
  height: 140px;
  animation-delay: 0s;
}

.ripple-2 {
  width: 160px;
  height: 160px;
  animation-delay: 1s;
}

@keyframes logoRipple {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}

.welcome-section {
  text-align: center;
  animation: textSlideIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.3s backwards;
}

@keyframes textSlideIn {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.welcome-title {
  font-size: 2.2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
}

.welcome-subtitle {
  font-size: 1.1rem;
  color: #666;
  line-height: 1.5;
  font-weight: 400;
}

.error-alert {
  animation: errorSlide 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border: 1px solid rgba(244, 67, 54, 0.2);
}

@keyframes errorSlide {
  0% {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.error-icon {
  animation: errorIconPulse 2s ease-in-out infinite;
}

@keyframes errorIconPulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.signin-button-container {
  position: relative;
  animation: buttonSlideUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.6s backwards;
}

@keyframes buttonSlideUp {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.signin-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  font-weight: 600;
  padding: 20px 24px !important;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  z-index: 2;
}

.signin-button:hover:not(:disabled) {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3) !important;
}

.signin-button:active:not(:disabled) {
  transform: translateY(-2px) scale(1.01);
}

.signin-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.6s;
}

.signin-button:hover::before:not(:disabled) {
  left: 100%;
}

.button-text {
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.microsoft-icon {
  transition: all 0.3s ease;
  color: #00bcf2;
  filter: drop-shadow(0 2px 4px rgba(0, 188, 242, 0.3));
}

.signin-button:hover .microsoft-icon:not(:disabled) {
  transform: scale(1.1) rotate(5deg);
}

.arrow-icon {
  transition: all 0.3s ease;
  opacity: 0.8;
}

.signin-button:hover .arrow-icon:not(:disabled) {
  transform: translateX(4px);
  opacity: 1;
}

.button-glow {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 20px;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
  animation: buttonGlow 2s ease-in-out infinite;
}

.button-glow.loading {
  opacity: 0.3;
  animation: loadingGlow 1.5s ease-in-out infinite;
}

@keyframes buttonGlow {
  0%,
  100% {
    opacity: 0;
  }
  50% {
    opacity: 0.1;
  }
}

@keyframes loadingGlow {
  0%,
  100% {
    opacity: 0.2;
  }
  50% {
    opacity: 0.4;
  }
}

/* Mobile Responsive */
@media (max-width: 600px) {
  .step-content {
    padding: 1rem;
  }

  .main-logo {
    width: 80px;
  }

  .welcome-title {
    font-size: 1.8rem;
  }

  .welcome-subtitle {
    font-size: 1rem;
  }

  .signin-button {
    padding: 16px 20px !important;
  }

  .button-text {
    font-size: 1rem;
  }

  .microsoft-icon {
    size: 24px;
  }
}

@media (max-width: 400px) {
  .step-content {
    padding: 0.5rem;
  }

  .welcome-title {
    font-size: 1.6rem;
  }
}
</style>

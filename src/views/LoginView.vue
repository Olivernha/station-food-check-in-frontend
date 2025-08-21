<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { msalService } from '@/services/msalService';
import logo from '@/assets/img/tuaslogo.png';
import AppHeader from '@/components/AppHeader.vue';

const authStore = useAuthStore();
const auth = msalService();

const isLoading = ref(false);
const error = ref('');

const currentDate = computed(() =>
  new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
);

const signInWithMicrosoft = async () => {
  if (isLoading.value) return;
  isLoading.value = true;
  error.value = '';
  try {
    await auth.login();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Sign in failed.';
    isLoading.value = false;
  }
};

onMounted(async () => {
  const ok = await authStore.bootstrapAuth();
  if (ok) {
    // already signed in, redirect to home
    window.location.href = '/';
  }
});
</script>

<template>
  <v-app>
    <AppHeader
      title="Meal Check-In"
      :subtitle="currentDate"
      color="white"
      :dark="false"
      :height="120"
      :show-logo="true"
      :logo-src="logo"
      logo-alt="Logo"
      :logo-size="60"
    />
    <v-main class="bg-grey-lighten-4">
      <v-container class="fill-height d-flex align-center justify-center">
        <div class="text-center w-100 pa-6 step-content">
          <v-icon color="primary" class="mb-8">mdi-microsoft</v-icon>
          <h1 class="text-h2 font-weight-bold mb-6">Welcome</h1>
          <p class="text-h5 text-grey mb-12">Please sign in with Microsoft to continue</p>

          <v-alert v-if="error" type="error" variant="tonal" class="mb-6 mx-auto" style="max-width: 400px">
            {{ error }}
          </v-alert>

          <v-btn
            color="primary"
            size="x-large"
            block
            rounded="xl"
            class="py-6"
            style="max-width: 400px; margin: 0 auto"
            :loading="isLoading"
            :disabled="isLoading"
            @click="signInWithMicrosoft"
          >
            <v-icon start>mdi-microsoft</v-icon>
            <span class="text-h6">{{ isLoading ? 'Signing In...' : 'Sign In with Microsoft' }}</span>
          </v-btn>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

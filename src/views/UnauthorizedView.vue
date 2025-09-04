<template>
  <v-container class="mobile-container">
    <div class="unauthorized-container">
      <v-card class="pa-6 text-center">
        <v-card-title>
          <v-icon size="80" color="error" class="mb-4">mdi-shield-alert</v-icon>
          <h2 class="text-h4 mb-2">Access Denied</h2>
        </v-card-title>

        <v-card-text>
          <p class="text-body-1 mb-4">You don't have permission to access this page.</p>

          <p class="text-body-2 text-medium-emphasis mb-6">
            If you believe this is an error, please contact your system administrator.
          </p>

          <div class="d-flex flex-column ga-3">
            <v-btn color="primary" @click="goBack" prepend-icon="mdi-arrow-left"> Go Back </v-btn>

            <v-btn variant="outlined" @click="goHome" prepend-icon="mdi-home"> Go to Home </v-btn>

            <v-btn variant="text" @click="logout" prepend-icon="mdi-logout"> Logout </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const goBack = () => {
  router.go(-1)
}

const goHome = () => {
  router.push('/')
}

const logout = async () => {
  await authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.mobile-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 16px;
}

.unauthorized-container {
  margin-top: 20vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 60vh;
}
</style>

<template>
  <v-app-bar :color="color" :dark="dark" :height="height" flat :class="headerClass" elevation="2">
    <v-container>
      <v-row align="center" :justify="justify" no-gutters>
        <v-col cols="auto" v-if="showLogo">
          <v-img
            v-if="logoSrc"
            :src="logoSrc"
            :alt="logoAlt"
            :height="logoSize"
            :width="logoSize"
            class="rounded-lg mr-4"
          />
          <v-icon v-else :size="iconSize" class="mr-3">{{ icon }}</v-icon>
        </v-col>
        <v-col>
          <div :class="titleAlignment">
            <h1 :class="titleClass">{{ title }}</h1>
            <p :class="subtitleClass" v-if="subtitle">{{ subtitle }}</p>
          </div>
        </v-col>

        <!-- Navigation Button -->
        <v-col cols="auto" v-if="showAdminButton && isAdmin">
          <v-btn
            color="primary"
            variant="outlined"
            size="small"
            class="admin-btn"
            @click="navigate"
          >
            <v-icon start :size="iconSizeSmall">{{ buttonIcon }}</v-icon>
            {{ buttonText }}
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-app-bar>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'

interface Props {
  title: string
  subtitle?: string
  color?: string
  dark?: boolean
  height?: number | string
  showLogo?: boolean
  logoSrc?: string
  logoAlt?: string
  logoSize?: number
  icon?: string
  iconSize?: number
  titleClass?: string
  subtitleClass?: string
  headerClass?: string
  justify?:
    | 'start'
    | 'center'
    | 'end'
    | 'space-around'
    | 'space-between'
    | 'space-evenly'
    | 'stretch'
  titleAlignment?: string
  showAdminButton?: boolean
}

withDefaults(defineProps<Props>(), {
  color: 'primary',
  dark: false,
  height: 120,
  showLogo: true,
  logoAlt: 'Logo',
  logoSize: 60,
  icon: 'mdi-food',
  iconSize: 48,
  titleClass: 'text-h2 font-weight-bold text-grey-darken-4',
  subtitleClass: 'text-h6 text-grey-darken-2 ma-0 font-weight-medium',
  headerClass: 'header-shadow',
  justify: 'start',
  titleAlignment: '',
  showAdminButton: true,
})

// Auth store for admin check
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

// Computed property for admin status
const isAdmin = computed(() => authStore.isAdmin)

// Computed properties for button text and icon based on current route
const isAdminRoute = computed(() => route.path === '/admin')
const buttonText = computed(() => (isAdminRoute.value ? 'Home' : 'Admin'))
const buttonIcon = computed(() => (isAdminRoute.value ? 'mdi-home' : 'mdi-shield-crown'))
const iconSizeSmall = computed(() => 16)

// Method to navigate based on current route
const navigate = () => {
  if (isAdminRoute.value) {
    router.push('/')
  } else {
    router.push('/admin')
  }
}
</script>

<style scoped>
.header-shadow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}

/* Enhanced title visibility */
:deep(.v-toolbar-title) {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* Ensure proper contrast */
.v-app-bar {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

/* Responsive font sizes for small screens */
@media (max-width: 600px) {
  h1 {
    font-size: 1.5rem !important; /* smaller title */
  }
  p {
    font-size: 0.875rem !important; /* smaller subtitle */
  }
}

/* Admin button styling */
.admin-btn {
  font-size: 0.875rem;
  text-transform: none;
  opacity: 0.9;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-left: 16px;
}

.admin-btn:hover {
  opacity: 1;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Mobile responsive adjustments */
@media (max-width: 600px) {
  .admin-btn {
    font-size: 0.75rem;
    padding: 0 8px !important;
    min-width: auto;
  }

  .admin-btn .v-icon {
    font-size: 14px !important;
  }
}
</style>

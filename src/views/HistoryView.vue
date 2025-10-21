<template>
  <v-app>
    <AppHeader
      title="Meal Check-In"
      :subtitle="currentDate"
      color="white"
      :dark="false"
      :height="100"
      :show-logo="true"
      :logo-src="logo"
      logo-alt="Logo"
      :logo-size="60"
      title-class="text-h4 font-weight-bold text-grey-darken-4"
      subtitle-class="text-body-2 text-grey-darken-2 ma-0 font-weight-medium"
    />

    <v-main class="bg-grey-lighten-3">
      <v-container class="py-6">
        <v-card class="mb-6" elevation="0" rounded="xl">
          <v-card-title class="d-flex align-center py-6 px-6">
            <v-icon start color="primary" size="x-large">mdi-history</v-icon>
            <div>
              <span class="text-h5 font-weight-bold">Your Meal History</span>
              <div class="text-body-2 text-grey">View your past meal collections</div>
            </div>
            <v-spacer></v-spacer>
            <v-btn
              icon="mdi-refresh"
              variant="tonal"
              @click="refreshHistory"
              :loading="isLoading"
              size="small"
              color="primary"
            ></v-btn>
          </v-card-title>

          <v-divider></v-divider>

          <v-card-text class="pa-0">
            <div v-if="isLoading" class="text-center py-16">
              <v-progress-circular
                indeterminate
                color="primary"
                size="64"
                width="4"
              ></v-progress-circular>
              <p class="mt-6 text-h6 text-grey-darken-1">Loading your meal history...</p>
            </div>

            <div v-else-if="error" class="text-center py-16 px-6">
              <v-icon size="80" color="error" class="mb-6">mdi-alert-circle-outline</v-icon>
              <p class="text-h5 mb-4">Failed to load meal history</p>
              <p class="text-body-1 mb-8 text-grey-darken-1">{{ error }}</p>
              <v-btn
                color="primary"
                @click="refreshHistory"
                rounded="pill"
                prepend-icon="mdi-refresh"
                size="large"
                class="px-8"
              >
                Try Again
              </v-btn>
            </div>

            <div v-else-if="historyItems.length === 0" class="text-center py-16 px-6">
              <v-icon size="100" color="grey-lighten-1" class="mb-6">mdi-food-off-outline</v-icon>
              <p class="text-h5 mb-4">No meal history yet</p>
              <p class="text-body-1 text-grey-darken-1 mb-8">
                Your meal collections will appear here
              </p>
              <v-btn
                color="success"
                @click="goBack"
                rounded="pill"
                prepend-icon="mdi-food"
                size="large"
                class="px-8"
              >
                Collect Your First Meal
              </v-btn>
            </div>

            <div v-else>
              <div class="pa-6">
                <v-row>
                  <v-col cols="6">
                    <v-card variant="tonal" color="success" class="mb-4" rounded="lg">
                      <v-card-text class="py-4 text-center">
                        <div class="text-h4 font-weight-bold">{{ totalMeals }}</div>
                        <div class="text-body-1 text-grey-darken-1">Total Portions</div>
                      </v-card-text>
                    </v-card>
                  </v-col>

                  <v-col cols="6">
                    <v-card variant="tonal" color="primary" class="mb-4" rounded="lg">
                      <v-card-text class="py-4 text-center">
                        <div class="text-h4 font-weight-bold">${{ totalAmount.toFixed(2) }}</div>
                        <div class="text-body-1 text-grey-darken-1">Total Spent</div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>

                <div class="text-h6 font-weight-bold mb-4 mt-6">Recent Collections</div>
              </div>

              <v-list lines="two" class="pa-0 bg-transparent">
                <v-list-item
                  v-for="(item, index) in historyItems"
                  :key="index"
                  :value="index"
                  class="mb-3 mx-4 pa-5"
                  rounded="lg"
                  variant="elevated"
                  @click="showDetail(item)"
                  style="cursor: pointer"
                >
                  <template v-slot:prepend>
                    <v-avatar
                      color="success"
                      icon="mdi-food"
                      size="x-large"
                      class="elevation-3"
                    ></v-avatar>
                  </template>

                  <v-list-item-title class="font-weight-bold text-h5 mb-1">
                    {{ item.count }}
                    <span class="text-body-1">Portion{{ item.count > 1 ? 's' : '' }}</span>
                  </v-list-item-title>

                  <v-list-item-subtitle class="mb-2 d-flex align-center">
                    <v-icon size="small" class="mr-2">mdi-calendar</v-icon>
                    <span>{{ formatDate(item.datetime) }}</span>
                  </v-list-item-subtitle>

                  <v-list-item-subtitle class="d-flex align-center">
                    <v-icon size="small" class="mr-2">mdi-clock-outline</v-icon>
                    <span>{{ formatTime(item.datetime) }}</span>
                  </v-list-item-subtitle>

                  <template v-slot:append>
                    <div class="text-right">
                      <div class="text-h5 font-weight-bold text-success">
                        ${{ item.price.toFixed(2) }}
                      </div>
                    </div>
                  </template>
                </v-list-item>
              </v-list>
            </div>
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>

    <!-- History Detail Dialog -->
    <v-dialog v-model="showDetailDialog" max-width="500">
      <v-card v-if="selectedItem" class="rounded-xl">
        <div class="bg-primary pa-6 text-center">
          <v-avatar
            color="white"
            icon="mdi-food"
            size="x-large"
            class="elevation-4 mb-4"
          ></v-avatar>
          <div class="text-h4 font-weight-bold text-white">Meal Details</div>
        </div>

        <v-card-text class="pa-6">
          <v-row>
            <v-col cols="6">
              <v-card variant="tonal" color="success" rounded="lg">
                <v-card-text class="text-center py-4">
                  <div class="text-h4 font-weight-bold">{{ selectedItem.count }}</div>
                  <div class="text-body-1 text-grey-darken-1">Portions</div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="6">
              <v-card variant="tonal" color="primary" rounded="lg">
                <v-card-text class="text-center py-4">
                  <div class="text-h4 font-weight-bold">${{ selectedItem.price.toFixed(2) }}</div>
                  <div class="text-body-1 text-grey-darken-1">Total</div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12">
              <v-divider class="my-6"></v-divider>
            </v-col>

            <v-col cols="12">
              <div class="d-flex align-start mb-5">
                <v-icon start color="primary" size="large" class="mt-1">mdi-calendar</v-icon>
                <div>
                  <div class="text-overline text-grey">Date & Time</div>
                  <div class="font-weight-medium text-h6">
                    {{ formatDate(selectedItem.datetime) }}
                  </div>
                  <div class="font-weight-medium text-h6">
                    {{ formatTime(selectedItem.datetime) }}
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="elevated"
            @click="showDetailDialog = false"
            size="large"
            rounded="pill"
            class="px-6"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import logo from '@/assets/img/tuaslogo.png'
import AppHeader from '../components/AppHeader.vue'
import { useAuthStore } from '../stores/auth'
import { useMealStore, type MealHistoryRecord } from '../stores/mealStore'

const router = useRouter()
const authStore = useAuthStore()
const mealStore = useMealStore()

// State
const historyItems = ref<MealHistoryRecord[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const showDetailDialog = ref(false)
const selectedItem = ref<MealHistoryRecord | null>(null)

// Computed
const currentDate = computed(() => {
  const date = new Date()
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

// Computed properties for summary
const totalMeals = computed(() => {
  return historyItems.value.reduce((total, item) => total + item.count, 0)
})

const totalAmount = computed(() => {
  return historyItems.value.reduce((total, item) => total + item.price, 0)
})

// Methods
const goBack = () => {
  router.push('/')
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

const fetchUserHistory = async () => {
  if (!authStore.user?.entraAd || !authStore.user?.department || !authStore.user?.entity) {
    error.value = 'User information not available'
    return
  }

  isLoading.value = true
  error.value = null

  try {
    // Fetch actual user history from the store
    const history = await mealStore.getUserMealHistory(
      authStore.user.entraAd,
      authStore.user.department,
      authStore.user.entity,
    )

    historyItems.value = history
  } catch (err) {
    console.error('Error fetching user history:', err)
    error.value = err instanceof Error ? err.message : 'Failed to fetch meal history'
  } finally {
    isLoading.value = false
  }
}

const refreshHistory = async () => {
  await fetchUserHistory()
}

const showDetail = (item: MealHistoryRecord) => {
  selectedItem.value = item
  showDetailDialog.value = true
}

// Lifecycle
onMounted(() => {
  fetchUserHistory()
})
</script>

<style scoped>
.v-list-item {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.v-list-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12) !important;
  border-color: rgba(0, 0, 0, 0.1);
}

.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.text-success {
  color: rgb(var(--v-theme-success)) !important;
}
</style>

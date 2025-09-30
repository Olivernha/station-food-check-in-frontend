<template>
  <v-card :elevation="elevation" rounded="lg" color="white" class="mb-4">
    <v-card-text class="pa-4">
      <div class="d-flex justify-space-between align-center mb-3">
        <div class="d-flex align-center">
          <v-icon v-if="titleIcon" :size="20" class="mr-2 text-grey-darken-1">
            {{ titleIcon }}
          </v-icon>
          <h3 class="text-subtitle-1 font-weight-medium text-grey-darken-2">{{ title }}</h3>
        </div>
        <div
          v-if="dateText"
          class="text-caption text-grey-darken-1 bg-grey-lighten-3 px-2 py-1 rounded"
        >
          {{ dateText }}
        </div>
      </div>

      <v-row class="mt-2">
        <v-col v-for="stat in stats" :key="stat.label" cols="4" class="text-center">
          <div :class="statNumberClass">{{ stat.value }}</div>
          <div class="text-caption text-grey-darken-1 text-uppercase font-weight-medium">
            {{ stat.label }}
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
interface Stat {
  label: string
  value: number | string
}

interface Props {
  title: string
  stats: Stat[]
  titleIcon?: string
  dateText?: string
  statNumberClass?: string
  elevation?: number | string
}

withDefaults(defineProps<Props>(), {
  statNumberClass: 'text-h4 font-weight-bold text-grey-darken-2 mb-1',
  elevation: 0,
})
</script>

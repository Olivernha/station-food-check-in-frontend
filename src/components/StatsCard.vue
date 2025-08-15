<template>
  <v-card :elevation="elevation" rounded="lg" class="mb-4">
    <v-card-text class="pa-6">
      <div class="d-flex justify-space-between align-center mb-4">
        <div class="d-flex align-center">
          <v-icon v-if="titleIcon" :size="24" class="mr-2 text-grey-darken-1">
            {{ titleIcon }}
          </v-icon>
          <h3 class="text-h6 font-weight-medium text-grey-darken-2">{{ title }}</h3>
        </div>
        <div v-if="dateText" class="text-body-2 text-grey">{{ dateText }}</div>
      </div>

      <v-row>
        <v-col v-for="stat in stats" :key="stat.label" cols="6" class="text-center">
          <div :class="statNumberClass">{{ stat.value }}</div>
          <div class="text-body-2 text-grey text-uppercase">{{ stat.label }}</div>
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
  statNumberClass: 'text-h2 font-weight-bold text-grey-darken-2 mb-2',
  elevation: 2,
})
</script>

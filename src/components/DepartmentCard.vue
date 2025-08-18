<template>
  <v-card :elevation="elevation" rounded="lg" color="white" class="mb-3">
    <!-- Department Header -->
    <v-card-title
      class="bg-blue-grey-darken-3 text-white pa-3 d-flex justify-space-between align-center"
    >
      <span class="text-body-1 font-weight-medium">{{ department.name }}</span>
      <span class="text-caption">Total: {{ department.totalPortions }} portions</span>
    </v-card-title>

    <!-- Staff List -->
    <v-card-text class="pa-0">
      <v-list density="compact" class="py-0">
        <v-list-item
          v-for="(staff, index) in department.staff"
          :key="staff.id"
          class="px-4 py-2"
          :class="{ 'border-b': index < department.staff.length - 1 }"
        >
          <v-list-item-title class="text-body-2 text-grey-darken-2 font-weight-regular">
            {{ staff.name }}
          </v-list-item-title>

          <template v-slot:append>
            <v-chip
              :color="getPortionChipColor(staff.portions)"
              :text-color="getPortionTextColor(staff.portions)"
              size="small"
              class="font-weight-medium"
              variant="flat"
            >
              {{ staff.portions }}
            </v-chip>
          </template>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
interface Staff {
  id: number
  name: string
  portions: number
}

interface Department {
  name: string
  staff: Staff[]
  totalPortions: number
}

interface Props {
  department: Department
  elevation?: number | string
}

withDefaults(defineProps<Props>(), {
  elevation: 0,
})

const getPortionChipColor = (portions: number): string => {
  if (portions >= 4) return 'grey-darken-2'
  if (portions >= 3) return 'grey-darken-1'
  if (portions >= 2) return 'grey'
  return 'grey-lighten-1'
}

const getPortionTextColor = (portions: number): string => {
  if (portions >= 2) return 'white'
  return 'grey-darken-3'
}
</script>

<style scoped>
.border-b {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
</style>

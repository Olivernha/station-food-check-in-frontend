<template>
  <v-card :elevation="elevation" rounded="lg" class="mb-4">
    <!-- Department Header -->
    <v-card-title class="bg-blue-grey-darken-2 text-white pa-4">
      <div class="d-flex justify-space-between align-center w-100">
        <span class="text-h6 font-weight-medium">{{ department.name }}</span>
        <span class="text-body-1">Total: {{ department.totalPortions }} portions</span>
      </div>
    </v-card-title>

    <!-- Staff List -->
    <v-card-text class="pa-0">
      <v-list density="compact">
        <v-list-item v-for="staff in department.staff" :key="staff.id" class="px-4 py-3 border-b">
          <v-list-item-title class="text-body-1 text-grey-darken-2">
            {{ staff.name }}
          </v-list-item-title>

          <template v-slot:append>
            <v-chip
              :color="getPortionColor(staff.portions)"
              size="small"
              class="text-white font-weight-medium"
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
  elevation: 2,
})

const getPortionColor = (portions: number): string => {
  if (portions >= 4) return 'blue-grey-darken-3'
  if (portions >= 3) return 'blue-grey-darken-2'
  if (portions >= 2) return 'blue-grey-darken-1'
  return 'blue-grey'
}
</script>

<style scoped>
.border-b {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.border-b:last-child {
  border-bottom: none;
}
</style>

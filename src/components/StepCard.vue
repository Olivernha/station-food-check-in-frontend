<template>
  <v-container :class="containerClass">
    <v-row justify="center" align="center">
      <v-col :cols="cols" :sm="sm" :md="md" :lg="lg">
        <v-card :class="cardClass" :elevation="elevation" :rounded="rounded">
          <!-- Special header for voucher type -->
          <v-card-title v-if="type === 'voucher'" :class="voucherHeaderClass">
            <div class="w-100">
              <v-icon :size="headerIconSize" class="mb-2">{{ headerIcon }}</v-icon>
              <div :class="voucherTitleClass">{{ voucherTitle }}</div>
            </div>
          </v-card-title>

          <v-card-text :class="contentClass">
            <!-- Icon for non-voucher types -->
            <v-icon
              v-if="type !== 'voucher' && icon"
              :size="iconSize"
              :color="iconColor"
              class="mb-4"
            >
              {{ icon }}
            </v-icon>

            <!-- Title and Subtitle -->
            <h2 v-if="title" :class="titleClass">{{ title }}</h2>
            <p v-if="subtitle" :class="subtitleClass">{{ subtitle }}</p>

            <!-- Custom Content Slot -->
            <slot name="content"></slot>

            <!-- Action Buttons -->
            <div v-if="buttons.length > 0" :class="buttonsClass">
              <v-btn
                v-for="button in buttons"
                :key="button.label"
                :color="button.color"
                :size="button.size || 'large'"
                :block="button.block !== false"
                :rounded="button.rounded || 'xl'"
                @click="button.action"
              >
                <v-icon v-if="button.icon" start>{{ button.icon }}</v-icon>
                {{ button.label }}
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
interface Button {
  label: string
  color: string
  action: () => void
  icon?: string
  size?: string
  block?: boolean
  rounded?: string
  loading?: boolean
  disabled?: boolean
}

interface Props {
  type?: 'default' | 'voucher'
  title?: string
  subtitle?: string
  icon?: string
  iconSize?: number
  iconColor?: string
  buttons?: Button[]

  // Voucher specific props
  voucherTitle?: string
  headerIcon?: string
  headerIconSize?: number

  // Layout props
  cols?: number | string
  sm?: number | string
  md?: number | string
  lg?: number | string

  // Styling props
  containerClass?: string
  cardClass?: string
  elevation?: number | string
  rounded?: string
  contentClass?: string
  titleClass?: string
  subtitleClass?: string
  buttonsClass?: string
  voucherHeaderClass?: string
  voucherTitleClass?: string
}

withDefaults(defineProps<Props>(), {
  type: 'default',
  iconSize: 64,
  headerIconSize: 40,
  cols: 12,
  sm: 8,
  md: 6,
  lg: 4,
  buttons: () => [],
  containerClass: 'fill-height',
  cardClass: 'pa-8',
  elevation: 8,
  rounded: 'xl',
  contentClass: 'text-center',
  titleClass: 'text-h4 font-weight-bold mb-2',
  subtitleClass: 'text-body-1 text-grey mb-6',
  buttonsClass: 'mt-4',
  voucherHeaderClass: 'bg-success text-white text-center pa-6',
  voucherTitleClass: 'text-h5 font-weight-bold',
})
</script>

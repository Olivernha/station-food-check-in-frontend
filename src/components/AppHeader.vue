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
      </v-row>
    </v-container>
  </v-app-bar>
</template>

<script setup lang="ts">
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
  subtitleClass: 'text-h6 text-grey-darken-2en-2 ma-0 font-weight-medium',
  headerClass: 'header-shadow',
  justify: 'start',
  titleAlignment: '',
})
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
</style>

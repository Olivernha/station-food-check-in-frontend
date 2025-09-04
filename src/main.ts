import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { msalInstance } from './services/msal'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'

const app = createApp(App)

app.use(createPinia())

app.use(router)
app.use(vuetify)

msalInstance.initialize().then(() => {
  app.mount('#app')
})

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration)
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError)
      })
  })
}

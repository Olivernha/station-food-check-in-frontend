// Service Worker for Background Sync
const CACHE_NAME = 'meal-app-v1'
const DB_NAME = 'MealCheckDB'
const MEAL_STORE = 'pendingMeals'

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker: Install event')
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate event')
  event.waitUntil(self.clients.claim())
})

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Sync event triggered', event.tag)

  if (event.tag === 'meal-submission') {
    event.waitUntil(syncPendingMeals())
  }
})

// Function to sync pending meals
async function syncPendingMeals() {
  console.log('Service Worker: Starting meal sync...')

  try {
    // Open IndexedDB
    const db = await openDB()
    const transaction = db.transaction(MEAL_STORE, 'readonly')
    const store = transaction.objectStore(MEAL_STORE)

    // Get all pending meals
    const pendingMeals = await new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })

    console.log(`Service Worker: Found ${pendingMeals.length} pending meals`)

    if (pendingMeals.length === 0) {
      return
    }

    let syncedCount = 0

    // Try to sync each meal
    for (const meal of pendingMeals) {
      try {
        const response = await fetch('/api/mobile/submit_meal_check_in', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(meal),
        })

        if (response.ok) {
          // Remove from IndexedDB if successful
          await removePendingMeal(db, meal.id)
          syncedCount++
          console.log(`Service Worker: Synced meal ID: ${meal.id}`)
        } else {
          console.error(`Service Worker: Failed to sync meal ID: ${meal.id}`, response.statusText)
        }
      } catch (error) {
        console.error(`Service Worker: Error syncing meal ID: ${meal.id}`, error)
      }
    }

    console.log(
      `Service Worker: Sync complete - ${syncedCount}/${pendingMeals.length} meals synced`,
    )

    // Notify the main app about sync completion
    const clients = await self.clients.matchAll()
    clients.forEach((client) => {
      client.postMessage({
        type: 'MEAL_SYNC_COMPLETE',
        syncedCount,
        totalCount: pendingMeals.length,
      })
    })
  } catch (error) {
    console.error('Service Worker: Sync failed', error)
  }
}

// Helper function to open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

// Helper function to remove pending meal
async function removePendingMeal(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(MEAL_STORE, 'readwrite')
    const store = transaction.objectStore(MEAL_STORE)
    const request = store.delete(id)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

// Handle fetch events (optional - for caching)
self.addEventListener('fetch', (event) => {
  // Only handle GET requests for now
  if (event.request.method !== 'GET') {
    return
  }

  // Let the browser handle the request normally
  // You can add caching logic here if needed
})

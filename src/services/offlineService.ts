import { type MealCollection } from '@/stores/mealStore'

// Database name and version
const DB_NAME = 'MealCheckDB'
const DB_VERSION = 1
const MEAL_STORE = 'pendingMeals'

// IndexedDB setup
let db: IDBDatabase | null = null

// Open IndexedDB connection
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db)
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(MEAL_STORE)) {
        const store = db.createObjectStore(MEAL_STORE, { keyPath: 'id', autoIncrement: true })
        store.createIndex('timestamp', 'timestamp', { unique: false })
      }
    }
  })
}

// Save meal to IndexedDB for offline submission
export const saveMealForOfflineSubmission = async (meal: MealCollection): Promise<boolean> => {
  try {
    const db = await openDB()
    const transaction = db.transaction(MEAL_STORE, 'readwrite')
    const store = transaction.objectStore(MEAL_STORE)
    console.log('📦 Saving meal for offline submission:', meal)
    // Add timestamp if not present
    if (!meal.timestamp) {
      meal.timestamp = new Date().toISOString()
    }

    await store.add(meal)
    return true
  } catch (error) {
    console.error('Failed to save meal for offline submission:', error)
    return false
  }
}

// Get all pending meals from IndexedDB
export const getPendingMeals = async (): Promise<MealCollection[]> => {
  try {
    const db = await openDB()
    const transaction = db.transaction(MEAL_STORE, 'readonly')
    const store = transaction.objectStore(MEAL_STORE)

    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result as MealCollection[])
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('Failed to get pending meals:', error)
    return []
  }
}

// Remove meal from IndexedDB after successful submission
export const removePendingMeal = async (id: number): Promise<boolean> => {
  try {
    const db = await openDB()
    const transaction = db.transaction(MEAL_STORE, 'readwrite')
    const store = transaction.objectStore(MEAL_STORE)

    await store.delete(id)
    return true
  } catch (error) {
    console.error('Failed to remove pending meal:', error)
    return false
  }
}

// Clear all pending meals from IndexedDB
export const clearPendingMeals = async (): Promise<boolean> => {
  try {
    const db = await openDB()
    const transaction = db.transaction(MEAL_STORE, 'readwrite')
    const store = transaction.objectStore(MEAL_STORE)

    await store.clear()
    return true
  } catch (error) {
    console.error('Failed to clear pending meals:', error)
    return false
  }
}

// Check if browser supports background sync
export const isBackgroundSyncSupported = (): boolean => {
  return 'serviceWorker' in navigator && 'sync' in (navigator as any).serviceWorker
}

// Get the oldest pending meal timestamp
export const getOldestPendingMealAge = async (): Promise<number> => {
  try {
    const db = await openDB()
    const transaction = db.transaction(MEAL_STORE, 'readonly')
    const store = transaction.objectStore(MEAL_STORE)
    const index = store.index('timestamp')

    return new Promise((resolve, reject) => {
      // Get the oldest record (first in timestamp order)
      const request = index.openCursor()
      request.onsuccess = () => {
        const cursor = request.result
        if (cursor) {
          const oldestTimestamp = new Date(cursor.value.timestamp).getTime()
          const ageInDays = (Date.now() - oldestTimestamp) / (1000 * 60 * 60 * 24)
          resolve(ageInDays)
        } else {
          resolve(0) // No pending meals
        }
      }
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('Failed to get oldest pending meal age:', error)
    return 0
  }
}

// Check if collection should be blocked due to old unsync data
export const shouldBlockCollection = async (): Promise<{
  blocked: boolean
  reason?: string
  ageInDays?: number
}> => {
  try {
    const maxUnsyncDays = Number(import.meta.env.VITE_MAX_UNSYNC_DAYS)
    const oldestAge = await getOldestPendingMealAge()
    console.log(`📅 Oldest pending meal age: ${oldestAge} days`)
    console.log(`🔒 Maximum unsync days allowed: ${maxUnsyncDays}`)
    if (oldestAge > maxUnsyncDays) {
      return {
        blocked: true,
        reason: `You have unsync meal data from ${Math.floor(oldestAge)} days ago. Please connect to internet to sync before collecting new meals.`,
        ageInDays: oldestAge,
      }
    }

    return { blocked: false }
  } catch (error) {
    console.error('Failed to check if collection should be blocked:', error)
    return { blocked: false }
  }
}

// Get pending meals count by age
export const getPendingMealsByAge = async (): Promise<{
  total: number
  oldCount: number
  maxDays: number
}> => {
  try {
    const maxUnsyncDays = Number(import.meta.env.VITE_MAX_UNSYNC_DAYS) || 3
    const pendingMeals = await getPendingMeals()
    const cutoffTime = Date.now() - maxUnsyncDays * 24 * 60 * 60 * 1000

    const oldMeals = pendingMeals.filter(
      (meal) => new Date(meal.timestamp || '').getTime() < cutoffTime,
    )

    return {
      total: pendingMeals.length,
      oldCount: oldMeals.length,
      maxDays: maxUnsyncDays,
    }
  } catch (error) {
    console.error('Failed to get pending meals by age:', error)
    return { total: 0, oldCount: 0, maxDays: 3 }
  }
}

// Register background sync for meal submission
export const registerMealSync = async (): Promise<boolean> => {
  if (!isBackgroundSyncSupported()) {
    console.log('⚠️ Background sync not supported, will sync on app return')
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready
    await (registration as any).sync.register('meal-submission')
    console.log('✅ Background sync registered for meal submission')
    return true
  } catch (error) {
    console.error('Failed to register background sync:', error)
    return false
  }
}

// Force sync pending meals (for manual triggers)
export const forceSyncPendingMeals = async (): Promise<{
  success: boolean
  syncedCount: number
  totalCount: number
  errors: string[]
}> => {
  const result = {
    success: false,
    syncedCount: 0,
    totalCount: 0,
    errors: [] as string[],
  }

  try {
    const pendingMeals = await getPendingMeals()
    result.totalCount = pendingMeals.length

    if (pendingMeals.length === 0) {
      result.success = true
      return result
    }

    console.log(`🔄 Force syncing ${pendingMeals.length} pending meals...`)

    for (const meal of pendingMeals) {
      try {
        // Make API call to submit meal
        const response = await fetch('/api/mobile/submit_meal_check_in', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(meal),
        })

        if (response.ok) {
          // Remove from pending if successful
          if (meal.id && typeof meal.id === 'number') {
            await removePendingMeal(meal.id)
            result.syncedCount++
            console.log(`✅ Synced meal ID: ${meal.id}`)
          }
        } else {
          const errorText = await response.text()
          result.errors.push(`Meal ID ${meal.id}: ${errorText}`)
          console.error(`❌ Failed to sync meal ID: ${meal.id}`, errorText)
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        result.errors.push(`Meal ID ${meal.id}: ${errorMsg}`)
        console.error(`❌ Error syncing meal ID: ${meal.id}`, error)
      }
    }

    result.success = result.syncedCount > 0
    console.log(`🎉 Force sync complete: ${result.syncedCount}/${result.totalCount} meals synced`)

    return result
  } catch (error) {
    console.error('❌ Force sync failed:', error)
    result.errors.push(error instanceof Error ? error.message : 'Unknown error')
    return result
  }
}

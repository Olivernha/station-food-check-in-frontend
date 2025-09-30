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

// Register background sync for meal submission
export const registerMealSync = async (): Promise<boolean> => {
    if (!isBackgroundSyncSupported()) {
        return false
    }

    try {
        const registration = await navigator.serviceWorker.ready
        await (registration as any).sync.register('meal-submission')
        return true
    } catch (error) {
        console.error('Failed to register background sync:', error)
        return false
    }
}

/// <reference lib="webworker" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { StaleWhileRevalidate } from 'workbox-strategies'
import { getPendingMeals, removePendingMeal } from './services/offlineService'
import apiClient from './services/api'

declare let self: ServiceWorkerGlobalScope

// self.__WB_MANIFEST is default injection point
precacheAndRoute(self.__WB_MANIFEST)

// clean old assets
cleanupOutdatedCaches()

// to allow work offline
registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')))

// Handle JavaScript files with proper MIME type
registerRoute(
    ({ request }) => request.destination === 'script',
    new StaleWhileRevalidate({
        cacheName: 'js-cache',
    })
)

// Handle CSS files with proper MIME type
registerRoute(
    ({ request }) => request.destination === 'style',
    new StaleWhileRevalidate({
        cacheName: 'css-cache',
    })
)

// Background sync for meal submissions
self.addEventListener('sync', (event: Event) => {
    const syncEvent = event as SyncEvent
    if (syncEvent.tag === 'meal-submission') {
        syncEvent.waitUntil(processPendingMeals())
    }
})

// Process pending meals
async function processPendingMeals(): Promise<void> {
    try {
        const pendingMeals = await getPendingMeals()

        // Process each pending meal
        for (const meal of pendingMeals) {
            try {
                // Submit meal to backend
                await apiClient.post('/mobile/submit_meal_check_in', meal)

                // If successful, remove from pending
                if (meal.id && typeof meal.id === 'number') {
                    await removePendingMeal(meal.id)
                }
            } catch (error) {
                console.error('Failed to submit meal during background sync:', error)
                // Keep in pending for next sync attempt
            }
        }
    } catch (error) {
        console.error('Error processing pending meals:', error)
    }
}

export type { }

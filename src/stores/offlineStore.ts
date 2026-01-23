import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useOfflineStore = defineStore('offline', () => {
  const isOnline = ref(navigator.onLine)

  const updateOnlineStatus = () => {
    isOnline.value = navigator.onLine
    console.log(isOnline.value ? 'Online' : 'Offline')
  }

  // Event Listener hinzufügen
  if (typeof window !== 'undefined') {
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
  }

  return {
    isOnline: computed(() => isOnline.value),
    updateOnlineStatus
  }
})
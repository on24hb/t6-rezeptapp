<template>
  <Transition name="fade">
    <div v-if="isOpen" class="cooking-overlay">
      <div class="overlay-header">
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: progress + '%' }"
          ></div>
        </div>
        <button @click="$emit('close')" class="close-overlay">✕</button>
      </div>

      <div class="step-content">
        <span class="step-number">Schritt {{ currentIndex + 1 }} von {{ steps.length }}</span>
        <h2 class="step-text">{{ steps[currentIndex] }}</h2>
      </div>

      <div class="overlay-footer">
        <button
          @click="prev"
          class="nav-btn prev"
          :disabled="currentIndex === 0"
        >
          Zurück
        </button>
        <button @click="next" class="nav-btn next">
          {{ currentIndex === steps.length - 1 ? 'Fertig' : 'Nächster Schritt' }}
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  isOpen: boolean;
  steps: string[];
}>()

const emit = defineEmits(['close'])

const currentIndex = ref(0)

// Reset des Index, wenn der Modus neu geöffnet wird
watch(() => props.isOpen, (newVal) => {
  if (newVal) currentIndex.value = 0
})

const progress = computed(() => {
  if (props.steps.length === 0) return 0
  return ((currentIndex.value + 1) / props.steps.length) * 100
})

const next = () => {
  if (currentIndex.value < props.steps.length - 1) {
    currentIndex.value++
  } else {
    emit('close')
  }
}

const prev = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}
</script>

<style scoped>
/* Overlay Grundgerüst */
.cooking-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #ffffff;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  padding: env(safe-area-inset-top) 1.5rem env(safe-area-inset-bottom);
}

/* Fortschrittsbalken oben */
.overlay-header {
  height: 60px;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #eee;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary-color);
  transition: width 0.3s ease;
}

.close-overlay {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #999;
  cursor: pointer;
  padding: 0.5rem;
}

/* Hauptinhalt (Schritt-Text) */
.step-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.step-number {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--primary-color);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 1.5rem;
}

.step-text {
  font-size: 1.75rem;
  line-height: 1.4;
  color: #2c3e50;
  max-width: 600px;
  margin: 0;
}

/* Navigation unten */
.overlay-footer {
  height: 100px;
  display: flex;
  gap: 1rem;
  align-items: center;
}

.nav-btn {
  flex: 1;
  padding: 1.25rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-btn.prev {
  background: #f5f5f5;
  color: #666;
}

.nav-btn.prev:disabled {
  opacity: 0.3;
}

.nav-btn.next {
  background: var(--primary-color);
  color: white;
}

/* Animation */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>

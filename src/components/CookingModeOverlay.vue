<template>
  <Transition name="fade">
    <div v-if="isOpen" class="cooking-overlay">
      <div class="overlay-header">
        <div class="header-left">
        <button
          @click="showIngredients = !showIngredients"
          class="btn-toggle-ingredients"
          :class="{ 'is-active': showIngredients }"
        >
          <span class="btn-text">Zutaten</span>
          <svg
            class="icon-chevron"
            :class="{ 'is-rotated': showIngredients }"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 448 512"
          >
            <path d="M201.4 342.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 274.7 86.6 137.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/>
          </svg>
        </button>

        <button @click="showTimer = !showTimer" class="btn-toggle-timer" :class="{ 'is-active': showTimer || isTimerRunning }">
            <svg class="icon-small" viewBox="0 0 512 512"><path d="M256 0c141.4 0 256 114.6 256 256S397.4 512 256 512 0 397.4 0 256 114.6 0 256 0zM232 120V256c0 8 4.5 15.4 11.6 18.9l112 56c12.5 6.3 27.6 1.2 33.9-11.3s1.2-27.6-11.3-33.9L280 236V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/></svg>
            <span>{{ isTimerRunning ? formatTime(timeLeft) : 'Timer' }}</span>
          </button>
        </div>

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

      <Transition name="slide-up">
      <div v-if="showTimer" class="timer-panel">
          <div class="radial-timer-container">
            <svg viewBox="0 0 100 100" class="radial-svg" @mousedown="startDragging" @mousemove="handleDragging" @mouseup="stopDragging" @mouseleave="stopDragging" @touchstart="startDragging" @touchmove="handleDragging" @touchend="stopDragging">
              <circle cx="50" cy="50" r="45" class="circle-bg" />
              <circle cx="50" cy="50" r="45" class="circle-progress" :style="progressStyle" />
              <circle :cx="handlePos.x" :cy="handlePos.y" r="4" class="circle-handle" />
            </svg>
            <div class="timer-display-inner">{{ formatTime(timeLeft) }}</div>
          </div>

          <div class="timer-main-controls">
            <button @click="toggleTimer" class="btn-primary-timer" :disabled="timeLeft === 0">
              {{ isTimerRunning ? 'Pause' : 'Start' }}
            </button>
            <button @click="resetTimer" class="btn-reset">Reset</button>
          </div>
        </div>
      </Transition>

      <Transition name="slide">
        <div v-if="showIngredients" class="ingredients-drawer">
          <div class="drawer-header">
            <h2>Zutatenliste</h2>
          </div>
          <div class="drawer-content">
            <p class="ingredients-raw">{{ ingredients }}</p>
          </div>
        </div>
      </Transition>

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
import { ref, computed, watch, onUnmounted } from 'vue'

const props = defineProps<{
  isOpen: boolean;
  steps: string[];
  ingredients: string;
}>()

const emit = defineEmits(['close'])

const currentIndex = ref(0)
const showIngredients = ref(false)
const showTimer = ref(false)
const isDragging = ref(false)

const timeLeft = ref(0)
const maxTime = 3600 // 60 Minuten
const isTimerRunning = ref(false)
let timerInterval: number | null = null

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

// Visualisierung des Kreises
const progressStyle = computed(() => {
  const radius = 45
  const circumference = 2 * Math.PI * radius
  // Wir berechnen den Offset basierend auf dem Fortschritt
  const offset = circumference - (timeLeft.value / maxTime) * circumference
  return {
    strokeDasharray: circumference,
    strokeDashoffset: offset
  }
})

// Position des Griffs (muss synchron mit der Zeitberechnung sein)
const handlePos = computed(() => {
  // -90 Grad versetzt den Startpunkt auf 12 Uhr
  const angle = (timeLeft.value / maxTime) * 360 - 90
  const radian = (angle * Math.PI) / 180
  const radius = 45
  return {
    x: 50 + radius * Math.cos(radian),
    y: 50 + radius * Math.sin(radian)
  }
})

const calculateTimeFromEvent = (e: MouseEvent | TouchEvent) => {
  const svg = document.querySelector('.radial-svg') as SVGGraphicsElement
  if (!svg) return

  const rect = svg.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2

  let clientX: number
  let clientY: number
  if ('touches' in e) {
    // TouchEvent.touches[0] kann undefined sein -> optional chaining mit Fallback
    const t = e.touches[0]
    clientX = t?.clientX ?? centerX
    clientY = t?.clientY ?? centerY
  } else {
    const me = e as MouseEvent
    clientX = me.clientX
    clientY = me.clientY
  }

  // Winkel berechnen: 12 Uhr ist der Startpunkt
  const dx = clientX - centerX
  const dy = clientY - centerY

  // atan2 gibt Werte von -PI bis PI zurück.
  // + 90 Grad verschiebt den Nullpunkt von 3 Uhr auf 12 Uhr
  let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90

  // Normalisieren auf 0-360 Grad
  if (angle < 0) angle += 360

  const rawSeconds = (angle / 360) * maxTime
  const step = 10 // Sekunden-Schritt
  const steppedSeconds = Math.round(rawSeconds / step) * step
  const newSeconds = Math.round(steppedSeconds)
  timeLeft.value = Math.min(maxTime, Math.max(0, newSeconds))
}

const startDragging = (e: MouseEvent | TouchEvent) => {
  if (isTimerRunning.value) return
  isDragging.value = true
  calculateTimeFromEvent(e)
}

const handleDragging = (e: MouseEvent | TouchEvent) => {
  if (isDragging.value) calculateTimeFromEvent(e)
}

const stopDragging = () => { isDragging.value = false }

const toggleTimer = () => {
  if (isTimerRunning.value) {
    if (timerInterval) clearInterval(timerInterval)
  } else if (timeLeft.value > 0) {
    timerInterval = window.setInterval(() => {
      if (timeLeft.value > 0) timeLeft.value--
      else {
        resetTimer()
        alert('Zeit abgelaufen!')
      }
    }, 1000)
  }
  isTimerRunning.value = !isTimerRunning.value
}

const resetTimer = () => {
  if (timerInterval) clearInterval(timerInterval)
  isTimerRunning.value = false
  timeLeft.value = 0
}

onUnmounted(() => { if (timerInterval) clearInterval(timerInterval) })
watch(() => props.isOpen, (active) => { if (active) currentIndex.value = 0 })

const progress = computed(() => props.steps.length > 0 ? ((currentIndex.value + 1) / props.steps.length) * 100 : 0)
const next = () => currentIndex.value < props.steps.length - 1 ? currentIndex.value++ : emit('close')
const prev = () => currentIndex.value > 0 ? currentIndex.value-- : null
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

.btn-toggle-ingredients {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  border: 1px solid var(--primary-color);
  padding: 8px 14px;
  border-radius: 25px;
  font-weight: 700;
  color: var(--primary-color);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.btn-toggle-ingredients:hover {
  background: var(--primary-color);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.btn-toggle-ingredients.is-active {
  background: var(--primary-color);
  color: white;
}

.btn-text {
  font-size: 0.9rem;
}

.icon-chevron {
  width: 14px;
  height: 14px;
  fill: currentColor;
  transition: transform 0.3s ease;
}

.icon-chevron.is-rotated {
  transform: rotate(180deg);
}

.ingredients-drawer {
  position: absolute;
  top: 80px;
  left: 1.5rem;
  right: 1.5rem;
  bottom: 100px;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.15);
  z-index: 3010;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.drawer-header {
  padding: 1rem 1.5rem;
  background: #fcfcfc;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.drawer-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #444;
}
.drawer-header button {
  background: none;
  border: none;
  color: var(--primary-color);
  font-weight: 700;
  cursor: pointer;
}

.drawer-content {
  padding: 1.5rem;
  overflow-y: auto;
}
.ingredients-raw {
  white-space: pre-wrap;
  line-height: 1.7;
  color: #555;
  font-size: 1.3rem;
}

.header-left { display: flex; gap: 8px; }

.btn-toggle-timer {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  border: 1px solid var(--primary-color);
  padding: 8px 14px;
  border-radius: 25px;
  font-weight: 700;
  color: var(--primary-color);
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.btn-toggle-timer.is-active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.icon-small {
  width: 14px;
  height: 14px;
  fill: currentColor;
}

/* Radial SVG Anpassung */
.radial-timer-container {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto 1.5rem;
  touch-action: none; /* Verhindert Scrolling beim Ziehen auf Mobile */
}

.radial-svg {
  width: 100%;
  height: 100%;
  cursor: pointer;
  /* Rotation removed — time/handle math already accounts for 12 o'clock start */
}

.circle-bg {
  fill: none;
  stroke: #f0f0f0;
  stroke-width: 6;
  transform-origin: 50% 50%;
  transform: rotate(-90deg);
}

.circle-progress {
  fill: none;
  stroke: var(--primary-color);
  stroke-width: 6;
  stroke-linecap: round;
  /* Sanfte Bewegung beim Timer-Lauf, aber direkt beim Ziehen */
  transition: stroke-dashoffset 0.1s linear;
  transform-origin: 50% 50%;
  transform: rotate(-90deg);
}

.circle-handle {
  fill: var(--primary-color);
  stroke: #fff;
  stroke-width: 2;
}

.timer-display-inner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2.5rem;
  font-weight: 800;
  color: #333;
  pointer-events: none; /* Klicks gehen durch die Zahl durch aufs SVG */
}

.progress-bar { flex: 1; height: 6px; background: #eee; border-radius: 3px; overflow: hidden; }
.progress-fill { height: 100%; background: var(--primary-color); transition: width 0.3s ease; }
.close-overlay { background: none; border: none; font-size: 1.5rem; color: #999; cursor: pointer; padding: 0.5rem; }
.timer-panel { position: absolute; top: 90px; left: 50%; transform: translateX(-50%); background: #fff; padding: 2rem; border-radius: 24px; box-shadow: 0 12px 40px rgba(0,0,0,0.15); width: 300px; z-index: 3000; text-align: center; }
.timer-main-controls { display: flex; flex-direction: column; gap: 10px; }
.btn-primary-timer { background: var(--primary-color); color: #fff; border: none; padding: 14px; border-radius: 12px; font-weight: 700; cursor: pointer; }
.btn-primary-timer:disabled { opacity: 0.3; }
.btn-reset { background: transparent; color: #999; border: none; font-weight: 600; cursor: pointer; }

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-up-enter-active, .slide-up-leave-active { transition: transform 0.3s ease-out; }
.slide-up-enter-from, .slide-up-leave-to { transform: translate(-50%, 20px); opacity: 0; }
</style>
